import { useState } from 'react'
import type { Operator } from '../types'
import { SmartImage } from '../components/SmartImage'

interface Props {
  operators: Operator[]
  onSelect: (operator: Operator) => void
}

export function CharactersScreen({ operators, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visible = q ? operators.filter((o) => o.name.toLowerCase().includes(q)) : operators

  return (
    <section className="screen">
      <header className="screen-head">
        <div>
          <h1>Operators</h1>
          <p className="subtitle">Pick an operator to manage your lineups.</p>
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search operators…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {visible.length === 0 ? (
        <p className="empty">No operators found.</p>
      ) : (
        <div className="tile-grid">
          {visible.map((op) => (
            <button type="button" key={op.id} className="tile" onClick={() => onSelect(op)}>
              <SmartImage src={op.icon} alt={op.name} className="tile-img" fallback={op.name} />
              <span className="tile-label">{op.name}</span>
            </button>
          ))}
        </div>
      )}

      <footer className="screen-foot">
        <span className="hint">To add operators: drop <code>&lt;Name&gt;.png</code> files into <code>Assets/Operator Icons</code> and restart the dev server.</span>
      </footer>
    </section>
  )
}
