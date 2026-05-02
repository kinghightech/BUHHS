import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, Marker } from 'react-leaflet'
import L from 'leaflet'
import twemoji from 'twemoji'
import 'leaflet/dist/leaflet.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TWEMOJI_OPTS = { folder: 'svg', ext: '.svg', base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/', className: 'emoji-img' }

// ─── Haversine Distance ────────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Color helpers ─────────────────────────────────────────────────────────
function quakeColor(mag) {
  if (mag >= 6) return '#FF3B3B'
  if (mag >= 4) return '#FF8C00'
  if (mag >= 2) return '#FFD700'
  return '#A8D8FF'
}

function alertTypeInfo(event = '', severity = '') {
  const ev = event.toLowerCase()
  if (ev.includes('tornado')) return { color: '#7C3AED', icon: '🌪️' }
  if (ev.includes('flash flood')) return { color: '#1D4ED8', icon: '🌊' }
  if (ev.includes('flood') || ev.includes('surge')) return { color: '#0EA5E9', icon: '💧' }
  if (ev.includes('hurricane') || ev.includes('tropical storm') || ev.includes('typhoon')) return { color: '#EC4899', icon: '🌀' }
  if (ev.includes('blizzard') || ev.includes('ice storm')) return { color: '#94A3B8', icon: '❄️' }
  if (ev.includes('winter') || ev.includes('freeze') || ev.includes('frost')) return { color: '#BAE6FD', icon: '🌨️' }
  if (ev.includes('fire') || ev.includes('red flag')) return { color: '#F97316', icon: '🔥' }
  if (ev.includes('heat')) return { color: '#DC2626', icon: '🌡️' }
  if (ev.includes('fog')) return { color: '#9CA3AF', icon: '🌫️' }
  if (ev.includes('dust')) return { color: '#D97706', icon: '💨' }
  if (severity === 'Extreme') return { color: '#FF0000', icon: '⛈️' }
  if (severity === 'Severe') return { color: '#FF6600', icon: '⛈️' }
  return { color: '#FFAA00', icon: '⛈️' }
}

function fireColor(acres) {
  if (acres >= 100000) return '#FF2D00'
  if (acres >= 10000) return '#FF6B00'
  if (acres >= 1000) return '#FF9500'
  return '#FFB347'
}

function hurricaneColor(classification = '') {
  if (classification.includes('HU')) return '#9333EA'
  if (classification.includes('TS')) return '#EC4899'
  return '#F59E0B'
}

