import { useState } from 'react'
import type { MapInfo, Operator, Setup, Site } from '../types'
import { SmartImage } from '../components/SmartImage'
import { Modal } from '../components/Modal'
import { ImageDropzone } from '../components/ImageDropzone'
import { gadgetFor, pluralize, siteDisplayName } from '../lib/catalog'

interface Props {
  operator: Operator
  map: MapInfo
  site: Site
  setups: Setup[]
  uploadImage: (file: File) => Promise<string>
  onBack: () => void
  onAdd: (input: { title: string; description: string; images: string[]; gadgetCount?: number }) => void
  onUpdate: (id: string, patch: { title?: string; description?: string; images?: string[]; gadgetCount?: number }) => void
  onRemove: (id: string) => void
}

interface Editing {
  id: string | null
  title: string
  description: string
  images: string[]
  gadgetCount: number
}

const EMPTY: Editing = { id: null, title: '', description: '', images: [], gadgetCount: 1 }

function titleCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function SetupsScreen({ operator, map, site, setups, uploadImage, onBack, onAdd, onUpdate, onRemove }: Props) {
  const gadget = gadgetFor(operator.id)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [viewing, setViewing] = useState<Setup | null>(null)
  const [confirming, setConfirming] = useState<Setup | null>(null)

  function openNew() {
    setEditing({ ...EMPTY })
  }

  function openEdit(setup: Setup) {
    setEditing({
      id: setup.id,
      title: setup.title,
      description: setup.description,
      images: [...setup.images],
      gadgetCount: setup.gadgetCount ?? 1,
    })
  }

  function save() {
    if (!editing || !editing.title.trim()) return
    const payload = {
      title: editing.title.trim(),
      description: editing.description.trim(),
      images: editing.images,
      gadgetCount: gadget ? editing.gadgetCount : undefined,
    }
    if (editing.id) {
      onUpdate(editing.id, payload)
    } else {
      onAdd(payload)
    }
    setEditing(null)
  }

  const sorted = [...setups].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <section className="screen">
      <header className="screen-head">
        <div className="head-left">
          <button type="button" className="back-btn" onClick={onBack}>
            ← Sites
          </button>
          <div className="head-title">
            {map.image && <SmartImage src={map.image} alt={map.name} className="head-icon" />}
            <div>
              <h1>{siteDisplayName(site)}</h1>
              <p className="subtitle">
                {operator.name} lineups on {map.name}.
              </p>
            </div>
          </div>
        </div>
        <button type="button" className="btn primary" onClick={openNew}>
          + New setup
        </button>
      </header>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p className="empty">No setups on this site yet.</p>
          <button type="button" className="btn primary" onClick={openNew}>
            Create your first setup
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {sorted.map((setup) => (
            <div key={setup.id} className="setup-card">
              <button type="button" className="setup-media" onClick={() => setViewing(setup)} title="View setup">
                {setup.images[0] ? (
                  <SmartImage src={setup.images[0]} alt={setup.title} className="setup-img" />
                ) : (
                  <span className="setup-img img-fallback">{setup.title.slice(0, 2).toUpperCase()}</span>
                )}
                {setup.images.length > 1 && <span className="img-count">{setup.images.length}</span>}
              </button>
              <div className="setup-body">
                <div className="setup-title-row">
                  <h3 className="setup-title">{setup.title}</h3>
                  {gadget && setup.gadgetCount != null && (
                    <span
                      className={`laser-chip ${setup.gadgetCount >= gadget.max ? 'max' : ''}`}
                      title={`${setup.gadgetCount} ${pluralize(gadget, setup.gadgetCount)} used`}
                    >
                      ◆ {setup.gadgetCount}/{gadget.max}
                    </span>
                  )}
                </div>
                {setup.description && <p className="setup-desc">{setup.description}</p>}
                <div className="setup-actions">
                  <button type="button" className="btn small" onClick={() => openEdit(setup)}>
                    Edit
                  </button>
                  <button type="button" className="btn small danger" onClick={() => setConfirming(setup)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit setup' : 'New setup'} onClose={() => setEditing(null)} wide>
          <label className="field">
            <span>Title</span>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="e.g. Default cam hatch from Garage"
              autoFocus
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={4}
              placeholder="Steps, cam position, pixel alignment…"
            />
          </label>
          {gadget && (
            <div className="field">
              <span>
                {gadget.name === 'Kiba barrier' ? 'Kiba barriers' : `${titleCase(gadget.name)}s`} used
              </span>
              <div className="laser-stepper">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setEditing({ ...editing, gadgetCount: Math.max(1, editing.gadgetCount - 1) })}
                  disabled={editing.gadgetCount <= 1}
                  aria-label="Fewer"
                >
                  −
                </button>
                <div className="laser-pips">
                  {Array.from({ length: gadget.max }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`pip ${i < editing.gadgetCount ? 'on' : ''}`}
                      onClick={() => setEditing({ ...editing, gadgetCount: i + 1 })}
                      title={`${i + 1} ${pluralize(gadget, i + 1)}`}
                      aria-label={`${i + 1} ${pluralize(gadget, i + 1)}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setEditing({ ...editing, gadgetCount: Math.min(gadget.max, editing.gadgetCount + 1) })}
                  disabled={editing.gadgetCount >= gadget.max}
                  aria-label="More"
                >
                  +
                </button>
                <span className="laser-count-label">
                  {editing.gadgetCount} / {gadget.max}
                </span>
              </div>
            </div>
          )}
          <div className="field">
            <span>Images</span>
            <ImageDropzone
              images={editing.images}
              onChange={(images) => setEditing({ ...editing, images })}
              upload={uploadImage}
              multiple
              label="Add image"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="button" className="btn primary" onClick={save} disabled={!editing.title.trim()}>
              Save setup
            </button>
          </div>
        </Modal>
      )}

      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)} wide>
          {gadget && viewing.gadgetCount != null && (
            <p className="laser-detail">
              Uses <strong>{viewing.gadgetCount}</strong> of {gadget.max} {pluralize(gadget, viewing.gadgetCount)}
            </p>
          )}
          <p className="setup-desc detail">{viewing.description}</p>
          <div className="gallery">
            {viewing.images.map((img, i) => (
              <SmartImage key={`${img}-${i}`} src={img} alt={`${viewing.title} image ${i + 1}`} className="gallery-img" />
            ))}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                const current = viewing
                setViewing(null)
                openEdit(current)
              }}
            >
              Edit
            </button>
            <button type="button" className="btn primary" onClick={() => setViewing(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {confirming && (
        <Modal title="Delete setup?" onClose={() => setConfirming(null)}>
          <p>
            Delete <strong>{confirming.title}</strong>? This cannot be undone.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setConfirming(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                onRemove(confirming.id)
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
