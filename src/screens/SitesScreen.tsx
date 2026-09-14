import { useState } from 'react'
import type { MapInfo, Operator, Site } from '../types'
import { SmartImage } from '../components/SmartImage'
import { Modal } from '../components/Modal'
import { siteDisplayName } from '../lib/catalog'

interface Props {
  operator: Operator
  map: MapInfo
  sites: Site[]
  countForSite: (operatorId: string, mapId: string, siteId: string) => number
  onBack: () => void
  onSelect: (site: Site) => void
  onAddSite: (name: string, floor: string) => void
  onRemoveSite: (siteId: string) => void
}

export function SitesScreen({ operator, map, sites, countForSite, onBack, onSelect, onAddSite, onRemoveSite }: Props) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [floor, setFloor] = useState('')
  const [confirming, setConfirming] = useState<Site | null>(null)

  function submit() {
    if (!name.trim()) return
    onAddSite(name, floor)
    setName('')
    setFloor('')
    setAdding(false)
  }

  return (
    <section className="screen">
      <header className="screen-head">
        <div className="head-left">
          <button type="button" className="back-btn" onClick={onBack}>
            ← Maps
          </button>
          <div className="head-title">
            {map.image && <SmartImage src={map.image} alt={map.name} className="head-icon" />}
            <div>
              <h1>{map.name}</h1>
              <p className="subtitle">
                Bomb sites for <strong>{operator.name}</strong>.
              </p>
            </div>
          </div>
        </div>
        <button type="button" className="btn primary" onClick={() => setAdding(true)}>
          + Add site
        </button>
      </header>

      <div className="site-grid">
        {sites.map((site, index) => {
          const count = countForSite(operator.id, map.id, site.id)
          return (
            <div key={site.id} className="site-card-row">
              <button type="button" className="site-card" onClick={() => onSelect(site)}>
                <span className="site-number">{index + 1}</span>
                <span className="site-names">
                  <span className="site-name">{site.name}</span>
                  {site.floor && <span className="site-floor">{site.floor}</span>}
                </span>
                <span className={`site-count ${count > 0 ? 'has' : ''}`}>{count}</span>
              </button>
              <button
                type="button"
                className="icon-btn danger site-remove"
                title="Delete site and its setups"
                onClick={() => setConfirming(site)}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {sites.length === 0 && (
        <p className="empty">
          No sites yet for this map. Click <strong>+ Add site</strong> to create one.
        </p>
      )}

      {adding && (
        <Modal title="Add site" onClose={() => setAdding(false)}>
          <label className="field">
            <span>Site name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CCTV Room / Cash Room" autoFocus />
          </label>
          <label className="field">
            <span>Floor (optional)</span>
            <input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="e.g. 2F" />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="button" className="btn primary" onClick={submit} disabled={!name.trim()}>
              Add site
            </button>
          </div>
        </Modal>
      )}

      {confirming && (
        <Modal title="Delete site?" onClose={() => setConfirming(null)}>
          <p>
            This removes <strong>{siteDisplayName(confirming)}</strong> and all setups saved on it.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setConfirming(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                onRemoveSite(confirming.id)
                setConfirming(null)
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}
