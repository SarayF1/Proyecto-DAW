// src/hooks/usePOI.js
// Fetches petrol stations and EV charging points around a lat/lng
// using the free Overpass API (OpenStreetMap data).
// No API key required.

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// Build Overpass QL query for a radius around a point
function buildQuery(lat, lng, radiusMeters = 5000) {
  return `[out:json][timeout:20];
(
  node["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
  node["amenity"="charging_station"](around:${radiusMeters},${lat},${lng});
);
out body;`
}

// Known fuel brand colours for marker tinting
const BRAND_COLORS = {
  repsol:    '#FF6600', cepsa: '#0055A5', bp: '#009B3A',
  shell:     '#FFD500', galp: '#F5A623',  campsa: '#E30613',
  petronor:  '#003580', total: '#E41B13', disa: '#003087',
}

function brandColor(name = '') {
  const lower = name.toLowerCase()
  for (const [brand, color] of Object.entries(BRAND_COLORS)) {
    if (lower.includes(brand)) return color
  }
  return null
}

// Map OSM socket type keys to readable labels
const SOCKET_LABELS = {
  'socket:type2':       'Tipo 2 (AC)',
  'socket:chademo':     'CHAdeMO (DC)',
  'socket:ccs':         'CCS Combo (DC)',
  'socket:type2_combo': 'CCS Combo (DC)',
  'socket:schuko':      'Schuko (AC lento)',
  'socket:tesla_supercharger': 'Tesla Supercharger',
  'socket:type1':       'Tipo 1 (AC)',
}

// Busy hours — approximate occupancy by hour of day (0-23)
// These are illustrative heuristics; OSM doesn't track live occupancy.
function getBusyProfile(type) {
  if (type === 'fuel') {
    return [20,15,10,8,10,20,50,80,90,85,80,75,85,80,75,70,80,90,85,70,60,45,30,20]
  }
  // EV chargers: more spread, peaks commute + evening
  return [15,10,8,6,8,12,25,40,55,60,65,60,55,60,65,60,55,60,70,65,50,35,25,18]
}

function currentBusyness(type) {
  const hour = new Date().getHours()
  const profile = getBusyProfile(type)
  return profile[hour]
}

function busynessLabel(pct) {
  if (pct >= 80) return { label: 'Muy concurrido',  color: '#E24B4A' }
  if (pct >= 55) return { label: 'Bastante ocupado', color: '#EF9F27' }
  if (pct >= 30) return { label: 'Moderado',         color: '#2F5D5B' }
  return              { label: 'Tranquilo',           color: '#0F6E56' }
}

// Infer rough opening hours from OSM tags or use defaults
function parseHours(tags) {
  if (tags.opening_hours) return tags.opening_hours
  if (tags.amenity === 'charging_station') return '24 horas'
  return '07:00 – 22:00'  // typical fuel station default
}

// Approximate fuel prices in the Canary Islands (updated manually)
// Real prices need a live API like gasolineras.es or MITECO
const CANARY_PRICES = {
  gasolina_95:  1.359,
  gasolina_98:  1.559,
  gasoil_a:     1.289,
  gasoil_plus:  1.389,
  glp:          0.729,
  adblue:       0.249,
  // EV prices (€/kWh approximate)
  ev_ac:        0.35,
  ev_dc:        0.55,
  ev_ultrafast: 0.79,
}

function normalisePOI(node) {
  const t    = node.tags || {}
  const type = t.amenity === 'charging_station' ? 'ev' : 'fuel'
  const busy = currentBusyness(type)
  const { label: busyLabel, color: busyColor } = busynessLabel(busy)

  // Sockets for EV
  const sockets = []
  for (const [key, label] of Object.entries(SOCKET_LABELS)) {
    if (t[key] && t[key] !== 'no') sockets.push({ key, label, count: t[key] === 'yes' ? '?' : t[key] })
  }

  // Fuel types
  const fuels = []
  if (type === 'fuel') {
    if (t['fuel:octane_95'] !== 'no')  fuels.push({ name: 'Gasolina 95',  price: CANARY_PRICES.gasolina_95 })
    if (t['fuel:octane_98'] !== 'no')  fuels.push({ name: 'Gasolina 98',  price: CANARY_PRICES.gasolina_98 })
    if (t['fuel:diesel']    !== 'no')  fuels.push({ name: 'Gasóleo A',    price: CANARY_PRICES.gasoil_a })
    if (t['fuel:diesel_plus'] === 'yes') fuels.push({ name: 'Gasóleo Plus',  price: CANARY_PRICES.gasoil_plus })
    if (t['fuel:lpg']       === 'yes') fuels.push({ name: 'GLP / Autogas',price: CANARY_PRICES.glp })
    if (fuels.length === 0) {
      fuels.push(
        { name: 'Gasolina 95', price: CANARY_PRICES.gasolina_95 },
        { name: 'Gasóleo A',   price: CANARY_PRICES.gasoil_a },
      )
    }
  } else {
    const hasDC = sockets.some(s => s.label.includes('DC') || s.label.includes('CHAdeMO') || s.label.includes('CCS') || s.label.includes('Tesla'))
    const maxKW = t['maxpower'] ? parseInt(t['maxpower']) : (hasDC ? 50 : 22)
    const evPrice = maxKW >= 100 ? CANARY_PRICES.ev_ultrafast : hasDC ? CANARY_PRICES.ev_dc : CANARY_PRICES.ev_ac
    fuels.push({ name: `Carga eléctrica (${maxKW} kW)`, price: evPrice, unit: '€/kWh' })
  }

  return {
    id:           node.id,
    type,
    lat:          node.lat,
    lng:          node.lon,
    name:         t.name || t.brand || (type === 'ev' ? 'Punto de carga' : 'Gasolinera'),
    brand:        t.brand || '',
    brandColor:   brandColor(t.brand || t.name || ''),
    operator:     t.operator || '',
    address:      [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ') || '',
    phone:        t.phone || t.contact_phone || '',
    website:      t.website || t.contact_website || '',
    hours:        parseHours(t),
    fuels,
    sockets,
    totalSockets: t.capacity ? parseInt(t.capacity) : (sockets.length || 1),
    busyPct:      busy,
    busyLabel,
    busyColor,
    busyProfile:  getBusyProfile(type),
    hasCar:       t['car'] !== 'no',
    hasTruck:     t['hgv'] === 'yes' || t['truck'] === 'yes',
    highPower:    type === 'ev' && (parseInt(t.maxpower) >= 50 || sockets.some(s => s.label.includes('DC'))),
  }
}

export async function fetchPOI(lat, lng, radius = 5000) {
  const query = buildQuery(lat, lng, radius)
  const res = await fetch(OVERPASS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `data=${encodeURIComponent(query)}`,
  })
  if (!res.ok) throw new Error(`Overpass error ${res.status}`)
  const data = await res.json()
  return (data.elements || [])
    .filter(n => n.lat && n.lon)
    .map(normalisePOI)
}

export { busynessLabel, getBusyProfile, CANARY_PRICES }
