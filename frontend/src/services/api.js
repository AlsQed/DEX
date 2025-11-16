import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 网络配置
export async function getNetworkConfig() {
  const response = await api.get('/api/wallet/connect')
  return response.data.data
}

// 钱包余额
export async function getWalletBalance(address) {
  const response = await api.get(`/api/wallet/balance/${address}`)
  return response.data.data
}

// 交换报价
export async function getSwapQuote(tokenIn, amountIn, userAddress) {
  const response = await api.post('/api/swap/quote', {
    tokenIn,
    amountIn,
    userAddress,
  })
  return response.data.data
}

// 执行交换
export async function executeSwap(tokenIn, amountIn, minAmountOut, to, userAddress) {
  const response = await api.post('/api/swap/execute', {
    tokenIn,
    amountIn,
    minAmountOut,
    to,
    userAddress,
  })
  return response.data
}

// 获取价格
export async function getPrice(baseToken) {
  const response = await api.get(`/api/swap/price/${baseToken}`)
  return response.data.data
}

// 购买代币
export async function buyToken(tokenOut, amountIn, minAmountOut, userAddress) {
  const response = await api.post('/api/trade/buy', {
    tokenOut,
    amountIn,
    minAmountOut,
    userAddress,
  })
  return response.data
}

// 出售代币
export async function sellToken(tokenIn, amountIn, minAmountOut, userAddress) {
  const response = await api.post('/api/trade/sell', {
    tokenIn,
    amountIn,
    minAmountOut,
    userAddress,
  })
  return response.data
}

// 用户状态
export async function getUserStatus(address) {
  const response = await api.get(`/api/user/status/${address}`)
  return response.data.data
}

// 用户代币列表
export async function getUserTokens(address) {
  const response = await api.get(`/api/user/tokens/${address}`)
  return response.data.data
}

// 检查授权
export async function checkApproval(token, userAddress) {
  const response = await api.post('/api/approval/check', {
    token,
    userAddress,
  })
  return response.data.data
}

// 构建授权交易
export async function buildApproval(token, amount, userAddress) {
  const response = await api.post('/api/approval/build', {
    token,
    amount,
    userAddress,
  })
  return response.data.data
}

export default api

