# 部署指南

## 如何获得合约地址（.env 文件配置）

### 方法一：自动生成（推荐）

运行部署脚本会自动生成 `.env` 文件：

```bash
npm run deploy
```

部署完成后，脚本会自动：
1. 部署所有合约（TokenA, TokenB, DEX, LPToken）
2. 添加初始流动性
3. 生成 `.env` 文件，包含所有合约地址

生成的 `.env` 文件示例：
```env
DEX_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
TOKEN0_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
TOKEN1_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
LP_TOKEN_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
PORT=3001
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
CORS_ORIGIN=*
```

### 方法二：手动配置

如果合约已经部署，可以手动创建 `.env` 文件：

1. 复制示例文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入合约地址：
   ```env
   DEX_ADDRESS=你的DEX合约地址
   TOKEN0_ADDRESS=你的Token0地址
   TOKEN1_ADDRESS=你的Token1地址
   LP_TOKEN_ADDRESS=你的LP Token地址
   ```

### 如何查找已部署的合约地址

#### 1. 从部署日志中查找

运行 `npm run deploy` 时，控制台会输出所有合约地址：
```
TokenA: 0x...
TokenB: 0x...
DEX: 0x...
LPToken: 0x...
```

#### 2. 从 Hardhat 部署记录中查找

如果使用 Hardhat 的部署功能，地址会保存在：
- `deployments/` 目录（如果使用 hardhat-deploy 插件）
- 或查看部署时的控制台输出

#### 3. 从区块链浏览器查找

如果部署到测试网或主网：
- 在 Etherscan（或对应网络的浏览器）中搜索部署者地址
- 查看合约创建交易，找到新部署的合约地址

#### 4. 从合约事件中查找

DEX 合约部署时会创建 LPToken，可以通过事件查找：
```javascript
// 在 Hardhat console 中
const DEX = await ethers.getContractAt("DEX", "DEX地址");
const lpTokenAddress = await DEX.lpToken();
console.log("LP Token:", lpTokenAddress);
```

### 验证配置

配置完成后，可以通过以下方式验证：

1. **检查 .env 文件**：
   ```bash
   cat .env
   ```

2. **启动 API 服务器**：
   ```bash
   npm run server
   ```
   
   如果配置正确，服务器会正常启动并显示合约地址。

3. **测试健康检查接口**：
   ```bash
   curl http://localhost:3001/health
   ```
   
   应该返回包含合约地址的响应。

### 常见问题

#### Q: 部署后找不到 LP Token 地址？

A: LP Token 是在 DEX 合约部署时自动创建的。可以通过以下方式获取：
```javascript
const dex = await ethers.getContractAt("DEX", "DEX地址");
const lpTokenAddress = await dex.lpToken();
```

#### Q: 如何更新已部署的合约地址？

A: 直接编辑 `.env` 文件，或重新运行 `npm run deploy`（会覆盖现有文件）。

#### Q: 部署到不同网络怎么办？

A: 更新 `.env` 文件中的 `RPC_URL` 和 `CHAIN_ID`：
```env
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
CHAIN_ID=11155111
```

#### Q: 多个网络如何管理？

A: 可以创建多个环境文件：
- `.env.localhost` - 本地网络
- `.env.sepolia` - Sepolia 测试网
- `.env.mainnet` - 主网

然后使用环境变量加载：
```bash
# Linux/Mac
cp .env.localhost .env

# Windows
copy .env.localhost .env
```

### 部署流程总结

1. **编译合约**：
   ```bash
   npm run build
   ```

2. **启动本地节点**（可选）：
   ```bash
   npx hardhat node
   ```

3. **部署合约**：
   ```bash
   npm run deploy
   ```
   
   这会自动生成 `.env` 文件。

4. **启动 API 服务器**：
   ```bash
   npm run server
   ```

5. **验证部署**：
   - 访问 `http://localhost:3001/health`
   - 检查返回的合约地址是否正确

完成！现在可以开始使用 API 服务了。

