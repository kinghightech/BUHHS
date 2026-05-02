import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HavenShell, { useHavenPalette } from '../components/HavenShell'
import { useLanguage } from '../i18n/LanguageContext'
import { makeT } from '../i18n/havenStrings'

const OPTIONS = [
  { id: 'homeowner', emoji: '🏠', accent: '#3B82F6', glow: 'rgba(59,130,246,0.30)',  to: '/assessment', titleKey: 'situation.homeowner.title', descKey: 'situation.homeowner.desc' },
  { id: 'renter',    emoji: '🔑', accent: '#A855F7', glow: 'rgba(168,85,247,0.30)',  to: '/renter',     titleKey: 'situation.renter.title',    descKey: 'situation.renter.desc' },
  { id: 'business',  emoji: '🏢', accent: '#10B981', glow: 'rgba(16,185,129,0.30)',  to: '/business',   titleKey: 'situation.business.title',  descKey: 'situation.business.desc' },
  { id: 'homeless',  emoji: '🕊️', accent: '#F87171', glow: 'rgba(248,113,113,0.45)', to: '/homeless',   titleKey: 'situation.homeless.title',  descKey: 'situation.homeless.desc', primary: true },
  { id: 'train',     emoji: '🎮', accent: '#F59E0B', glow: 'rgba(245,158,11,0.30)',  to: '/quizzes',    titleKey: 'situation.train.title',     descKey: 'situation.train.desc' },
  { id: 'evacuate',  emoji: '🚗', accent: '#06B6D4', glow: 'rgba(6,182,212,0.30)',   to: '/evacuation', titleKey: 'situation.evacuate.title',  descKey: 'situation.evacuate.desc' },
]

export default function SituationPage() {
  const navigate = useNavigate()
  const palette = useHavenPalette()
  const { lang, dir } = useLanguage()
  const t = makeT(lang)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  return (
    <div dir={dir}>
      <HavenShell palette={palette} backTo="/">
        <main style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '3rem 1.5rem 4rem', textAlign: 'center',
        }}>
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            maxWidth: '64rem', width: '100%',
          }}>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.20em',
              color: palette.textMuted, marginBottom: '1.25rem',
            }}>{t('situation.eyebrow')}</p>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300,
              margin: '0 0 1rem', lineHeight: 1.1, letterSpacing: '-0.03em',
              color: palette.text,
            }}>{t('situation.h1')}</h1>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.05rem', color: palette.textDim,
              margin: '0 auto 3rem', maxWidth: '34rem', lineHeight: 1.6, fontWeight: 400,
            }}>{t('situation.sub')}</p>

            {/* 4-card grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem', maxWidth: '62rem', margin: '0 auto',
            }}>
              {OPTIONS.map((opt, i) => (
                <button
                  key={opt.id}
                  onClick={() => navigate(opt.to)}
                  style={{
                    position: 'relative',
                    background: opt.primary
                      ? `linear-gradient(135deg, ${opt.accent}, ${opt.accent}cc)`
                      : palette.surface,
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: opt.primary
                      ? `1px solid ${opt.accent}`
                      : `1px solid ${palette.border}`,
                    borderRadius: '1.25rem',
                    padding: '1.85rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'start',
                    gap: '0.85rem',
                    color: opt.primary ? '#fff' : palette.text,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s, border-color 0.25s, background 0.25s',
                    boxShadow: opt.primary
                      ? `0 14px 44px ${opt.glow}, inset 0 1px 0 rgba(255,255,255,0.18)`
                      : palette.shadow,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                    transitionDelay: `${i * 90 + 200}ms`,
                    minHeight: '210px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 22px 52px ${opt.glow}, inset 0 1px 0 rgba(255,255,255,0.18)`
                    if (!opt.primary) {
                      e.currentTarget.style.borderColor = `${opt.accent}88`
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = opt.primary
                      ? `0 14px 44px ${opt.glow}, inset 0 1px 0 rgba(255,255,255,0.18)`
                      : palette.shadow
                    if (!opt.primary) {
                      e.currentTarget.style.borderColor = palette.border
                    }
                  }}
                >
                  <div style={{
                    width: '3rem', height: '3rem', borderRadius: '0.875rem',
                    background: opt.primary ? 'rgba(255,255,255,0.20)' : `${opt.accent}1F`,
                    border: opt.primary ? '1px solid rgba(255,255,255,0.30)' : `1px solid ${opt.accent}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>{opt.emoji}</div>
                  <h3 style={{
                    fontSize: '1.3rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em',
                  }}>{t(opt.titleKey)}</h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: opt.primary ? 'rgba(255,255,255,0.92)' : palette.textDim,
                    margin: 0, lineHeight: 1.55, fontWeight: 400,
                  }}>{t(opt.descKey)}</p>
                  <div style={{
                    marginTop: 'auto', paddingTop: '0.5rem',
                    fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.02em',
                    color: opt.primary ? '#fff' : opt.accent,
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}>{t('situation.continue')} <span style={{ fontSize: '1rem' }}>→</span></div>
                </button>
              ))}
            </div>

            <p style={{
              marginTop: '3rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.78rem', color: palette.textMuted, fontWeight: 500,
            }}>{t('situation.disclaimer')}</p>
          </div>
        </main>
      </HavenShell>
    </div>
  )
}
