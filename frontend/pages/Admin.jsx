import React, { useState } from 'react'
import ClickSparkShim from '../shared/ClickSparkShim'
import { adminAPI, winnerAPI, nftAPI } from '../services/api'

function Admin() {
  const [activeTab, setActiveTab] = useState('create')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [tournamentData, setTournamentData] = useState({
    name: '',
    tournament_name: '',
    format_type: 'knockout',
    month: 'January',
    year: new Date().getFullYear(),
    badge_image_url: '',
    badge_metadata_url: '',
    tournament_password: ''
  })

  const [winnerData, setWinnerData] = useState({
    tournament_id: '',
    team_id: ''
  })

  const handleTournamentChange = (e) => {
    setTournamentData({
      ...tournamentData,
      [e.target.name]: e.target.value
    })
  }

  const handleWinnerChange = (e) => {
    setWinnerData({
      ...winnerData,
      [e.target.name]: e.target.value
    })
  }

  const handleCreateTournament = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      await adminAPI.createTournament(tournamentData)
      setMessage('Tournament created successfully!')
      setMessageType('success')
      setTournamentData({
        name: '',
        tournament_name: '',
        format_type: 'knockout',
        month: 'January',
        year: new Date().getFullYear(),
        badge_image_url: '',
        badge_metadata_url: '',
        tournament_password: ''
      })
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create tournament')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeclareWinner = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const data = {
        tournament_id: parseInt(winnerData.tournament_id),
        team_id: parseInt(winnerData.team_id)
      }
      await winnerAPI.declareWinner(data)
      setMessage('Winner declared and NFT minting triggered!')
      setMessageType('success')
      setWinnerData({ tournament_id: '', team_id: '' })
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to declare winner')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <section className="hero-mini">
        <h1 className="neon-text">🔧 Admin Panel</h1>
        <p>Manage tournaments, declare winners, trigger NFT minting.</p>
      </section>
      <div className="card">

      <div style={{ marginBottom: '2rem' }}>
        <ClickSparkShim>
          <button 
            onClick={() => setActiveTab('create')} 
            className="btn btn-secondary"
            style={{ marginRight: '0.6rem', outline: activeTab === 'create' ? '2px solid var(--primary)' : 'none' }}
          >
            Create Tournament
          </button>
        </ClickSparkShim>
        <ClickSparkShim>
          <button 
            onClick={() => setActiveTab('winner')} 
            className="btn btn-secondary"
            style={{ outline: activeTab === 'winner' ? '2px solid var(--primary)' : 'none' }}
          >
            Declare Winner
          </button>
        </ClickSparkShim>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      {activeTab === 'create' && (
        <form onSubmit={handleCreateTournament}>
          <h2>Create New Tournament</h2>

          <div className="form-group">
            <label htmlFor="name">Tournament Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={tournamentData.name}
              onChange={handleTournamentChange}
              required
              placeholder="e.g., Intramural Basketball Championship"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tournament_name">Tournament *</label>
            <input
              type="text"
              id="tournament_name"
              name="tournament_name"
              value={tournamentData.tournament_name}
              onChange={handleTournamentChange}
              required
              placeholder="e.g., Basketball, Football, Valorant, Chess"
            />
          </div>

          <div className="form-group">
            <label htmlFor="format_type">Format *</label>
            <select
              id="format_type"
              name="format_type"
              value={tournamentData.format_type}
              onChange={handleTournamentChange}
              required
            >
              <option value="knockout">Knockout</option>
              <option value="round-robin">Round Robin</option>
              <option value="double-elimination">Double Elimination</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="month">Month *</label>
            <select
              id="month"
              name="month"
              value={tournamentData.month}
              onChange={handleTournamentChange}
              required
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Year *</label>
            <input
              type="number"
              id="year"
              name="year"
              value={tournamentData.year}
              onChange={handleTournamentChange}
              required
              min="2020"
              max="2100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="badge_image_url">Badge Image URL</label>
            <input
              type="url"
              id="badge_image_url"
              name="badge_image_url"
              value={tournamentData.badge_image_url}
              onChange={handleTournamentChange}
              placeholder="https://example.com/badge.png"
            />
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              URL to the champion badge image
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="tournament_password">Registration Password (Optional)</label>
            <input
              type="text"
              id="tournament_password"
              name="tournament_password"
              value={tournamentData.tournament_password}
              onChange={handleTournamentChange}
              placeholder="Leave empty for open registration"
            />
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Teams will need this password to register. Leave empty to allow anyone to register.
            </p>
          </div>

          <ClickSparkShim>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Tournament'}
            </button>
          </ClickSparkShim>
        </form>
      )}

      {activeTab === 'winner' && (
        <form onSubmit={handleDeclareWinner}>
          <h2>Declare Tournament Winner</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            This will trigger automatic NFT minting for the winning team
          </p>

          <div className="form-group">
            <label htmlFor="tournament_id">Tournament ID *</label>
            <input
              type="number"
              id="tournament_id"
              name="tournament_id"
              value={winnerData.tournament_id}
              onChange={handleWinnerChange}
              required
              placeholder="e.g., 1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="team_id">Winning Team ID *</label>
            <input
              type="number"
              id="team_id"
              name="team_id"
              value={winnerData.team_id}
              onChange={handleWinnerChange}
              required
              placeholder="e.g., 5"
            />
          </div>

          <ClickSparkShim>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Declaring Winner...' : 'Declare Winner'}
            </button>
          </ClickSparkShim>
        </form>
      )}
      </div>
    </div>
  )
}

export default Admin

