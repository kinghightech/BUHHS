import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { geocodeZip } from '../utils/api'

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_HEADING = "'Fraunces', Georgia, serif"
const FONT_BODY = "'Plus Jakarta Sans', system-ui, sans-serif"
const C_PRIMARY = 'var(--ds-text-primary)'
const C_SECONDARY = 'var(--ds-text-secondary)'
const C_ACCENT = 'var(--ds-accent)'

const glassPanel = {
  background: 'var(--ds-surface)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--ds-border)',
  borderRadius: '1rem',
  boxShadow: 'var(--ds-shadow-md)',
}

const pillBtn = {
  background: '#0C1A2E',
  borderRadius: '9999px',
  color: '#fff',
  border: 'none',
  padding: '0.75rem 2rem',
  fontSize: '0.9375rem',
  fontWeight: 700,
  fontFamily: FONT_BODY,
  cursor: 'pointer',
  transition: 'opacity 0.15s, transform 0.15s',
  letterSpacing: '-0.01em',
}

// ─── Risk Gauge ───────────────────────────────────────────────────────────────
function RiskGauge({ label, score, icon, animate }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 38
  const circ = 2 * Math.PI * r
  const color = score > 70 ? '#EF4444' : score > 40 ? '#F59E0B' : '#22C55E'
  const riskLevel = score > 70 ? 'High' : score > 40 ? 'Moderate' : 'Low'
  const riskBg = score > 70 ? 'rgba(239,68,68,0.1)' : score > 40 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)'

  useEffect(() => {
    if (!animate) return
    setDisplayed(0)
    const start = performance.now()
    const dur = 1200
    function tick(now) {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(score * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score, animate])

  const offset = circ * (1 - displayed / 100)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '1.25rem 0.75rem',
        ...glassPanel,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.13)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.08)'
      }}
    >
      <div style={{ fontSize: '1.25rem' }}>{icon}</div>
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="rgba(99,150,222,0.15)"
            strokeWidth="10"
          />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: C_PRIMARY, fontFamily: FONT_BODY, lineHeight: 1 }}>
            {displayed}
          </span>
          <span style={{ fontSize: '0.6rem', color: C_SECONDARY, fontWeight: 600, fontFamily: FONT_BODY }}>/ 100</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C_PRIMARY, fontFamily: FONT_BODY }}>{label}</div>
        <span
          style={{
            display: 'inline-block',
            marginTop: '0.25rem',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color,
            background: riskBg,
            borderRadius: '9999px',
            padding: '0.125rem 0.5rem',
            fontFamily: FONT_BODY,
          }}
        >
          {riskLevel}
        </span>
      </div>
    </div>
  )
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!text) { setDisplayed(''); return }
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(id)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return displayed
}

