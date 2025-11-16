# Minimal AMM DEX (Single Pair)

基于区块链的去中心化交易所（DEX）后端实现，包含智能合约和RESTful API服务。

## 核心功能

### 智能合约功能
- ✅ 用户存款/取款（内部余额管理）
- ✅ 基础代币交换（恒定乘积模型，0.3%手续费）
- ✅ 流动性提供/移除（LP代币）
- ✅ 价格计算工具

### API接口功能
- ✅ 钱包连接支持
- ✅ 代币交换操作
- ✅ 代币购买与出售操作
- ✅ 用户状态查询（持有代币可视化）

### 前端界面功能
- ✅ 钱包连接（MetaMask集成）
- ✅ 代币交换界面
- ✅ 代币买卖界面
- ✅ 用户资产可视化
- ✅ 实时价格更新
- ✅ 响应式设计

## 技术栈

### 智能合约
- Solidity 0.8.24
- Hardhat + Ethers v6
- OpenZeppelin contracts

### API服务
- Node.js + Express
- Ethers.js v6
- CORS支持

### 前端应用
- React 18 + Vite
- Ethers.js v6
- Axios

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 编译智能合约
```bash
npm run build
```

### 3. 部署合约（可选，用于测试）
```bash
# 部署到Hardhat内置网络
npm run deploy

# 或运行完整演示
npm run demo
```

### 4. 部署合约并获取地址

运行部署脚本会自动生成 `.env` 文件（包含所有合约地址）：

```bash
npm run deploy
```

部署完成后，脚本会自动：
- ✅ 部署所有合约（TokenA, TokenB, DEX, LPToken）
- ✅ 添加初始流动性
- ✅ **自动生成 `.env` 文件**，包含所有合约地址

生成的 `.env` 文件示例：
```env
DEX_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
TOKEN0_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
TOKEN1_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
LP_TOKEN_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
PORT=3001
RPC_URL=http://127.0.0.1:8545
```

**如果合约已部署**，可以手动创建 `.env` 文件并填入地址。详细说明请查看 [部署指南](./docs/DEPLOYMENT.md)。

### 5. 启动API服务器

```bash
# 生产模式
npm run server

# 开发模式（自动重启）
npm run server:dev
```

API服务器将在 `http://localhost:3001` 启动。

### 6. 启动本地区块链节点（可选）

如果需要独立的本地节点：

```bash
# 在另一个终端运行
npx hardhat node
```

然后更新 `server/config.js` 中的 RPC_URL。

### 7. 启动前端应用

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

**完整启动流程：**

1. 终端1：启动区块链节点（可选）
   ```bash
   npx hardhat node
   ```

2. 终端2：启动后端API服务器
   ```bash
   npm run server
   ```

3. 终端3：启动前端应用
   ```bash
   cd frontend
   npm run dev
   ```

## 项目结构

```
DEX/
├── contracts/              # 智能合约
│   ├── DEX.sol            # 主DEX合约（AMM实现）
│   ├── LPToken.sol        # LP代币合约
│   └── TestToken.sol      # 测试代币
├── scripts/               # 部署脚本
│   ├── deploy.js          # 部署脚本
│   ├── demo.js            # 演示脚本
│   └── update-config.js   # 配置更新脚本
├── server/                # API服务器
│   ├── index.js           # 服务器入口
│   ├── config.js          # 配置文件
│   ├── routes/            # API路由
│   │   ├── wallet.js      # 钱包相关
│   │   ├── swap.js        # 交换相关
│   │   ├── trade.js       # 买卖相关
│   │   ├── user.js        # 用户状态
│   │   └── approval.js    # 授权相关
│   └── utils/             # 工具函数
│       └── contracts.js   # 合约交互工具
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── contexts/      # React Context
│   │   ├── services/      # API服务
│   │   └── App.jsx        # 主应用
│   ├── package.json
│   └── vite.config.js
├── API.md                 # API完整文档
└── README.md              # 本文件
```

## API接口

### 主要接口列表

- **钱包相关**
  - `GET /api/wallet/connect` - 获取网络配置
  - `GET /api/wallet/balance/:address` - 查询ETH余额

- **代币交换**
  - `POST /api/swap/quote` - 获取交换报价
  - `POST /api/swap/execute` - 执行交换（返回交易数据）
  - `GET /api/swap/price/:baseToken` - 获取代币价格

- **买卖操作**
  - `POST /api/trade/buy` - 购买代币
  - `POST /api/trade/sell` - 出售代币

- **用户状态**
  - `GET /api/user/status/:address` - 查询完整用户状态
  - `GET /api/user/tokens/:address` - 查询用户代币列表

- **代币授权**
  - `POST /api/approval/check` - 检查授权状态
  - `POST /api/approval/build` - 构建授权交易

详细API文档请查看 [API.md](./API.md)

## 前端集成示例

```javascript
// 1. 连接钱包
const response = await fetch('http://localhost:3001/api/wallet/connect');
const { data } = await response.json();

// 2. 查询用户状态
const statusResponse = await fetch(`http://localhost:3001/api/user/status/${userAddress}`);
const { data: status } = await statusResponse.json();

// 3. 获取交换报价
const quoteResponse = await fetch('http://localhost:3001/api/swap/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenIn: token0Address,
    amountIn: '100',
    userAddress: userAddress
  })
});

// 4. 执行交换（需要前端签名）
const swapResponse = await fetch('http://localhost:3001/api/swap/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenIn: token0Address,
    amountIn: '100',
    minAmountOut: '95',
    to: userAddress,
    userAddress: userAddress
  })
});

const { data: swapData } = await swapResponse.json();
// 使用 ethers.js 发送交易
const tx = await signer.sendTransaction(swapData);
await tx.wait();
```

更多示例请参考 [API.md](./API.md) 中的"前端集成示例"部分。

## 智能合约说明

### DEX.sol
主DEX合约，实现AMM功能：
- `deposit(token, amount)` - 存款到内部余额
- `withdraw(token, amount)` - 从内部余额取款
- `addLiquidity(amount0, amount1)` - 添加流动性
- `removeLiquidity(lpAmount)` - 移除流动性
- `swapExactTokensForTokens(...)` - 精确输入交换
- `getAmountOut(amountIn, tokenIn)` - 计算输出数量
- `getPrice(baseToken)` - 获取价格

### LPToken.sol
流动性提供者代币，由DEX合约控制铸造和销毁。

### TestToken.sol
测试用的ERC20代币。

## 注意事项

⚠️ **这是一个教学示例项目**，包含以下限制：

- 单交易对（token0/token1）
- 无价格预言机
- 无TWAP（时间加权平均价格）
- 无协议费用
- 无闪电贷防护（仅基础重入保护）

🚀 **生产环境使用前需要：**
- 完整的代码审计
- 更严格的安全检查
- 多交易对支持
- 价格预言机集成
- 访问控制机制
- 升级策略
- 完善的错误处理和事件日志

## 开发命令

```bash
# 编译合约
npm run build

# 运行测试
npm test

# 部署合约
npm run deploy

# 运行演示
npm run demo

# 启动API服务器
npm run server

# 开发模式（自动重启）
npm run server:dev
```

## 许可证

MIT


