import { useState } from 'react'
import type { MapInfo, Operator, Setup } from '../types'
import { SmartImage } from '../components/SmartImage'

interface Props {
  operator: Operator
  maps: MapInfo[]
  setups: Setup[]
  onSelect: (map: MapInfo) => void
  onBack: () => void
}

export function MapsScreen({ operator, maps, setups, onSelect, onBack }: Props) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visible = q ? maps.filter((m) => m.name.toLowerCase().includes(q)) : maps

  return (
    <section className="screen">
      <header className="screen-head">
        <div className="head-left">
          <button type="button" className="back-btn" onClick={onBack}>
            ← Operators
          </button>
          <div className="head-title">
            {operator.icon && <SmartImage src={operator.icon} alt={operator.name} className="head-icon" />}
            <div>
              <h1>{operator.name}</h1>
              <p className="subtitle">Choose a map.</p>
            </div>
          </div>
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search maps…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {visible.length === 0 ? (
        <p className="empty">No maps found.</p>
      ) : (
        <div className="tile-grid">
          {visible.map((map) => {
            const count = setups.filter((s) => s.operatorId === operator.id && s.mapId === map.id).length
            return (
              <button type="button" key={map.id} className="tile map-tile" onClick={() => onSelect(map)}>
                <SmartImage src={map.image} alt={map.name} className="tile-img" fallback={map.name} />
                <span className="tile-label">{map.name}</span>
                {count > 0 && <span className="tile-badge">{count}</span>}
              </button>
            )
          })}
        </div>
      )}

      <footer className="screen-foot">
        <span className="hint">To add maps: drop <code>&lt;Map Name&gt;.webp</code> files into <code>Assets/Maps</code> and restart the dev server.</span>
      </footer>
    </section>
  )
}
