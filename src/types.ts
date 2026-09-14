/**
 * Any image in the app is referenced by a string:
 *  - a bundled asset URL ("..../Azami-abc123.png"), or
 *  - an uploaded blob stored in IndexedDB, referenced as "idb:<uuid>".
 */
export type ImageSource = string

export interface Operator {
  id: string
  name: string
  icon: ImageSource | null
}

export interface MapInfo {
  id: string
  name: string
  image: ImageSource | null
}

export interface Site {
  id: string
  name: string
  /** Optional floor label, e.g. "2F" */
  floor: string
}

export interface Setup {
  id: string
  operatorId: string
  mapId: string
  siteId: string
  title: string
  description: string
  images: ImageSource[]
  createdAt: number
  updatedAt: number
}

export interface StoreData {
  operators: Operator[]
  maps: MapInfo[]
  /** mapId -> bomb sites for that map */
  sitesByMap: Record<string, Site[]>
  setups: Setup[]
}
