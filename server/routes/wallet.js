
const express = require('express');
const router = express.Router();
const { getProvider } = require('../utils/contracts');
const config = require('../config');
const { ethers } = require('ethers');
 
router.get('/connect', async (req, res) => {
  try {
    const network = config.network.localhost;
    res.json({
      success: true,
      data: {
        chainId: network.chainId,
        rpcUrl: network.url,
        contracts: config.contracts,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    
    res.json({
      success: true,
      data: {
        address,
        balance: balance.toString(),
        balanceFormatted: ethers.formatEther(balance),
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

