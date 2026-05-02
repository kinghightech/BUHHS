import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle, { useTheme } from '../components/ThemeToggle'
import LanguagePopup from '../components/LanguagePopup'

// ─────────────────────────────────────────────
// Boston neighborhoods you can intervene in
// ─────────────────────────────────────────────
const HOODS = [
  { id: 'chinatown',   name: 'Chinatown',    baseTemp: 96, baseER: 142, color: '#DC2626', emoji: '🌡️', desc: 'Hottest neighborhood. Lowest tree canopy in core Boston.' },
  { id: 'eastboston',  name: 'East Boston',  baseTemp: 88, baseER:  78, color: '#1D4ED8', emoji: '🌊', desc: 'Floods first. Logan exhaust + sea-level rise.' },
  { id: 'roxbury',     name: 'Roxbury',      baseTemp: 92, baseER: 118, color: '#D97706', emoji: '💨', desc: 'Highway-adjacent. Highest asthma rate.' },
  { id: 'mattapan',    name: 'Mattapan',     baseTemp: 93, baseER: 104, color: '#059669', emoji: '🌳', desc: 'Lowest tree canopy per capita in Boston.' },
  { id: 'dorchester',  name: 'Dorchester',   baseTemp: 90, baseER:  88, color: '#7C3AED', emoji: '🏘️', desc: 'Aging triple-decker housing stock.' },
]

// ─────────────────────────────────────────────
// Animated counter (smooth ease-out)
// ─────────────────────────────────────────────
function useAnimatedNumber(target, durationMs = 450) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const startRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    fromRef.current = value
    startRef.current = performance.now()
    cancelAnimationFrame(rafRef.current)
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = fromRef.current + (target - fromRef.current) * eased
      setValue(v)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return value
}

