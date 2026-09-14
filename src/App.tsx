import { useCallback, useEffect, useState } from 'react'
import type { MapInfo, Operator, Site } from './types'
import { useStore, getMap } from './lib/store'
import { CharactersScreen } from './screens/CharactersScreen'
import { MapsScreen } from './screens/MapsScreen'
import { SitesScreen } from './screens/SitesScreen'
import { SetupsScreen } from './screens/SetupsScreen'
import { UpdateBadge } from './components/UpdateBadge'

type View =
  | { name: 'characters' }
  | { name: 'maps'; operatorId: string }
  | { name: 'sites'; operatorId: string; mapId: string }
  | { name: 'setups'; operatorId: string; mapId: string; siteId: string }

export default function App() {
  const store = useStore()
  const [view, setView] = useState<View>({ name: 'characters' })

  // If the current view no longer resolves (data changed underneath us), go home.
  const viewValid =
    view.name === 'characters' ||
    (view.name === 'maps' && store.data.operators.some((o) => o.id === view.operatorId)) ||
    (view.name === 'sites' &&
      store.data.operators.some((o) => o.id === view.operatorId) &&
      !!getMap(store.data.maps, view.mapId)) ||
    (view.name === 'setups' &&
      store.data.operators.some((o) => o.id === view.operatorId) &&
      !!getMap(store.data.maps, view.mapId) &&
      store.sitesFor(view.mapId).some((s) => s.id === view.siteId))
  useEffect(() => {
    if (!viewValid) setView({ name: 'characters' })
  }, [viewValid])

  const handleSelectOperator = useCallback(
    (op: Operator) => setView({ name: 'maps', operatorId: op.id }),
    [],
  )
  const handleSelectMap = useCallback(
    (m: MapInfo) => {
      if (view.name !== 'maps') return
      setView({ name: 'sites', operatorId: view.operatorId, mapId: m.id })
    },
    [view],
  )
  const handleSelectSite = useCallback(
    (s: Site) => {
      if (view.name !== 'sites') return
      setView({ name: 'setups', operatorId: view.operatorId, mapId: view.mapId, siteId: s.id })
    },
    [view],
  )

  let screen: React.ReactNode

  if (view.name === 'characters' || !viewValid) {
    screen = <CharactersScreen operators={store.data.operators} onSelect={handleSelectOperator} />
  } else {
    const operator = store.data.operators.find((o) => o.id === view.operatorId)!

    if (view.name === 'maps') {
      screen = (
        <MapsScreen
          operator={operator}
          maps={store.data.maps}
          setups={store.data.setups}
          onSelect={handleSelectMap}
          onBack={() => setView({ name: 'characters' })}
        />
      )
    } else {
      const map = getMap(store.data.maps, view.mapId)!

      if (view.name === 'sites') {
        screen = (
          <SitesScreen
            operator={operator}
            map={map}
            sites={store.sitesFor(map.id)}
            countForSite={store.countForSite}
            onBack={() => setView({ name: 'maps', operatorId: operator.id })}
            onSelect={handleSelectSite}
            onAddSite={(name, floor) => store.addSite(map.id, name, floor)}
            onRemoveSite={(siteId) => store.removeSite(map.id, siteId)}
          />
        )
      } else {
        const site = store.sitesFor(view.mapId).find((s) => s.id === view.siteId)!
        screen = (
          <SetupsScreen
            operator={operator}
            map={map}
            site={site}
            setups={store.setupsFor(operator.id, map.id, site.id)}
            uploadImage={store.uploadImage}
            onBack={() => setView({ name: 'sites', operatorId: operator.id, mapId: map.id })}
            onAdd={(input) =>
              store.addSetup({ operatorId: operator.id, mapId: map.id, siteId: site.id, ...input })
            }
            onUpdate={(id, patch) => store.updateSetup(id, patch)}
            onRemove={(id) => store.removeSetup(id)}
          />
        )
      }
    }
  }

  return (
    <>
      {screen}
      <UpdateBadge />
    </>
  )
}
