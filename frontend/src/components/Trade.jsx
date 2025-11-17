import React, { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { buyToken, sellToken, checkApproval, buildApproval } from '../services/api'
import { ethers } from 'ethers'
import './Trade.css'

function Trade() {
  const { address, signer, networkConfig } = useWallet()
  const [mode, setMode] = useState('buy')
  const [token, setToken] = useState('')
  const [amount, setAmount] = useState('')
  const [estimatedAmount, setEstimatedAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [needsApproval, setNeedsApproval] = useState(false)

  useEffect(() => {
    if (networkConfig?.contracts) {
      // Buy: 用Token0购买Token1 (buyToken的tokenOut参数是Token1)
      // Sell: 用Token1出售得到Token0 (sellToken的tokenIn参数是Token1)
      setToken(networkConfig.contracts.Token1)
    }
  }, [networkConfig, mode])

  useEffect(() => {
    if (amount && token && address) {
      fetchEstimate()
      if (mode === 'sell') {
        checkTokenApproval()
      }
    } else {
      setEstimatedAmount('')
    }
  }, [amount, token, mode, address])

  const fetchEstimate = async () => {
    if (!amount || !token) return

    try {
      if (mode === 'buy') {
        const result = await buyToken(token, amount, null, address)
        setEstimatedAmount(result.data.amountOut || '0')
      } else {
        const result = await sellToken(token, amount, null, address)
        setEstimatedAmount(result.data.amountOut || '0')
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching estimate:', err)
      setEstimatedAmount('0')
    }
  }

  const checkTokenApproval = async () => {
    if (!token || !address || mode !== 'sell') return

    try {
      const approval = await checkApproval(token, address)
      const amountWei = ethers.parseUnits(amount || '0', 18)
      setNeedsApproval(approval.allowance < amountWei)
    } catch (err) {
      console.error('Error checking approval:', err)
    }
  }

  const handleApprove = async () => {
    if (!signer || !token) return

    setLoading(true)
    setError(null)

    try {
      const approvalData = await buildApproval(token, 'max', address)
      const tx = await signer.sendTransaction(approvalData)
      await tx.wait()
      setNeedsApproval(false)
      setSuccess('Approval successful!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Approval failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async () => {
    if (!signer || !amount || !token) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'sell' && needsApproval) {
        setError('Please approve token first')
        setLoading(false)
        return
      }

      // Buy: 用Token0购买Token1 (tokenOut = Token1)
      // Sell: 用Token1出售得到Token0 (tokenIn = Token1)
      const result = mode === 'buy'
        ? await buyToken(token, amount, null, address)
        : await sellToken(token, amount, null, address)

      if (result.requiresApproval) {
        setNeedsApproval(true)
        setError('Token approval required')
        setLoading(false)
        return
      }

      const minAmountOut = (parseFloat(estimatedAmount) * 0.95).toFixed(6)
      const tradeData = result.data

      const tx = await signer.sendTransaction({
        to: tradeData.to,
        data: tradeData.data,
        value: tradeData.value
      })

      setSuccess('Transaction submitted, waiting for confirmation...')
      const receipt = await tx.wait()
      setSuccess(`${mode === 'buy' ? 'Buy' : 'Sell'} successful!`)
      setAmount('')
      setEstimatedAmount('')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.message || `${mode === 'buy' ? 'Buy' : 'Sell'} failed`)
    } finally {
      setLoading(false)
    }
  }

  const getTokenSymbol = (tokenAddress) => {
    if (!tokenAddress || !networkConfig?.contracts) return 'Token'
    const { Token0, Token1 } = networkConfig.contracts
    if (tokenAddress.toLowerCase() === (Token0 || '').toLowerCase()) return 'TKA'
    if (tokenAddress.toLowerCase() === (Token1 || '').toLowerCase()) return 'TKB'
    return 'Token'
  }

  // Buy模式：用Token0购买Token1
  // Sell模式：用Token1出售得到Token0
  const tokenIn = mode === 'buy' 
    ? networkConfig?.contracts?.Token0 
    : networkConfig?.contracts?.Token1
  const tokenOut = mode === 'buy'
    ? networkConfig?.contracts?.Token1
    : networkConfig?.contracts?.Token0

  return (
    <div className="trade-container">
      <h2>Buy & Sell</h2>

      <div className="mode-selector">
        <button
          className={`mode-button ${mode === 'buy' ? 'active' : ''}`}
          onClick={() => setMode('buy')}
        >
          Buy
        </button>
        <button
          className={`mode-button ${mode === 'sell' ? 'active' : ''}`}
          onClick={() => setMode('sell')}
        >
          Sell
        </button>
      </div>

      <div className="trade-card">
        <div className="trade-input-group">
          <label>{mode === 'buy' ? 'Pay Amount' : 'Sell Amount'}</label>
          <div className="input-wrapper">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
            <div className="token-display">
              <span>{tokenIn ? getTokenSymbol(tokenIn) : 'Token'}</span>
            </div>
          </div>
        </div>

        <div className="arrow">↓</div>

        <div className="trade-input-group">
          <label>Receive Amount (Estimated)</label>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="0.0"
              value={estimatedAmount}
              readOnly
              className="readonly"
            />
            <div className="token-display">
              <span>{tokenOut ? getTokenSymbol(tokenOut) : 'Token'}</span>
            </div>
          </div>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {mode === 'sell' && needsApproval ? (
          <button
            className="action-button approve-button"
            onClick={handleApprove}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Approve Token'}
          </button>
        ) : (
          <button
            className={`action-button ${mode === 'buy' ? 'buy-button' : 'sell-button'}`}
            onClick={handleTrade}
            disabled={loading || !amount || !estimatedAmount}
          >
            {loading ? 'Processing...' : mode === 'buy' ? 'Buy' : 'Sell'}
          </button>
        )}
      </div>
    </div>
  )
}

export default Trade

