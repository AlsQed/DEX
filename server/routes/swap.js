
const express = require('express');
const router = express.Router();
const { getContract, getSignedContract, formatTokenAmount, parseTokenAmount } = require('../utils/contracts');
const config = require('../config');


router.post('/quote', async (req, res) => {
  try {
    const { tokenIn, amountIn, userAddress } = req.body;
    
    if (!tokenIn || !amountIn) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenIn, amountIn'
      });
    }
    
    const dexAddress = config.contracts.DEX;
    if (!dexAddress) {
      return res.status(500).json({
        success: false,
        error: 'DEX contract address not configured'
      });
    }
    
    const dex = getContract('DEX', dexAddress);
    const amountInWei = parseTokenAmount(amountIn);
    const amountOut = await dex.getAmountOut(amountInWei, tokenIn);
    
    const [reserve0, reserve1] = await Promise.all([
      dex.reserve0(),
      dex.reserve1()
    ]);
    
    const token0Address = await dex.token0();
    const token1Address = await dex.token1();
    
    res.json({
      success: true,
      data: {
        tokenIn,
        amountIn,
        amountOut: formatTokenAmount(amountOut),
        amountOutWei: amountOut.toString(),
        reserves: {
          token0: {
            address: token0Address,
            reserve: formatTokenAmount(reserve0),
          },
          token1: {
            address: token1Address,
            reserve: formatTokenAmount(reserve1),
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/execute', async (req, res) => {
  try {
    const { tokenIn, amountIn, minAmountOut, to, userAddress } = req.body;
    
    if (!tokenIn || !amountIn || !to || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenIn, amountIn, to, userAddress'
      });
    }
    
    const dexAddress = config.contracts.DEX;
    if (!dexAddress) {
      return res.status(500).json({
        success: false,
        error: 'DEX contract address not configured'
      });
    }
    
    const dex = getContract('DEX', dexAddress);
    const amountInWei = parseTokenAmount(amountIn);
    const minAmountOutWei = minAmountOut ? parseTokenAmount(minAmountOut) : 0n;
    
    const tokenContract = getContract('ERC20', tokenIn);
    const balance = await tokenContract.balanceOf(userAddress);
    const internalBalance = await dex.balances(userAddress, tokenIn);
    
    if (balance < amountInWei && internalBalance < amountInWei) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
        data: {
          walletBalance: formatTokenAmount(balance),
          internalBalance: formatTokenAmount(internalBalance),
          required: amountIn,
        }
      });
    }
    
    if (balance >= amountInWei) {
      const allowance = await tokenContract.allowance(userAddress, dexAddress);
      if (allowance < amountInWei) {
        return res.json({
          success: true,
          requiresApproval: true,
          data: {
            token: tokenIn,
            amount: amountIn,
            spender: dexAddress,
            message: 'Token approval required before swap'
          }
        });
      }
    }
    
    const swapTx = await dex.swapExactTokensForTokens.populateTransaction(
      tokenIn,
      amountInWei,
      minAmountOutWei,
      to
    );
    
    res.json({
      success: true,
      requiresApproval: false,
      data: {
        to: dexAddress,
        data: swapTx.data,
        value: '0',
        gasEstimate: '200000',
        message: 'Transaction ready to sign'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/price/:baseToken', async (req, res) => {
  try {
    const { baseToken } = req.params;
    const dexAddress = config.contracts.DEX;
    
    if (!dexAddress) {
      return res.status(500).json({
        success: false,
        error: 'DEX contract address not configured'
      });
    }
    
    const dex = getContract('DEX', dexAddress);
    const [numerator, denominator] = await dex.getPrice(baseToken);
    const token0Address = await dex.token0();
    const token1Address = await dex.token1();
    
    const price = Number(numerator) / Number(denominator);
    
    res.json({
      success: true,
      data: {
        baseToken,
        price,
        numerator: numerator.toString(),
        denominator: denominator.toString(),
        token0: token0Address,
        token1: token1Address,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

