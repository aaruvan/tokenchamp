import React, { useState } from 'react'
import ClickSparkShim from '../shared/ClickSparkShim'
import { winnerAPI } from '../services/api'

function Dashboard() {
  const [walletAddress, setWalletAddress] = useState('')
  const [wins, setWins] = useState([])
  const [loading, setLoading] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)

  const maskWalletAddress = (addr) => {
    if (!addr) return ''
    if (addr.length <= 8) {
      const first = addr.slice(0, 2)
      const last = addr.slice(-2)
      const maskLength = Math.max(0, addr.length - 4)
      return `${first}${'•'.repeat(maskLength)}${last}`
    }
    const head = addr.slice(0, 4)
    const tail = addr.slice(-4)
    const maskLength = Math.max(4, addr.length - 8)
    return `${head}${'•'.repeat(maskLength)}${tail}`
  }

  // Check if Phantom is installed
  const isPhantomInstalled = typeof window !== 'undefined' && window.solana && window.solana.isPhantom

  const fetchWins = async (address) => {
    setLoading(true)
    try {
      const response = await winnerAPI.getWinsByWallet(address)
      setWins(response.data.wins)
    } catch (error) {
      console.error('Error fetching wins:', error)
      setWins([])
    } finally {
      setLoading(false)
    }
  }

  const connectPhantom = async () => {
    try {
      const response = await window.solana.connect()
      const publicKey = response.publicKey.toString()
      setWalletAddress(publicKey)
      setWalletConnected(true)
      // Auto-fetch badges
      await fetchWins(publicKey)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await fetchWins(walletAddress)
  }

  return (
    <div>
      <section className="hero-mini">
        <h1 className="neon-text">Your Champion Badges</h1>
        <p>Connect your Solana address to view on-chain wins.</p>
      </section>
      <div className="card">

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        {/* Wallet Connect Options */}
        {isPhantomInstalled && !walletConnected && (
          <div style={{ marginBottom: '1rem' }}>
            <ClickSparkShim>
              <button 
                type="button"
                onClick={connectPhantom}
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '0.5rem' }}
              >
                👛 Connect Phantom Wallet
              </button>
            </ClickSparkShim>
            <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
              <span style={{ color: '#666' }}>or</span>
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="wallet">Wallet Address</label>
          <input
            type="password"
            id="wallet"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter your Solana wallet address"
            autoComplete="off"
            spellCheck="false"
            inputMode="text"
            required
          />
          {walletAddress && (
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
              Masked: {maskWalletAddress(walletAddress)}
            </p>
          )}
        </div>
        
        {!walletConnected && (
          <ClickSparkShim>
            <button type="submit" className="btn btn-primary">
              View Badges
            </button>
          </ClickSparkShim>
        )}
        
        {!isPhantomInstalled && (
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>
            💡 Tip: <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">Download Phantom</a> for one-click wallet connection
          </p>
        )}
      </form>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : wins.length === 0 ? (
        <p style={{ color: '#999' }}>No wins found for this wallet address.</p>
      ) : (
        <div className="champion-grid">
          {wins.map(win => (
            <div key={win.id} className="champion-card spotlight-card" onMouseMove={(e)=>{
              const t=e.currentTarget; const r=t.getBoundingClientRect();
              t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
              t.style.setProperty('--my', (e.clientY - r.top) + 'px');
            }}>
              {win.badge_image_url && (
                <img src={win.badge_image_url} alt="Badge" className="champion-badge" />
              )}
              <h3>{win.team_name}</h3>
              <p><strong>Tournament:</strong> {win.tournament_name}</p>
              <p><strong>Month:</strong> {win.month} {win.year}</p>
              {win.nft_token_id && (
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  NFT Token: {win.nft_token_id.substring(0, 10)}...
                </p>
              )}
              {win.badge_image_url && (
                <ClickSparkShim>
                  <a 
                    href={win.badge_image_url} 
                    download
                    className="btn btn-secondary"
                    style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}
                  >
                    Download Badge
                  </a>
                </ClickSparkShim>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default Dashboard

