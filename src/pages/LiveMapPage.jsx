import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import ThemeToggle, { useTheme } from '../components/ThemeToggle'
import LanguagePopup from '../components/LanguagePopup'

const BOSTON_CENTER = [42.3601, -71.0589]
const BOSTON_ZOOM = 12

const NEIGHBORHOODS = [
  { name: 'Chinatown',    bounds: [[42.3460, -71.0680], [42.3540, -71.0570]], color: '#DC2626', stress: 'Extreme heat' },
  { name: 'East Boston',  bounds: [[42.3625, -71.0470], [42.3870, -71.0150]], color: '#1D4ED8', stress: 'Floods first' },
  { name: 'Roxbury',      bounds: [[42.3070, -71.1010], [42.3380, -71.0700]], color: '#D97706', stress: 'Air quality' },
  { name: 'Dorchester',   bounds: [[42.2820, -71.0800], [42.3290, -71.0410]], color: '#7C3AED', stress: 'Energy burden' },
  { name: 'Mattapan',     bounds: [[42.2570, -71.1020], [42.2790, -71.0780]], color: '#059669', stress: 'Tree canopy gap' },
]

function quakeColor(mag) {
  if (mag >= 6) return '#FF3B3B'; if (mag >= 4) return '#FF8C00'
  if (mag >= 2) return '#FFD700'; return '#A8D8FF'
}
function alertColor(ev = '') {
  const e = ev.toLowerCase()
  if (e.includes('tornado')) return '#7C3AED'
  if (e.includes('flood') || e.includes('surge')) return '#0EA5E9'
  if (e.includes('hurricane')) return '#EC4899'
  if (e.includes('winter') || e.includes('blizzard')) return '#94A3B8'
  if (e.includes('fire')) return '#F97316'
  if (e.includes('heat')) return '#DC2626'
  return '#FFAA00'
}
function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function LiveMapPage() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  const [quakes, setQuakes] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [layer, setLayer] = useState({ quakes: true, alerts: true, neighborhoods: true })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const [qRes, aRes] = await Promise.allSettled([
          fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'),
          fetch('https://api.weather.gov/alerts/active?status=actual&message_type=alert', { headers: { Accept: 'application/geo+json' } }),
        ])
        if (cancelled) return

        if (qRes.status === 'fulfilled' && qRes.value.ok) {
          const data = await qRes.value.json()
          setQuakes((data.features || []).slice(0, 200).map(f => ({
            id: f.id, mag: f.properties.mag, place: f.properties.place,
            time: f.properties.time, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0],
          })))
        }
        if (aRes.status === 'fulfilled' && aRes.value.ok) {
          const data = await aRes.value.json()
          const items = []
          for (const f of (data.features || [])) {
            const p = f.properties || {}
            let coords = null
            if (f.geometry?.type === 'Polygon' && f.geometry.coordinates?.[0]?.length) {
              const ring = f.geometry.coordinates[0]
              const [sx, sy] = ring.reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0])
              coords = [sy / ring.length, sx / ring.length]
            }
            if (!coords) continue
            items.push({
              id: f.id || p['@id'], event: p.event, severity: p.severity,
              headline: p.headline, area: p.areaDesc, sent: p.sent,
              lat: coords[0], lon: coords[1],
            })
            if (items.length >= 80) break
          }
          setAlerts(items)
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load live data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const tx1 = isDark ? '#D6E8FF' : '#0C1A2E'
  const txMt = isDark ? 'rgba(214,232,255,0.65)' : '#5B7FA5'
  const N = isDark ? '#7CB9FF' : '#2563EB'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: isDark ? 'linear-gradient(160deg,#050B18 0%,#0E2040 100%)' : 'linear-gradient(160deg,#EFF6FF 0%,#D0ECFA 100%)',
      transition: 'background 0.3s',
    }}>
      <nav style={{ padding: '1.25rem 1.5rem 0', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          background: isDark ? 'rgba(8,18,38,0.65)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: isDark ? '1px solid rgba(99,150,222,0.18)' : '1px solid rgba(99,150,222,0.25)',
          borderRadius: '0.875rem', padding: '0.6rem 1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          boxShadow: '0 8px 32px rgba(12,26,46,0.10)',
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ fontSize: '1.2rem' }}>🌊</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: tx1, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Beacon</span>
          </Link>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: N, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            🗺️ Live Hazard Map · Boston
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle theme={theme} onToggle={toggle} />
            <LanguagePopup />
            <Link to="/" style={{ fontSize: '0.8rem', color: txMt, textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</Link>
          </div>
        </div>
      </nav>

      <header style={{ padding: '2rem 1.5rem 1rem', maxWidth: '72rem', width: '100%', margin: '0 auto' }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.16em', color: txMt, margin: '0 0 0.4rem' }}>LIVE DATA · USGS + NOAA</p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: tx1, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
          Boston Hazard Map
        </h1>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', color: isDark ? 'rgba(214,232,255,0.78)' : '#3D5A80', margin: 0, lineHeight: 1.6 }}>
          Real-time earthquakes (last 7 days) and active NOAA weather alerts overlaid on Boston's 5 hero neighborhoods.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
          {[
            { key: 'quakes', label: `🌐 USGS Quakes (${quakes.length})`, on: layer.quakes },
            { key: 'alerts', label: `⛈️ NOAA Alerts (${alerts.length})`, on: layer.alerts },
            { key: 'neighborhoods', label: `🏘️ Boston Neighborhoods (5)`, on: layer.neighborhoods },
          ].map(p => (
            <button key={p.key}
              onClick={() => setLayer(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
              style={{
                background: p.on ? (isDark ? 'rgba(75,150,243,0.22)' : '#0C1A2E') : (isDark ? 'rgba(22,32,56,0.65)' : 'rgba(255,255,255,0.7)'),
                color: p.on ? '#fff' : tx1,
                border: p.on ? `1px solid ${N}` : (isDark ? '1px solid rgba(99,150,222,0.20)' : '1px solid rgba(99,150,222,0.25)'),
                borderRadius: '9999px', padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer', transition: 'all 0.15s',
              }}>{p.label}</button>
          ))}
          {loading && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: txMt }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(37,99,235,0.2)', borderTopColor: N, animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            Loading live feeds…
          </span>}
          {error && <span style={{ fontSize: '0.78rem', color: '#DC2626' }}>⚠️ {error}</span>}
        </div>
      </header>

      <main style={{ flex: 1, padding: '0 1.5rem 2rem', maxWidth: '72rem', width: '100%', margin: '0 auto' }}>
        <div style={{
          borderRadius: '1rem', overflow: 'hidden',
          border: isDark ? '1px solid rgba(99,150,222,0.18)' : '1px solid rgba(99,150,222,0.22)',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.40)' : '0 8px 32px rgba(37,99,235,0.10)',
        }}>
          <MapContainer center={BOSTON_CENTER} zoom={BOSTON_ZOOM} style={{ height: '70vh', width: '100%' }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url={isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'}
            />
            {layer.neighborhoods && NEIGHBORHOODS.map(n => (
              <Rectangle key={n.name} bounds={n.bounds} pathOptions={{ color: n.color, fillColor: n.color, fillOpacity: 0.18, weight: 2 }}>
                <Tooltip permanent direction="center" opacity={1} className="hood-label">
                  <div style={{ textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0C1A2E', letterSpacing: '-0.01em' }}>{n.name}</div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 600, color: n.color, marginTop: '0.1rem' }}>{n.stress}</div>
                  </div>
                </Tooltip>
              </Rectangle>
            ))}
            {layer.quakes && quakes.map(q => (
              <CircleMarker key={q.id} center={[q.lat, q.lon]} radius={Math.max(4, (q.mag || 1) * 2.2)}
                pathOptions={{ color: quakeColor(q.mag), fillColor: quakeColor(q.mag), fillOpacity: 0.55, weight: 1.5 }}>
                <Popup>
                  <strong>M{q.mag} earthquake</strong><br />
                  {q.place}<br />
                  <span style={{ color: '#5B7FA5', fontSize: '0.75rem' }}>{formatTime(q.time)}</span>
                </Popup>
              </CircleMarker>
            ))}
            {layer.alerts && alerts.map(a => (
              <CircleMarker key={a.id} center={[a.lat, a.lon]} radius={6}
                pathOptions={{ color: alertColor(a.event), fillColor: alertColor(a.event), fillOpacity: 0.65, weight: 1.5 }}>
                <Popup>
                  <strong>{a.event}</strong> <span style={{ fontSize: '0.7rem', color: '#5B7FA5' }}>· {a.severity}</span><br />
                  <span style={{ fontSize: '0.78rem' }}>{a.headline}</span><br />
                  <span style={{ color: '#5B7FA5', fontSize: '0.72rem' }}>{a.area}</span>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem', fontSize: '0.78rem', fontFamily: "'Plus Jakarta Sans', sans-serif", color: txMt }}>
          {[
            { c: '#FF3B3B', l: 'M6+ quake' },
            { c: '#FF8C00', l: 'M4–6 quake' },
            { c: '#FFD700', l: 'M2–4 quake' },
            { c: '#0EA5E9', l: 'Flood alert' },
            { c: '#DC2626', l: 'Heat alert' },
            { c: '#7C3AED', l: 'Tornado' },
          ].map(item => (
            <span key={item.l} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.c, display: 'inline-block' }} />{item.l}
            </span>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .leaflet-container { font-family: 'Plus Jakarta Sans', sans-serif; }
        .hood-label { background: rgba(255,255,255,0.92) !important; border: 1px solid rgba(99,150,222,0.30) !important; box-shadow: 0 2px 8px rgba(12,26,46,0.15) !important; padding: 0.3rem 0.5rem !important; border-radius: 0.4rem !important; }
        .hood-label::before { display: none !important; }
      `}</style>
    </div>
  )
}
