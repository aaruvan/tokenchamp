import React from 'react'

const items = [
  { sym: 'CHAMP', text: 'Sentinels • Just Minted', dir: 'up' },
  { sym: 'CHAMP', text: 'Cloud9 • Just Minted', dir: 'up' },
  { sym: 'CHAMP', text: 'T1 • Just Minted', dir: 'down' },
  { sym: 'CHAMP', text: 'G2 Esports • Just Minted', dir: 'up' },
  { sym: 'CHAMP', text: 'Fnatic • Just Minted', dir: 'up' },
  { sym: 'CHAMP', text: 'Paper Rex • Just Minted', dir: 'down' },
  { sym: 'CHAMP', text: '100 Thieves • Just Minted', dir: 'up' },
  { sym: 'CHAMP', text: 'Team Liquid • Just Minted', dir: 'down' },
  { sym: 'CHAMP', text: 'LOUD • Just Minted', dir: 'up' },
  { sym: 'CHAMP', text: 'Windy City Bulls • Just Minted', dir: 'down' },
]

export default function Ticker() {
  const row = [...items, ...items, ...items]
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {row.map((i, idx) => (
          <span key={idx} className={`chip chip--${i.dir}`}>
            <span className="chip-dot" /> {i.text}
          </span>
        ))}
      </div>
    </div>
  )
}


