
const express = require('express');
const router = express.Router();
const { getContract, formatTokenAmount, parseTokenAmount } = require('../utils/contracts');
const config = require('../config');
 
router.get('/pool/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Missing address parameter'
      });
    }
    
    const dexAddress = config.contracts.DEX;
    if (!dexAddress) {
      return res.status(500).json({
        success: false,
        error: 'DEX contract address not configured. Please run "npm run deploy" first.'
      });
    }
    
    const provider = require('../utils/contracts').getProvider();
    const code = await provider.getCode(dexAddress);
    if (code === '0x') {
      return res.status(500).json({
        success: false,
        error: 'DEX contract not found at address. Please run "npm run deploy" first.'
      });
    }
    
    const dex = getContract('DEX', dexAddress);
    
    if (typeof dex.token0 !== 'function') {
      return res.status(500).json({
        success: false,
        error: 'DEX contract ABI not loaded correctly. Please run "npm run build" first.'
      });
    }
    
    const token0Address = config.contracts.Token0 || await dex.token0();
    const token1Address = config.contracts.Token1 || await dex.token1();
    const lpTokenAddress = config.contracts.LPToken || await dex.lpToken();
    
    const [reserve0, reserve1] = await Promise.all([
      dex.reserve0(),
      dex.reserve1()
    ]);
    
    const lpToken = getContract('LPToken', lpTokenAddress);
    const totalSupply = await lpToken.totalSupply();
    const userLpBalance = await lpToken.balanceOf(address);
    
    let poolShare = '0';
    let userAmount0 = '0';
    let userAmount1 = '0';
    
    if (totalSupply > 0n && userLpBalance > 0n) {
      poolShare = (Number(userLpBalance * 10000n / totalSupply) / 100).toFixed(2);
      userAmount0 = (reserve0 * userLpBalance / totalSupply).toString();
      userAmount1 = (reserve1 * userLpBalance / totalSupply).toString();
    }
    
    const token0 = getContract('ERC20', token0Address);
    const token1 = getContract('ERC20', token1Address);
    const [token0Symbol, token1Symbol] = await Promise.all([
      token0.symbol(),
      token1.symbol()
    ]);
    
    res.json({
      success: true,
      data: {
        userAddress: address,
        lpTokenAddress: lpTokenAddress,
        lpBalance: formatTokenAmount(userLpBalance),
        lpBalanceWei: userLpBalance.toString(),
        poolShare: poolShare,
        underlyingTokens: {
          token0: {
            address: token0Address,
            symbol: token0Symbol,
            amount: formatTokenAmount(userAmount0),
            amountWei: userAmount0
          },
          token1: {
            address: token1Address,
            symbol: token1Symbol,
            amount: formatTokenAmount(userAmount1),
            amountWei: userAmount1
          }
        },
        poolReserves: {
          token0: {
            address: token0Address,
            symbol: token0Symbol,
            reserve: formatTokenAmount(reserve0),
            reserveWei: reserve0.toString()
          },
          token1: {
            address: token1Address,
            symbol: token1Symbol,
            reserve: formatTokenAmount(reserve1),
            reserveWei: reserve1.toString()
          }
        },
        totalLPSupply: formatTokenAmount(totalSupply),
        totalLPSupplyWei: totalSupply.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching pool info:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch pool info'
    });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { amount0, amount1, userAddress } = req.body;
    
    if (!amount0 || !amount1 || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount0, amount1, userAddress'
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
    const token0Address = config.contracts.Token0 || await dex.token0();
    const token1Address = config.contracts.Token1 || await dex.token1();
    
    const amount0Wei = parseTokenAmount(amount0);
    const amount1Wei = parseTokenAmount(amount1);
    
    const token0 = getContract('ERC20', token0Address);
    const token1 = getContract('ERC20', token1Address);
    
    const [balance0, balance1, allowance0, allowance1] = await Promise.all([
      token0.balanceOf(userAddress),
      token1.balanceOf(userAddress),
      token0.allowance(userAddress, dexAddress),
      token1.allowance(userAddress, dexAddress)
    ]);
    
    const iface = new (require('ethers')).Interface(require('../utils/contracts').DEX_ABI);
    const data = iface.encodeFunctionData('addLiquidity', [amount0Wei, amount1Wei]);
    
    res.json({
      success: true,
      data: {
        to: dexAddress,
        data: data,
        value: '0',
        checks: {
          balance0: {
            required: amount0Wei.toString(),
            available: balance0.toString(),
            sufficient: balance0 >= amount0Wei
          },
          balance1: {
            required: amount1Wei.toString(),
            available: balance1.toString(),
            sufficient: balance1 >= amount1Wei
          },
          allowance0: {
            required: amount0Wei.toString(),
            approved: allowance0.toString(),
            sufficient: allowance0 >= amount0Wei
          },
          allowance1: {
            required: amount1Wei.toString(),
            approved: allowance1.toString(),
            sufficient: allowance1 >= amount1Wei
          }
        }
      }
    });
  } catch (error) {
    console.error('Error building add liquidity transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to build add liquidity transaction'
    });
  }
});

router.post('/remove', async (req, res) => {
  try {
    const { lpAmount, userAddress } = req.body;
    
    if (!lpAmount || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: lpAmount, userAddress'
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
    const lpTokenAddress = config.contracts.LPToken || await dex.lpToken();
    const lpToken = getContract('LPToken', lpTokenAddress);
    
    const lpAmountWei = parseTokenAmount(lpAmount);
    
    const lpBalance = await lpToken.balanceOf(userAddress);
    
    const [reserve0, reserve1, totalSupply] = await Promise.all([
      dex.reserve0(),
      dex.reserve1(),
      lpToken.totalSupply()
    ]);
    
    let expectedAmount0 = '0';
    let expectedAmount1 = '0';
    
    if (totalSupply > 0n) {
      expectedAmount0 = (reserve0 * lpAmountWei / totalSupply).toString();
      expectedAmount1 = (reserve1 * lpAmountWei / totalSupply).toString();
    }
    
    const iface = new (require('ethers')).Interface(require('../utils/contracts').DEX_ABI);
    const data = iface.encodeFunctionData('removeLiquidity', [lpAmountWei]);
    
    res.json({
      success: true,
      data: {
        to: dexAddress,
        data: data,
        value: '0',
        expectedAmounts: {
          token0: formatTokenAmount(expectedAmount0),
          token1: formatTokenAmount(expectedAmount1)
        },
        checks: {
          lpBalance: {
            required: lpAmountWei.toString(),
            available: lpBalance.toString(),
            sufficient: lpBalance >= lpAmountWei
          }
        }
      }
    });
  } catch (error) {
    console.error('Error building remove liquidity transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to build remove liquidity transaction'
    });
  }
});

module.exports = router;

