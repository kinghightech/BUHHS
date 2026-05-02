import { useNavigate } from 'react-router-dom'
import HavenShell, { useHavenPalette } from '../components/HavenShell'

export default function BusinessPage() {
  const navigate = useNavigate()
  const palette = useHavenPalette()

  return (
    <HavenShell palette={palette} backTo="/situation">
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: '40rem', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏢</div>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.20em', color: palette.textMuted, marginBottom: '0.75rem' }}>BUSINESS CONTINUITY</p>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.85rem, 4vw, 2.5rem)', fontWeight: 300, margin: '0 0 1rem', lineHeight: 1.15, letterSpacing: '-0.025em', color: palette.text }}>
            Your block has 3 hazards.<br /><span style={{ fontWeight: 700 }}>Your insurance probably covers 1.</span>
          </h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', color: palette.textDim, margin: '0 auto 2rem', maxWidth: '32rem', lineHeight: 1.55 }}>
            Haven analyzes your property's climate exposure, your insurance coverage gap, and SBA disaster-loan eligibility — then builds a continuity plan so you re-open in days, not months.
          </p>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'start',
            background: palette.surface, borderRadius: '1rem', padding: '1.25rem 1.5rem',
            border: `1px solid ${palette.border}`, marginBottom: '2rem',
          }}>
            {[
              { e: '💼', t: 'SBA Economic Injury Disaster Loans', d: 'Up to $2M low-interest. Apply when a Boston-area disaster is declared.' },
              { e: '🏛️', t: 'Mass Growth Capital Corporation', d: 'Bridge loans + grants for small businesses in declared disaster zones.' },
              { e: '📋', t: 'Business Continuity Checklist', d: 'Documents to safeguard, vendor backups, payroll continuity plan.' },
              { e: '🛡️', t: 'Insurance Gap Analysis', d: 'Most BOP policies exclude flood + earthquake. Haven flags your gaps in dollars.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.5rem' }}>{item.e}</div>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: palette.text }}>{item.t}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', color: palette.textDim, marginTop: '0.15rem', lineHeight: 1.5 }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/assessment')} style={{
            background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none',
            borderRadius: '9999px', padding: '0.95rem 2rem', fontSize: '1rem', fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(16,185,129,0.30)',
          }}>📊 Run my business risk assessment →</button>
        </div>
      </main>
    </HavenShell>
  )
}
