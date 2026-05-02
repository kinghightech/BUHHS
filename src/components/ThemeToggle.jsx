import { useEffect, useState } from 'react'
import Icon from './Icon'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ds_theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ds_theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  return { theme, toggle }
}

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={onToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '0.6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.125rem',
        background: isDark
          ? 'linear-gradient(135deg, rgba(140,180,230,0.18) 0%, rgba(140,180,230,0.10) 100%)'
          : 'linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0.05) 100%)',
        border: isDark
          ? '1px solid rgba(140,180,230,0.28)'
          : '1px solid rgba(99,150,222,0.30)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, background 0.15s, box-shadow 0.15s',
        flexShrink: 0,
        color: isDark ? '#FBBF24' : '#1D4ED8', // sun = warm amber, moon = brand blue
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.06)'
          : 'inset 0 1px 0 rgba(255,255,255,0.50)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = isDark
          ? '0 6px 18px rgba(140,180,230,0.20), inset 0 1px 0 rgba(255,255,255,0.10)'
          : '0 6px 18px rgba(37,99,235,0.20), inset 0 1px 0 rgba(255,255,255,0.50)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.06)'
          : 'inset 0 1px 0 rgba(255,255,255,0.50)'
      }}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={17} />
    </button>
  )
}
