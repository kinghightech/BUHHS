import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'

// BuhhsCast onboarding flow (TSX — Vite handles types automatically)
const Onboarding = lazy(() => import('./business/Onboarding').then(m => ({ default: m.Onboarding })))

export default function BusinessPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Floating "Back to Haven" badge — overlays the buhhscast experience without
          disrupting its full-bleed dark navy aesthetic */}
      <Link
        to="/situation"
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 9999,
          textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: '9999px', padding: '0.45rem 0.95rem',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '0.78rem', fontWeight: 600,
          fontFamily: "'Geist', 'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 8px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)',
          transition: 'all 0.18s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
      >
        ← Haven
      </Link>

      <Suspense fallback={
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(155deg, #060b1b 0%, #08112c 38%, #05060a 100%)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.10)', borderTopColor: '#fff',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      }>
        <Onboarding />
      </Suspense>
    </div>
  )
}