// ─── Coverage Bar ─────────────────────────────────────────────────────────────
function CoverageBar({ homeValue, coverage }) {
  const hv = parseFloat(homeValue.replace(/,/g, '')) || 0
  const cv = parseFloat(coverage.replace(/,/g, '')) || 0
  if (!hv || !cv) return null
  const ratio = Math.min(cv / hv, 1)
  const gap = hv - cv
  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: C_SECONDARY, fontFamily: FONT_BODY }}>
          Current Coverage: ${cv.toLocaleString()}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#EF4444', fontFamily: FONT_BODY }}>
          Gap: ${gap.toLocaleString()}
        </span>
      </div>
      <div style={{ height: '1rem', background: 'rgba(99,150,222,0.12)', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: `${ratio * 100}%`,
            background: ratio < 0.7 ? '#EF4444' : ratio < 0.9 ? '#F59E0B' : '#22C55E',
            borderRadius: '9999px',
            transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '0.6875rem', color: C_SECONDARY, fontFamily: FONT_BODY }}>$0</span>
        <span style={{ fontSize: '0.6875rem', color: C_PRIMARY, fontWeight: 600, fontFamily: FONT_BODY }}>
          Home value: ${hv.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

// ─── Fallback risk scores by region ──────────────────────────────────────────
function getFallbackScores(lat, lon) {
  const jitter = (base, range) => Math.min(100, Math.max(0, Math.round(base + (lat % 1) * range - range / 2)))
  // California
  if (lon < -114 && lat > 32 && lat < 42) {
    return { earthquake: jitter(85, 10), hurricane: jitter(5, 4), flood: jitter(45, 12), tornado: jitter(8, 5), wildfire: jitter(78, 12), winterStorm: jitter(20, 10) }
  }
  // Florida
  if (lon > -87.5 && lat < 31) {
    return { earthquake: jitter(12, 6), hurricane: jitter(90, 8), flood: jitter(75, 10), tornado: jitter(55, 12), wildfire: jitter(30, 10), winterStorm: jitter(10, 6) }
  }
  // Texas
  if (lon > -106 && lon < -93.5 && lat > 25.8 && lat < 36.5) {
    return { earthquake: jitter(18, 8), hurricane: jitter(50, 14), flood: jitter(68, 12), tornado: jitter(82, 10), wildfire: jitter(45, 12), winterStorm: jitter(25, 10) }
  }
  // Pacific Northwest
  if (lon < -116 && lat > 42) {
    return { earthquake: jitter(62, 12), hurricane: jitter(4, 3), flood: jitter(50, 10), tornado: jitter(12, 6), wildfire: jitter(60, 14), winterStorm: jitter(55, 14) }
  }
  // Southeast
  if (lat < 36 && lon > -92) {
    return { earthquake: jitter(22, 10), hurricane: jitter(65, 14), flood: jitter(58, 12), tornado: jitter(60, 14), wildfire: jitter(38, 12), winterStorm: jitter(18, 8) }
  }
  // Midwest
  if (lat > 36 && lat < 49 && lon > -104 && lon < -80) {
    return { earthquake: jitter(20, 8), hurricane: jitter(5, 4), flood: jitter(52, 14), tornado: jitter(72, 12), wildfire: jitter(25, 10), winterStorm: jitter(62, 14) }
  }
  // Northeast
  if (lat > 38 && lon > -80) {
    return { earthquake: jitter(28, 10), hurricane: jitter(42, 14), flood: jitter(48, 12), tornado: jitter(32, 10), wildfire: jitter(18, 8), winterStorm: jitter(65, 12) }
  }
  // Default
  return {
    earthquake: jitter(42, 14), hurricane: jitter(38, 14), flood: jitter(50, 14),
    tornado: jitter(44, 14), wildfire: jitter(40, 14), winterStorm: jitter(46, 14),
  }
}

// ─── Parse FEMA NRI response ──────────────────────────────────────────────────
function parseFemaScores(data) {
  const item = Array.isArray(data) ? data[0] : (data?.properties || data)
  if (!item) return null
  const pct = (v) => {
    if (v == null) return null
    if (typeof v === 'string') {
      const map = { 'Very High': 90, 'High': 75, 'Relatively High': 62, 'Relatively Moderate': 50, 'Relatively Low': 35, 'Low': 22, 'Very Low': 10 }
      return map[v] ?? null
    }
    return typeof v === 'number' ? Math.round(v) : null
  }
  return {
    earthquake: pct(item.ERPT) ?? pct(item.EQKR_RISKR) ?? pct(item.earthquakeRisk),
    hurricane: pct(item.HRCN_RISKR) ?? pct(item.hurricaneRisk),
    flood: pct(item.RFLD_RISKR) ?? pct(item.CFLD_RISKR) ?? pct(item.floodRisk),
    tornado: pct(item.TRND_RISKR) ?? pct(item.tornadoRisk),
    wildfire: pct(item.WFIR_RISKR) ?? pct(item.wildfireRisk),
    winterStorm: pct(item.WNTW_RISKR) ?? pct(item.CWAV_RISKR) ?? pct(item.winterStormRisk),
  }
}

// ─── OpenRouter call ──────────────────────────────────────────────────────────
async function callOpenRouter(systemPrompt, userPrompt) {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Custos',
    },
    body: JSON.stringify({
      model: 'google/gemma-3-27b-it:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenRouter error ${res.status}`)
  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RiskScorePage() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [geocodeResult, setGeocodeResult] = useState(null)
  const [femaData, setFemaData] = useState(null)
  const [scores, setScores] = useState(null)
  const [scoresReady, setScoresReady] = useState(false)
  const [aiNarrative, setAiNarrative] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [gapInputs, setGapInputs] = useState({ homeValue: '', coverage: '', years: 10 })
  const [gapResult, setGapResult] = useState('')
  const [gapLoading, setGapLoading] = useState(false)
  const [gapError, setGapError] = useState('')

  const narrativeText = useTypewriter(aiNarrative, 14)
  const scoresRef = useRef(null)

  // Scroll to scores when they appear
  useEffect(() => {
    if (scores && scoresRef.current) {
      setTimeout(() => scoresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [scores])

  // Kick off AI narrative after scores are set
  useEffect(() => {
    if (!scores || !geocodeResult) return
    setAiLoading(true)
    setAiNarrative('')
    const sys = 'You are Custos, a disaster risk AI. Provide a clear, concise 3-paragraph risk assessment for a homeowner. Use plain text — no markdown, no asterisks, no bullet symbols, just clean paragraphs separated by newlines.'
    const usr = `Address: ${geocodeResult.display_name}. Risk scores: Earthquake ${scores.earthquake}/100, Hurricane ${scores.hurricane}/100, Flood ${scores.flood}/100, Tornado ${scores.tornado}/100, Wildfire ${scores.wildfire}/100, Winter Storm ${scores.winterStorm}/100. Give: 1) Overall risk summary, 2) Top 2 threats and why, 3) Top 3 actionable preparedness steps.`
    callOpenRouter(sys, usr)
      .then((txt) => setAiNarrative(txt))
      .catch(() => setAiNarrative('Unable to generate AI narrative. Please check your API key or try again later.'))
      .finally(() => setAiLoading(false))
  }, [scores]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAnalyze(e) {
    e.preventDefault()
    if (!address.trim()) return
    setLoading(true)
    setError('')
    setGeocodeResult(null)
    setFemaData(null)
    setScores(null)
    setScoresReady(false)
    setAiNarrative('')

    try {
      // Step 1: Geocode — ZIP codes use the dedicated US-ZIP pipeline; everything else uses Nominatim
      let lat, lon, display_name
      const trimmed = address.trim()
      if (/^\d{5}$/.test(trimmed)) {
        const geo = await geocodeZip(trimmed)
        lat = geo.lat
        lon = geo.lng
        display_name = geo.displayName
      } else {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const geoJson = await geoRes.json()
        if (!geoJson.length) throw new Error('Address not found. Please try a more specific address or a 5-digit ZIP code.')
        const geo = geoJson[0]
        lat = parseFloat(geo.lat)
        lon = parseFloat(geo.lon)
        display_name = geo.display_name
      }
      setGeocodeResult({ lat, lon, display_name })

      // Step 2: Try FEMA NRI
      let parsedScores = null
      const femaUrls = [
        `https://hazards.fema.gov/nri/api/county?lat=${lat}&lon=${lon}`,
        `https://hazards.fema.gov/nri/api/counties?lat=${lat}&lon=${lon}`,
      ]
      for (const url of femaUrls) {
        try {
          const ctrl = new AbortController()
          const tid = setTimeout(() => ctrl.abort(), 5000)
          const fRes = await fetch(url, { signal: ctrl.signal })
          clearTimeout(tid)
          if (fRes.ok) {
            const fJson = await fRes.json()
            setFemaData(fJson)
            const tried = parseFemaScores(fJson)
            if (tried && Object.values(tried).some((v) => v != null)) {
              parsedScores = {
                earthquake: tried.earthquake ?? getFallbackScores(lat, lon).earthquake,
                hurricane: tried.hurricane ?? getFallbackScores(lat, lon).hurricane,
                flood: tried.flood ?? getFallbackScores(lat, lon).flood,
                tornado: tried.tornado ?? getFallbackScores(lat, lon).tornado,
                wildfire: tried.wildfire ?? getFallbackScores(lat, lon).wildfire,
                winterStorm: tried.winterStorm ?? getFallbackScores(lat, lon).winterStorm,
              }
              break
            }
          }
        } catch {
          // CORS or timeout — continue to fallback
        }
      }

      if (!parsedScores) parsedScores = getFallbackScores(lat, lon)

      setScores(parsedScores)
      setTimeout(() => setScoresReady(true), 50)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGapCalculate(e) {
    e.preventDefault()
    if (!gapInputs.homeValue || !gapInputs.coverage) return
    setGapLoading(true)
    setGapResult('')
    setGapError('')
    const topRisks = scores
      ? Object.entries(scores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([k, v]) => `${k} (${v}/100)`)
          .join(', ')
      : 'unknown location'
    const sys = 'You are an insurance expert AI for Custos. Be concise and specific. Use plain text only — no markdown, no asterisks, no bullet symbols. Use numbered lists like "1." or newlines.'
    const usr = `Home value: $${gapInputs.homeValue}. Current dwelling coverage: $${gapInputs.coverage}. Years in home: ${gapInputs.years}. Location risk scores: ${topRisks}. Calculate: 1. Coverage gap amount and percentage. 2. Estimated rebuild cost vs current coverage. 3. Recommended coverage increase. 4. Annual premium increase estimate to close gap. 5. Risk-adjusted recommendation. Keep response concise, use specific dollar amounts.`
    try {
      const result = await callOpenRouter(sys, usr)
      setGapResult(result)
    } catch {
      setGapError('Unable to generate gap analysis. Please check your API key.')
    } finally {
      setGapLoading(false)
    }
  }

  const gauges = scores
    ? [
        { key: 'earthquake', label: 'Earthquake', icon: '🌍', score: scores.earthquake },
        { key: 'hurricane', label: 'Hurricane', icon: '🌀', score: scores.hurricane },
        { key: 'flood', label: 'Flood', icon: '🌊', score: scores.flood },
        { key: 'tornado', label: 'Tornado', icon: '🌪️', score: scores.tornado },
        { key: 'wildfire', label: 'Wildfire', icon: '🔥', score: scores.wildfire },
        { key: 'winterStorm', label: 'Winter Storm', icon: '❄️', score: scores.winterStorm },
      ]
    : []

  const overallRisk = scores
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6)
    : null

  return (
    <div
      className="ds-page-wrapper"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT_BODY,
        background: 'linear-gradient(160deg, #EFF6FF 0%, #F8FAFF 50%, #EBF4FF 100%)',
      }}
    >
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="ds-hero-light"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #C8E6FA 0%, #EFF8FF 50%, #DBEAFE 100%)',
          marginTop: '-5rem',
          paddingTop: '9rem',
          paddingBottom: '4.5rem',
          textAlign: 'center',
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-4rem', left: '-6rem', width: '28rem', height: '28rem', background: 'radial-gradient(circle, rgba(147,197,253,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5rem', right: '-5rem', width: '24rem', height: '24rem', background: 'radial-gradient(circle, rgba(186,230,255,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '48rem', margin: '0 auto', padding: '0 1.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.18)',
              borderRadius: '9999px',
              padding: '0.3rem 0.875rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: C_ACCENT,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <span>✦</span> AI-Powered · FEMA NRI Data
          </div>
          <h1
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 900,
              color: C_PRIMARY,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 0 1rem',
            }}
          >
            Risk Score
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
              color: C_SECONDARY,
              lineHeight: 1.65,
              margin: '0 auto 0',
              maxWidth: '34rem',
            }}
          >
            Enter any U.S. address or ZIP code to get a comprehensive disaster risk analysis powered by FEMA data and AI insights.
          </p>
        </div>
      </section>

      {/* ── Address Input ─────────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 1.25rem', maxWidth: '48rem', margin: '0 auto', width: '100%' }}>
        <div style={{ ...glassPanel, padding: '2.5rem' }}>
          <h2 style={{ fontFamily: FONT_HEADING, fontSize: '1.5rem', fontWeight: 800, color: C_PRIMARY, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Enter Your Address or ZIP Code
          </h2>
          <p style={{ color: C_SECONDARY, fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            Enter a full address or any U.S. ZIP code. We'll analyze your location against 6 major disaster risk categories.
          </p>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.125rem', pointerEvents: 'none' }}>📍</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Los Angeles, CA  or  90001"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '1rem 1rem 1rem 2.75rem',
                  fontSize: '1rem',
                  fontFamily: FONT_BODY,
                  color: C_PRIMARY,
                  background: 'var(--ds-surface)',
                  border: '1.5px solid rgba(99,150,222,0.25)',
                  borderRadius: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = C_ACCENT
                  e.target.style.boxShadow = `0 0 0 3px rgba(37,99,235,0.12)`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(99,150,222,0.25)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem', fontFamily: FONT_BODY }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !address.trim()}
              style={{
                ...pillBtn,
                opacity: loading || !address.trim() ? 0.55 : 1,
                cursor: loading || !address.trim() ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => { if (!loading && address.trim()) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={(e) => { if (!loading && address.trim()) e.currentTarget.style.opacity = '1' }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  Analyzing…
                </>
              ) : (
                <>🔍 Analyze My Risk</>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ── Risk Gauges ───────────────────────────────────────────────────── */}
      {scores && (
        <section ref={scoresRef} style={{ padding: '0 1.25rem 3rem', maxWidth: '72rem', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {/* Location confirmed */}
          <div style={{ ...glassPanel, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.5rem' }}>📍</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: C_PRIMARY, fontSize: '0.9375rem', fontFamily: FONT_BODY }}>Location Confirmed</div>
              <div style={{ color: C_SECONDARY, fontSize: '0.825rem', fontFamily: FONT_BODY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {geocodeResult?.display_name}
              </div>
            </div>
            {overallRisk != null && (
              <div
                style={{
                  background: overallRisk > 70 ? 'rgba(239,68,68,0.1)' : overallRisk > 40 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                  border: `1.5px solid ${overallRisk > 70 ? '#EF4444' : overallRisk > 40 ? '#F59E0B' : '#22C55E'}`,
                  borderRadius: '0.875rem',
                  padding: '0.5rem 1rem',
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: overallRisk > 70 ? '#EF4444' : overallRisk > 40 ? '#F59E0B' : '#22C55E', fontFamily: FONT_BODY, lineHeight: 1 }}>{overallRisk}</div>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: C_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT_BODY }}>Overall Risk</div>
              </div>
            )}
          </div>

          {/* Gauge grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {gauges.map(({ key, label, icon, score }) => (
              <RiskGauge key={key} label={label} score={score} icon={icon} animate={scoresReady} />
            ))}
          </div>

          {femaData && (
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: C_SECONDARY, fontFamily: FONT_BODY, opacity: 0.7 }}>
              ✓ Data sourced from FEMA National Risk Index · Scores represent relative risk percentiles
            </p>
          )}
          {!femaData && (
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: C_SECONDARY, fontFamily: FONT_BODY, opacity: 0.7 }}>
              ℹ️ Using region-based estimates (FEMA API unavailable due to CORS restrictions)
            </p>
          )}
        </section>
      )}

      {/* ── AI Narrative ──────────────────────────────────────────────────── */}
      {(aiLoading || aiNarrative) && (
        <section style={{ padding: '0 1.25rem 3rem', maxWidth: '56rem', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ ...glassPanel, padding: '2rem 2.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div>
                <h2 style={{ fontFamily: FONT_HEADING, fontSize: '1.3125rem', fontWeight: 800, color: C_PRIMARY, margin: 0, letterSpacing: '-0.02em' }}>
                  AI Risk Assessment
                </h2>
                <p style={{ color: C_SECONDARY, fontSize: '0.8rem', margin: 0, fontFamily: FONT_BODY }}>Powered by Gemma 3 · via OpenRouter</p>
              </div>
              {aiLoading && (
                <span style={{ marginLeft: 'auto', display: 'inline-block', animation: 'spin 0.8s linear infinite', width: 18, height: 18, border: '2px solid rgba(37,99,235,0.2)', borderTopColor: C_ACCENT, borderRadius: '50%' }} />
              )}
            </div>
            {narrativeText ? (
              <div style={{ color: C_PRIMARY, fontSize: '0.9375rem', lineHeight: 1.75, fontFamily: FONT_BODY, whiteSpace: 'pre-wrap' }}>
                {narrativeText}
                {aiLoading && <span style={{ display: 'inline-block', width: 2, height: '1em', background: C_ACCENT, marginLeft: 2, animation: 'blink 0.8s step-end infinite', verticalAlign: 'text-bottom' }} />}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', color: C_SECONDARY, fontSize: '0.875rem', fontFamily: FONT_BODY }}>
                <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', width: 14, height: 14, border: '2px solid rgba(37,99,235,0.2)', borderTopColor: C_ACCENT, borderRadius: '50%' }} />
                Generating your personalized risk analysis…
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Insurance Gap Calculator ──────────────────────────────────────── */}
      <section style={{ padding: '0 1.25rem 4rem', maxWidth: '56rem', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ ...glassPanel, padding: '2.25rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '3rem', height: '3rem', borderRadius: '0.875rem', flexShrink: 0,
                background: 'linear-gradient(135deg, #1A3558, #2563EB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
              }}
            >
              🛡️
            </div>
            <div>
              <h2 style={{ fontFamily: FONT_HEADING, fontSize: '1.5rem', fontWeight: 800, color: C_PRIMARY, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                Insurance Gap Calculator
              </h2>
              <p style={{ color: C_SECONDARY, fontSize: '0.875rem', margin: 0, fontFamily: FONT_BODY }}>
                Discover if your home is underinsured relative to its rebuild cost and local risk.
              </p>
            </div>
          </div>

          <form onSubmit={handleGapCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* Home Value */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: C_PRIMARY, marginBottom: '0.375rem', fontFamily: FONT_BODY }}>
                  Home Value
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: C_SECONDARY, fontSize: '0.9rem', fontWeight: 600, fontFamily: FONT_BODY, pointerEvents: 'none' }}>$</span>
                  <input
                    type="text"
                    value={gapInputs.homeValue}
                    onChange={(e) => setGapInputs((p) => ({ ...p, homeValue: e.target.value }))}
                    placeholder="450,000"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '0.75rem 0.875rem 0.75rem 1.75rem',
                      fontSize: '0.9375rem', fontFamily: FONT_BODY, color: C_PRIMARY,
                      background: 'var(--ds-surface)',
                      border: '1.5px solid rgba(99,150,222,0.25)',
                      borderRadius: '0.75rem', outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = C_ACCENT; e.target.style.boxShadow = `0 0 0 3px rgba(37,99,235,0.1)` }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(99,150,222,0.25)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

              {/* Current Coverage */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: C_PRIMARY, marginBottom: '0.375rem', fontFamily: FONT_BODY }}>
                  Current Dwelling Coverage
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: C_SECONDARY, fontSize: '0.9rem', fontWeight: 600, fontFamily: FONT_BODY, pointerEvents: 'none' }}>$</span>
                  <input
                    type="text"
                    value={gapInputs.coverage}
                    onChange={(e) => setGapInputs((p) => ({ ...p, coverage: e.target.value }))}
                    placeholder="300,000"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '0.75rem 0.875rem 0.75rem 1.75rem',
                      fontSize: '0.9375rem', fontFamily: FONT_BODY, color: C_PRIMARY,
                      background: 'var(--ds-surface)',
                      border: '1.5px solid rgba(99,150,222,0.25)',
                      borderRadius: '0.75rem', outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = C_ACCENT; e.target.style.boxShadow = `0 0 0 3px rgba(37,99,235,0.1)` }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(99,150,222,0.25)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Years slider */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, color: C_PRIMARY, marginBottom: '0.5rem', fontFamily: FONT_BODY }}>
                <span>Years in Home</span>
                <span style={{ color: C_ACCENT }}>{gapInputs.years} yr{gapInputs.years !== 1 ? 's' : ''}</span>
              </label>
              <input
                type="range"
                min={1} max={30} step={1}
                value={gapInputs.years}
                onChange={(e) => setGapInputs((p) => ({ ...p, years: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: C_ACCENT, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: C_SECONDARY, fontFamily: FONT_BODY, marginTop: '0.25rem' }}>
                <span>1 yr</span><span>30 yrs</span>
              </div>
            </div>

            {/* Coverage visual bar */}
            {gapInputs.homeValue && gapInputs.coverage && (
              <CoverageBar homeValue={gapInputs.homeValue} coverage={gapInputs.coverage} />
            )}

            {gapError && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem', fontFamily: FONT_BODY }}>
                ⚠️ {gapError}
              </div>
            )}

            <button
              type="submit"
              disabled={gapLoading || !gapInputs.homeValue || !gapInputs.coverage}
              style={{
                ...pillBtn,
                background: 'linear-gradient(135deg, #1A3558, #2563EB)',
                opacity: gapLoading || !gapInputs.homeValue || !gapInputs.coverage ? 0.55 : 1,
                cursor: gapLoading || !gapInputs.homeValue || !gapInputs.coverage ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => { if (!gapLoading) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={(e) => { if (!gapLoading) e.currentTarget.style.opacity = '1' }}
            >
              {gapLoading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  Calculating…
                </>
              ) : '🧮 Calculate Gap'}
            </button>
          </form>

          {/* Gap result */}
          {gapResult && (
            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.75rem',
                borderTop: '1px solid rgba(99,150,222,0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.125rem' }}>📊</span>
                <h3 style={{ fontFamily: FONT_HEADING, fontSize: '1.125rem', fontWeight: 800, color: C_PRIMARY, margin: 0, letterSpacing: '-0.01em' }}>
                  Gap Analysis Results
                </h3>
              </div>
              <div
                style={{
                  background: 'rgba(37,99,235,0.04)',
                  border: '1px solid rgba(37,99,235,0.1)',
                  borderRadius: '0.875rem',
                  padding: '1.25rem 1.5rem',
                  color: C_PRIMARY,
                  fontSize: '0.9rem',
                  lineHeight: 1.75,
                  fontFamily: FONT_BODY,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {gapResult}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CSS animations ───────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Footer />
    </div>
  )
}
