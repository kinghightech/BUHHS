import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HavenLogo from './components/HavenLogo'
import ThemeToggle, { useTheme } from './components/ThemeToggle'
import LanguagePopup from './components/LanguagePopup'
import { useLanguage } from './i18n/LanguageContext'
import { makeT } from './i18n/havenStrings'

const FadeIn = ({ children, delay = 0, duration = 1000, className = '', style = {} }) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div className={className} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    }}>{children}</div>
  )
}

const AnimatedHeading = ({ text, color }) => {
  const lines = text.split('\n')
  const [animating, setAnimating] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimating(true), 200); return () => clearTimeout(t) }, [text])
  return (
    <h1 style={{
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: 'clamp(2.5rem, 6vw, 4.75rem)', fontWeight: 300,
      letterSpacing: '-0.035em', lineHeight: 1.05, margin: 0, color, textAlign: 'center',
      textShadow: '0 2px 14px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.35)',
    }}>
      {lines.map((line, li) => (
        <div key={li} style={{ overflow: 'hidden' }}>
          {line.split('').map((ch, ci) => (
            <span key={ci} style={{
              display: 'inline-block',
              opacity: animating ? 1 : 0,
              transform: animating ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.34,1.56,0.64,1)',
              transitionDelay: `${li * 60 + ci * 28}ms`,
            }}>{ch === ' ' ? ' ' : ch}</span>
          ))}
        </div>
      ))}
    </h1>
  )
}

export default function App() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { lang, dir } = useLanguage()
  const t = makeT(lang)
  const isDark = theme === 'dark'

  return (
    <div dir={dir} className="relative min-h-screen w-full overflow-hidden font-sans" style={{
      background: '#000',
    }}>
      {/* Video Background — luminous, bright, lifted */}
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          filter: isDark
            ? 'brightness(0.95) saturate(1.20) contrast(1.05)'
            : 'brightness(1.18) saturate(1.15) contrast(1.02)',
        }}
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
      </video>

      {/* Light wash + warm bloom — keeps text readable but brightens the whole frame */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: isDark
          ? 'radial-gradient(ellipse at 50% 30%, rgba(120,180,255,0.18) 0%, transparent 60%), linear-gradient(180deg, rgba(8,18,38,0.10) 0%, rgba(8,18,38,0.30) 100%)'
          : 'radial-gradient(ellipse at 50% 25%, rgba(255,235,200,0.30) 0%, transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(180,210,240,0.18) 100%)',
      }} />

      {/* Bottom readability gradient — only the bottom 35% darkens slightly for the headline */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 z-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 100%)',
      }} />

      <div className="relative z-10 flex flex-col min-h-screen" style={{ color: '#fff' }}>
        {/* Top bar */}
        <nav style={{ padding: '1.5rem 1.5rem 0' }}>
          <div style={{
            maxWidth: '72rem', margin: '0 auto',
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: '1rem', padding: '0.55rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 24px rgba(0,0,0,0.20)',
          }}>
            <HavenLogo size={30} color="#fff" withWordmark wordmarkColor="#fff" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ThemeToggle theme={theme} onToggle={toggle} />
              <LanguagePopup />
            </div>
          </div>
        </nav>

        {/* Hero — centered */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 pb-12">
          <div className="max-w-4xl flex flex-col items-center" style={{ textAlign: 'center' }}>
            <FadeIn delay={50}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.92)', margin: '0 0 1.5rem',
                textShadow: '0 1px 6px rgba(0,0,0,0.40)',
              }}>{t('landing.eyebrow')}</p>
            </FadeIn>

            <AnimatedHeading text={t('landing.h1a')} color="#fff" />

            <FadeIn delay={1000}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(1rem, 1.5vw, 1.18rem)',
                color: 'rgba(255,255,255,0.95)', margin: '1.5rem auto 0',
                maxWidth: '36rem', lineHeight: 1.6, fontWeight: 400,
                textShadow: '0 1px 8px rgba(0,0,0,0.40)',
              }}>{t('landing.sub')}</p>
            </FadeIn>

            <FadeIn delay={1300}>
              <button
                onClick={() => navigate('/situation')}
                style={{
                  marginTop: '2.25rem',
                  background: '#fff', color: '#000',
                  border: 'none', borderRadius: '9999px',
                  padding: '1rem 2.25rem', fontSize: '1rem', fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: 'pointer', letterSpacing: '0.005em',
                  boxShadow: '0 14px 40px rgba(255,255,255,0.20), 0 4px 12px rgba(0,0,0,0.35)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 18px 48px rgba(255,255,255,0.28), 0 6px 16px rgba(0,0,0,0.40)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(255,255,255,0.20), 0 4px 12px rgba(0,0,0,0.35)' }}
              >{t('landing.cta')} →</button>
            </FadeIn>
          </div>
        </main>

        {/* subtle footer mark */}
        <div style={{ textAlign: 'center', padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.40)', letterSpacing: '0.06em' }}>
          PEACE · REFUGE · BOSTON
        </div>
      </div>
    </div>
  )
}