function Counter({ value, format = (v) => Math.round(v).toLocaleString(), color, label, suffix = '' }) {
  const v = useAnimatedNumber(value)
  return (
    <div>
      <div style={{
        fontFamily: "'Fraunces', serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900,
        color, lineHeight: 1, letterSpacing: '-0.025em',
        fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'baseline', gap: '0.25rem',
      }}>
        {format(v)}
        {suffix && <span style={{ fontSize: '0.55em', fontWeight: 700, color: 'inherit' }}>{suffix}</span>}
      </div>
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem',
        fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
        marginTop: '0.4rem', color: 'rgba(0,0,0,0.55)',
      }}>{label}</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function InterventionPage() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  const [hoodId, setHoodId] = useState('chinatown')
  const [trees, setTrees] = useState(0)
  const [whiteRoofs, setWhiteRoofs] = useState(0)
  const [coolingCenters, setCoolingCenters] = useState(0)

  const hood = HOODS.find(h => h.id === hoodId) || HOODS[0]

  // ── Demo formulas (per brief) ──
  const tempDropF       = trees * 0.04 + whiteRoofs * 0.006 + coolingCenters * 0.02
  const erVisitsAvoided = Math.round(trees * 0.012 + whiteRoofs * 0.004 + coolingCenters * 0.85)
  const dollarsSaved    = Math.round(trees * 387 + whiteRoofs * 92 + coolingCenters * 24500)
  const livesSaved      = Math.round((trees * 0.0014) + (coolingCenters * 0.18))

  const projectedTemp = Math.max(75, hood.baseTemp - tempDropF)
  const erRemaining = Math.max(0, hood.baseER - erVisitsAvoided)

  const tx1 = isDark ? '#fff' : '#0C1A2E'
  const tx2 = isDark ? 'rgba(214,232,255,0.78)' : '#3D5A80'
  const txMt = isDark ? 'rgba(214,232,255,0.55)' : '#5B7FA5'
  const N = isDark ? '#7CB9FF' : '#2563EB'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: isDark
        ? 'radial-gradient(ellipse at 70% 0%, rgba(75,150,243,0.10) 0%, transparent 55%), linear-gradient(180deg,#050B18 0%,#0E2040 100%)'
        : 'radial-gradient(ellipse at 70% 0%, rgba(96,165,250,0.18) 0%, transparent 55%), linear-gradient(180deg,#EFF6FF 0%,#D0ECFA 100%)',
      transition: 'background 0.3s',
    }}>
      {/* ── Navbar ── */}
      <nav style={{ padding: '1.25rem 1.5rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          background: isDark ? 'rgba(8,18,38,0.65)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: isDark ? '1px solid rgba(99,150,222,0.18)' : '1px solid rgba(99,150,222,0.25)',
          borderRadius: '0.875rem', padding: '0.6rem 1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          boxShadow: '0 8px 32px rgba(12,26,46,0.10)',
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🌊</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: tx1, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Beacon</span>
          </Link>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: hood.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            🌳 Intervention ROI · {hood.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle theme={theme} onToggle={toggle} />
            <LanguagePopup />
            <Link to="/" style={{ fontSize: '0.8rem', color: txMt, textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header style={{ padding: '2.5rem 1.5rem 1rem', maxWidth: '64rem', width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.18em', color: txMt, margin: '0 0 0.5rem' }}>
          THE WOW MOMENT · DRAG A SLIDER
        </p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: tx1, margin: '0 0 0.75rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          Plant trees in {hood.name}.<br />
          <span style={{ color: hood.color }}>Watch the temperature drop.</span>
        </h1>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', color: tx2, margin: '0 auto', lineHeight: 1.6, maxWidth: '40rem' }}>
          What you can measure, you can hack. Drag a slider — see the live ROI of every tree, white roof, and cooling center.
        </p>
      </header>

      {/* ── Neighborhood selector ── */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0 1.5rem' }}>
        {HOODS.map(h => (
          <button key={h.id} onClick={() => setHoodId(h.id)} style={{
            background: h.id === hoodId ? h.color : (isDark ? 'rgba(22,32,56,0.75)' : 'rgba(255,255,255,0.85)'),
            color: h.id === hoodId ? '#fff' : tx1,
            border: h.id === hoodId ? `1px solid ${h.color}` : (isDark ? '1px solid rgba(99,150,222,0.20)' : '1px solid rgba(99,150,222,0.25)'),
            borderRadius: '9999px', padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer',
            transition: 'all 0.18s', whiteSpace: 'nowrap',
            boxShadow: h.id === hoodId ? `0 6px 20px ${h.color}55` : 'none',
          }}>
            {h.emoji} {h.name}
          </button>
        ))}
      </div>

      {/* ── Main panel ── */}
      <main style={{ flex: 1, padding: '2rem 1.5rem 3rem', maxWidth: '72rem', width: '100%', margin: '0 auto' }}>

        {/* HERO COUNTERS — the WOW MOMENT */}
        <section style={{
          background: isDark ? 'rgba(22,32,56,0.70)' : 'rgba(255,255,255,0.92)',
          border: isDark ? '1px solid rgba(99,150,222,0.20)' : '1px solid rgba(99,150,222,0.25)',
          borderRadius: '1.5rem', padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.40)' : '0 12px 40px rgba(37,99,235,0.12)',
          backdropFilter: 'blur(8px)',
          marginBottom: '1.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Color accent border */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${hood.color}, ${hood.color}88)` }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
            <Counter
              value={projectedTemp}
              format={(v) => v.toFixed(1)}
              suffix="°F"
              color={tempDropF > 0.5 ? '#059669' : hood.color}
              label="Projected peak temp" />
            <Counter
              value={erVisitsAvoided}
              color="#059669"
              label="ER visits avoided / yr" />
            <Counter
              value={dollarsSaved}
              format={(v) => '$' + Math.round(v).toLocaleString()}
              color="#0C1A2E"
              label="Dollars saved / yr" />
            <Counter
              value={livesSaved}
              color="#DC2626"
              label="Lives saved / decade" />
          </div>

          <div style={{
            marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem',
            background: isDark ? 'rgba(75,150,243,0.10)' : 'rgba(37,99,235,0.06)',
            border: isDark ? '1px solid rgba(75,150,243,0.20)' : '1px solid rgba(37,99,235,0.15)',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem',
            color: tx2, lineHeight: 1.55,
          }}>
            <strong style={{ color: tx1 }}>{hood.name}:</strong> {hood.desc} Today's baseline:
            <strong style={{ color: hood.color }}> {hood.baseTemp}°F peak</strong>,
            <strong style={{ color: hood.color }}> {hood.baseER} ER visits</strong> per heat-wave year.
          </div>
        </section>

        {/* SLIDERS */}
        <section style={{
          background: isDark ? 'rgba(22,32,56,0.65)' : 'rgba(255,255,255,0.88)',
          border: isDark ? '1px solid rgba(99,150,222,0.20)' : '1px solid rgba(99,150,222,0.25)',
          borderRadius: '1.5rem', padding: 'clamp(1.5rem, 3vw, 2rem)',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.30)' : '0 8px 32px rgba(37,99,235,0.10)',
        }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.3rem', fontWeight: 800, color: tx1, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>
            Choose your interventions
          </h2>

          <SliderRow
            isDark={isDark}
            label="🌳 Trees planted"
            sublabel="$1.20 cost per shade-degree-day · 0.04°F drop per 100 trees"
            value={trees} setValue={setTrees}
            min={0} max={500} step={5}
            color="#059669"
            displayValue={`${trees} trees`}
            tx1={tx1} tx2={tx2}
          />
          <SliderRow
            isDark={isDark}
            label="🏠 White / cool roofs retrofit"
            sublabel="DOE: ~1.5°F surface temp drop per 10% albedo · ~$92 saved per roof annually"
            value={whiteRoofs} setValue={setWhiteRoofs}
            min={0} max={2000} step={25}
            color="#2563EB"
            displayValue={`${whiteRoofs.toLocaleString()} roofs`}
            tx1={tx1} tx2={tx2}
          />
          <SliderRow
            isDark={isDark}
            label="🏥 New cooling centers"
            sublabel="EPA: each averts ~0.85 ER visits/year per facility · $24.5K avg ROI"
            value={coolingCenters} setValue={setCoolingCenters}
            min={0} max={20} step={1}
            color="#DC2626"
            displayValue={`${coolingCenters} centers`}
            tx1={tx1} tx2={tx2}
          />

          {/* Quick presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: txMt, alignSelf: 'center', marginRight: '0.5rem' }}>QUICK</span>
            <button onClick={() => { setTrees(0); setWhiteRoofs(0); setCoolingCenters(0) }}
              style={presetBtnStyle(isDark, tx1)}>Reset</button>
            <button onClick={() => { setTrees(200); setWhiteRoofs(0); setCoolingCenters(0) }}
              style={presetBtnStyle(isDark, tx1)}>🌳 Plant 200 trees</button>
            <button onClick={() => { setTrees(0); setWhiteRoofs(500); setCoolingCenters(0) }}
              style={presetBtnStyle(isDark, tx1)}>🏠 Retrofit 500 roofs</button>
            <button onClick={() => { setTrees(0); setWhiteRoofs(0); setCoolingCenters(3) }}
              style={presetBtnStyle(isDark, tx1)}>🏥 Add 3 centers</button>
            <button onClick={() => { setTrees(500); setWhiteRoofs(2000); setCoolingCenters(20) }}
              style={{ ...presetBtnStyle(isDark, tx1), background: '#0C1A2E', color: '#fff', border: '1px solid #0C1A2E' }}>🌟 Max-out plan</button>
          </div>
        </section>

        {/* SOURCES / PITCH */}
        <section style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem',
          background: isDark ? 'rgba(22,32,56,0.40)' : 'rgba(255,255,255,0.55)',
          border: isDark ? '1px solid rgba(99,150,222,0.15)' : '1px solid rgba(99,150,222,0.18)',
          borderRadius: '1rem', textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', color: txMt, lineHeight: 1.6,
        }}>
          Coefficients based on MIT Urban Climate Lab tree-cooling effects, DOE Cool Roof program data, and EPA heat-mortality cost models.
          Numbers are demo estimates — for educational use at <strong style={{ color: tx1 }}>BUHHS 2026</strong>.
        </section>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────
// SliderRow — full-width, accessible, animated
// ─────────────────────────────────────────────
function presetBtnStyle(isDark, tx1) {
  return {
    background: isDark ? 'rgba(75,150,243,0.10)' : 'rgba(37,99,235,0.07)',
    color: tx1,
    border: isDark ? '1px solid rgba(75,150,243,0.25)' : '1px solid rgba(37,99,235,0.20)',
    borderRadius: '9999px', padding: '0.4rem 0.85rem',
    fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'pointer', transition: 'all 0.15s',
  }
}

function SliderRow({ label, sublabel, value, setValue, min, max, step, color, displayValue, tx1, tx2, isDark }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: tx1 }}>{label}</span>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.3rem', fontWeight: 800, color, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{displayValue}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(Number(e.target.value))}
        style={{
          width: '100%', height: '8px', borderRadius: '9999px', appearance: 'none',
          background: `linear-gradient(90deg, ${color} 0%, ${color} ${pct}%, ${isDark ? 'rgba(99,150,222,0.15)' : 'rgba(37,99,235,0.12)'} ${pct}%, ${isDark ? 'rgba(99,150,222,0.15)' : 'rgba(37,99,235,0.12)'} 100%)`,
          outline: 'none', cursor: 'pointer',
        }}
        className="beacon-slider"
      />
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.72rem', color: tx2, margin: '0.5rem 0 0', lineHeight: 1.5 }}>{sublabel}</p>
      <style>{`
        .beacon-slider::-webkit-slider-thumb {
          appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: white; border: 3px solid ${color};
          box-shadow: 0 4px 12px rgba(0,0,0,0.25); cursor: grab;
          transition: transform 0.1s;
        }
        .beacon-slider::-webkit-slider-thumb:active { transform: scale(1.15); cursor: grabbing; }
        .beacon-slider::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 50%;
          background: white; border: 3px solid ${color};
          box-shadow: 0 4px 12px rgba(0,0,0,0.25); cursor: grab;
        }
      `}</style>
    </div>
  )
}
