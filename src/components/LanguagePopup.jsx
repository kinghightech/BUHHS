import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageWheel from './LanguageWheel'

export default function LanguagePopup() {
  const { lang, setLang, countryCode } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Change language"
        aria-label="Change language"
        style={{
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--ds-accent-dim)',
          border: '1px solid var(--ds-border-strong)',
          cursor: 'pointer',
          transition: 'background 0.15s',
          flexShrink: 0,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <img
          src={`https://flagcdn.com/w80/${countryCode}.png`}
          alt={lang}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
