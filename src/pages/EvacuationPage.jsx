import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ─── Custom marker icons ────────────────────────────────────────────────────
const makeIcon = (color) =>
  L.divIcon({
    html: `<div style="width:16px;height:16px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

const makeShelterIcon = (color) =>
  L.divIcon({
    html: `<div style="width:14px;height:14px;background:${color};border:2.5px solid white;border-radius:3px;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

const greenIcon   = makeIcon('#16A34A')
const redIcon     = makeIcon('#DC2626')
const shelterIcon = makeShelterIcon('#2563EB')

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions && positions.length > 1) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [48, 48] })
    }
  }, [positions, map])
  return null
}

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
function fmtMiles(meters) { return (meters / 1609.34).toFixed(1) }

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8
  const toRad = d => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}
function roughEtaMin(distMiles) {
  return Math.max(5, Math.round(distMiles * 1.35 / 40 * 60))
}
function fmtEta(minutes) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `~${h}h ${m}m` : `~${h}h`
  }
  return `~${minutes}m`
}

const SHELTER_PRIORITY = {
  'Emergency Shelter': 0, 'Community Center': 1, 'Hospital': 2,
  'School': 3, 'College / University': 4, 'Social Services': 5, 'Shelter': 6,
}
function shelterLabel(tags) {
  if (tags?.emergency === 'shelter' || tags?.amenity === 'shelter') return 'Emergency Shelter'
  if (tags?.amenity === 'community_centre') return 'Community Center'
  if (tags?.amenity === 'hospital') return 'Hospital'
  if (tags?.amenity === 'school') return 'School'
  if (tags?.amenity === 'college' || tags?.amenity === 'university') return 'College / University'
  if (tags?.amenity === 'social_facility') return 'Social Services'
  return 'Shelter'
}
function shelterEmoji(label) {
  if (label === 'Emergency Shelter' || label === 'Hospital') return '🏥'
  if (label === 'Community Center') return '🏛️'
  if (label === 'School') return '🏫'
  if (label === 'College / University') return '🎓'
  return '🏢'
}

async function fetchWithTimeout(url, opts = {}, ms = 12000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal })
    clearTimeout(timer)
    return res
  } catch (e) { clearTimeout(timer); throw e }
}

function normalizeShelters(elements, originLat, originLon) {
  const seen = new Set()
  return elements
    .map(e => {
      const lat = e.lat ?? e.center?.lat
      const lon = e.lon ?? e.center?.lon
      if (!lat || !lon) return null
      const tags = e.tags || {}
      const type = shelterLabel(tags)
      const name = tags.name || tags.operator || tags['addr:housename'] || type
      const dist = haversineMiles(originLat, originLon, lat, lon)
      return { name, type, lat, lon, distMiles: dist, etaMin: roughEtaMin(dist), priority: SHELTER_PRIORITY[type] ?? 99 }
    })
    .filter(item => {
      if (!item) return false
      const key = `${item.lat.toFixed(3)},${item.lon.toFixed(3)}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : a.distMiles - b.distMiles)
    .slice(0, 6)
}

async function queryOverpass(lat, lon) {
  const query = `[out:json][timeout:20];
(
  node["amenity"~"^(shelter|community_centre|hospital|school)$"](around:80000,${lat},${lon});
  way["amenity"~"^(shelter|community_centre|hospital|school)$"](around:80000,${lat},${lon});
  node["emergency"="shelter"](around:120000,${lat},${lon});
  way["emergency"="shelter"](around:120000,${lat},${lon});
);
out center 100;`
  for (const url of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
    try {
      const res = await fetchWithTimeout(url, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: query }, 14000)
      if (!res.ok) continue
      const data = await res.json()
      const items = normalizeShelters(data.elements || [], lat, lon)
      if (items.length > 0) return items
    } catch { /* try mirror */ }
  }
  return []
}

async function queryNominatim(lat, lon) {
  const d = 1.2
  const box = `${lon - d},${lat + d},${lon + d},${lat - d}`
  const terms = [
    { q: 'emergency shelter', type: 'Emergency Shelter', priority: 0 },
    { q: 'evacuation center', type: 'Emergency Shelter', priority: 0 },
    { q: 'community center',  type: 'Community Center',  priority: 1 },
    { q: 'community centre',  type: 'Community Center',  priority: 1 },
    { q: 'school',            type: 'School',            priority: 3 },
  ]
  const all = []; const seen = new Set()
  for (const { q, type, priority } of terms) {
    try {
      const res = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&viewbox=${box}&bounded=1`,
        { headers: { 'User-Agent': 'BUHHS-App/1.0' } }, 8000,
      )
      if (!res.ok) continue
      const data = await res.json()
      for (const item of data) {
        const key = `${parseFloat(item.lat).toFixed(3)},${parseFloat(item.lon).toFixed(3)}`
        if (seen.has(key)) continue
        seen.add(key)
        const elat = parseFloat(item.lat), elon = parseFloat(item.lon)
        all.push({ name: item.display_name.split(',')[0], type, lat: elat, lon: elon,
          distMiles: haversineMiles(lat, lon, elat, elon), etaMin: roughEtaMin(haversineMiles(lat, lon, elat, elon)), priority })
      }
    } catch { /* skip */ }
  }
  return all.sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : a.distMiles - b.distMiles).slice(0, 6)
}

