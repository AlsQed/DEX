需要先安装Node.js

### 安装依赖

npm install

### 编译智能合约

npm run build

### 执行测试脚本

npm run test

### 部署合约（自动生成.env文件）

**注意：部署前需要先启动 Hardhat 节点**

# 终端1：启动 Hardhat 节点
npx hardhat node

# 终端2：部署合约
npm run deploy

部署完成后会自动生成 `.env` 文件，包含所有合约地址。

### 启动后端API服务器

npm run server

API服务器将在 `http://localhost:3001` 启动。

# 终端3：启动前端
### 启动前端应用

cd frontend
npm run dev

前端应用将在 `http://localhost:3000` 启动。

配置 MetaMask:

添加网络: RPC URL http://127.0.0.1:8545, 链 ID 31337, 货币符号 ETH。
导入账户: 复制 npx hardhat node 终端里显示的第一个账户（Account #0）的私钥，导入到 MetaMask 中，这样你就有测试用的 ETH 了