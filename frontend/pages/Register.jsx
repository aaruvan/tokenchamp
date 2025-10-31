import React, { useState, useEffect } from 'react'
import ClickSparkShim from '../shared/ClickSparkShim'
import { tournamentAPI } from '../services/api'

function Register() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
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

  const [formData, setFormData] = useState({
    tournament_id: '',
    team_name: '',
    player_names: '',
    captain_wallet_address: '',
    tournament_password: ''
  })

  const fieldSequence = ['tournament_id', 'tournament_password', 'team_name', 'player_names', 'captain_wallet_address']

  const isFieldComplete = (field) => {
    const value = formData[field]
    if (field === 'tournament_id') {
      return Boolean(value)
    }
    if (field === 'player_names') {
      return value.split('\n').some((name) => name.trim())
    }
    if (typeof value === 'string') {
      return value.trim().length > 0
    }
    return Boolean(value)
  }

  const shouldHighlightLabel = (field) => {
    const index = fieldSequence.indexOf(field)
    if (index === -1) return false
    if (index === 0) return true
    const prevField = fieldSequence[index - 1]
    return isFieldComplete(prevField) || isFieldComplete(field)
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  // Check if Phantom is installed
  const isPhantomInstalled = typeof window !== 'undefined' && window.solana && window.solana.isPhantom

  const connectPhantom = async () => {
    try {
      const response = await window.solana.connect()
      const publicKey = response.publicKey.toString()
      setFormData({
        ...formData,
        captain_wallet_address: publicKey
      })
      setWalletConnected(true)
      setMessage('Wallet connected successfully!')
      setMessageType('success')
    } catch (error) {
      setMessage('Failed to connect wallet. Please enter manually.')
      setMessageType('error')
    }
  }

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const response = await tournamentAPI.getAvailable()
      setTournaments(response.data.tournaments)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      // Parse player names from textarea
      const players = formData.player_names.split('\n').filter(name => name.trim())

      const registrationData = {
        ...formData,
        tournament_id: parseInt(formData.tournament_id),
        player_names: players
      }

      const response = await tournamentAPI.registerTeam(registrationData)
      
      setMessage('Team registered successfully!')
      setMessageType('success')
      
      // Reset form
      setFormData({
        tournament_id: '',
        team_name: '',
        player_names: '',
        captain_wallet_address: '',
        tournament_password: ''
      })
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to register team')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <section className="hero-mini">
        <h1 className="neon-text">Register Your Team</h1>
        <p>Secure your spot and mint glory on-chain when you win.</p>
      </section>
      <div className="card">

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h2 className="section-title">Tournament Access</h2>
        <hr className="divider" />
        <div className="form-grid">
          <div className="form-group">
          <label
            htmlFor="tournament_id"
            className={`field-label ${shouldHighlightLabel('tournament_id') ? 'field-label--active' : ''}`}
          >
            Select Tournament *
          </label>
          <select
            id="tournament_id"
            name="tournament_id"
            value={formData.tournament_id}
            onChange={handleChange}
            required
          >
              <option value="">Choose a tournament...</option>
              {tournaments.map(tournament => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} - {tournament.tournament_name} ({tournament.month} {tournament.year})
                </option>
              ))}
          </select>
          </div>

          <div className="form-group">
          <label
            htmlFor="tournament_password"
            className={`field-label ${shouldHighlightLabel('tournament_password') ? 'field-label--active' : ''}`}
          >
            Tournament Password *
          </label>
          <div className="input-adorn">
            <span className="icon">🔒</span>
            <input
              type="password"
              id="tournament_password"
              name="tournament_password"
              value={formData.tournament_password}
              onChange={handleChange}
              required
              placeholder="Password provided by the tournament admin"
            />
          </div>
          <p className="field-hint">Ask your tournament admin for the password. Case-sensitive.</p>
          </div>
        </div>

        <h2 className="section-title">Team Details</h2>
        <hr className="divider" />
        <div className="form-grid">
          <div className="form-group">
          <label
            htmlFor="team_name"
            className={`field-label ${shouldHighlightLabel('team_name') ? 'field-label--active' : ''}`}
          >
            Team Name *
          </label>
          <input
            type="text"
            id="team_name"
            name="team_name"
            value={formData.team_name}
            onChange={handleChange}
            required
            placeholder="e.g., Thunderbolts"
          />
          </div>

          <div className="form-group form-span-2">
          <label
            htmlFor="player_names"
            className={`field-label ${shouldHighlightLabel('player_names') ? 'field-label--active' : ''}`}
          >
            Player Names (one per line) *
          </label>
          <textarea
            id="player_names"
            name="player_names"
            value={formData.player_names}
            onChange={handleChange}
            required
            rows="5"
            placeholder="Player 1&#10;Player 2&#10;Player 3"
          />
          </div>

          <div className="form-group form-span-2">
          <label
            htmlFor="captain_wallet_address"
            className={`field-label ${shouldHighlightLabel('captain_wallet_address') ? 'field-label--active' : ''}`}
          >
            Captain's Solana Wallet Address *
          </label>
          
          {/* Wallet Connect Options */}
          {isPhantomInstalled && !walletConnected && (
            <div style={{ marginBottom: '0.5rem' }}>
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
          
          <div className="input-adorn">
            <span className="icon">👛</span>
            <input
              type="password"
              id="captain_wallet_address"
              name="captain_wallet_address"
              value={formData.captain_wallet_address}
              onChange={handleChange}
              required
              placeholder="e.g., 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
              autoComplete="off"
              spellCheck="false"
              inputMode="text"
            />
          </div>
          <p className="field-hint">
            {walletConnected 
              ? '✓ Wallet connected! ' 
              : isPhantomInstalled 
                ? 'Connect with Phantom or enter manually. ' 
                : 'Enter a valid Solana address. '}
            This will receive the Champion NFT if you win.
          </p>
          {formData.captain_wallet_address && (
            <p className="field-hint" style={{ marginTop: '0.35rem' }}>
              Masked: {maskWalletAddress(formData.captain_wallet_address)}
            </p>
          )}
          {!isPhantomInstalled && (
            <p className="field-hint" style={{ marginTop: '0.5rem' }}>
              💡 Tip: <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">Download Phantom</a> for one-click wallet connection
            </p>
          )}
          </div>
        </div>

        <ClickSparkShim>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register Team'}
          </button>
        </ClickSparkShim>
      </form>
      </div>
    </div>
  )
}

export default Register