function ChecklistSection({ title, emoji, items, checks, onToggle, color }) {
  return (
    <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(250,252,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(99,150,222,0.22)', borderRadius: '1rem', padding: '1.5rem', borderTop: `3px solid ${color}` }}>
      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', fontWeight: 800, color: '#1A3558', margin: 0 }}>
        {emoji} {title}
      </h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => {
          const key = `${title}-${i}`
          return (
            <li key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }} onClick={() => onToggle(key)}>
              <div style={{ width: 18, height: 18, borderRadius: '0.3rem', flexShrink: 0, marginTop: 1, background: checks[key] ? color : 'transparent', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                {checks[key] && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', color: checks[key] ? '#5B7FA5' : '#1A3558', lineHeight: 1.45, textDecoration: checks[key] ? 'line-through' : 'none', transition: 'color 0.15s' }}>
                {item}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const TIPS = [
  { icon: '🚗', title: 'Leave Early', body: "Don't wait for a mandatory order. Voluntary evacuation avoids gridlock and gives you time to secure your home." },
  { icon: '📱', title: 'Emergency Contacts', body: 'Save local emergency management numbers before you lose signal. Download offline maps for your route.' },
  { icon: '⛽', title: 'Full Tank Rule', body: 'Always evacuate with a full tank of gas. Gas stations may close, run out, or have hours-long lines.' },
]

const N = '#2563EB'

const glass = {
  background: 'rgba(250, 252, 255, 0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(99, 150, 222, 0.22)',
  borderRadius: '1rem',
  padding: '1.5rem',
  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
}

const pillBtn = {
  background: '#1A3558',
  borderRadius: '9999px',
  color: '#fff',
  padding: '0.75rem 1.75rem',
  border: 'none',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: 700,
  fontSize: '0.9rem',
  whiteSpace: 'nowrap',
  boxShadow: '0 4px 14px rgba(26, 53, 88, 0.25)',
}

const secondaryBtn = {
  background: 'rgba(37, 99, 235, 0.08)',
  borderRadius: '9999px',
  color: N,
  padding: '0.75rem 1.5rem',
  border: '1.5px solid rgba(37, 99, 235, 0.25)',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: '0.9rem',
  whiteSpace: 'nowrap',
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(99, 150, 222, 0.35)',
  borderRadius: '0.625rem',
  padding: '0.7rem 1rem',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontSize: '0.9rem',
  color: '#1A3558',
  outline: 'none',
  boxSizing: 'border-box',
}

const statCard = {
  background: 'rgba(37, 99, 235, 0.05)',
  border: '1px solid rgba(37, 99, 235, 0.14)',
  borderRadius: '0.75rem',
  padding: '1rem',
  textAlign: 'center',
}

export default function EvacuationPage() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [disasterType, setDisasterType] = useState('Hurricane')
  const [routeCoords, setRouteCoords] = useState(null)
  const [originPos, setOriginPos] = useState(null)
  const [destPos, setDestPos] = useState(null)
  const [routeMeta, setRouteMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checklist, setChecklist] = useState({ must: [], important: [], before: [] })
  const [checklistLoading, setChecklistLoading] = useState(false)
  const [checks, setChecks] = useState({})
  const [geoLoading, setGeoLoading] = useState(false)
  const [shelters, setShelters] = useState([])
  const [shelterLoading, setShelterLoading] = useState(false)
  const [showShelters, setShowShelters] = useState(true)
  const [preselectedDestCoords, setPreselectedDestCoords] = useState(null)

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'User-Agent': 'BUHHS-App/1.0' } },
          )
          const data = await res.json()
          setOrigin(
            data.address?.city || data.address?.town || data.address?.village ||
            data.display_name?.split(',')[0] || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
          )
        } catch { setOrigin(`${lat.toFixed(5)}, ${lon.toFixed(5)}`) }
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
    )
  }, [])

  async function geocode(addr) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'BUHHS-App/1.0' } },
    )
    const data = await res.json()
    if (!data.length) throw new Error(`Could not find "${addr}"`)
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name }
  }

  async function fetchNearbyShelters(lat, lon) {
    setShelterLoading(true)
    setShelters([])
    try {
      let results = await queryOverpass(lat, lon)
      if (results.length === 0) results = await queryNominatim(lat, lon)
      setShelters(results)
      setShowShelters(true)
    } finally {
      setShelterLoading(false)
    }
  }

  function selectShelter(shelter) {
    setDestination(shelter.name)
    setPreselectedDestCoords({ lat: shelter.lat, lon: shelter.lon, display: shelter.name })
  }

  async function findSheltersNearOrigin() {
    if (!origin.trim()) { setError('Enter your origin first.'); return }
    setError('')
    setShelterLoading(true)
    try {
      const originGeo = await geocode(origin)
      setOriginPos([originGeo.lat, originGeo.lon])
      await fetchNearbyShelters(originGeo.lat, originGeo.lon)
    } catch (err) {
      setError(err.message || 'Could not find origin.')
      setShelterLoading(false)
    }
  }

  async function planRoute() {
    if (!origin.trim() || !destination.trim()) { setError('Please enter both an origin and a destination.'); return }
    setLoading(true); setError(''); setRouteCoords(null); setRouteMeta(null)
    try {
      const [originGeo, destGeo] = await Promise.all([
        geocode(origin),
        preselectedDestCoords ? Promise.resolve(preselectedDestCoords) : geocode(destination),
      ])
      setOriginPos([originGeo.lat, originGeo.lon])
      setDestPos([destGeo.lat, destGeo.lon])
      fetchNearbyShelters(originGeo.lat, originGeo.lon)

      const osrmRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originGeo.lon},${originGeo.lat};${destGeo.lon},${destGeo.lat}?overview=full&geometries=geojson&steps=true`,
      )
      const osrmData = await osrmRes.json()
      if (!osrmData.routes?.length) throw new Error('No route found. Try different addresses.')

      const route = osrmData.routes[0]
      setRouteCoords(route.geometry.coordinates.map(([lon, lat]) => [lat, lon]))
      setRouteMeta({
        duration: route.duration, distance: route.distance,
        steps: route.legs?.[0]?.steps?.length || 0,
        originDisplay: originGeo.display.split(',')[0],
        destDisplay: (destGeo.display || destination).split(',')[0],
      })
      fetchChecklist(origin, destination, fmtMiles(route.distance), fmtDuration(route.duration), disasterType)
    } catch (err) {
      setError(err.message || 'Routing failed. Please try again.')
    } finally { setLoading(false) }
  }

  async function fetchChecklist(orig, dest, distMi, dur, type) {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY
    if (!key) return
    setChecklistLoading(true)
    const prompt = `I'm evacuating from ${orig} to ${dest} (${distMi} miles, ${dur}). Disaster type: ${type}.\nGive me a prioritized evacuation checklist in exactly 3 categories with exactly 5 items each:\n(1) Must Have First\n(2) Important Items\n(3) Do Before Leaving\nFormat EXACTLY as:\nMUST HAVE FIRST:\n- item\n...\nIMPORTANT ITEMS:\n- item\n...\nDO BEFORE LEAVING:\n- item\n...`
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://buhhs.vercel.app', 'X-Title': 'BUHHS Emergency App' },
        body: JSON.stringify({ model: 'google/gemma-3-27b-it:free', messages: [{ role: 'system', content: 'You are an emergency preparedness AI.' }, { role: 'user', content: prompt }] }),
      })
      const data = await res.json()
      parseChecklist(data.choices?.[0]?.message?.content || '')
    } catch { /* silently fail */ }
    finally { setChecklistLoading(false) }
  }

  function parseChecklist(text) {
    setChecklist({
      must:      (text.match(/MUST HAVE FIRST[:\s]*([\s\S]*?)(?=IMPORTANT ITEMS|$)/i)?.[1] || '').split('\n').map(l=>l.replace(/^[-*•]\s*/,'').trim()).filter(l=>l.length>2&&!l.endsWith(':')).slice(0,5),
      important: (text.match(/IMPORTANT ITEMS[:\s]*([\s\S]*?)(?=DO BEFORE LEAVING|$)/i)?.[1] || '').split('\n').map(l=>l.replace(/^[-*•]\s*/,'').trim()).filter(l=>l.length>2&&!l.endsWith(':')).slice(0,5),
      before:    (text.match(/DO BEFORE LEAVING[:\s]*([\s\S]*?)$/i)?.[1] || '').split('\n').map(l=>l.replace(/^[-*•]\s*/,'').trim()).filter(l=>l.length>2&&!l.endsWith(':')).slice(0,5),
    })
    setChecks({})
  }

  function toggleCheck(key) { setChecks(p => ({ ...p, [key]: !p[key] })) }

  function openGoogleMaps() {
    if (!origin || !destination) return
    window.open(`https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`, '_blank', 'noopener noreferrer')
  }

  const mapCenter = originPos || [42.36, -71.06]
  const mapZoom = originPos ? 9 : 11
  const hasChecklist = checklist.must.length > 0 || checklist.important.length > 0 || checklist.before.length > 0
  const showShelterPanel = shelterLoading || shelters.length > 0

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(ellipse 80% 50% at 15% 10%, rgba(96,165,250,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 5%, rgba(147,197,253,0.12) 0%, transparent 55%), linear-gradient(160deg, #EFF6FF 0%, #F8FAFF 50%, #EBF4FF 100%)' }}>

      {/* ── BUHHS Navbar ── */}
      <nav style={{ padding: '1.25rem 1.5rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(99,150,222,0.25)', borderRadius: '0.75rem', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(37,99,235,0.08)' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.2rem', fontWeight: 700, color: '#1A3558', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            BUHHS
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            🚨 Emergency Evacuation Planner
          </div>
          <Link to="/"
            style={{ textDecoration: 'none', fontSize: '0.8rem', color: '#5B7FA5', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1A3558'}
            onMouseLeave={e => e.currentTarget.style.color = '#5B7FA5'}
          >
            ← Back
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '3rem 1.5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '0 0 0.75rem', letterSpacing: '-0.03em', lineHeight: 1.15, color: '#1A3558' }}>
            Evacuation Route Planner
          </h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', color: '#3D5A80', margin: 0, lineHeight: 1.7 }}>
            Plan your emergency evacuation with real-time route guidance and personalized checklists
          </p>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: '72rem', margin: '0 auto', width: '100%', padding: '0 1.25rem 3rem' }}>

        {/* ── Route Input Panel ── */}
        <div style={{ ...glass, marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#1A3558', margin: '0 0 1.25rem', textShadow: 'none' }}>
            🗺️ Plan Your Route
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Origin */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: '#3D5A80', marginBottom: '0.375rem' }}>
                🟢 Origin
              </label>
              <input type="text" placeholder="Your current location" value={origin}
                onChange={e => setOrigin(e.target.value)} onKeyDown={e => e.key === 'Enter' && planRoute()} style={inputStyle} />
              <button type="button" onClick={handleUseMyLocation} disabled={geoLoading}
                style={{ marginTop: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: N, fontSize: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, padding: '0.125rem 0', opacity: geoLoading ? 0.6 : 1 }}>
                {geoLoading ? '⏳ Getting location…' : '📍 Use My Location'}
              </button>
            </div>

            {/* Destination */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: '#3D5A80', marginBottom: '0.375rem' }}>
                🔴 Destination
              </label>
              <input type="text" placeholder="Safe destination or pick a shelter ↓" value={destination}
                onChange={e => { setDestination(e.target.value); setPreselectedDestCoords(null) }}
                onKeyDown={e => e.key === 'Enter' && planRoute()} style={inputStyle} />

              {showShelterPanel && (
                <div style={{ marginTop: '0.5rem', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(37,99,235,0.18)', background: 'rgba(255,255,255,0.97)', boxShadow: '0 4px 20px rgba(37,99,235,0.10)' }}>
                  <div style={{ padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(37,99,235,0.05)', borderBottom: '1px solid rgba(37,99,235,0.12)' }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', fontWeight: 700, color: N, textShadow: 'none' }}>
                      🏥 Nearest Shelters — estimated drive time from origin
                    </span>
                    {shelters.length > 0 && <span style={{ fontSize: '0.65rem', color: '#5B7FA5', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{shelters.length} found</span>}
                  </div>

                  {shelterLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem' }}>
                      <div style={{ width: 16, height: 16, flexShrink: 0, border: '2px solid rgba(37,99,235,0.2)', borderTop: `2px solid ${N}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: '#3D5A80' }}>Searching for nearby emergency shelters…</span>
                    </div>
                  ) : shelters.length === 0 ? (
                    <div style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: '#5B7FA5' }}>No tagged shelters found within 100 km — enter a destination manually.</span>
                    </div>
                  ) : !showShelters ? null : (
                    shelters.map((s, i) => {
                      const emoji = shelterEmoji(s.type)
                      const isSelected = preselectedDestCoords?.lat === s.lat && preselectedDestCoords?.lon === s.lon
                      return (
                        <button key={i} onClick={() => selectShelter(s)} onDoubleClick={() => { selectShelter(s); setShowShelters(false) }}
                          style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', background: isSelected ? 'rgba(37,99,235,0.07)' : 'none', border: 'none', borderBottom: i < shelters.length - 1 ? '1px solid rgba(37,99,235,0.08)' : 'none', borderLeft: isSelected ? `3px solid ${N}` : '3px solid transparent', cursor: 'pointer', textAlign: 'left' }}>
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.68rem', fontWeight: 800, color: '#5B7FA5', width: '1.1rem', flexShrink: 0 }}>#{i + 1}</span>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{emoji}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600, color: '#1A3558', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#5B7FA5', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.type}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', fontWeight: 800, color: isSelected ? N : '#1A3558', textShadow: 'none' }}>{fmtEta(s.etaMin)}</div>
                            <div style={{ fontSize: '0.68rem', color: '#5B7FA5', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.distMiles.toFixed(1)} mi</div>
                          </div>
                        </button>
                      )
                    })
                  )}
                  {shelters.length > 0 && (
                    <div style={{ padding: '0.4rem 0.85rem', borderTop: '1px solid rgba(37,99,235,0.08)' }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.65rem', color: '#5B7FA5', fontStyle: 'italic' }}>Times are estimates. Actual drive time shown after routing.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disaster type */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: '#3D5A80', marginBottom: '0.375rem' }}>
                ⚡ Disaster Type
              </label>
              <select value={disasterType} onChange={e => setDisasterType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {['Hurricane', 'Wildfire', 'Flood', 'Earthquake', 'Winter Storm', 'General Emergency'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={planRoute} disabled={loading} style={{ ...pillBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Planning route…' : '🚗 Plan Route'}
            </button>
            <button onClick={findSheltersNearOrigin} disabled={shelterLoading || geoLoading} style={{ ...secondaryBtn, opacity: (shelterLoading || geoLoading) ? 0.6 : 1 }}>
              {shelterLoading ? '⏳ Searching…' : '🏥 Find Nearby Shelters'}
            </button>
            {error && <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.825rem', color: '#ef4444', fontWeight: 500 }}>⚠️ {error}</span>}
          </div>
        </div>

        {/* ── Map ── */}
        <div style={{ ...glass, padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '55vh', width: '100%', borderRadius: '1rem' }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routeCoords && (
              <>
                <FitBounds positions={routeCoords} />
                <Polyline positions={routeCoords} pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.9 }} />
              </>
            )}
            {originPos && <Marker position={originPos} icon={greenIcon}><Popup><strong>Origin</strong><br />{origin}</Popup></Marker>}
            {destPos && <Marker position={destPos} icon={redIcon}><Popup><strong>Destination</strong><br />{destination}</Popup></Marker>}
            {shelters.map((s, i) => (
              <Marker key={i} position={[s.lat, s.lon]} icon={shelterIcon}>
                <Popup><strong>{s.name}</strong><br />{s.type}<br /><span style={{ color: N, fontWeight: 600 }}>{fmtEta(s.etaMin)} · {s.distMiles.toFixed(1)} mi</span></Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* ── Route Summary ── */}
        {routeMeta && (
          <div style={{ ...glass, marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#1A3558', margin: '0 0 1.25rem', textShadow: 'none' }}>
              📊 Route Summary
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { icon: '⏱️', label: 'Estimated Time', value: fmtDuration(routeMeta.duration) },
                { icon: '📏', label: 'Distance', value: `${fmtMiles(routeMeta.distance)} mi` },
                { icon: '🔄', label: 'Turn-by-Turn Steps', value: `${routeMeta.steps} steps` },
                { icon: '⚡', label: 'Disaster Type', value: disasterType },
              ].map(item => (
                <div key={item.label} style={statCard}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: N, marginBottom: '0.2rem', textShadow: 'none' }}>{item.value}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.72rem', color: '#3D5A80' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={openGoogleMaps} style={pillBtn}>🧭 Start Navigation</button>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', color: '#3D5A80' }}>
                {routeMeta.originDisplay} → {routeMeta.destDisplay}
              </span>
            </div>
          </div>
        )}

        {/* ── AI Checklist ── */}
        {(checklistLoading || hasChecklist) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#1A3558', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textShadow: 'none' }}>
              🤖 AI Evacuation Checklist
              <span style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '9999px', padding: '0.15rem 0.6rem', fontSize: '0.7rem', color: '#A78BFA', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Gemma 3 27B</span>
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', color: '#3D5A80', marginBottom: '1rem' }}>
              Personalized for a {disasterType.toLowerCase()} evacuation · Click items to check off
            </p>
            {checklistLoading ? (
              <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: 28, height: 28, border: '3px solid rgba(37,99,235,0.15)', borderTop: `3px solid ${N}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', color: '#3D5A80' }}>Generating personalized checklist…</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {checklist.must.length > 0 && <ChecklistSection title="Must Have First" emoji="🔴" items={checklist.must} checks={checks} onToggle={toggleCheck} color="#DC2626" />}
                {checklist.important.length > 0 && <ChecklistSection title="Important Items" emoji="🟡" items={checklist.important} checks={checks} onToggle={toggleCheck} color="#D97706" />}
                {checklist.before.length > 0 && <ChecklistSection title="Do Before Leaving" emoji="🟢" items={checklist.before} checks={checks} onToggle={toggleCheck} color="#16A34A" />}
              </div>
            )}
          </div>
        )}

        {/* ── Tips ── */}
        <section>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#1A3558', marginBottom: '1rem', textAlign: 'center', textShadow: 'none' }}>
            Essential Evacuation Tips
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {TIPS.map(tip => (
              <div key={tip.title} style={{ ...glass, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ fontSize: '2rem' }}>{tip.icon}</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#1A3558', margin: 0 }}>{tip.title}</h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#3D5A80', lineHeight: 1.6, margin: 0 }}>{tip.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid rgba(99,150,222,0.2)', padding: '1.5rem', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', color: '#5B7FA5' }}>
          © 2026 BUHHS · Evacuation data from OpenStreetMap &amp; OSRM · For informational use only
        </span>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .leaflet-container { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      `}</style>
    </div>
  )
}
