import { useCallback, useEffect, useState } from 'react'

export interface UpdateStatus {
  state: 'idle' | 'checking' | 'up-to-date' | 'available' | 'downloading' | 'ready' | 'error'
  version?: string
  percent?: number
  message?: string
}

interface DesktopBridge {
  isDesktop: boolean
  checkForUpdates: () => Promise<{ ok: boolean; version?: string; error?: string }>
  installUpdate: () => Promise<void>
  getCurrentVersion: () => Promise<string>
  onUpdateStatus: (cb: (status: UpdateStatus) => void) => () => void
}

declare global {
  interface Window {
    desktop?: DesktopBridge
  }
}

export function useUpdater() {
  const desktop = typeof window !== 'undefined' ? window.desktop : undefined
  const isDesktop = !!desktop
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [status, setStatus] = useState<UpdateStatus>({ state: 'idle' })

  useEffect(() => {
    if (!desktop) return
    let disposed = false
    void desktop.getCurrentVersion().then((v) => {
      if (!disposed) setCurrentVersion(v)
    })
    const unsubscribe = desktop.onUpdateStatus((next) => setStatus(next))
    return () => {
      disposed = true
      unsubscribe()
    }
  }, [desktop])

  const check = useCallback(async () => {
    if (!desktop) return
    setStatus({ state: 'checking' })
    const result = await desktop.checkForUpdates()
    if (!result.ok) {
      setStatus({ state: 'error', message: result.error })
    }
  }, [desktop])

  const install = useCallback(() => {
    if (!desktop) return
    void desktop.installUpdate()
  }, [desktop])

  return { isDesktop, currentVersion, status, check, install }
}
