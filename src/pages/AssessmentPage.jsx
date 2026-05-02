import { lazy, Suspense } from 'react'
import HavenShell, { useHavenPalette } from '../components/HavenShell'

const CustosAssessment = lazy(() => import('../CustosAssessment'))

const BOSTON_ZIPS = [
  { zip: '02111', name: 'Chinatown' },
  { zip: '02128', name: 'East Boston' },
  { zip: '02119', name: 'Roxbury' },
  { zip: '02125', name: 'Dorchester' },
  { zip: '02126', name: 'Mattapan' },
]

function copyZip(zip) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(zip).catch(() => {})
}

export default function AssessmentPage() {
  const palette = useHavenPalette()

  return (
    <HavenShell palette={palette} backTo="/situation" current="📊 Risk Assessment">
      {/* Boston ZIP quick-pick chips */}
      <div style={{ maxWidth: '72rem', width: '100%', margin: '1.25rem auto 0', padding: '0 1.5rem' }}>
        <div style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: '0.875rem', padding: '0.85rem 1.1rem',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700,
            color: palette.text, marginInlineEnd: '0.4rem',
          }}>🏙️ Try a Boston neighborhood:</span>
          {BOSTON_ZIPS.map(b => (
            <button key={b.zip}
              onClick={() => copyZip(b.zip)}
              title={`Click to copy ${b.zip}`}
              style={{
                background: palette.isDark ? 'rgba(124,185,255,0.10)' : '#fff',
                border: `1px solid ${palette.borderStrong}`,
                borderRadius: '9999px', padding: '0.32rem 0.75rem',
                fontSize: '0.74rem', fontWeight: 700,
                color: palette.text, fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = palette.accent; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = palette.isDark ? 'rgba(124,185,255,0.10)' : '#fff'; e.currentTarget.style.color = palette.text }}
            >
              <strong style={{ fontFamily: 'inherit' }}>{b.zip}</strong>
              <span style={{ opacity: 0.75, fontWeight: 500 }}>· {b.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${palette.border}`, borderTopColor: palette.accent, animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        }>
          <CustosAssessment embedded={true} />
        </Suspense>
      </div>
    </HavenShell>
  )
}