function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Spinner ───────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
      <div style={{
        width: 52, height: 52,
        border: '4px solid rgba(37,99,235,0.2)',
        borderTop: '4px solid #2563EB',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ─── Centroid of polygon coords ────────────────────────────────────────────
function polygonCentroid(coords) {
  let ring = coords
  if (Array.isArray(coords[0][0])) ring = coords[0]
  const lats = ring.map(c => c[1])
  const lons = ring.map(c => c[0])
  return [
    lats.reduce((a, b) => a + b, 0) / lats.length,
    lons.reduce((a, b) => a + b, 0) / lons.length,
  ]
}

// ─── Demo disaster data (always visible, supplements live feeds) ───────────
const DEMO_WILDFIRES = [
  { id: 'fw1', name: 'Sycamore Fire', lat: 34.12, lon: -118.42, acres: 85000, contained: 35, state: 'CA' },
  { id: 'fw2', name: 'Blanco Fire', lat: 30.15, lon: -99.81, acres: 22000, contained: 60, state: 'TX' },
  { id: 'fw3', name: 'Eagle Creek Fire', lat: 45.63, lon: -121.72, acres: 49000, contained: 48, state: 'OR' },
  { id: 'fw4', name: 'Mesa Fire', lat: 39.54, lon: -106.91, acres: 12000, contained: 72, state: 'CO' },
  { id: 'fw5', name: 'Rim Fire', lat: 37.82, lon: -120.07, acres: 130000, contained: 15, state: 'CA' },
  { id: 'fw6', name: 'Palo Verde Fire', lat: 33.45, lon: -112.07, acres: 7500, contained: 90, state: 'AZ' },
]

const DEMO_TORNADOES = [
  { id: 'to1', lat: 35.47, lon: -97.52, city: 'Oklahoma City, OK', ef: 'EF2', width: '400 yd', path: '12 mi' },
  { id: 'to2', lat: 37.69, lon: -97.34, city: 'Wichita, KS', ef: 'EF1', width: '200 yd', path: '5 mi' },
  { id: 'to3', lat: 31.55, lon: -97.14, city: 'Waco, TX', ef: 'EF3', width: '600 yd', path: '22 mi' },
  { id: 'to4', lat: 41.26, lon: -95.93, city: 'Omaha, NE', ef: 'EF1', width: '150 yd', path: '4 mi' },
  { id: 'to5', lat: 33.45, lon: -86.81, city: 'Birmingham, AL', ef: 'EF2', width: '350 yd', path: '18 mi' },
]

const DEMO_HURRICANES = [
  { id: 'hu1', name: 'Hurricane Maria', lat: 22.5, lon: -75.3, category: 3, winds: 125, pressure: 952, classification: 'HU' },
  { id: 'hu2', name: 'Tropical Storm Lee', lat: 17.2, lon: -60.8, category: null, winds: 65, pressure: 994, classification: 'TS' },
  { id: 'hu3', name: 'Hurricane Karl', lat: 19.8, lon: -87.4, category: 1, winds: 80, pressure: 985, classification: 'HU' },
  { id: 'hu4', name: 'Hurricane Nadine', lat: 26.1, lon: -70.5, category: 2, winds: 105, pressure: 968, classification: 'HU' },
]

// ─── Emoji DivIcon ─────────────────────────────────────────────────────────
function makeEmojiIcon(emoji, size = 28) {
  const imgHtml = twemoji.parse(emoji, TWEMOJI_OPTS)
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 1px 4px rgba(0,0,0,0.5));user-select:none;">${imgHtml}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

// ─── EF color ─────────────────────────────────────────────────────────────
function efColor(ef) {
  if (ef === 'EF4' || ef === 'EF5') return '#4C1D95'
  if (ef === 'EF3') return '#7C3AED'
  if (ef === 'EF2') return '#A855F7'
  return '#C084FC'
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function LiveMapPage() {
  const [earthquakes, setEarthquakes] = useState([])
  const [alerts, setAlerts] = useState([])
  const [wildfires, setWildfires] = useState([])
  const [hurricanes, setHurricanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [filters, setFilters] = useState({
    showQuakes: true,
    showAlerts: true,
    showFires: true,
    showHurricanes: true,
    showTornadoes: true,
    majorOnly: false,
  })
  const [safetyResult, setSafetyResult] = useState(null)
  const [safetyLoading, setSafetyLoading] = useState(false)
  const [userPos, setUserPos] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const intervalRef = useRef(null)
  const tickRef = useRef(null)
  const tornadoIconRef = useRef(null)
  const hurricaneIconRef = useRef(null)
  const fireIconRef = useRef(null)

  // ── Theme detection ──────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') || 'light'
  )
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setTheme(document.documentElement.getAttribute('data-theme') || 'light')
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  const isDark = theme === 'dark'

  // ── Fetch all data ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [quakeRes, alertRes, fireRes, hurricaneRes] = await Promise.allSettled([
        fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'),
        fetch('https://api.weather.gov/alerts/active?status=actual&severity=Severe,Extreme&limit=100', {
          headers: { 'User-Agent': 'Custos/1.0 (disaster-risk-app)' },
        }),
        fetch('https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Active_Fires/FeatureServer/0/query?where=1%3D1&outFields=FireName,POOCounty,POOState,DailyAcres,PercentContained,ModifiedOnDateTime&f=geojson&resultRecordCount=300'),
        fetch('https://www.nhc.noaa.gov/CurrentStorms.json'),
      ])

      if (quakeRes.status === 'fulfilled' && quakeRes.value.ok) {
        const data = await quakeRes.value.json()
        setEarthquakes(data.features || [])
      }
      if (alertRes.status === 'fulfilled' && alertRes.value.ok) {
        const data = await alertRes.value.json()
        setAlerts(data.features || [])
      }
      if (fireRes.status === 'fulfilled' && fireRes.value.ok) {
        const data = await fireRes.value.json()
        setWildfires(data.features || [])
      }
      if (hurricaneRes.status === 'fulfilled' && hurricaneRes.value.ok) {
        const data = await hurricaneRes.value.json()
        setHurricanes(data.activeStorms || [])
      }

      setLastUpdated(Date.now())
      setSecondsAgo(0)
    } catch {
      // keep stale data; don't crash
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 60000)
    return () => clearInterval(intervalRef.current)
  }, [fetchData])

  // ── Tick "seconds ago" counter ─────────────────────────────────────────
  useEffect(() => {
    tickRef.current = setInterval(() => setSecondsAgo(s => s + 1), 1000)
    return () => clearInterval(tickRef.current)
  }, [])

  // ── "Am I Safe?" one-time check ───────────────────────────────────────
  const checkSafety = () => {
    if (!navigator.geolocation) {
      setSafetyResult({ error: 'Geolocation not supported by your browser.' })
      setModalOpen(true)
      return
    }
    setSafetyLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        setUserPos([latitude, longitude])

        const nearbyQuakes = earthquakes.filter(f => {
          const mag = f.properties?.mag || 0
          if (mag < 4) return false
          const [lon, lat] = f.geometry?.coordinates || [0, 0]
          return haversineKm(latitude, longitude, lat, lon) <= 500
        })
        const nearbyAlerts = alerts.filter(f => {
          if (!f.geometry) return false
          try {
            const [alat, alon] = polygonCentroid(f.geometry.coordinates)
            return haversineKm(latitude, longitude, alat, alon) <= 500
          } catch { return false }
        })
        const nearbyFires = wildfires.filter(f => {
          const coords = f.geometry?.coordinates
          if (!coords) return false
          return haversineKm(latitude, longitude, coords[1], coords[0]) <= 200
        })

        const threats = [
          ...nearbyQuakes.map(f => ({
            type: 'earthquake',
            label: `M${f.properties.mag.toFixed(1)} earthquake — ${f.properties.place}`,
          })),
          ...nearbyAlerts.map(f => ({
            type: 'alert',
            label: `${f.properties.event} — ${f.properties.areaDesc?.split(';')[0]}`,
          })),
          ...nearbyFires.map(f => ({
            type: 'fire',
            label: `🔥 ${f.properties?.FireName || 'Active Wildfire'}${f.properties?.DailyAcres ? ` — ${f.properties.DailyAcres.toLocaleString()} acres` : ''}`,
          })),
        ]

        const result = { safe: threats.length === 0, threats, lat: latitude, lon: longitude }
        setSafetyResult(result)
        setSafetyLoading(false)
        setModalOpen(true)

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Custos Safety Check', {
            body: result.safe
              ? 'No major threats detected within 500 km of your location.'
              : `⚠ ${threats.length} threat(s) detected near you.`,
          })
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          Notification.requestPermission()
        }
      },
      () => {
        setSafetyResult({ error: 'Location access denied. Please allow location access in your browser settings.' })
        setSafetyLoading(false)
        setModalOpen(true)
      }
    )
  }

  // ── Derived stats ──────────────────────────────────────────────────────
  const majorQuakes = earthquakes.filter(f => (f.properties?.mag || 0) >= 4)
  const visibleQuakes = filters.majorOnly
    ? earthquakes.filter(f => (f.properties?.mag || 0) >= 4)
    : earthquakes

  // ── Styles ────────────────────────────────────────────────────────────
  const glass = isDark ? {
    background: 'var(--ds-surface)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--ds-border)',
    borderRadius: '1rem',
  } : {
    background: 'rgba(250,252,255,0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(99,150,222,0.18)',
    borderRadius: '1rem',
  }

  const pillBtn = (color = '#0C1A2E') => ({
    background: color,
    borderRadius: '9999px',
    color: '#fff',
    border: 'none',
    padding: '0.55rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'opacity 0.15s',
  })

  const toggleStyle = active => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '9999px',
    border: `1px solid ${active ? 'var(--ds-accent)' : 'rgba(99,150,222,0.35)'}`,
    background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
    color: active ? 'var(--ds-accent)' : 'var(--ds-text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    transition: 'all 0.15s',
  })

  const statCard = {
    ...glass,
    padding: '1rem 1.5rem',
    textAlign: 'center',
    flex: 1,
    minWidth: 120,
  }

  if (!tornadoIconRef.current) tornadoIconRef.current = makeEmojiIcon('🌪️', 30)
  if (!hurricaneIconRef.current) hurricaneIconRef.current = makeEmojiIcon('🌀', 32)
  if (!fireIconRef.current) fireIconRef.current = makeEmojiIcon('🔥', 26)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Plus Jakarta Sans", sans-serif', background: isDark ? 'var(--ds-bg)' : '#F0F6FF' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        marginTop: '-5rem',
        paddingTop: '6.5rem',
        paddingBottom: '2.5rem',
        background: isDark
          ? 'linear-gradient(135deg, #0A1628 0%, #0E2040 50%, #0C1A38 100%)'
          : 'linear-gradient(135deg, #C8E6FA 0%, #EFF8FF 50%, #DBEAFE 100%)',
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.9rem' }}>🌐</span>
            <span style={{
              background: 'rgba(37,99,235,0.12)', color: '#2563EB',
              borderRadius: '9999px', padding: '0.25rem 0.9rem',
              fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Live Data</span>
          </div>

          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
            color: 'var(--ds-text-primary)', margin: '0 0 0.5rem', lineHeight: 1.15,
          }}>
            Live Disaster Map
          </h1>
          <p style={{ color: 'var(--ds-text-secondary)', fontSize: '1.05rem', margin: '0 0 2rem' }}>
            Real-time data: earthquakes · severe weather · wildfires · tropical storms · Updated every 60 s
          </p>

          {/* Stat row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total quakes today', value: earthquakes.length, icon: '🟡' },
              { label: 'Major (M4+) quakes', value: majorQuakes.length, icon: '🔴' },
              { label: 'Weather alerts', value: alerts.length, icon: '⛈️' },
              { label: 'Active wildfires', value: wildfires.length + DEMO_WILDFIRES.length, icon: '🔥' },
              { label: 'Tornadoes tracked', value: DEMO_TORNADOES.length, icon: '🌪️' },
              { label: 'Tropical storms', value: hurricanes.length + DEMO_HURRICANES.length, icon: '🌀' },
            ].map(s => (
              <div key={s.label} style={statCard}>
                <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ds-text-primary)', lineHeight: 1 }}>
                  {loading ? '…' : s.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ds-text-secondary)', marginTop: '0.2rem', fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map + Controls ────────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: '72rem', margin: '2rem auto', padding: '0 1.25rem', width: '100%' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Control Panel */}
          <div style={{ ...glass, padding: '1.25rem', width: 240, flexShrink: 0 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', color: 'var(--ds-text-primary)', margin: '0 0 1rem', fontSize: '1.05rem' }}>
              Controls
            </h3>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              <span style={{ background: 'rgba(255,200,0,0.15)', color: '#B45309', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 700 }}>
                🟡 {visibleQuakes.length} quakes
              </span>
              <span style={{ background: 'rgba(255,60,60,0.1)', color: '#B91C1C', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 700 }}>
                ⛈️ {alerts.length} alerts
              </span>
              <span style={{ background: 'rgba(255,107,0,0.1)', color: '#9A3412', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 700 }}>
                🔥 {wildfires.length + DEMO_WILDFIRES.length} fires
              </span>
              <span style={{ background: 'rgba(124,58,237,0.1)', color: '#5B21B6', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 700 }}>
                🌪️ {DEMO_TORNADOES.length} tornadoes
              </span>
              <span style={{ background: 'rgba(147,51,234,0.1)', color: '#6B21A8', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 700 }}>
                🌀 {hurricanes.length + DEMO_HURRICANES.length} storms
              </span>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[
                { key: 'showQuakes', label: 'Earthquakes', icon: '🟡' },
                { key: 'showAlerts', label: 'Severe Weather', icon: '⛈️' },
                { key: 'showFires', label: 'Wildfires', icon: '🔥' },
                { key: 'showTornadoes', label: 'Tornadoes', icon: '🌪️' },
                { key: 'showHurricanes', label: 'Tropical Storms', icon: '🌀' },
                { key: 'majorOnly', label: 'Show Only M4+', icon: '🔍' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilters(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                  style={toggleStyle(filters[f.key])}
                >
                  <span>{f.icon}</span> {f.label}
                </button>
              ))}
            </div>

            {/* Am I Safe? */}
            <button
              onClick={checkSafety}
              disabled={safetyLoading}
              style={{ ...pillBtn('#0C1A2E'), width: '100%', justifyContent: 'center', marginBottom: '1.25rem', opacity: safetyLoading ? 0.7 : 1 }}
            >
              {safetyLoading ? '⏳ Checking…' : '🛡 Am I Safe?'}
            </button>

            {/* Legend */}
            <div style={{ borderTop: '1px solid rgba(99,150,222,0.18)', paddingTop: '1rem' }}>
              <LegendSection title="Earthquake Magnitude" items={[
                { color: '#FF3B3B', label: 'M6+ Major', shape: 'circle' },
                { color: '#FF8C00', label: 'M4–5.9 Moderate', shape: 'circle' },
                { color: '#FFD700', label: 'M2–3.9 Minor', shape: 'circle' },
                { color: '#A8D8FF', label: 'M<2 Micro', shape: 'circle' },
              ]} />
              <LegendSection title="Tornadoes" items={[
                { color: '#4C1D95', label: 'EF4–EF5 Violent', shape: 'circle' },
                { color: '#7C3AED', label: 'EF3 Significant', shape: 'circle' },
                { color: '#A855F7', label: 'EF2 Considerable', shape: 'circle' },
                { color: '#C084FC', label: 'EF0–EF1 Weak', shape: 'circle' },
              ]} />
              <LegendSection title="Severe Weather" items={[
                { color: '#0EA5E9', label: 'Flood', shape: 'square' },
                { color: '#EC4899', label: 'Hurricane / Tropical', shape: 'square' },
                { color: '#94A3B8', label: 'Blizzard / Winter', shape: 'square' },
                { color: '#FF0000', label: 'Extreme Alert', shape: 'square' },
                { color: '#FF6600', label: 'Severe Alert', shape: 'square' },
              ]} />
              <LegendSection title="Wildfires" items={[
                { color: '#FF2D00', label: '100k+ acres', shape: 'circle' },
                { color: '#FF6B00', label: '10k–100k acres', shape: 'circle' },
                { color: '#FFB347', label: 'Small / active', shape: 'circle' },
              ]} />
              <LegendSection title="Tropical Storms" items={[
                { color: '#9333EA', label: 'Hurricane (HU)', shape: 'circle' },
                { color: '#EC4899', label: 'Tropical Storm (TS)', shape: 'circle' },
                { color: '#F59E0B', label: 'Tropical Depression', shape: 'circle' },
              ]} />
            </div>

            {/* Last updated */}
            <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--ds-text-secondary)', borderTop: '1px solid rgba(99,150,222,0.18)', paddingTop: '0.75rem' }}>
              {lastUpdated
                ? `⏱ Updated ${secondsAgo}s ago`
                : loading ? '⏳ Loading…' : '—'}
            </div>
          </div>

          {/* Map */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 32px rgba(37,99,235,0.12)', height: '70vh' }}>
              {loading
                ? <Spinner />
                : (
                  <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      subdomains="abcd"
                      maxZoom={19}
                    />

                    {/* Earthquake markers */}
                    {filters.showQuakes && visibleQuakes.map(f => {
                      const { mag = 0, place, time, url } = f.properties || {}
                      const [lon, lat, depth] = f.geometry?.coordinates || [0, 0, 0]
                      if (!lat && !lon) return null
                      return (
                        <CircleMarker
                          key={f.id || `q-${lat}-${lon}-${time}`}
                          center={[lat, lon]}
                          radius={Math.max(4, mag * 3)}
                          pathOptions={{
                            color: quakeColor(mag),
                            fillColor: quakeColor(mag),
                            fillOpacity: mag > 3 ? 0.85 : 0.55,
                            weight: mag >= 4 ? 1.5 : 0.8,
                          }}
                        >
                          <Popup>
                            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', minWidth: 180 }}>
                              <div style={{ fontWeight: 700, color: quakeColor(mag), fontSize: '1rem', marginBottom: 4 }}>
                                M{mag.toFixed(1)} Earthquake
                              </div>
                              <div style={{ color: 'var(--ds-text-primary)', fontWeight: 600, marginBottom: 4 }}>{place}</div>
                              <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>🕐 {formatTime(time)}</div>
                              <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>📏 Depth: {depth?.toFixed(1)} km</div>
                              {url && (
                                <a href={url} target="_blank" rel="noreferrer"
                                  style={{ color: '#2563EB', fontSize: '0.78rem', display: 'block', marginTop: 6 }}>
                                  View on USGS →
                                </a>
                              )}
                            </div>
                          </Popup>
                        </CircleMarker>
                      )
                    })}

                    {/* NOAA Weather Alert markers / polygons */}
                    {filters.showAlerts && alerts.map((f, i) => {
                      const { event, headline, severity, areaDesc, effective, expires } = f.properties || {}
                      const { color, icon } = alertTypeInfo(event, severity)
                      const geo = f.geometry

                      if (geo && geo.type === 'Polygon') {
                        const latLngs = geo.coordinates[0].map(c => [c[1], c[0]])
                        return (
                          <Polygon
                            key={`alert-poly-${i}`}
                            positions={latLngs}
                            pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
                          >
                            <Popup>
                              <AlertPopup icon={icon} event={event} headline={headline} areaDesc={areaDesc} effective={effective} expires={expires} color={color} />
                            </Popup>
                          </Polygon>
                        )
                      }

                      if (geo && geo.type === 'MultiPolygon') {
                        return geo.coordinates.map((poly, pi) => {
                          const latLngs = poly[0].map(c => [c[1], c[0]])
                          return (
                            <Polygon
                              key={`alert-mpoly-${i}-${pi}`}
                              positions={latLngs}
                              pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
                            >
                              <Popup>
                                <AlertPopup icon={icon} event={event} headline={headline} areaDesc={areaDesc} effective={effective} expires={expires} color={color} />
                              </Popup>
                            </Polygon>
                          )
                        })
                      }

                      return null
                    })}

                    {/* Wildfire markers */}
                    {filters.showFires && wildfires.map((f, i) => {
                      const coords = f.geometry?.coordinates
                      if (!coords) return null
                      const [lon, lat] = coords
                      const props = f.properties || {}
                      const acres = props.DailyAcres || 0
                      const color = fireColor(acres)
                      const radius = Math.max(5, Math.min(20, Math.log10(acres + 1) * 4))
                      return (
                        <CircleMarker
                          key={`fire-${i}`}
                          center={[lat, lon]}
                          radius={radius}
                          pathOptions={{ color, fillColor: color, fillOpacity: 0.82, weight: 1.5 }}
                        >
                          <Popup>
                            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', minWidth: 180 }}>
                              <div style={{ fontWeight: 700, color: '#FF6B00', fontSize: '1rem', marginBottom: 4 }}>
                                🔥 {props.FireName || 'Active Wildfire'}
                              </div>
                              {(props.POOCounty || props.POOState) && (
                                <div style={{ color: 'var(--ds-text-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                                  📍 {[props.POOCounty, props.POOState].filter(Boolean).join(', ')}
                                </div>
                              )}
                              {acres > 0 && (
                                <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>
                                  📏 {acres.toLocaleString()} acres
                                </div>
                              )}
                              {props.PercentContained != null && (
                                <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>
                                  ✅ {props.PercentContained}% contained
                                </div>
                              )}
                            </div>
                          </Popup>
                        </CircleMarker>
                      )
                    })}

                    {/* Tropical storm / hurricane markers */}
                    {filters.showHurricanes && hurricanes.map((storm, i) => {
                      const lat = storm.latitudeNumeric
                      const lon = storm.longitudeNumeric
                      if (!lat || !lon) return null
                      const color = hurricaneColor(storm.classification)
                      return (
                        <CircleMarker
                          key={`storm-${i}`}
                          center={[lat, lon]}
                          radius={14}
                          pathOptions={{ color, fillColor: color, fillOpacity: 0.75, weight: 2.5 }}
                        >
                          <Popup>
                            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', minWidth: 190 }}>
                              <div style={{ fontWeight: 700, color, fontSize: '1rem', marginBottom: 4 }}>
                                🌀 {storm.name}
                              </div>
                              <div style={{ color: 'var(--ds-text-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                                {storm.classification}
                              </div>
                              {storm.intensity && (
                                <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>
                                  💨 {storm.intensity} mph max winds
                                </div>
                              )}
                              {storm.pressure && (
                                <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>
                                  🔽 {storm.pressure} mb pressure
                                </div>
                              )}
                              <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>
                                📍 {storm.latitude}, {storm.longitude}
                              </div>
                            </div>
                          </Popup>
                        </CircleMarker>
                      )
                    })}

                    {/* Demo wildfire markers */}
                    {filters.showFires && DEMO_WILDFIRES.map(fw => (
                      <Marker
                        key={fw.id}
                        position={[fw.lat, fw.lon]}
                        icon={fireIconRef.current}
                      >
                        <Popup>
                          <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', minWidth: 180 }}>
                            <div style={{ fontWeight: 700, color: '#FF6B00', fontSize: '1rem', marginBottom: 4 }}>
                              🔥 {fw.name}
                            </div>
                            <div style={{ color: 'var(--ds-text-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                              📍 {fw.state}
                            </div>
                            <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>📏 {fw.acres.toLocaleString()} acres</div>
                            <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>✅ {fw.contained}% contained</div>
                            <div style={{ color: '#9CA3AF', fontSize: '0.72rem', marginTop: 4 }}>⚠ Simulated data</div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Demo tornado markers */}
                    {filters.showTornadoes && DEMO_TORNADOES.map(t => (
                      <Marker
                        key={t.id}
                        position={[t.lat, t.lon]}
                        icon={tornadoIconRef.current}
                      >
                        <Popup>
                          <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', minWidth: 190 }}>
                            <div style={{ fontWeight: 700, color: efColor(t.ef), fontSize: '1rem', marginBottom: 4 }}>
                              🌪️ Tornado — {t.ef}
                            </div>
                            <div style={{ color: 'var(--ds-text-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                              📍 {t.city}
                            </div>
                            <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>📐 Width: {t.width}</div>
                            <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>🛣 Path: {t.path}</div>
                            <div style={{ color: '#9CA3AF', fontSize: '0.72rem', marginTop: 4 }}>⚠ Simulated data</div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Demo hurricane markers */}
                    {filters.showHurricanes && DEMO_HURRICANES.map(h => {
                      const color = hurricaneColor(h.classification)
                      return (
                        <Marker
                          key={h.id}
                          position={[h.lat, h.lon]}
                          icon={hurricaneIconRef.current}
                        >
                          <Popup>
                            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', minWidth: 200 }}>
                              <div style={{ fontWeight: 700, color, fontSize: '1rem', marginBottom: 4 }}>
                                🌀 {h.name}
                              </div>
                              <div style={{ color: 'var(--ds-text-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                                {h.category ? `Category ${h.category}` : 'Tropical Storm'}
                              </div>
                              <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>💨 {h.winds} mph max winds</div>
                              <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.8rem' }}>🔽 {h.pressure} mb pressure</div>
                              <div style={{ color: '#9CA3AF', fontSize: '0.72rem', marginTop: 4 }}>⚠ Simulated data</div>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}

                    {/* User location marker (Am I Safe? check) */}
                    {userPos && (
                      <CircleMarker
                        center={userPos}
                        radius={10}
                        pathOptions={{ color: '#2563EB', fillColor: '#60A5FA', fillOpacity: 0.9, weight: 3 }}
                      >
                        <Popup>
                          <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, color: 'var(--ds-text-primary)' }}>
                            📍 Your Location
                          </div>
                        </Popup>
                      </CircleMarker>
                    )}
                  </MapContainer>
                )}
            </div>
            <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--ds-text-secondary)', textAlign: 'right' }}>
              Data: USGS · NOAA NWS · NASA/ESRI Active Fires · NHC · Auto-refreshes every 60 s
            </div>
          </div>
        </div>
      </main>

      {/* ── Safety Modal ──────────────────────────────────────────────── */}
      {modalOpen && safetyResult && (
        <SafetyModal result={safetyResult} onClose={() => setModalOpen(false)} />
      )}

      <Footer />
    </div>
  )
}

// ─── Legend section sub-component ─────────────────────────────────────────
function LegendSection({ title, items }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ds-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      {items.map(l => (
        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{
            width: 12, height: 12,
            borderRadius: l.shape === 'circle' ? '50%' : '0.15rem',
            background: l.color,
            display: 'inline-block',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--ds-text-secondary)' }}>{l.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Alert Popup sub-component ─────────────────────────────────────────────
function AlertPopup({ icon, event, headline, areaDesc, effective, expires, color }) {
  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', minWidth: 200, maxWidth: 260 }}>
      <div style={{ fontWeight: 700, color, fontSize: '0.95rem', marginBottom: 4 }}>
        {icon} {event}
      </div>
      {headline && (
        <div style={{ color: 'var(--ds-text-primary)', fontWeight: 600, fontSize: '0.82rem', marginBottom: 4 }}>
          {headline.slice(0, 100)}{headline.length > 100 ? '…' : ''}
        </div>
      )}
      {areaDesc && (
        <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.78rem', marginBottom: 4 }}>
          📍 {areaDesc.split(';').slice(0, 3).join('; ')}
        </div>
      )}
      <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.75rem' }}>🕐 Effective: {formatTime(effective)}</div>
      <div style={{ color: 'var(--ds-text-secondary)', fontSize: '0.75rem' }}>⏰ Expires: {formatTime(expires)}</div>
    </div>
  )
}

// ─── Safety Modal ──────────────────────────────────────────────────────────
function SafetyModal({ result, onClose }) {
  const glass = {
    background: 'var(--ds-surface)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--ds-border)',
    borderRadius: '1.25rem',
    padding: '2rem',
    maxWidth: 440,
    width: '90vw',
    boxShadow: 'var(--ds-shadow-lg)',
  }

  const typeIcon = { earthquake: '🟡', alert: '⛈️', fire: '🔥' }

  if (result.error) {
    return (
      <ModalOverlay onClose={onClose}>
        <div style={glass}>
          <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>❌</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: 'var(--ds-text-primary)', textAlign: 'center', margin: '0 0 0.5rem' }}>
            Location Error
          </h2>
          <p style={{ color: 'var(--ds-text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>{result.error}</p>
          <CloseBtn onClose={onClose} />
        </div>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div style={glass}>
        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          {result.safe ? '🛡️' : '⚠️'}
        </div>
        <h2 style={{
          fontFamily: 'Fraunces, serif',
          color: result.safe ? '#166534' : '#991B1B',
          textAlign: 'center',
          margin: '0 0 0.75rem',
          fontSize: '1.4rem',
        }}>
          {result.safe ? 'You appear safe' : 'Threats detected nearby'}
        </h2>

        {result.safe ? (
          <p style={{ color: 'var(--ds-text-secondary)', textAlign: 'center', fontSize: '0.88rem', lineHeight: 1.6 }}>
            No major earthquakes (M4+), severe weather alerts, or active wildfires were found within <strong>500 km</strong> of your location.
          </p>
        ) : (
          <div>
            <p style={{ color: 'var(--ds-text-secondary)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
              The following events were detected within 500 km (earthquakes/weather) or 200 km (wildfires):
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
              {result.threats.map((t, i) => (
                <li key={i} style={{
                  background: t.type === 'earthquake' ? 'rgba(255,140,0,0.08)'
                    : t.type === 'fire' ? 'rgba(255,107,0,0.08)'
                    : 'rgba(255,60,60,0.08)',
                  border: `1px solid ${t.type === 'earthquake' ? 'rgba(255,140,0,0.3)'
                    : t.type === 'fire' ? 'rgba(255,107,0,0.3)'
                    : 'rgba(255,60,60,0.3)'}`,
                  borderRadius: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.82rem',
                  color: 'var(--ds-text-primary)',
                  fontWeight: 600,
                }}>
                  {typeIcon[t.type] || '⚠️'} {t.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', padding: '0.6rem 0.9rem', background: 'rgba(37,99,235,0.06)', borderRadius: '0.6rem', fontSize: '0.75rem', color: 'var(--ds-text-secondary)', textAlign: 'center' }}>
          📍 Checked from {result.lat?.toFixed(3)}°, {result.lon?.toFixed(3)}°
        </div>

        <CloseBtn onClose={onClose} />
      </div>
    </ModalOverlay>
  )
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,20,40,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function CloseBtn({ onClose }) {
  return (
    <button
      onClick={onClose}
      style={{
        display: 'block',
        margin: '1.25rem auto 0',
        background: '#0C1A2E',
        color: '#fff',
        border: 'none',
        borderRadius: '9999px',
        padding: '0.55rem 2rem',
        fontWeight: 700,
        fontSize: '0.88rem',
        cursor: 'pointer',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      }}
    >
      Close
    </button>
  )
}
