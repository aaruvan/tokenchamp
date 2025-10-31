import React, { useEffect, useState } from 'react'
import ClickSparkShim from '../shared/ClickSparkShim'
import { CardBody, CardContainer, CardItem } from '../shared/ui/3d-card'
import InfiniteMenu from '../shared/InfiniteMenu'
import { winnerAPI } from '../services/api'

function HallOfChampions() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)

  // Load gallery images to use for all champion visuals
  const galleryModules = import.meta.glob('../assets/gallery/*.{png,jpg,jpeg,webp,gif,PNG,JPG,JPEG,WEBP,GIF}', { eager: true, as: 'url' })
  const galleryImages = Object.values(galleryModules)
  const fallbackImg = '/badge-placeholder.png'

  const demoWinners = [
    { id: 'm1', team_name: 'Neon Raiders', tournament_name: 'Basketball', month: 'Fall', year: 2025, badge_image_url: '/badge-placeholder.png', created_at: new Date().toISOString() },
    { id: 'm2', team_name: 'Cyber Foxes', tournament_name: 'Soccer', month: 'Fall', year: 2025, badge_image_url: '/badge-placeholder.png', created_at: new Date().toISOString() },
    { id: 'm3', team_name: 'Quantum Knights', tournament_name: 'Volleyball', month: 'Fall', year: 2025, badge_image_url: '/badge-placeholder.png', created_at: new Date().toISOString() }
  ]

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    try {
      setLoading(true)
      const response = await winnerAPI.getHallOfChampions()
      setWinners(response.data.winners)
    } catch (error) {
      console.error('Error fetching winners:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section className="hero-mini">
        <h1 className="neon-text">Hall of Champions</h1>
        <p>Every victory, immortalized on-chain.</p>
      </section>
      
      <div className="card">
        <h2>Featured</h2>

      {loading ? (
        <div className="loading">Loading champions...</div>
      ) : winners.length === 0 ? (
        (() => {
          return (
            <div className="hoc-grid">
              {demoWinners.map((winner, i) => (
                <CardContainer key={winner.id} className="inter-var">
                  <CardBody className="big-card group-card dark:bg-black dark:border-white/[0.2] border-black/[0.1]">
                    <CardItem translateZ={100} className="w-full mt-2">
                      <img src={galleryImages[i % galleryImages.length] || fallbackImg} alt="Champion Badge" className="hoc-nft" />
                    </CardItem>
                    <CardItem translateZ={50}>
                      <h3>{winner.team_name}</h3>
                    </CardItem>
                    <CardItem translateZ={40}>
                      <p><strong>Tournament:</strong> {winner.tournament_name}</p>
                    </CardItem>
                    <CardItem translateZ={30}>
                      <p><strong>Month:</strong> {winner.month} {winner.year}</p>
                    </CardItem>
                    <CardItem translateZ={20}>
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Won: {new Date(winner.created_at).toLocaleDateString()}
                      </p>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              ))}
            </div>
          )
        })()
      ) : (
        <div className="hoc-grid">
          {winners.map((winner, i) => (
            <CardContainer key={winner.id} className="inter-var">
              <CardBody className="big-card group-card dark:bg-black dark:border-white/[0.2] border-black/[0.1]">
                <CardItem translateZ={100} className="w-full mt-2">
                  <img src={(galleryImages[i % galleryImages.length]) || (winner.badge_image_url) || fallbackImg} alt="Champion Badge" className="hoc-nft" />
                </CardItem>
                <CardItem translateZ={60}>
                  <h3>{winner.team_name}</h3>
                </CardItem>
                  <CardItem translateZ={50}>
                    <p><strong>Tournament:</strong> {winner.tournament_name}</p>
                  </CardItem>
                  <CardItem translateZ={40}>
                    <p><strong>Month:</strong> {winner.month} {winner.year}</p>
                  </CardItem>
                {winner.created_at && (
                  <CardItem translateZ={30}>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      Won: {new Date(winner.created_at).toLocaleDateString()}
                    </p>
                  </CardItem>
                )}
              </CardBody>
            </CardContainer>
          ))}
        </div>
      )}
      </div>

      {/* Infinite menu directly under 3D row using gallery images */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>More Champions</h2>
        {(() => {
          const sourceData = winners.length > 0 ? winners : demoWinners
          const items = [...sourceData, ...sourceData].map((w, idx) => ({
            image: galleryImages[idx % galleryImages.length] || fallbackImg,
            link: '#',
            team_name: w.team_name,
            tournament_name: w.tournament_name,
            month: w.month,
            year: w.year,
            created_at: w.created_at
          }))
          return (
            <div style={{ height: '600px', position: 'relative', marginTop: '0.8rem' }}>
              <InfiniteMenu items={items} />
            </div>
          )
        })()}
      </section>

      
    </div>
  )
}

export default HallOfChampions

