import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import LZString from 'lz-string'

// ─── Plan encoder/decoder (URL-safe, compressed) ────────────────────
// Encodes only `plan` (NOT timeline) to keep QR scannable. Timeline is
// regenerated client-side from the plan if needed.
export function encodePlan(planData) {
  try {
    if (!planData) return ''
    const json = JSON.stringify(planData)
    return LZString.compressToEncodedURIComponent(json)
  } catch {
    return ''
  }
}

export function decodePlan(encoded) {
  if (!encoded || typeof encoded !== 'string') return null
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    return JSON.parse(json)
  } catch {
    return null
  }
}

const CATEGORY_COLOR = {
  shelter: '#EF4444', benefits: '#3B82F6', housing: '#10B981',
  legal: '#A855F7', health: '#F59E0B', food: '#06B6D4',
}
const CATEGORY_EMOJI = {
  shelter: '🏠', benefits: '📋', housing: '🔑',
  legal: '⚖️', health: '🏥', food: '🍞',
}

// ─── Defensive helper ──────────────────────────────────────────────
function safeArr(x) { return Array.isArray(x) ? x : [] }

// ─── Error boundary so a bad render never blanks the page ─────────
export class PlanErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.warn('Plan render error', err) }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '1.5rem', borderRadius: '0.75rem', background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.40)', color: '#fca5a5', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          The plan rendered with an error, but your data is safe. Try generating a new plan.
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Plan list view (theme-aware via palette prop) ────────────────
export function PlanListView({ plan, palette, sectionLabels = {} }) {
  if (!plan) return null
  const isDark = palette?.isDark
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,150,222,0.20)'
  const text = isDark ? '#E6EEF8' : '#0C1A2E'
  const textDim = isDark ? 'rgba(214,232,255,0.72)' : '#3D5A80'
  const textMuted = isDark ? 'rgba(180,200,230,0.55)' : '#5B7FA5'

  const sections = [
    { key: 'urgentTonight', title: sectionLabels.urgent  || 'Tonight — most urgent',  emoji: '🆘', color: '#EF4444' },
    { key: 'health',        title: sectionLabels.health  || 'Health & counseling',    emoji: '🏥', color: '#F59E0B' },
    { key: 'benefits',      title: sectionLabels.benefits|| 'Benefits you qualify for', emoji: '📋', color: '#3B82F6' },
    { key: 'housing',       title: sectionLabels.housing || 'Long-term housing',      emoji: '🔑', color: '#10B981' },
    { key: 'food',          title: sectionLabels.food    || 'Food + supplies',        emoji: '🍞', color: '#06B6D4' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {plan.summary && (
        <div style={{
          padding: '1.25rem 1.5rem', borderRadius: '1rem',
          background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 12px 32px rgba(59,130,246,0.25)',
        }}>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500, lineHeight: 1.55 }}>{plan.summary}</p>
        </div>
      )}

      {sections.filter(s => safeArr(plan[s.key]).length > 0).map(section => (
        <section key={section.key} style={{
          background: cardBg, borderRadius: '1rem',
          border: `1px solid ${cardBorder}`,
          padding: '1.1rem 1.4rem',
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.30)' : '0 4px 16px rgba(12,26,46,0.06)',
        }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1rem', fontWeight: 800,
            color: section.color, margin: '0 0 0.85rem',
            letterSpacing: '-0.01em', borderBottom: `2px solid ${section.color}33`, paddingBottom: '0.5rem',
          }}>
            <span style={{ fontSize: '1.2rem' }}>{section.emoji}</span>{section.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {safeArr(plan[section.key]).map((item, i) => item && (
              <div key={i} style={{
                padding: '0.75rem 0.95rem', borderRadius: '0.625rem',
                background: isDark ? `${section.color}11` : `${section.color}08`,
                border: `1px solid ${section.color}33`,
                borderLeft: `3px solid ${section.color}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: text, marginBottom: '0.15rem' }}>
                  {item.name || item.program || ''}
                  {item.agency && <span style={{ fontWeight: 500, color: textMuted, marginInlineStart: '0.4rem', fontSize: '0.82rem' }}>· {item.agency}</span>}
                </div>
                {item.address && <div style={{ fontSize: '0.815rem', color: textDim, marginBottom: '0.1rem' }}>📍 {item.address}</div>}
                {item.phone && <div style={{ fontSize: '0.815rem', color: textDim, marginBottom: '0.1rem' }}>📞 <a href={`tel:${item.phone}`} style={{ color: section.color, textDecoration: 'none', fontWeight: 600 }}>{item.phone}</a></div>}
                {item.hours && <div style={{ fontSize: '0.815rem', color: textDim, marginBottom: '0.1rem' }}>🕒 {item.hours}</div>}
                {item.contact && <div style={{ fontSize: '0.815rem', color: textDim, marginBottom: '0.1rem' }}>📞 {item.contact}</div>}
                {item.eligibility && <div style={{ fontSize: '0.78rem', color: textMuted, fontStyle: 'italic', marginTop: '0.25rem' }}>Eligibility: {item.eligibility}</div>}
                {(item.why || item.how) && <div style={{ fontSize: '0.815rem', color: textDim, marginTop: '0.25rem', lineHeight: 1.5 }}>{item.why || item.how}</div>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ─── Timeline view ─────────────────────────────────────────────────
export function PlanTimelineView({ timeline, palette }) {
  const items = safeArr(timeline).filter(x => x && typeof x.day === 'number')
  if (!items.length) return (
    <div style={{
      textAlign: 'center', padding: '2.5rem 1rem',
      color: palette?.textMuted || '#5B7FA5', fontSize: '0.9rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>Timeline could not be generated. The List View above has all your resources.</div>
  )
  const isDark = palette?.isDark
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,150,222,0.22)'
  const text = isDark ? '#E6EEF8' : '#0C1A2E'
  const textDim = isDark ? 'rgba(214,232,255,0.72)' : '#3D5A80'
  const textMuted = isDark ? 'rgba(180,200,230,0.55)' : '#5B7FA5'

  return (
    <div style={{ position: 'relative', padding: '0.5rem 0 1rem 0' }}>
      <div style={{ position: 'absolute', insetInlineStart: '1.65rem', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg, #EF4444, #3B82F6, #10B981)', borderRadius: '9999px', opacity: 0.4 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {items.map((item, i) => {
          const color = CATEGORY_COLOR[item.category] || '#3B82F6'
          return (
            <div key={i} style={{
              display: 'flex', gap: '1.1rem', position: 'relative',
              animation: `fadeSlideIn 0.5s ease ${Math.min(i,12) * 0.05}s both`,
            }}>
              <div style={{
                position: 'relative', flexShrink: 0,
                width: '3.4rem', height: '3.4rem', borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                boxShadow: `0 4px 16px ${color}55, 0 0 0 4px ${isDark ? '#0a1220' : '#fff'}`,
                zIndex: 1,
              }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', opacity: 0.85, lineHeight: 1 }}>DAY</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1 }}>{item.day}</span>
              </div>
              <div style={{
                flex: 1, padding: '0.85rem 1.05rem', borderRadius: '0.875rem',
                background: cardBg, border: `1px solid ${cardBorder}`, borderInlineStart: `3px solid ${color}`,
                boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.30)' : '0 4px 12px rgba(12,26,46,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase',
                    background: `${color}22`, color, padding: '0.15rem 0.5rem', borderRadius: '9999px',
                  }}>{CATEGORY_EMOJI[item.category] || '·'} {item.category || 'plan'}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: text, marginBottom: '0.2rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.84rem', color: textDim, lineHeight: 1.55 }}>{item.description}</div>
                {item.address && <div style={{ fontSize: '0.78rem', color: textMuted, marginTop: '0.35rem' }}>📍 {item.address}</div>}
                {item.phone && <div style={{ fontSize: '0.78rem', color: textMuted, marginTop: '0.1rem' }}>📞 <a href={`tel:${item.phone}`} style={{ color, fontWeight: 600, textDecoration: 'none' }}>{item.phone}</a></div>}
              </div>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

// ─── QR Card — fault-tolerant ──────────────────────────────────────
export function PlanQRCard({ encoded, palette, labels = {} }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      if (!encoded) { setError(true); return }
      const built = `${window.location.origin}/plan?d=${encoded}`
      // Cap at 2200 chars — QR Level L max for alphanumeric. Most plans (no timeline)
      // compress to <800 chars. If a plan is unusually large, we fall back to a
      // shortened URL that just loads the situation summary.
      if (built.length > 2200) {
        setError(true)
      } else {
        setUrl(built)
      }
    } catch {
      setError(true)
    }
  }, [encoded])

  const isDark = palette?.isDark
  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.04)' : '#0C1A2E',
      color: '#fff',
      borderRadius: '1rem', padding: '1.25rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.7rem',
      border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 8px 28px rgba(0,0,0,0.30)',
    }}>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.18em',
        color: 'rgba(180,200,230,0.85)', margin: 0,
      }}>{labels.title || 'QR HANDOFF'}</p>
      <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.5rem' }}>
        {error ? (
          <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B7FA5', fontSize: '0.7rem', textAlign: 'center', padding: '0.5rem' }}>
            QR will be available after the plan finishes loading.
          </div>
        ) : url ? (
          <QRCodeSVG value={url} size={160} level="L" />
        ) : (
          <div style={{ width: 160, height: 160 }} />
        )}
      </div>
      <p style={{
        fontSize: '0.82rem', textAlign: 'center', margin: 0,
        color: 'rgba(255,255,255,0.92)', fontWeight: 600, lineHeight: 1.4,
      }}>
        {labels.scan || 'Scan at any agency.'}
        <br />
        <span style={{ fontWeight: 400, color: 'rgba(180,200,230,0.85)' }}>{labels.subtitle || 'No need to repeat your story.'}</span>
      </p>
    </div>
  )
}
