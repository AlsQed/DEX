
require('dotenv').config();

module.exports = {

  port: process.env.PORT || 3001,
  
  network: {
    localhost: {
      url: process.env.RPC_URL || 'http://127.0.0.1:8545',
      chainId: 31337,
    },
  },
  
  contracts: {
    DEX: process.env.DEX_ADDRESS || '',
    Token0: process.env.TOKEN0_ADDRESS || '',
    Token1: process.env.TOKEN1_ADDRESS || '',
    LPToken: process.env.LP_TOKEN_ADDRESS || '',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }
};

