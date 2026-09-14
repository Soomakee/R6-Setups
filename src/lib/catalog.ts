import type { MapInfo, Operator, Site } from '../types'

// Operator icons live in Assets/Operator Icons (PNG). Drop a
// "<Name>.png" file there and it shows up on the home screen.
const operatorFiles = import.meta.glob('/Assets/Operator Icons/*.{png,webp,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const OPERATORS: Operator[] = Object.entries(operatorFiles)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() ?? ''
    const name = fileName.replace(/\.(png|webp|jpg|jpeg)$/i, '')
    return { id: `op:${name.toLowerCase()}`, name, icon: url }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

// Map images live in Assets/Maps (webp). Drop a "<Map Name>.webp" file
// there and the map gets its tile automatically.
const mapFiles = import.meta.glob('/Assets/Maps/*.{png,webp,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const MAPS: MapInfo[] = Object.entries(mapFiles)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() ?? ''
    const name = fileName.replace(/\.(png|webp|jpg|jpeg)$/i, '')
    return { id: `map:${name.toLowerCase()}`, name, image: url }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

type SiteTemplate = [string, string]

const DEFAULT_SITES: Record<string, SiteTemplate[]> = {
  bank: [
    ['CCTV Room / Cash Room', '2F'],
    ['Open Area / Archives', '1F'],
    ['Tellers / Lockers', '1F'],
    ['Staff Room / Canteen', 'B'],
  ],
  border: [
    ['Armory Lockers / Archives', '2F'],
    ['Bathroom / Customs Inspection', '1F'],
    ['Workshop / Ventilation', '1F'],
    ['Presidency / Trade Office', '2F'],
  ],
  'calypso casino': [
    ['Vodka Bar / Roulette', '1F'],
    ['B3 Pool / changing rooms', 'B3'],
    ['Harmony / Karaoke', '2F'],
    ['Island / Catering', '2F'],
  ],
  chalet: [
    ['Master Bedroom / Office', '2F'],
    ['Bar / Gaming Room', '1F'],
    ['Kitchen / Kitchen Dining', '1F'],
    ['Wine Cellar / Snowmobile Garage', 'B'],
  ],
  clubhouse: [
    ['Gym / Bedroom', '2F'],
    ['Bar / Stock Room', '1F'],
    ['Cash Room / Church', '1F'],
    ['Armory / Lounge', 'B'],
  ],
  coastline: [
    ['Penthouse / Billiards', 'Penthouse'],
    ['Kitchen / Dining', '1F'],
    ['Hookah Lounge / Lounge', '2F'],
    ['Garage / Theater', '1F'],
  ],
  consulate: [
    ['Consul Office / Meeting Room', '2F'],
    ['Lobby / Conference', '1F'],
    ['Cafeteria / Garage', 'B'],
    ['Alias / Visa Room', '1F'],
  ],
  'emerald plains': [
    ['Meeting / CEO Office', '2F'],
    ['Bar / Kitchen', '1F'],
    ['Ventilation / Electrical', '2F'],
    ['Private Lounge / Waiting Room', '1F'],
  ],
  fortress: [
    ['Chef Room / Kitchen Service', '1F'],
    ['Meeting Room / Throne Room', '2F'],
    ['Dormitory / Main Hall', '1F'],
    ['Armory / Treasury', '2F'],
  ],
  'kafe dostoyevsky': [
    ['Cocktail Bar / Bar', '3F'],
    ['Kitchen Service / Kitchen Cooking', '2F'],
    ['Fireplace / Mining Room', '2F'],
    ['Freezer / Kitchen', '1F'],
  ],
  kanal: [
    ['Coastal Map / Observational', '2F'],
    ['Server / Control', '1F'],
    ['Kitchen / Cafeteria', '1F'],
    ['Bedroom /Storage', 'B'],
  ],
  lair: [
    ['Pipes / Linen', '2F'],
    ['Assembly / Launch Prep', '1F'],
    ['Trainer / Observation', '2F'],
    ['Mission Prep / Storage', 'B'],
  ],
  'nighthaven labs': [
    ['Servers / Climate', '2F'],
    ['R&D / Lab Prep', '2F'],
    ['Storage / Launchpad', '1F'],
    ['Workshop / Testing', '1F'],
  ],
  oregon: [
    ['Kids Dorm / Dorms Main Hall', '2F'],
    ['Kitchen / Small Office', '1F'],
    ['Meeting Hall / Kitchen', '1F'],
    ['Laundry / Supply', 'B'],
  ],
  outback: [
    ['Party Room / Piano Room', '2F'],
    ['Laundry / Kitchen', '1F'],
    ['Restaurant / Kitchen Service', '1F'],
    ['Office / Signage Room', '2F'],
  ],
  skyscraper: [
    ['Tea Room / Exhibition', '2F'],
    ['Geisha / Kiln', '2F'],
    ['Gift Shop / Calligraphy', '1F'],
    ['Karaoke / Tea Room', '1F'],
  ],
  'theme park': [
    ['Arcade / Throne Room', '2F'],
    ['Bunk / Day Care', '2F'],
    ['Storage / Castle', '1F'],
    ['Register / objective', '1F'],
  ],
  villa: [
    ['Games Room / Aviator Room', '2F'],
    ['Library / Office', '1F'],
    ['Dining Room / Living Room', '1F'],
    ['Statuary / Garage', 'B'],
  ],
}

/** Per-operator gadget budget shown as a counter on setups. */
export interface OperatorGadget {
  /** Lower-case noun, e.g. "laser" — pluralized for labels. */
  name: string
  max: number
}

export const OPERATOR_GADGETS: Record<string, OperatorGadget> = {
  'op:denari': { name: 'laser', max: 7 },
  'op:valkyrie': { name: 'cam', max: 3 },
  'op:azami': { name: 'Kiba barrier', max: 5 },
}

export function gadgetFor(operatorId: string): OperatorGadget | undefined {
  return OPERATOR_GADGETS[operatorId]
}

export function pluralize(gadget: OperatorGadget, n: number): string {
  if (n === 1) return gadget.name
  if (gadget.name === 'Kiba barrier') return 'Kiba barriers'
  return `${gadget.name}s`
}

export function defaultSitesForMap(map: MapInfo): Site[] {
  const templates = DEFAULT_SITES[map.id.slice('map:'.length)] ?? []
  return templates.map(([name, floor]) => ({ id: '', name, floor }))
}

export function siteDisplayName(site: Site): string {
  return site.floor ? `${site.name} — ${site.floor}` : site.name
}
