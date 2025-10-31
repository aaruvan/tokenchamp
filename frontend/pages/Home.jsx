import React, { useEffect, useState } from 'react'
import ClickSparkShim from '../shared/ClickSparkShim'
import Ticker from '../shared/Ticker'
import { tournamentAPI } from '../services/api'

function Home() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

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

  return (
    <div>
      <section className="hero">
        <div className="hero-orb hero-orb--cyan" />
        <div className="hero-orb" />
        <h1 className="hero-title">Compete. Win. Own the Moment.</h1>
        <p className="hero-sub">
          TokenChamp lets you enter real tournaments and mint verifiable Champion NFTs on Solana.
          Your victories, on-chain and forever.
        </p>
        
      </section>

      <div style={{ marginTop: '1rem', marginBottom: '1.2rem' }}>
        <Ticker />
      </div>

      {/* Use Cases */}
      <section className="card usecases">
        {(() => {
          const modules = import.meta.glob('../assets/usecases/*', { eager: true, as: 'url' })
          const imgList = Object.values(modules)
          const fallback = '/badge-placeholder.png'
          const data = [
            {
              key: 'esports',
              title: 'E‑sports Tournaments',
              desc: 'Run on-chain brackets, verify winners, and issue Champion NFTs to teams and MVPs across your favorite titles.'
            },
            {
              key: 'traditional',
              title: 'Traditional Sports Tournaments',
              desc: 'From basketball to soccer, automate registration, formats, and verifiable on‑chain trophies.'
            },
            {
              key: 'intramurals',
              title: 'Intramural Leagues',
              desc: 'Campus leagues track seasons and standings, then crown winners with collectible, shareable badges.'
            },
            {
              key: 'any',
              title: 'Virtually Any Tournament',
              desc: 'Rec leagues, high‑school competitions, trading competitions—plug in formats and mint proof of victory.'
            }
          ]
          const images = [imgList[0] || fallback, imgList[1] || fallback, imgList[2] || fallback, imgList[3] || fallback]
          // simple intersection observer to reveal rows on scroll
          setTimeout(() => {
            try {
              const els = document.querySelectorAll('.usecase-row.reveal')
              const obs = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add('in')
                  }
                })
              }, { threshold: 0.2 })
              els.forEach((el) => obs.observe(el))
            } catch (e) {}
          }, 0)

          return (
            <div className="usecases-grid">
              {data.map((uc, i) => (
                <div className="usecase-row reveal" key={uc.key}>
                  <div className="usecase-inner">
                    {i % 2 === 1 ? (
                      <>
                        <img className="usecase-media" src={images[i]} alt={uc.title} />
                        <div className="usecase-meta">
                          <div className="usecase-title">{uc.title}</div>
                          <div className="usecase-desc">{uc.desc}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="usecase-meta">
                          <div className="usecase-title">{uc.title}</div>
                          <div className="usecase-desc">{uc.desc}</div>
                        </div>
                        <img className="usecase-media" src={images[i]} alt={uc.title} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </section>

      {/* Get Started card with primary actions */}
      <section className="card getstarted">
        <h2>Get Started</h2>
        <div className="getstarted-actions">
          <div className="getstarted-actions-row">
            <ClickSparkShim>
              <a href="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Register a Team</a>
            </ClickSparkShim>
            <ClickSparkShim>
              <a href="/hall-of-champions" className="btn btn-secondary" style={{ textDecoration: 'none' }}>View Champions</a>
            </ClickSparkShim>
          </div>
          <ClickSparkShim>
            <a href="mailto:contact@tokenchamp.app" className="cta-link" style={{ textDecoration: 'none' }}>Get in Touch</a>
          </ClickSparkShim>
          <p className="getstarted-desc">Get in touch with us to have your tournament added, or jump right in.</p>
        </div>
      </section>

      <div className="card">
      <h2>Available Tournaments</h2>

      {loading ? (
        <div className="loading">Loading tournaments...</div>
      ) : tournaments.length === 0 ? (
        <p style={{ color: '#999' }}>No tournaments available at the moment. Check back soon!</p>
      ) : (
        <div className="tournament-list">
          {tournaments.map(tournament => (
            <div key={tournament.id} className="tournament-card spotlight-card" onMouseMove={(e)=>{
              const t=e.currentTarget; const r=t.getBoundingClientRect();
              t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
              t.style.setProperty('--my', (e.clientY - r.top) + 'px');
            }}>
              <h3>{tournament.name}</h3>
              <p><strong>Tournament:</strong> {tournament.tournament_name}</p>
              <p><strong>Format:</strong> {tournament.format_type}</p>
              <p><strong>Month:</strong> {tournament.month} {tournament.year}</p>
              <p><strong>Teams Registered:</strong> {tournament.team_count}</p>
              <p style={{ marginTop: '1rem' }}>
                <ClickSparkShim>
                <a href="/register" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Register Now
                </a>
                </ClickSparkShim>
              </p>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default Home

