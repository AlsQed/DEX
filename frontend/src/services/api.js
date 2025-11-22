import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
})

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器，统一处理错误
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      error.message = '无法连接到后端服务器。请确保后端 API 服务器正在运行 (npm run server)'
    }
    return Promise.reject(error)
  }
)

export async function getNetworkConfig() {
  const response = await api.get('/api/wallet/connect')
  return response.data.data
}

export async function getWalletBalance(address) {
  const response = await api.get(`/api/wallet/balance/${address}`)
  return response.data.data
}

export async function getSwapQuote(tokenIn, amountIn, userAddress) {
  const response = await api.post('/api/swap/quote', {
    tokenIn,
    amountIn,
    userAddress,
  })
  return response.data.data
}

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

export async function getPrice(baseToken) {
  const response = await api.get(`/api/swap/price/${baseToken}`)
  return response.data.data
}

export async function checkApproval(token, userAddress) {
  const response = await api.post('/api/approval/check', {
    token,
    userAddress,
  })
  return response.data.data
}

export async function buildApproval(token, amount, userAddress) {
  const response = await api.post('/api/approval/build', {
    token,
    amount,
    userAddress,
  })
  return response.data.data
}

// Liquidity related API
export async function getPoolInfo(address) {
  const response = await api.get(`/api/liquidity/pool/${address}`)
  return response.data.data
}

export async function addLiquidity(amount0, amount1, userAddress) {
  const response = await api.post('/api/liquidity/add', {
    amount0,
    amount1,
    userAddress,
  })
  return response.data.data
}

export async function removeLiquidity(lpAmount, userAddress) {
  const response = await api.post('/api/liquidity/remove', {
    lpAmount,
    userAddress,
  })
  return response.data.data
}

export default api

