import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ShieldLogo from './ShieldLogo'
import ThemeToggle, { useTheme } from './ThemeToggle'
import LanguagePopup from './LanguagePopup'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

// ── Navigation structure ─────────────────────────────────────────────────────
// Uses translation keys — labels resolved via t() at render time
const NAV_ITEMS = [
  { labelKey: 'nav.home', to: '/' },
  {
    labelKey: 'nav.group.protect', group: true,
    children: [
      { labelKey: 'nav.item.liveMap',     to: '/map',        descKey: 'nav.item.liveMap.desc' },
      { labelKey: 'nav.item.climate',     to: '/climate',    descKey: 'nav.item.climate.desc' },
    ],
  },
  {
    labelKey: 'nav.group.respond', group: true,
    children: [
      { labelKey: 'nav.item.evacuate',    to: '/evacuation', descKey: 'nav.item.evacuate.desc' },
      { labelKey: 'nav.item.claims',      to: '/claims',     descKey: 'nav.item.claims.desc' },
      { labelKey: 'nav.item.disasterInfo',to: '/disasters',  descKey: 'nav.item.disasterInfo.desc' },
    ],
  },
  {
    labelKey: 'nav.group.train', group: true,
    children: [
      { labelKey: 'nav.item.vrSim',       to: '/vr-simulator', descKey: 'nav.item.vrSim.desc' },
      { labelKey: 'nav.item.reflect',     to: '/reflections',  descKey: 'nav.item.reflect.desc' },
    ],
  },
]

// Always-visible urgent action pills in the nav
const URGENT_LINKS = [
  { labelKey: 'nav.urgent.liveMap',    to: '/map',        color: '#0C1A2E' },
  { labelKey: 'nav.urgent.evacuate',   to: '/evacuation', color: '#DC2626' },
]

