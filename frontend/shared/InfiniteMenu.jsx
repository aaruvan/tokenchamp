import React, { useMemo } from 'react'

export default function InfiniteMenu({ items = [] }) {
  const doubled = useMemo(() => [...items, ...items], [items])
  return (
    <div className="infmenu-wrap">
      <div className="infmenu-track">
        {doubled.map((it, i) => (
          <a key={i} className="infmenu-card" href={it.link || '#'} target={it.link ? '_blank' : undefined} rel="noreferrer">
            <img src={it.image} alt={it.team_name || it.title || `item-${i}`} />
            <div className="infmenu-meta">
              <div className="infmenu-title">{it.team_name || it.title || 'Item'}</div>
              {it.sport && (
                <div className="infmenu-desc"><strong>Sport:</strong> {it.sport}</div>
              )}
              {it.semester && (
                <div className="infmenu-desc"><strong>Semester:</strong> {it.semester} {it.year}</div>
              )}
              {it.created_at && (
                <div className="infmenu-desc">Won: {new Date(it.created_at).toLocaleDateString()}</div>
              )}
              {!it.sport && it.description && (
                <div className="infmenu-desc">{it.description}</div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}


