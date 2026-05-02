import { useNavigate } from 'react-router-dom'
import HavenShell, { useHavenPalette } from '../components/HavenShell'

export default function RenterPage() {
  const navigate = useNavigate()
  const palette = useHavenPalette()

  return (
    <HavenShell palette={palette} backTo="/situation">
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: '40rem', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.20em', color: palette.textMuted, marginBottom: '0.75rem' }}>RENTER PROTECTION</p>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.85rem, 4vw, 2.5rem)', fontWeight: 300, margin: '0 0 1rem', lineHeight: 1.15, letterSpacing: '-0.025em', color: palette.text }}>
            Know your rights.<br /><span style={{ fontWeight: 700 }}>Get the assistance you qualify for.</span>
          </h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', color: palette.textDim, margin: '0 auto 2rem', maxWidth: '32rem', lineHeight: 1.55 }}>
            Haven pulls your tenant rights under MA law, the rental-assistance programs you qualify for, and 4 affordable units within 2 miles — based on your address.
          </p>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'start',
            background: palette.surface, borderRadius: '1rem', padding: '1.25rem 1.5rem',
            border: `1px solid ${palette.border}`, marginBottom: '2rem',
          }}>
            {[
              { e: '🏛️', t: 'RAFT (Residential Assistance for Families in Transition)', d: 'Up to $7,000 to prevent eviction. Apply via Metro Housing Boston.' },
              { e: '⚖️', t: 'MA Tenant Protections Act', d: 'Notice rules, security deposit caps, retaliation protections.' },
              { e: '🏘️', t: 'Boston Housing Authority + Section 8', d: 'Long waitlists — apply NOW even if you don\'t need it yet.' },
              { e: '📞', t: 'Greater Boston Legal Services', d: 'Free legal aid. Call (617) 371-1234.' },
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/homeless')} style={{
              background: 'linear-gradient(135deg, #EF4444, #B91C1C)', color: '#fff', border: 'none',
              borderRadius: '9999px', padding: '0.85rem 1.75rem', fontSize: '0.95rem', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(239,68,68,0.30)',
            }}>🆘 I'm at risk of eviction →</button>
            <button onClick={() => navigate('/assessment')} style={{
              background: palette.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(12,26,46,0.06)',
              color: palette.text, border: `1px solid ${palette.borderStrong}`,
              borderRadius: '9999px', padding: '0.85rem 1.75rem', fontSize: '0.95rem', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer',
            }}>📊 Run my Haven plan</button>
          </div>
        </div>
      </main>
    </HavenShell>
  )
}
