import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ShieldLogo from '../components/ShieldLogo'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from '../components/Icon'

const heroStyle = {
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(180deg, #4E96D1 0%, #6CB8EA 38%, #A8D9F5 72%, #D0ECFA 100%)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '5rem 1.5rem 4rem',
  marginTop: '-5rem',
}
// heroClassName applied separately via className prop

const cardStyle = {
  background: 'rgba(250, 252, 255, 0.92)',
  border: '1px solid rgba(99, 150, 222, 0.22)',
  borderRadius: '1.25rem',
  padding: '2rem',
  boxShadow: '0 4px 24px rgba(37, 99, 235, 0.09), 0 1px 4px rgba(37, 99, 235, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  backdropFilter: 'blur(8px)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
}
// cardClassName="ds-home-feature-card" applied via className prop

const btnBase = {
  marginTop: 'auto',
  color: '#fff',
  border: 'none',
  borderRadius: '0.75rem',
  padding: '0.75rem 1.25rem',
  fontSize: '0.875rem',
  fontWeight: 700,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  cursor: 'pointer',
  transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  // ── Parallax logo state ──
  const [logoEntered, setLogoEntered] = useState(false)
  const logoRotRef = useRef(null)
  const heroRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const rotEl = logoRotRef.current
    const heroEl = heroRef.current
    if (!rotEl || !heroEl) return
    const rect = heroEl.getBoundingClientRect()
    const x = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)))
    const y = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)))
    rotEl.style.transform = `rotateX(${18 + y * -12}deg) rotateY(${-22 + x * 14}deg) rotateZ(4deg)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const rotEl = logoRotRef.current
    if (rotEl) rotEl.style.transform = 'rotateX(18deg) rotateY(-22deg) rotateZ(4deg)'
  }, [])

  // ── Scroll-reveal for stats + cards ──
  const statsRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const groups = [
      { el: statsRef.current, children: true, delay: 0.06 },
      { el: cardsRef.current, children: true, delay: 0.10 },
    ]
    const cleanups = []

    groups.forEach(({ el, children, delay }) => {
      if (!el) return
      const targets = children ? Array.from(el.children) : [el]
      targets.forEach((target, i) => {
        target.style.opacity = '0'
        target.style.transform = 'translateY(28px)'
        target.style.transition = `opacity 0.65s ease ${i * delay}s, transform 0.65s ease ${i * delay}s`
        const obs = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            target.style.opacity = '1'
            target.style.transform = 'translateY(0)'
            obs.disconnect()
          }
        }, { threshold: 0.1 })
        obs.observe(target)
        cleanups.push(() => obs.disconnect())
      })
    })
    return () => cleanups.forEach(fn => fn())
  }, [])

  const cards = [
    {
      emoji: '🛡️',
      iconBg: 'rgba(37,99,235,0.12)', accent: '#2563EB',
      title: 'Protect',
      desc: 'Know your risk before disaster strikes. Live data, AI analysis, and 50 years of climate trends.',
      links: [
        { label: '🗺️ Live Disaster Map', to: '/map', sub: 'Real-time USGS & NOAA feed' },
        { label: '📈 Climate Trends', to: '/climate', sub: '50 years of disaster data' },
      ],
    },
    {
      emoji: '🚨',
      iconBg: 'rgba(220,38,38,0.10)', accent: '#DC2626',
      title: 'Respond',
      desc: 'When disaster hits, move fast. Plan your evacuation, document damage, and start your claim instantly.',
      links: [
        { label: '🚗 Evacuation Planner', to: '/evacuation', sub: 'AI route + packing checklist' },
        { label: '📸 Claims Estimation', to: '/claims', sub: 'CNN-powered repair cost estimation' },
        { label: '⚠️ Disaster Guides', to: '/disasters', sub: 'FEMA hazard info' },
      ],
    },
    {
      emoji: '🎓',
      iconBg: 'rgba(124,58,237,0.10)', accent: '#7C3AED',
      title: 'Train',
      desc: 'Build real preparedness with immersive simulations and personal reflection tracking.',
      links: [
        { label: '🥽 VR Simulator', to: '/vr-simulator', sub: 'Disaster readiness scenarios' },
        { label: '📓 Reflect', to: '/reflections', sub: 'Journal your preparedness' },
      ],
    },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="ds-home-hero"
        style={heroStyle}
        onMouseMove={logoEntered ? handleMouseMove : undefined}
        onMouseLeave={logoEntered ? handleMouseLeave : undefined}
      >
        {/* Subtle radial glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: '-20%', left: '-15%',
            width: '60%', height: '80%', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 65%)',
          }} />
          <div style={{
            position: 'absolute', top: '-10%', right: '-10%',
            width: '50%', height: '65%', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 65%)',
          }} />
        </div>

        {/* Content */}
        <div style={{ maxWidth: '52rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Brand name */}
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 0.5rem',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            Custos
          </h1>

          {/* Tagline under brand name */}
          <p style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.88)',
            margin: '0 0 0.75rem',
            lineHeight: 1.4,
          }}>
            Protect what matters most,
          </p>
          <p style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.4rem, 3.5vw, 2.25rem)',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 2.5rem',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
          }}>
            every season.
          </p>

          {/* Dark pill CTA */}
          <button
            onClick={() => navigate('/disasters')}
            style={{
              background: '#0C1A2E',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.9rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.625rem',
              boxShadow: '0 4px 24px rgba(12,26,46,0.30)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(12,26,46,0.40)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(12,26,46,0.30)'
            }}
          >
            {t('home.startExploring')}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '1.5rem', height: '1.5rem', borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
            }}>
              <Icon name="arrowRight" size={13} />
            </span>
          </button>

          {/* Sub-tagline */}
          <p style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '0.825rem',
            color: 'rgba(255,255,255,0.62)',
            marginTop: '1.5rem',
            letterSpacing: '0.01em',
          }}>
            FEMA hazard data · Insurance gap analysis · AI claims assessment
          </p>

          {/* 3D logo — rises and twirls on entry, then parallax-floats */}
          <div style={{
            perspective: '1200px',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2.5rem',
            padding: '80px',        /* room for glow to breathe */
            overflow: 'visible',
          }}>
            {/* Rotation layer: entrance animation → parallax on mouse */}
            <div
              ref={logoRotRef}
              style={logoEntered ? {
                transform: 'rotateX(18deg) rotateY(-22deg) rotateZ(4deg)',
                transition: 'transform 0.18s ease-out',
                transformStyle: 'preserve-3d',
                overflow: 'visible',
              } : {
                animation: 'logoEntrance 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                transformStyle: 'preserve-3d',
                overflow: 'visible',
              }}
              onAnimationEnd={() => setLogoEntered(true)}
            >
              {/* Float layer: gentle Y bob after entrance */}
              <div style={{
                animation: logoEntered ? 'floatY 6s ease-in-out infinite' : 'none',
                overflow: 'visible',
              }}>
                <ShieldLogo size={400} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue — larger and more visible */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0.88,
        }}>
          <div style={{
            width: '1.75rem', height: '2.875rem', borderRadius: '9999px',
            border: '2.5px solid rgba(255,255,255,0.92)',
            display: 'flex', justifyContent: 'center', paddingTop: '0.45rem',
            boxShadow: '0 0 16px rgba(255,255,255,0.25)',
          }}>
            <div style={{
              width: '4px', height: '8px', borderRadius: '9999px',
              background: '#ffffff',
              animation: 'scrollDot 1.8s ease-in-out infinite',
            }} />
          </div>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}>Scroll</span>
        </div>
        <style>{`
          @keyframes scrollDot {
            0%,100% { transform: translateY(0); opacity: 1; }
            60% { transform: translateY(8px); opacity: 0.2; }
          }
          @keyframes logoEntrance {
            0% {
              transform: rotateX(55deg) rotateY(-140deg) rotateZ(-16deg) translateY(90px) scale(0.42);
              opacity: 0;
            }
            28% { opacity: 1; }
            100% {
              transform: rotateX(18deg) rotateY(-22deg) rotateZ(4deg) translateY(0px) scale(1);
              opacity: 1;
            }
          }
          @keyframes floatY {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-12px); }
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes logoEntrance { from { opacity:1; transform: rotateX(18deg) rotateY(-22deg) rotateZ(4deg); } }
            @keyframes floatY { from {} to {} }
          }
        `}</style>
      </section>

      {/* ── Stats Bar ── */}
      <section className="ds-home-stats" style={{
        background: 'rgba(250, 252, 255, 0.90)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(99, 150, 222, 0.18)',
        borderBottom: '1px solid rgba(99, 150, 222, 0.18)',
        padding: '2.25rem 1.5rem',
      }}>
        <div style={{
          maxWidth: '64rem',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center',
        }}
        ref={statsRef}>
          {[
            { value: '3,800+', labelKey: 'home.stat.disasters' },
            { value: '$1T+', labelKey: 'home.stat.losses' },
            { value: '12+', labelKey: 'home.stat.conditions' },
            { value: '6', labelKey: 'home.stat.languages' },
          ].map(stat => (
            <div key={stat.labelKey}>
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '2.25rem',
                fontWeight: 800,
                color: 'var(--ds-accent)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: '0.78rem',
                color: 'var(--ds-text-muted)',
                marginTop: '0.375rem',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}>
                {t(stat.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section Cards ── */}
      <section style={{ padding: '3.5rem 1.5rem', maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--ds-text-muted)', marginBottom: '0.5rem',
          }}>
            Everything you need
          </p>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700, color: 'var(--ds-text-primary)',
            letterSpacing: '-0.02em', margin: 0,
          }}>
            Your complete risk toolkit
          </h2>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}
          ref={cardsRef}
          className="ds-cards-grid"
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className="ds-home-feature-card"
              style={cardStyle}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 12px 36px ${card.accent}22, 0 2px 8px rgba(37,99,235,0.08)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(37, 99, 235, 0.09), 0 1px 4px rgba(37, 99, 235, 0.05)'
              }}
            >
              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: '0.875rem',
                  background: card.iconBg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.4rem',
                  border: `1px solid ${card.accent}22`, flexShrink: 0,
                }}>
                  {card.emoji}
                </div>
                <h2 style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '1.3rem', fontWeight: 800, color: 'var(--ds-text-primary)', margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  {card.title}
                </h2>
              </div>

              <p style={{ fontSize: '0.835rem', color: 'var(--ds-text-secondary)', lineHeight: 1.65, margin: 0 }}>
                {card.desc}
              </p>

              {/* Sub-feature links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.25rem' }}>
                {card.links.map(link => (
                  <button
                    key={link.to}
                    onClick={() => navigate(link.to)}
                    className="ds-feature-link"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '0.1rem',
                      padding: '0.6rem 0.875rem', borderRadius: '0.625rem',
                      background: 'rgba(255,255,255,0.6)',
                      border: `1px solid ${card.accent}18`,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${card.accent}0D`
                      e.currentTarget.style.borderColor = `${card.accent}33`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.6)'
                      e.currentTarget.style.borderColor = `${card.accent}18`
                    }}
                  >
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.825rem', fontWeight: 700, color: 'var(--ds-text-primary)' }}>
                      {link.label}
                    </span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.72rem', color: 'var(--ds-text-muted)' }}>
                      {link.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 900px) {
            .ds-cards-grid { grid-template-columns: 1fr !important; }
          }
          @media (min-width: 640px) and (max-width: 900px) {
            .ds-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </section>

      {/* ── Team Section ── */}
      <section className="ds-home-team" style={{ padding: '3.5rem 1.5rem 4rem', background: 'rgba(248, 251, 255, 0.80)' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--ds-text-muted)', marginBottom: '0.5rem',
            }}>
              The people behind it
            </p>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700, color: 'var(--ds-text-primary)',
              letterSpacing: '-0.02em', margin: 0,
            }}>
              Meet the team
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
          }}
          className="team-cards-grid">
            {[
              {
                name: 'Roshan Anand',
                role: 'Lead Developer',
                desc: 'Passionate about building tools that help communities stay safe and informed during emergencies.',
                initials: 'RA',
                color: '#2563EB',
                bg: 'rgba(37,99,235,0.10)',
              },
              {
                name: 'Vikas Gopinath',
                role: 'Data Engineer',
                desc: 'Focused on integrating real-time hazard feeds and translating complex risk data into clear insights.',
                initials: 'VG',
                color: '#059669',
                bg: 'rgba(5,150,105,0.10)',
              },
              {
                name: 'Kabir Tiwari',
                role: 'UI / UX Designer',
                desc: 'Designs intuitive interfaces that make disaster preparedness accessible to everyone, everywhere.',
                initials: 'KT',
                color: '#7C3AED',
                bg: 'rgba(124,58,237,0.10)',
              },
              {
                name: 'Srihan Anand',
                role: 'AI & ML Engineer',
                desc: 'Develops the machine-learning models that power claims estimation, risk scoring, and damage analysis.',
                initials: 'SA',
                color: '#DC2626',
                bg: 'rgba(220,38,38,0.10)',
              },
            ].map(member => (
              <div
                key={member.name}
                className="ds-home-team-card"
                style={{
                  background: 'rgba(250,252,255,0.95)',
                  border: '1px solid rgba(99,150,222,0.20)',
                  borderRadius: '1.25rem',
                  padding: '1.75rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 4px 20px rgba(37,99,235,0.07)',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 12px 32px ${member.color}22, 0 2px 8px rgba(37,99,235,0.08)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.07)'
                }}
              >
                {/* Avatar placeholder */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: member.bg,
                  border: `2px dashed ${member.color}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: member.color,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}>
                  {member.initials}
                </div>

                {/* Name + role */}
                <div>
                  <div style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--ds-text-primary)',
                    letterSpacing: '-0.01em',
                    marginBottom: '0.2rem',
                  }}>
                    {member.name}
                  </div>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    color: member.color,
                  }}>
                    {member.role}
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: '0.8rem',
                  color: 'var(--ds-text-secondary)',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .team-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 540px) {
            .team-cards-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      <Footer />
    </div>
  )
}
