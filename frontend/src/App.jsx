import React, { useState } from 'react'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import Header from './components/Header'
import WalletConnect from './components/WalletConnect'
import Swap from './components/Swap'
import Pool from './components/Pool'
import './App.css'

function AppContent() {
  const { isConnected } = useWallet()
  const [activeTab, setActiveTab] = useState('swap')

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {!isConnected ? (
          <div className="connect-container">
            <WalletConnect />
          </div>
        ) : (
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'swap' ? 'active' : ''}`}
                onClick={() => setActiveTab('swap')}
              >
                Swap
              </button>
              <button
                className={`tab ${activeTab === 'pool' ? 'active' : ''}`}
                onClick={() => setActiveTab('pool')}
              >
                Pool
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'swap' && <Swap />}
              {activeTab === 'pool' && <Pool />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  )
}

export default App

