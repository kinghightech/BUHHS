import { useState, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageWheel from './LanguageWheel'

export default function LanguagePopup() {
  const { lang, setLang, countryCode } = useLanguage()
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')

  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark'))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const baseShadow = isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.50)'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Change language"
        aria-label="Change language"
        style={{
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(135deg, rgba(140,180,230,0.18) 0%, rgba(140,180,230,0.10) 100%)'
            : 'linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0.05) 100%)',
          border: isDark ? '1px solid rgba(140,180,230,0.28)' : '1px solid rgba(99,150,222,0.30)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s',
          flexShrink: 0,
          overflow: 'hidden',
          padding: '3px',
          boxShadow: baseShadow,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = isDark
            ? '0 6px 18px rgba(140,180,230,0.20), ' + baseShadow.replace('inset', 'inset')
            : '0 6px 18px rgba(37,99,235,0.20), ' + baseShadow
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = baseShadow
        }}
      >
        <img
          src={`https://flagcdn.com/w80/${countryCode}.png`}
          alt={lang}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '0.4rem' }}
        />
      </button>

      {open && (
        <LanguageWheel
          currentLang={lang}
          onSelect={(code) => setLang(code)}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
