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
  return (
    <button
      onClick={onToggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.125rem',
        background: 'var(--ds-accent-dim)',
        border: '1px solid var(--ds-border-strong)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        flexShrink: 0,
        color: 'var(--ds-text-primary)',
      }}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  )
}
