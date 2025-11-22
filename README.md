# Minimal AMM DEX (Single Pair)

A blockchain-based decentralized exchange (DEX) implementation

## Core Features

### Smart Contract Features
- Token swapping (Constant product model with 0.3% fee)
- Liquidity provision/removal (LP tokens)
- Price calculation utilities

### API Features
- Wallet connection support
- Token swap operations
- Liquidity management (add/remove)

### Frontend Features
- Wallet connection (MetaMask integration)
- Token swap interface (Swap)
- Liquidity pool management interface (Pool)
- Real-time price updates
- Responsive design

## Tech Stack

### Smart Contracts
- Solidity 0.8.24
- Hardhat + Ethers v6
- OpenZeppelin contracts

### API Server
- Node.js + Express
- Ethers.js v6
- CORS support

### Frontend Application
- React 18 + Vite
- Ethers.js v6
- Axios

## Project Structure

DEX/
├── contracts/              # Smart contracts
│   ├── DEX.sol            # Main DEX contract (AMM implementation)
│   ├── LPToken.sol        # LP token contract
│   └── TestToken.sol      # Test token contract
├── scripts/               # Deployment scripts
│   ├── deploy-localhost.js # Deployment script (auto-generates .env)
│   └── test.js            # Test script
├── server/                # API server
│   ├── index.js           # Server entry point
│   ├── config.js          # Configuration file
│   ├── routes/            # API routes
│   └── utils/             # Utility functions
├── frontend/              # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React Context
│   │   └── services/      # API services
│   └── vite.config.js
└── README.md


## License

MIT

