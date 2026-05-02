import { Link } from 'react-router-dom'
import ShieldLogo from './ShieldLogo'
import { useLanguage } from '../i18n/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer
      style={{
        background: 'rgba(250, 252, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(99, 150, 222, 0.18)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '2.5rem 1.25rem 1.5rem',
        }}
      >
        {/* Three-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldLogo size={28} />
              <span
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--ds-text-primary)',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                Custos
              </span>
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--ds-text-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t('footer.brandSub')}
            </p>
          </div>

          {/* Links column */}
          <div>
            <h3
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--ds-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                marginBottom: '0.75rem',
              }}
            >
              {t('footer.tools')}
            </h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { labelKey: 'nav.disasters', to: '/disasters' },
                { labelKey: 'nav.imageAnalysis', to: '/claims' },
              ].map(({ labelKey, to }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--ds-text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-text-secondary)')}
                >
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Disclaimer column */}
          <div>
            <h3
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--ds-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                marginBottom: '0.75rem',
              }}
            >
              {t('footer.disclaimer')}
            </h3>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--ds-text-muted)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t('footer.disclaimerText')}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--ds-border)',
            paddingTop: '1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--ds-text-muted)',
          }}
        >
          © 2026 Custos. All rights reserved. Educational use only.
        </div>
      </div>
    </footer>
  )
}
