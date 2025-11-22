
const express = require('express');
const cors = require('cors');
const config = require('./config');

const walletRoutes = require('./routes/wallet');
const swapRoutes = require('./routes/swap');
const approvalRoutes = require('./routes/approval');
const liquidityRoutes = require('./routes/liquidity');

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DEX API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      wallet: {
        connect: 'GET /api/wallet/connect',
        balance: 'GET /api/wallet/balance/:address',
      },
      swap: {
        quote: 'POST /api/swap/quote',
        execute: 'POST /api/swap/execute',
        price: 'GET /api/swap/price/:baseToken',
      },
      approval: {
        check: 'POST /api/approval/check',
        build: 'POST /api/approval/build',
      },
      liquidity: {
        pool: 'GET /api/liquidity/pool/:address',
        add: 'POST /api/liquidity/add',
        remove: 'POST /api/liquidity/remove',
      },
    },
    contracts: config.contracts,
    documentation: 'See API.md for detailed documentation',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DEX API Server is running',
    timestamp: new Date().toISOString(),
    contracts: config.contracts,
  });
});

app.use('/api/wallet', walletRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/liquidity', liquidityRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
  DEX API Server Started Successfully
  `);
  
  console.log('\nContract Configuration:');
  if (config.contracts.DEX) {
    console.log(`   DEX: ${config.contracts.DEX}`);
  } else {
    console.warn('   DEX: Not configured');
  }
  if (config.contracts.Token0) {
    console.log(`   Token0: ${config.contracts.Token0}`);
  } else {
    console.warn('   Token0: Not configured (will be fetched from DEX contract)');
  }
  if (config.contracts.Token1) {
    console.log(`   Token1: ${config.contracts.Token1}`);
  } else {
    console.warn('   Token1: Not configured (will be fetched from DEX contract)');
  }
  
  if (!config.contracts.DEX) {
    console.warn('\nWarning: DEX contract address not configured.');
    console.warn('   Please run "npm run deploy" to deploy contracts and generate .env file.');
    console.warn('   Or run "npm run check" to diagnose deployment status.\n');
  }
});

module.exports = app;

