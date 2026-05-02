// HavenShell — unified page chrome (background + navbar + footer) used by every page.
// One aesthetic: dark navy gradient OR soft cloud-blue gradient depending on theme.

import { Link, useNavigate } from 'react-router-dom'
import HavenLogo from './HavenLogo'
import ThemeToggle, { useTheme } from './ThemeToggle'
import LanguagePopup from './LanguagePopup'

export function useHavenPalette() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  const palette = isDark ? {
    isDark: true,
    // Multi-layered atmospheric background — soft cyan glow at top, faint
    // violet bloom at bottom-right, deep navy base. Anchored to viewport.
    bg: `
      radial-gradient(ellipse 90% 60% at 50% -5%, rgba(96,180,255,0.10) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 90% 110%, rgba(168,140,255,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 70% 60% at 5% 90%, rgba(56,189,248,0.05) 0%, transparent 55%),
      linear-gradient(180deg, #0a1628 0%, #0d1b34 35%, #060d1c 100%)
    `,
    bgSolid: '#060d1c',
    text: '#F1F6FC',
    textDim: 'rgba(220,232,250,0.82)',
    textMuted: 'rgba(176,196,224,0.62)',
    accent: '#8AC2FF',
    accentSolid: '#3B82F6',
    danger: '#FB7185',
    success: '#34D399',
    // Cards: subtle blue-tinted glass with vertical gradient → real elevation
    surface: 'linear-gradient(180deg, rgba(34,50,78,0.65) 0%, rgba(22,34,58,0.55) 100%)',
    surfaceSolid: '#1A2540',
    // Blue-tinted borders so cards feel like glass, not grey paper
    border: 'rgba(140,180,230,0.14)',
    borderStrong: 'rgba(140,180,230,0.34)',
    // Frosted glass nav with proper depth
    glassNav: 'linear-gradient(180deg, rgba(22,34,58,0.72) 0%, rgba(16,26,46,0.62) 100%)',
    glassCard: 'linear-gradient(180deg, rgba(34,50,78,0.55) 0%, rgba(22,34,58,0.45) 100%)',
    // Layered shadow: deep base + tight contact + inner highlight (the secret to "elevated" cards in dark UIs)
    shadow: '0 20px 50px rgba(0,0,0,0.55), 0 6px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
  } : {
    isDark: false,
    bg: 'radial-gradient(ellipse at 50% -10%, #DCEAF7 0%, #EFF5FC 40%, #F8FBFF 100%)',
    bgSolid: '#F8FBFF',
    text: '#0C1A2E',
    textDim: '#3D5A80',
    textMuted: '#5B7FA5',
    accent: '#1D4ED8',
    accentSolid: '#1D4ED8',
    danger: '#DC2626',
    success: '#059669',
    surface: 'rgba(255,255,255,0.92)',
    surfaceSolid: '#FFFFFF',
    border: 'rgba(99,150,222,0.22)',
    borderStrong: 'rgba(99,150,222,0.40)',
    glassNav: 'rgba(255,255,255,0.78)',
    glassCard: 'rgba(255,255,255,0.92)',
    shadow: '0 8px 32px rgba(37,99,235,0.10)',
  }

  return { ...palette, theme, toggle }
}

export function HavenNav({ palette, current = '', backTo, hideRightControls = false }) {
  const { theme, toggle } = palette
  return (
    <nav style={{
      padding: '1.25rem 1.5rem 0', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: '72rem', margin: '0 auto',
        background: palette.glassNav,
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        border: palette.isDark ? '1px solid rgba(140,180,230,0.18)' : `1px solid ${palette.border}`,
        borderRadius: '1rem', padding: '0.55rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        boxShadow: palette.isDark
          ? '0 16px 40px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(140,180,230,0.04) inset'
          : '0 8px 32px rgba(37,99,235,0.10), 0 1px 0 rgba(255,255,255,0.50) inset',
      }}>
        <Link to="/" style={{ textDecoration: 'none', color: palette.text, display: 'inline-flex', alignItems: 'center' }}>
          <HavenLogo size={28} color={palette.accent} withWordmark wordmarkColor={palette.text} />
        </Link>
        {current && (
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.78rem', fontWeight: 700,
            color: palette.accent, letterSpacing: '0.02em',
          }}>{current}</div>
        )}
        {!hideRightControls && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle theme={theme} onToggle={toggle} />
            <LanguagePopup />
            {backTo !== undefined && (
              <Link to={backTo || '/'} style={{
                textDecoration: 'none', color: palette.textMuted,
                fontSize: '0.82rem', fontWeight: 600, padding: '0.35rem 0.65rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>← Back</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default function HavenShell({ children, current, backTo, palette: passedPalette }) {
  const palette = passedPalette || useHavenPalette()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      color: palette.text,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      transition: 'color 0.25s',
      position: 'relative',
      background: palette.bgSolid,
    }}>
      {/* Fixed atmospheric background — gives the page a cinematic, layered feel */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: palette.bg,
        transition: 'background 0.5s ease',
      }} />
      {/* Subtle grain in dark mode for premium depth */}
      {palette.isDark && (
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          opacity: 0.40, mixBlendMode: 'overlay',
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <HavenNav palette={palette} current={current} backTo={backTo} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {typeof children === 'function' ? children(palette) : children}
        </div>
      </div>
    </div>
  )
}
