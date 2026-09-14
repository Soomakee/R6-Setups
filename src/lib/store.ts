import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MapInfo, Setup, Site, StoreData } from '../types'
import { MAPS, OPERATORS, defaultSitesForMap } from './catalog'
import { deleteImage, getImage, putImage } from './db'
import { uid } from './ids'

const STORAGE_KEY = 'r6-lineup-tracker:data:v1'

export function resolveImageSrc(source: string | null | undefined): string | null {
  if (!source) return null
  if (source.startsWith('idb:')) {
    return `__idb__/${source.slice(4)}`
  }
  return source
}

function seedSites(): Record<string, Site[]> {
  const out: Record<string, Site[]> = {}
  for (const map of MAPS) {
    out[map.id] = defaultSitesForMap(map).map((s) => ({ ...s, id: `site:${map.id}:${uid('s')}` }))
  }
  return out
}

function load(): StoreData {
  const seeded: StoreData = {
    operators: OPERATORS,
    maps: MAPS,
    sitesByMap: seedSites(),
    setups: [],
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seeded
    const parsed = JSON.parse(raw) as Partial<StoreData>
    return {
      operators: parsed.operators?.length ? parsed.operators : OPERATORS,
      maps: MAPS.length ? MAPS : (parsed.maps ?? []),
      sitesByMap: parsed.sitesByMap ?? seeded.sitesByMap,
      // v0.1.2 -> v0.1.3: laserCount was renamed to gadgetCount.
      setups: (parsed.setups ?? []).map((s) => {
        const legacy = s as unknown as { laserCount?: number }
        if (legacy.laserCount != null && s.gadgetCount == null) {
          return { ...s, gadgetCount: legacy.laserCount }
        }
        return s
      }),
    }
  } catch {
    return seeded
  }
}

function save(data: StoreData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save data', err)
  }
}

export function useStore() {
  const [data, setData] = useState<StoreData>(load)

  useEffect(() => {
    save(data)
  }, [data])

  const sitesFor = useCallback((mapId: string): Site[] => data.sitesByMap[mapId] ?? [], [data.sitesByMap])

  const setSites = useCallback((mapId: string, sites: Site[]) => {
    setData((prev) => ({ ...prev, sitesByMap: { ...prev.sitesByMap, [mapId]: sites } }))
  }, [])

  const addSite = useCallback((mapId: string, name: string, floor: string) => {
    setData((prev) => {
      const site: Site = { id: `site:${mapId}:${uid('s')}`, name: name.trim(), floor: floor.trim() }
      return { ...prev, sitesByMap: { ...prev.sitesByMap, [mapId]: [...(prev.sitesByMap[mapId] ?? []), site] } }
    })
  }, [])

  const removeSite = useCallback((mapId: string, siteId: string) => {
    setData((prev) => ({
      ...prev,
      sitesByMap: { ...prev.sitesByMap, [mapId]: (prev.sitesByMap[mapId] ?? []).filter((s) => s.id !== siteId) },
      setups: prev.setups.filter((su) => !(su.mapId === mapId && su.siteId === siteId)),
    }))
  }, [])

  const addSetup = useCallback(
    (input: {
      operatorId: string
      mapId: string
      siteId: string
      title: string
      description: string
      images: string[]
      gadgetCount?: number
    }) => {
      const now = Date.now()
      const setup: Setup = { id: uid('setup'), createdAt: now, updatedAt: now, ...input }
      setData((prev) => ({ ...prev, setups: [setup, ...prev.setups] }))
      return setup.id
    },
    [],
  )

  const updateSetup = useCallback((id: string, patch: Partial<Omit<Setup, 'id' | 'operatorId' | 'mapId' | 'siteId'>>) => {
    setData((prev) => ({
      ...prev,
      setups: prev.setups.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s)),
    }))
  }, [])

  const removeSetup = useCallback((id: string) => {
    setData((prev) => {
      const target = prev.setups.find((s) => s.id === id)
      if (target) {
        for (const img of target.images) {
          if (img.startsWith('idb:')) void deleteImage(img)
        }
      }
      return { ...prev, setups: prev.setups.filter((s) => s.id !== id) }
    })
  }, [])

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const id = uid('img')
    await putImage(id, file)
    return `idb:${id}`
  }, [])

  const setupsFor = useMemo(
    () => (operatorId: string, mapId: string, siteId: string) =>
      data.setups.filter((s) => s.operatorId === operatorId && s.mapId === mapId && s.siteId === siteId),
    [data.setups],
  )

  const countForSite = useCallback(
    (operatorId: string, mapId: string, siteId: string) =>
      data.setups.filter((s) => s.operatorId === operatorId && s.mapId === mapId && s.siteId === siteId).length,
    [data.setups],
  )

  return { data, sitesFor, setSites, addSite, removeSite, addSetup, updateSetup, removeSetup, uploadImage, setupsFor, countForSite }
}

export function getMap(maps: MapInfo[], id: string): MapInfo | undefined {
  return maps.find((m) => m.id === id)
}

/** Bridges "idb:<uuid>" references to object URLs once the blob is fetched. */
export function useIdbImage(id: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  const key = id && id.startsWith('idb:') ? id.slice(4) : null
  useEffect(() => {
    if (!key) {
      setUrl(null)
      return
    }
    let url: string | null = null
    let cancelled = false
    void getImage(key).then((blob) => {
      if (cancelled || !blob) return
      url = URL.createObjectURL(blob)
      setUrl(url)
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [key])
  return url
}
