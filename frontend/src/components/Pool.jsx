import React, { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { getPoolInfo, addLiquidity, removeLiquidity, checkApproval, buildApproval } from '../services/api'
import { ethers } from 'ethers'
import './Pool.css'

function Pool() {
  const { address, signer, networkConfig } = useWallet()
  const [activeTab, setActiveTab] = useState('position')
  const [poolInfo, setPoolInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Add liquidity state
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [needsApproval0, setNeedsApproval0] = useState(false)
  const [needsApproval1, setNeedsApproval1] = useState(false)
  
  // Remove liquidity state
  const [lpAmount, setLpAmount] = useState('')

  const token0Address = networkConfig?.contracts?.Token0 || ''
  const token1Address = networkConfig?.contracts?.Token1 || ''
  const dexAddress = networkConfig?.contracts?.DEX || ''

  useEffect(() => {
    if (address) {
      fetchPoolInfo()
    }
  }, [address])

  const fetchPoolInfo = async () => {
    if (!address) return

    try {
      setLoading(true)
      const info = await getPoolInfo(address)
      setPoolInfo(info)
      setError(null)
    } catch (err) {
      console.error('Error fetching pool info:', err)
      setError(err.message || 'Failed to load pool information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'add' && amount0 && amount1 && address && token0Address && token1Address) {
      checkApprovals()
    }
  }, [amount0, amount1, address, token0Address, token1Address, activeTab])

  const checkApprovals = async () => {
    if (!token0Address || !token1Address || !address || !dexAddress) return

    try {
      const [approval0, approval1] = await Promise.all([
        checkApproval(token0Address, address),
        checkApproval(token1Address, address)
      ])
      
      const amount0Wei = ethers.parseUnits(amount0 || '0', 18)
      const amount1Wei = ethers.parseUnits(amount1 || '0', 18)
      
      setNeedsApproval0(approval0.allowance < amount0Wei)
      setNeedsApproval1(approval1.allowance < amount1Wei)
    } catch (err) {
      console.error('Error checking approvals:', err)
    }
  }


  const handleApproveToken0 = async () => {
    if (!signer || !token0Address) return

    setLoading(true)
    setError(null)

    try {
      const approvalData = await buildApproval(token0Address, 'max', address)
      const tx = await signer.sendTransaction(approvalData)
      await tx.wait()
      setNeedsApproval0(false)
      setSuccess('Token0 approval successful!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Approval failed')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveToken1 = async () => {
    if (!signer || !token1Address) return

    setLoading(true)
    setError(null)

    try {
      const approvalData = await buildApproval(token1Address, 'max', address)
      const tx = await signer.sendTransaction(approvalData)
      await tx.wait()
      setNeedsApproval1(false)
      setSuccess('Token1 approval successful!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Approval failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLiquidity = async () => {
    if (!signer || !amount0 || !amount1) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (needsApproval0 || needsApproval1) {
        setError('Please approve tokens first')
        setLoading(false)
        return
      }

      const txData = await addLiquidity(amount0, amount1, address)
      
      if (!txData.checks.balance0.sufficient || !txData.checks.balance1.sufficient) {
        setError('Insufficient token balance')
        setLoading(false)
        return
      }

      const tx = await signer.sendTransaction({
        to: txData.to,
        data: txData.data,
        value: txData.value
      })

      setSuccess('Transaction submitted, waiting for confirmation...')
      await tx.wait()
      setSuccess('Liquidity added successfully!')
      setAmount0('')
      setAmount1('')
      await fetchPoolInfo()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to add liquidity')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!signer || !lpAmount) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const txData = await removeLiquidity(lpAmount, address)
      
      if (!txData.checks.lpBalance.sufficient) {
        setError('Insufficient LP token balance')
        setLoading(false)
        return
      }

      const tx = await signer.sendTransaction({
        to: txData.to,
        data: txData.data,
        value: txData.value
      })

      setSuccess('Transaction submitted, waiting for confirmation...')
      await tx.wait()
      setSuccess('Liquidity removed successfully!')
      setLpAmount('')
      await fetchPoolInfo()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to remove liquidity')
    } finally {
      setLoading(false)
    }
  }

  const getTokenSymbol = (address) => {
    if (!address || !networkConfig?.contracts) return address?.slice(0, 6) + '...'
    if (address.toLowerCase() === networkConfig.contracts.Token0?.toLowerCase()) return 'TKA'
    if (address.toLowerCase() === networkConfig.contracts.Token1?.toLowerCase()) return 'TKB'
    return address?.slice(0, 6) + '...'
  }

  if (loading && !poolInfo) {
    return (
      <div className="pool-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="pool-container">
      <div className="pool-header">
        <h2>Liquidity Pool</h2>
        <button onClick={fetchPoolInfo} className="refresh-btn">Refresh</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="pool-tabs">
        <button
          className={`pool-tab ${activeTab === 'position' ? 'active' : ''}`}
          onClick={() => setActiveTab('position')}
        >
          My Position
        </button>
        <button
          className={`pool-tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add Liquidity
        </button>
        <button
          className={`pool-tab ${activeTab === 'remove' ? 'active' : ''}`}
          onClick={() => setActiveTab('remove')}
        >
          Remove Liquidity
        </button>
      </div>

      <div className="pool-content">
        {activeTab === 'position' && (
          <div className="position-info">
            {poolInfo ? (
              <>
                <div className="info-section">
                  <h3>Your LP Position</h3>
                  <div className="info-row">
                    <span>LP Balance:</span>
                    <span className="value">{poolInfo.lpBalance} LPD</span>
                  </div>
                  <div className="info-row">
                    <span>Pool Share:</span>
                    <span className="value">{poolInfo.poolShare}%</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Underlying Assets</h3>
                  <div className="info-row">
                    <span>{getTokenSymbol(poolInfo.underlyingTokens.token0.address)}:</span>
                    <span className="value">{poolInfo.underlyingTokens.token0.amount}</span>
                  </div>
                  <div className="info-row">
                    <span>{getTokenSymbol(poolInfo.underlyingTokens.token1.address)}:</span>
                    <span className="value">{poolInfo.underlyingTokens.token1.amount}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Pool Reserves</h3>
                  <div className="info-row">
                    <span>{getTokenSymbol(poolInfo.poolReserves.token0.address)}:</span>
                    <span className="value">{poolInfo.poolReserves.token0.reserve}</span>
                  </div>
                  <div className="info-row">
                    <span>{getTokenSymbol(poolInfo.poolReserves.token1.address)}:</span>
                    <span className="value">{poolInfo.poolReserves.token1.reserve}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-position">No liquidity position found</div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="add-liquidity">
            <div className="input-group">
              <label>{getTokenSymbol(token0Address)} Amount</label>
              <input
                type="number"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
                placeholder="0.0"
              />
              {needsApproval0 && (
                <button onClick={handleApproveToken0} className="approve-btn" disabled={loading}>
                  {loading ? 'Processing...' : 'Approve Token0'}
                </button>
              )}
            </div>

            <div className="input-group">
              <label>{getTokenSymbol(token1Address)} Amount</label>
              <input
                type="number"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                placeholder="0.0"
              />
              {needsApproval1 && (
                <button onClick={handleApproveToken1} className="approve-btn" disabled={loading}>
                  {loading ? 'Processing...' : 'Approve Token1'}
                </button>
              )}
            </div>

            <button
              onClick={handleAddLiquidity}
              className="action-btn"
              disabled={loading || !amount0 || !amount1 || needsApproval0 || needsApproval1}
            >
              {loading ? 'Processing...' : 'Add Liquidity'}
            </button>
          </div>
        )}

        {activeTab === 'remove' && (
          <div className="remove-liquidity">
            <div className="input-group">
              <label>LP Token Amount</label>
              <input
                type="number"
                value={lpAmount}
                onChange={(e) => setLpAmount(e.target.value)}
                placeholder="0.0"
              />
              {poolInfo && (
                <button
                  onClick={() => setLpAmount(poolInfo.lpBalance)}
                  className="max-btn"
                >
                  MAX
                </button>
              )}
            </div>

            {poolInfo && lpAmount && (
              <div className="expected-amounts">
                <p>You will receive approximately:</p>
                <div className="info-row">
                  <span>{getTokenSymbol(token0Address)}:</span>
                  <span className="value">
                    {((parseFloat(poolInfo.underlyingTokens.token0.amount) * parseFloat(lpAmount)) / parseFloat(poolInfo.lpBalance) || 0).toFixed(6)}
                  </span>
                </div>
                <div className="info-row">
                  <span>{getTokenSymbol(token1Address)}:</span>
                  <span className="value">
                    {((parseFloat(poolInfo.underlyingTokens.token1.amount) * parseFloat(lpAmount)) / parseFloat(poolInfo.lpBalance) || 0).toFixed(6)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleRemoveLiquidity}
              className="action-btn"
              disabled={loading || !lpAmount}
            >
              {loading ? 'Processing...' : 'Remove Liquidity'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pool

