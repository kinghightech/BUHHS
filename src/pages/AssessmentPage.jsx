import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle, { useTheme } from '../components/ThemeToggle'
import LanguagePopup from '../components/LanguagePopup'

const CustosAssessment = lazy(() => import('../CustosAssessment'))

function Loader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--ds-accent-dim)', borderTopColor: 'var(--ds-accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function AssessmentPage() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  const tx1 = isDark ? '#D0EEFF' : '#1A3558'
  const txMt = isDark ? '#4A87A8' : '#5B7FA5'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: isDark ? 'linear-gradient(160deg,#010912 0%,#020E22 100%)' : 'linear-gradient(160deg,#EFF6FF 0%,#F8FAFF 50%,#EBF4FF 100%)', transition: 'background 0.3s' }}>

      {/* BUHHS Navbar */}
      <nav style={{ padding: '1.25rem 1.5rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,150,222,0.25)', borderRadius: '0.75rem', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.2rem', fontWeight: 700, color: isDark ? '#fff' : tx1, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 }}>
            BUHHS
          </Link>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: isDark ? '#00C4FF' : '#2563EB' }}>
            📊 Risk Assessment
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <ThemeToggle theme={theme} onToggle={toggle} />
            <LanguagePopup />
            <Link to="/"
              style={{ textDecoration: 'none', fontSize: '0.8rem', color: txMt, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = tx1}
              onMouseLeave={e => e.currentTarget.style.color = txMt}
            >← Back</Link>
          </div>
        </div>
      </nav>

      {/* Assessment content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<Loader />}>
          <CustosAssessment embedded={true} />
        </Suspense>
      </div>
    </div>
  )
}
