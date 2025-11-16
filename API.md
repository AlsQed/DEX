# DEX API 文档

## 基础信息

- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`

## 响应格式

所有API响应遵循统一格式：

```json
{
  "success": true,
  "data": { ... },
  "error": "错误信息（仅当success为false时）"
}
```

---

## 1. 钱包相关 API

### 1.1 获取钱包连接信息

**GET** `/api/wallet/connect`

获取网络配置和合约地址信息，用于前端钱包连接。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "chainId": 31337,
    "rpcUrl": "http://127.0.0.1:8545",
    "contracts": {
      "DEX": "0x...",
      "Token0": "0x...",
      "Token1": "0x...",
      "LPToken": "0x..."
    }
  }
}
```

### 1.2 查询ETH余额

**GET** `/api/wallet/balance/:address`

查询指定地址的ETH余额。

**参数：**
- `address` (路径参数): 钱包地址

**响应示例：**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "balance": "1000000000000000000",
    "balanceFormatted": "1.0"
  }
}
```

---

## 2. 代币交换 API

### 2.1 获取交换报价

**POST** `/api/swap/quote`

获取代币交换的报价（不执行交易）。

**请求体：**
```json
{
  "tokenIn": "0x...",      // 输入代币地址
  "amountIn": "100",       // 输入数量（字符串格式）
  "userAddress": "0x..."   // 用户地址（可选）
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "tokenIn": "0x...",
    "amountIn": "100",
    "amountOut": "95.5",
    "amountOutWei": "95500000000000000000",
    "reserves": {
      "token0": {
        "address": "0x...",
        "reserve": "5000.0"
      },
      "token1": {
        "address": "0x...",
        "reserve": "5000.0"
      }
    }
  }
}
```

### 2.2 执行代币交换

**POST** `/api/swap/execute`

构建交换交易数据（需要前端签名后发送）。

**请求体：**
```json
{
  "tokenIn": "0x...",           // 输入代币地址
  "amountIn": "100",            // 输入数量
  "minAmountOut": "95",         // 最小输出数量（可选，用于滑点保护）
  "to": "0x...",                // 接收地址
  "userAddress": "0x..."        // 用户地址
}
```

**响应示例：**
```json
{
  "success": true,
  "requiresApproval": false,
  "data": {
    "to": "0x...",              // DEX合约地址
    "data": "0x...",            // 交易数据
    "value": "0",
    "gasEstimate": "200000",
    "message": "Transaction ready to sign"
  }
}
```

**如果需要授权：**
```json
{
  "success": true,
  "requiresApproval": true,
  "data": {
    "token": "0x...",
    "amount": "100",
    "spender": "0x...",
    "message": "Token approval required before swap"
  }
}
```

### 2.3 获取代币价格

**GET** `/api/swap/price/:baseToken`

获取指定代币的价格。

**参数：**
- `baseToken` (路径参数): 基础代币地址

**响应示例：**
```json
{
  "success": true,
  "data": {
    "baseToken": "0x...",
    "price": 1.0,
    "numerator": "5000000000000000000000",
    "denominator": "5000000000000000000000",
    "token0": "0x...",
    "token1": "0x..."
  }
}
```

---

## 3. 购买/出售 API

### 3.1 购买代币

**POST** `/api/trade/buy`

购买指定代币（用另一种代币购买）。

**请求体：**
```json
{
  "tokenOut": "0x...",          // 要购买的代币地址
  "amountIn": "100",            // 支付的代币数量
  "minAmountOut": "95",         // 最小获得数量（可选）
  "userAddress": "0x..."        // 用户地址
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "type": "buy",
    "tokenIn": "0x...",
    "tokenOut": "0x...",
    "amountIn": "100",
    "amountOut": "95.5",
    "minAmountOut": "90.725",
    "to": "0x...",
    "data": "0x...",
    "requiresApproval": true
  }
}
```

### 3.2 出售代币

**POST** `/api/trade/sell`

出售指定代币。

**请求体：**
```json
{
  "tokenIn": "0x...",           // 要出售的代币地址
  "amountIn": "100",            // 出售数量
  "minAmountOut": "95",         // 最小获得数量（可选）
  "userAddress": "0x..."        // 用户地址
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "type": "sell",
    "tokenIn": "0x...",
    "tokenOut": "0x...",
    "amountIn": "100",
    "amountOut": "95.5",
    "minAmountOut": "90.725",
    "to": "0x...",
    "data": "0x...",
    "requiresApproval": true
  }
}
```

---

## 4. 用户状态查询 API

### 4.1 查询用户完整状态

**GET** `/api/user/status/:address`

查询用户的所有代币余额和状态。

**参数：**
- `address` (路径参数): 用户钱包地址

**响应示例：**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "balances": {
      "eth": {
        "balance": "1000000000000000000",
        "balanceFormatted": "1.0"
      },
      "token0": {
        "address": "0x...",
        "name": "TokenA",
        "symbol": "TKA",
        "decimals": 18,
        "walletBalance": "1000.0",
        "internalBalance": "500.0",
        "totalBalance": "1500.0",
        "allowance": "10000.0",
        "allowanceFormatted": "10000000000000000000000"
      },
      "token1": {
        "address": "0x...",
        "name": "TokenB",
        "symbol": "TKB",
        "decimals": 18,
        "walletBalance": "2000.0",
        "internalBalance": "300.0",
        "totalBalance": "2300.0",
        "allowance": "5000.0",
        "allowanceFormatted": "5000000000000000000000"
      },
      "lpToken": {
        "address": "0x...",
        "name": "LP-DEX",
        "symbol": "LPD",
        "decimals": 18,
        "balance": "100.0",
        "balanceRaw": "100000000000000000000",
        "underlyingValue": {
          "token0": "50.0",
          "token1": "50.0"
        }
      }
    },
    "pool": {
      "reserve0": "5000.0",
      "reserve1": "5000.0",
      "reserve0Raw": "5000000000000000000000",
      "reserve1Raw": "5000000000000000000000"
    },
    "summary": {
      "totalTokens": {
        "token0": "1550.0",
        "token1": "2350.0"
      }
    }
  }
}
```

