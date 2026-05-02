import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import HavenShell, { useHavenPalette } from '../components/HavenShell'
import { decodePlan, PlanListView, PlanTimelineView, PlanErrorBoundary } from '../components/BeaconPlan'
import { useLanguage } from '../i18n/LanguageContext'
import { makeT } from '../i18n/havenStrings'
import { generateTimeline } from '../utils/beaconAI'

export default function PlanReadOnlyPage() {
  const [params] = useSearchParams()
  const palette = useHavenPalette()
  const { lang, dir } = useLanguage()
  const t = makeT(lang)

  const encoded = params.get('d')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [view, setView] = useState('timeline')
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    const decoded = decodePlan(encoded)
    if (!decoded) setError('Could not load this plan. The link may be incomplete.')
    else {
      setData(decoded)
      // Regenerate timeline on receiving end (it's not in the encoded payload to keep QR small)
      if (decoded.plan && decoded.situation) {
        generateTimeline(decoded.plan, decoded.situation).then(setTimeline).catch(() => {})
      }
    }
  }, [encoded])

  if (error) {
    return (
      <HavenShell palette={palette} backTo="/">
        <main style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ color: '#F87171', fontWeight: 700, marginBottom: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Plan not found</h1>
          <p style={{ color: palette.textDim, marginBottom: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{error}</p>
          <Link to="/" style={{ color: palette.accent, textDecoration: 'underline', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Home</Link>
        </main>
      </HavenShell>
    )
  }

  if (!data) {
    return (
      <HavenShell palette={palette} backTo="/">
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${palette.border}`, borderTopColor: palette.accent, animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </main>
      </HavenShell>
    )
  }

  const { plan, situation } = data
  return (
    <div dir={dir}>
      <HavenShell palette={palette} backTo="/situation">
        <div className="no-print" style={{
          background: 'linear-gradient(90deg,#0C1A2E,#1E3A8A)', color: '#fff',
          padding: '0.7rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          ✅ Plan loaded from QR code — agency mode. The client doesn't have to retell their story.
        </div>

        <main style={{ maxWidth: '54rem', margin: '0 auto', padding: '2rem 1.5rem 4rem', width: '100%' }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.18em', color: palette.accent, margin: '0 0 0.5rem' }}>RECEIVED PLAN</p>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.02em', color: palette.text }}>{t('homeless.your_plan')}</h1>
          {situation && <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: palette.textMuted, margin: '0 0 1.5rem', fontStyle: 'italic' }}>"{situation.length > 200 ? situation.slice(0, 200) + '…' : situation}"</p>}

          <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.4rem', background: palette.surface, borderRadius: '0.75rem', border: `1px solid ${palette.border}`, width: 'fit-content' }}>
            {['timeline', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  background: view === v ? (palette.isDark ? '#fff' : '#0C1A2E') : 'transparent',
                  color: view === v ? (palette.isDark ? '#0C1A2E' : '#fff') : palette.textMuted,
                  border: 'none', borderRadius: '9999px',
                  padding: '0.42rem 0.95rem', fontSize: '0.78rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textTransform: 'capitalize',
                }}>{v === 'timeline' ? '📅 Timeline' : '📋 List'} View</button>
            ))}
            <button onClick={() => window.print()} style={{ background: palette.accent, color: '#fff', border: 'none', borderRadius: '9999px', padding: '0.42rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🖨 Print</button>
          </div>

          <PlanErrorBoundary>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {view === 'timeline' && timeline.length > 0
                ? <PlanTimelineView timeline={timeline} palette={palette} />
                : <PlanListView plan={plan} palette={palette} sectionLabels={{
                    urgent: t('plan.section.urgent'),
                    health: t('plan.section.health'),
                    benefits: t('plan.section.benefits'),
                    housing: t('plan.section.housing'),
                    food: t('plan.section.food'),
                  }} />}
            </div>
          </PlanErrorBoundary>
        </main>
      </HavenShell>

      <style>{`@media print { .no-print { display: none !important } body { background: #fff !important } }`}</style>
    </div>
  )
}