// ── Dropdown component ────────────────────────────────────────────────────────
function NavDropdown({ item, isMobile = false }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const ref = useRef(null)
  const { t } = useLanguage()

  const isGroupActive = item.children?.some(c => location.pathname.startsWith(c.to))

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  if (isMobile) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '0.75rem 1rem', borderRadius: '0.75rem',
            color: isGroupActive ? '#2563EB' : 'var(--ds-text-secondary)',
            fontWeight: isGroupActive ? 700 : 500,
            fontSize: '0.95rem',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          {t(item.labelKey)}
          <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '0.7rem' }}>▾</span>
        </button>
        {open && (
          <div style={{ paddingLeft: '1rem', paddingBottom: '0.25rem' }}>
            {item.children.map(child => (
              <Link
                key={child.to}
                to={child.to}
                style={{
                  display: 'block', padding: '0.6rem 1rem', borderRadius: '0.6rem',
                  textDecoration: 'none', marginBottom: '0.125rem',
                  color: location.pathname.startsWith(child.to) ? 'var(--ds-accent)' : 'var(--ds-text-secondary)',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: '0.875rem', fontWeight: 500,
                  background: location.pathname.startsWith(child.to) ? 'rgba(37,99,235,0.08)' : 'transparent',
                }}
              >
                {t(child.labelKey)}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          background: isGroupActive ? 'rgba(37,99,235,0.10)' : 'transparent',
          color: isGroupActive ? '#2563EB' : 'var(--ds-text-secondary)',
          fontWeight: isGroupActive ? 700 : 500,
          border: 'none', cursor: 'pointer',
          fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          padding: '0.375rem 0.75rem', borderRadius: '9999px',
          transition: 'color 0.15s, background 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {t(item.labelKey)}
        <span style={{ fontSize: '0.6rem', opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="ds-nav-dropdown"
          style={{
            position: 'absolute', top: 'calc(100% + 0.75rem)', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(99,150,222,0.22)',
            borderRadius: '1rem',
            boxShadow: '0 16px 48px rgba(37,99,235,0.14), 0 4px 12px rgba(0,0,0,0.08)',
            padding: '0.5rem',
            minWidth: '220px',
            zIndex: 200,
            animation: 'dropIn 0.18s ease both',
          }}
        >
          {item.children.map(child => (
            <Link
              key={child.to}
              to={child.to}
              role="menuitem"
              style={{
                display: 'flex', flexDirection: 'column', gap: '0.125rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
                textDecoration: 'none', marginBottom: '0.125rem',
                background: location.pathname.startsWith(child.to) ? 'rgba(37,99,235,0.07)' : 'transparent',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = location.pathname.startsWith(child.to) ? 'rgba(37,99,235,0.07)' : 'transparent'}
            >
              <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: '0.875rem', fontWeight: 600, color: 'var(--ds-text-primary)' }}>
                {t(child.labelKey)}
              </span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: '0.725rem', color: 'var(--ds-text-muted)', lineHeight: 1.3 }}>
                {t(child.descKey)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0.75rem 1rem', background: 'transparent', pointerEvents: 'none' }}>
      {/* Floating glass pill */}
      <nav className="ds-nav-pill" style={{
        maxWidth: '72rem', margin: '0 auto', padding: '0 1.25rem',
        display: 'flex', alignItems: 'center', height: '3.5rem', gap: '0.25rem',
        background: 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.45)', borderRadius: '1.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.60)',
        pointerEvents: 'auto',
      }}>

        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0, marginRight: '0.5rem' }}>
          <ShieldLogo size={26} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ds-text-primary)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            Custos
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="ds-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
          {/* Home */}
          <Link to="/" style={{
            color: isActive('/') ? '#2563EB' : 'var(--ds-text-secondary)',
            fontWeight: isActive('/') ? 700 : 500,
            textDecoration: 'none', fontSize: '0.875rem',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            padding: '0.375rem 0.75rem', borderRadius: '9999px',
            background: isActive('/') ? 'rgba(37,99,235,0.10)' : 'transparent',
            transition: 'color 0.15s, background 0.15s', whiteSpace: 'nowrap',
          }}>
            {t('nav.home')}
          </Link>

          {/* Dropdown groups */}
          {NAV_ITEMS.filter(i => i.group).map(item => (
            <NavDropdown key={item.labelKey} item={item} />
          ))}
        </div>

        {/* Urgent pills + controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
          {/* Urgent links — desktop only */}
          {URGENT_LINKS.map(u => (
            <Link
              key={u.to}
              to={u.to}
              className="ds-urgent-link"
              style={{
                background: isActive(u.to) ? u.color : 'rgba(12,26,46,0.08)',
                color: isActive(u.to) ? '#fff' : 'var(--ds-text-primary)',
                textDecoration: 'none', borderRadius: '9999px',
                padding: '0.35rem 0.875rem',
                fontSize: '0.78rem', fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                transition: 'all 0.15s', whiteSpace: 'nowrap',
                border: `1px solid ${isActive(u.to) ? 'transparent' : 'rgba(12,26,46,0.12)'}`,
              }}
            >
              {t(u.labelKey)}
            </Link>
          ))}

          <button
            onClick={() => window.dispatchEvent(new Event('custos:replay-intro'))}
            title="Replay intro"
            style={{
              width: '2rem', height: '2rem', borderRadius: '9999px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.18)',
              cursor: 'pointer', color: 'var(--ds-accent)', flexShrink: 0, transition: 'background 0.15s',
            }}
          >
            <Icon name="sparkles" size={15} />
          </button>
          <ThemeToggle theme={theme} onToggle={toggle} />
          <LanguagePopup />

          <button
            className="ds-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu" aria-expanded={menuOpen}
            style={{
              display: 'none', width: '2rem', height: '2rem', borderRadius: '9999px',
              alignItems: 'center', justifyContent: 'center',
              background: menuOpen ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.30)',
              border: '1px solid rgba(255,255,255,0.50)', cursor: 'pointer',
              color: 'var(--ds-text-primary)', flexShrink: 0,
            }}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={16} />
          </button>
        </div>
      </nav>

      {/* Mobile menu — accordion style */}
      {menuOpen && (
        <div className="ds-mobile-menu" style={{
          maxWidth: '72rem', margin: '0.5rem auto 0',
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.50)',
          borderRadius: '1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '0.5rem', pointerEvents: 'auto',
        }}>
          <Link to="/" onClick={() => setMenuOpen(false)}
            style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.75rem', textDecoration: 'none', color: isActive('/') ? 'var(--ds-accent)' : 'var(--ds-text-secondary)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: '0.95rem', fontWeight: isActive('/') ? 700 : 500 }}>
            {t('nav.home')}
          </Link>
          {NAV_ITEMS.filter(i => i.group).map(item => (
            <NavDropdown key={item.labelKey} item={item} isMobile />
          ))}
          <div style={{ padding: '0.5rem 1rem 0.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {URGENT_LINKS.map(u => (
              <Link key={u.to} to={u.to} onClick={() => setMenuOpen(false)}
                style={{ background: u.color, color: '#fff', textDecoration: 'none', borderRadius: '9999px', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                {t(u.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 900px) {
          .ds-nav-links { display: none !important; }
          .ds-urgent-link { display: none !important; }
          .ds-hamburger { display: flex !important; }
        }
        @media (min-width: 901px) {
          .ds-mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  )
}
