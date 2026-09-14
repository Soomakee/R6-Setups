import { useEffect, useState } from 'react'
import { useUpdater } from '../lib/updater'

/**
 * Floating update pill. Only rendered inside the desktop app:
 *  - idle: shows the app version, click to check for updates
 *  - downloading: shows progress
 *  - ready: "Restart to update" applies the downloaded update
 *  - "Up to date" auto-hides after a few seconds
 */
export function UpdateBadge() {
  const { isDesktop, currentVersion, status, check, install } = useUpdater()
  const [showUpToDate, setShowUpToDate] = useState(true)

  useEffect(() => {
    if (status.state !== 'up-to-date') {
      setShowUpToDate(true)
      return
    }
    const t = setTimeout(() => setShowUpToDate(false), 4000)
    return () => clearTimeout(t)
  }, [status.state])

  if (!isDesktop) return null
  if (status.state === 'up-to-date' && !showUpToDate) {
    // Still render the idle pill so the version stays visible.
    return (
      <button type="button" className="update-badge" onClick={() => void check()} title="Check for updates">
        <span className="update-label">v{currentVersion ?? '?'}</span>
      </button>
    )
  }

  let label = `v${currentVersion ?? '?'}`
  let sublabel: string | null = null
  let cls = 'update-badge'
  let onClick: (() => void) | null = check
  let showSpinner = false

  switch (status.state) {
    case 'checking':
      cls += ' checking'
      sublabel = 'Checking for updates…'
      showSpinner = true
      onClick = null
      break
    case 'up-to-date':
      sublabel = 'Up to date'
      onClick = null
      break
    case 'available':
      cls += ' active'
      sublabel = `v${status.version} available — downloading…`
      onClick = null
      break
    case 'downloading':
      cls += ' active'
      sublabel = `Downloading v${status.version}… ${status.percent ?? 0}%`
      onClick = null
      break
    case 'ready':
      cls += ' ready'
      label = `Update to v${status.version}`
      sublabel = 'Click to restart and install'
      onClick = install
      break
    case 'error':
      cls += ' error'
      sublabel = 'Update check failed — click to retry'
      onClick = check
      break
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={onClick ? () => void onClick() : undefined}
      title={sublabel ?? 'Check for updates'}
    >
      {showSpinner && <span className="spin" aria-hidden />}
      <span className="update-label">{label}</span>
      {sublabel && <span className="update-sub">{sublabel}</span>}
    </button>
  )
}
