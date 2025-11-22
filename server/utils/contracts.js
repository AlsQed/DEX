
const { ethers } = require('ethers');
const config = require('../config');
const fs = require('fs');
const path = require('path');

let DEX_ABI, ERC20_ABI, LP_TOKEN_ABI;

try {
  DEX_ABI = require('../../artifacts/contracts/DEX.sol/DEX.json').abi;
} catch (e) {
  console.error('Warning: DEX ABI not found. Please run "npm run build" first.');
  DEX_ABI = [];
}

try {
  ERC20_ABI = require('../../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json').abi;
} catch (e) {
  console.error('Warning: ERC20 ABI not found. Please run "npm run build" first.');
  ERC20_ABI = [];
}

try {
  LP_TOKEN_ABI = require('../../artifacts/contracts/LPToken.sol/LPToken.json').abi;
} catch (e) {
  console.error('Warning: LPToken ABI not found. Please run "npm run build" first.');
  LP_TOKEN_ABI = [];
}

function getProvider() {
  const network = config.network.localhost;
  return new ethers.JsonRpcProvider(network.url);
}

function getContract(contractName, address) {
  const provider = getProvider();
  let abi;
  
  switch(contractName) {
    case 'DEX':
      abi = DEX_ABI;
      break;
    case 'ERC20':
      abi = ERC20_ABI;
      break;
    case 'LPToken':
      abi = LP_TOKEN_ABI;
      break;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
  
  return new ethers.Contract(address, abi, provider);
}

function getSignedContract(contractName, address, privateKey) {
  const provider = getProvider();
  const wallet = new ethers.Wallet(privateKey, provider);
  let abi;
  
  switch(contractName) {
    case 'DEX':
      abi = DEX_ABI;
      break;
    case 'ERC20':
      abi = ERC20_ABI;
      break;
    case 'LPToken':
      abi = LP_TOKEN_ABI;
      break;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
  
  return new ethers.Contract(address, abi, wallet);
}

function formatTokenAmount(amount, decimals = 18) {
  return ethers.formatUnits(amount, decimals);
}

function parseTokenAmount(amount, decimals = 18) {
  return ethers.parseUnits(amount, decimals);
}

module.exports = {
  getProvider,
  getContract,
  getSignedContract,
  formatTokenAmount,
  parseTokenAmount,
  DEX_ABI,
  ERC20_ABI,
  LP_TOKEN_ABI,
};