### 4.2 查询用户代币列表

**GET** `/api/user/tokens/:address`

获取用户持有的代币列表（简化版）。

**参数：**
- `address` (路径参数): 用户钱包地址

**响应示例：**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "tokens": [
      {
        "address": "0x...",
        "symbol": "TKA",
        "balance": "1500.0",
        "type": "token"
      },
      {
        "address": "0x...",
        "symbol": "LPD",
        "balance": "100.0",
        "type": "lp",
        "underlyingValue": {
          "token0": "50.0",
          "token1": "50.0"
        }
      }
    ],
    "count": 2
  }
}
```

---

## 5. 代币授权 API

### 5.1 检查授权状态

**POST** `/api/approval/check`

检查用户对DEX合约的代币授权状态。

**请求体：**
```json
{
  "token": "0x...",             // 代币地址
  "userAddress": "0x..."        // 用户地址
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "token": "0x...",
    "userAddress": "0x...",
    "spender": "0x...",
    "allowance": "10000000000000000000000",
    "allowanceFormatted": "10000.0",
    "isApproved": true
  }
}
```

### 5.2 构建授权交易

**POST** `/api/approval/build`

构建代币授权交易数据（需要前端签名）。

**请求体：**
```json
{
  "token": "0x...",             // 代币地址
  "amount": "10000",            // 授权数量，或 "max"/"unlimited" 表示无限授权
  "userAddress": "0x..."        // 用户地址
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "to": "0x...",              // 代币合约地址
    "data": "0x...",            // 交易数据
    "value": "0",
    "gasEstimate": "50000",
    "message": "Approval transaction ready to sign"
  }
}
```

---

## 错误处理

所有错误响应格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

常见错误码：
- `400`: 请求参数错误
- `500`: 服务器内部错误

---

## 前端集成示例

### 1. 连接钱包并获取网络信息

```javascript
// 获取网络配置
const response = await fetch('http://localhost:3001/api/wallet/connect');
const { data } = await response.json();

// 使用 ethers.js 连接钱包
const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();

// 切换到正确的网络
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: `0x${data.chainId.toString(16)}` }],
});
```

### 2. 查询用户状态

```javascript
const address = await signer.getAddress();
const response = await fetch(`http://localhost:3001/api/user/status/${address}`);
const { data } = await response.json();

console.log('Token0余额:', data.balances.token0.totalBalance);
console.log('Token1余额:', data.balances.token1.totalBalance);
console.log('LP代币:', data.balances.lpToken.balance);
```

### 3. 获取交换报价

```javascript
const quoteResponse = await fetch('http://localhost:3001/api/swap/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenIn: token0Address,
    amountIn: '100',
    userAddress: address
  })
});

const { data: quote } = await quoteResponse.json();
console.log(`100 Token0 可以兑换 ${quote.amountOut} Token1`);
```

### 4. 执行交换（需要先授权）

```javascript
// 1. 检查授权
const approvalCheck = await fetch('http://localhost:3001/api/approval/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: token0Address,
    userAddress: address
  })
});

const { data: approval } = await approvalCheck.json();

// 2. 如果需要授权，先执行授权
if (!approval.isApproved || approval.allowance < amount) {
  const approvalTx = await fetch('http://localhost:3001/api/approval/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: token0Address,
      amount: 'max',
      userAddress: address
    })
  });
  
  const { data: approvalData } = await approvalTx.json();
  const tx = await signer.sendTransaction(approvalData);
  await tx.wait();
}

// 3. 执行交换
const swapResponse = await fetch('http://localhost:3001/api/swap/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenIn: token0Address,
    amountIn: '100',
    minAmountOut: '95',
    to: address,
    userAddress: address
  })
});

const { data: swapData } = await swapResponse.json();
const swapTx = await signer.sendTransaction(swapData);
await swapTx.wait();
console.log('交换完成！');
```

### 5. 购买代币

```javascript
const buyResponse = await fetch('http://localhost:3001/api/trade/buy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenOut: token1Address,  // 要购买的代币
    amountIn: '100',          // 用100个Token0购买
    userAddress: address
  })
});

const { data: buyData } = await buyResponse.json();

// 如果需要授权，先授权
if (buyData.requiresApproval) {
  // ... 授权逻辑同上
}

// 执行购买
const buyTx = await signer.sendTransaction({
  to: buyData.to,
  data: buyData.data,
  value: buyData.value
});
await buyTx.wait();
```

---

## 注意事项

1. **所有交易都需要用户在前端签名**：API只返回交易数据，不直接执行交易
2. **授权检查**：执行交换前务必检查代币授权状态
3. **滑点保护**：建议设置合理的 `minAmountOut` 值
4. **Gas估算**：API返回的gas估算仅供参考，实际gas可能不同
5. **错误处理**：前端应妥善处理所有可能的错误情况

