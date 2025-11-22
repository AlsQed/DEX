
const express = require('express');
const router = express.Router();
const { getContract, formatTokenAmount, parseTokenAmount } = require('../utils/contracts');
const config = require('../config');
const { ethers } = require('ethers');

router.post('/check', async (req, res) => {
  try {
    const { token, userAddress } = req.body;
    
    if (!token || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: token, userAddress'
      });
    }
    
    const dexAddress = config.contracts.DEX;
    if (!dexAddress) {
      return res.status(500).json({
        success: false,
        error: 'DEX contract address not configured'
      });
    }
    
    const tokenContract = getContract('ERC20', token);
    const allowance = await tokenContract.allowance(userAddress, dexAddress);
    
    res.json({
      success: true,
      data: {
        token,
        userAddress,
        spender: dexAddress,
        allowance: allowance.toString(),
        allowanceFormatted: formatTokenAmount(allowance),
        isApproved: allowance > 0n,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/build', async (req, res) => {
  try {
    const { token, amount, userAddress } = req.body;
    
    if (!token || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: token, userAddress'
      });
    }
    
    const dexAddress = config.contracts.DEX;
    if (!dexAddress) {
      return res.status(500).json({
        success: false,
        error: 'DEX contract address not configured'
      });
    }
    
    const tokenContract = getContract('ERC20', token);
    const amountWei = amount === 'max' || amount === 'unlimited' 
      ? ethers.MaxUint256 
      : parseTokenAmount(amount);
    
    const approveTx = await tokenContract.approve.populateTransaction(
      dexAddress,
      amountWei
    );
    
    res.json({
      success: true,
      data: {
        to: token,
        data: approveTx.data,
        value: '0',
        gasEstimate: '50000',
        message: 'Approval transaction ready to sign'
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

