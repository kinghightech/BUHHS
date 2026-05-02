import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DisclaimerBanner from '../components/DisclaimerBanner'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from '../components/Icon'

const heroGradient = 'linear-gradient(180deg, #4E96D1 0%, #6CB8EA 38%, #A8D9F5 72%, #D0ECFA 100%)'

const DISASTER_TYPES = [
  { emoji: 'flame', nameKey: 'disasterInfo.wildfire', descKey: 'disasterInfo.wildfireDesc' },
  { emoji: 'waves', nameKey: 'disasterInfo.hurricane', descKey: 'disasterInfo.hurricaneDesc' },
  { emoji: 'rain', nameKey: 'disasterInfo.riverFlood', descKey: 'disasterInfo.riverFloodDesc' },
  { emoji: 'waves', nameKey: 'disasterInfo.coastFlood', descKey: 'disasterInfo.coastFloodDesc' },
  { emoji: 'tornado', nameKey: 'disasterInfo.tornado', descKey: 'disasterInfo.tornadoDesc' },
  { emoji: 'mountain', nameKey: 'disasterInfo.earthquake', descKey: 'disasterInfo.earthquakeDesc' },
  { emoji: 'snowflake', nameKey: 'disasterInfo.winterStorm', descKey: 'disasterInfo.winterStormDesc' },
  { emoji: 'lightning', nameKey: 'disasterInfo.severeStorm', descKey: 'disasterInfo.severeStormDesc' },
]

export default function DisastersInfoPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ds-bg)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ background: heroGradient, marginTop: '-5rem', padding: '9rem 1.5rem 4.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.75rem', letterSpacing: '-0.02em', fontFamily: "'Fraunces', Georgia, serif" }}>
            {t('disasterInfo.heroTitle')}
          </h1>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: '0 0 1.25rem' }}>
            {t('disasterInfo.heroSub')}
          </p>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, margin: 0 }}>
            {t('disasterInfo.heroDesc')}
          </p>
        </div>
      </section>

      {/* ── Why This Matters ── */}
      <section style={{ padding: '3.5rem 1.5rem', maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A3558', textAlign: 'center', marginBottom: '1.75rem', fontFamily: "'Fraunces', Georgia, serif" }}>
          {t('disasterInfo.whyTitle')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: 'home', titleKey: 'disasterInfo.propDmgTitle', bodyKey: 'disasterInfo.propDmgBody' },
            { icon: 'dollar', titleKey: 'disasterInfo.finImpTitle', bodyKey: 'disasterInfo.finImpBody' },
            { icon: 'clipboard', titleKey: 'disasterInfo.prepTitle', bodyKey: 'disasterInfo.prepBody' },
          ].map(card => (
            <div
              key={card.titleKey}
              style={{
                background: 'rgba(250,252,255,0.92)',
                border: '1px solid rgba(99,150,222,0.22)',
                borderRadius: '1.25rem',
                padding: '1.75rem',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 24px rgba(99,150,222,0.10)',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}><Icon name={card.icon} size={32} /></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A3558', margin: '0 0 0.5rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{t(card.titleKey)}</h3>
              <p style={{ fontSize: '0.875rem', color: '#3D5A80', lineHeight: 1.6, margin: 0 }}>{t(card.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key Statistics ── */}
      <section style={{ background: 'rgba(238,245,255,0.6)', padding: '3.5rem 1.5rem', width: '100%' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A3558', textAlign: 'center', marginBottom: '1.75rem', fontFamily: "'Fraunces', Georgia, serif" }}>
            {t('disasterInfo.statsTitle')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { value: '7,000+', labelKey: 'disasterInfo.stat1Label' },
              { value: '$65B', labelKey: 'disasterInfo.stat2Label' },
              { value: '40%', labelKey: 'disasterInfo.stat3Label' },
              { value: '30sec', labelKey: 'disasterInfo.stat4Label' },
            ].map(s => (
              <div key={s.labelKey}>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#4E96D1', fontFamily: "'Fraunces', Georgia, serif" }}>{s.value}</div>
                <div style={{ fontSize: '0.82rem', color: '#3D5A80', marginTop: '0.35rem', fontWeight: 500 }}>{t(s.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disaster Types Grid ── */}
      <section style={{ padding: '3.5rem 1.5rem', maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A3558', textAlign: 'center', marginBottom: '1.75rem', fontFamily: "'Fraunces', Georgia, serif" }}>
          {t('disasterInfo.typesTitle')}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
          }}
          className="ds-disaster-grid"
        >
          {DISASTER_TYPES.map(d => (
            <div
              key={d.nameKey}
              style={{
                background: 'rgba(250,252,255,0.92)',
                border: '1px solid rgba(99,150,222,0.22)',
                borderRadius: '1.25rem',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 24px rgba(99,150,222,0.08)',
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}><Icon name={d.emoji} size={32} /></div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A3558', marginBottom: '0.25rem' }}>{t(d.nameKey)}</div>
              <div style={{ fontSize: '0.75rem', color: '#3D5A80', lineHeight: 1.5 }}>{t(d.descKey)}</div>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 640px) {
            .ds-disaster-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '2rem 1.5rem 3.5rem', maxWidth: '44rem', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <DisclaimerBanner type="disaster" position="top" />
        <button
          onClick={() => navigate('/disasters/assessment')}
          style={{
            background: '#0C1A2E',
            color: '#fff',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.9rem 2rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          {t('disasterInfo.cta')} <Icon name="arrowRight" size={16} />
        </button>
        <p style={{ fontSize: '0.82rem', color: 'var(--ds-text-muted)', marginTop: '0.875rem' }}>
          {t('disasterInfo.ctaSub')}
        </p>
      </section>

      <Footer />
    </div>
  )
}
