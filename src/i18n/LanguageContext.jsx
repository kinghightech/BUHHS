import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import translations from './translations'

export const LANGUAGES = [
  { code: 'en', name: 'English',    nativeName: 'English',   dir: 'ltr', flag: '🇺🇸', countryCode: 'us' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',   dir: 'ltr', flag: '🇪🇸', countryCode: 'es' },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',       dir: 'ltr', flag: '🇨🇳', countryCode: 'cn' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',      dir: 'ltr', flag: '🇮🇳', countryCode: 'in' },
  { code: 'fr', name: 'French',     nativeName: 'Français',   dir: 'ltr', flag: '🇫🇷', countryCode: 'fr' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',    dir: 'rtl', flag: '🇸🇦', countryCode: 'sa' },
]

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ds_lang') || 'en'
  })

  const dir = LANGUAGES.find(l => l.code === lang)?.dir || 'ltr'
  const flag = LANGUAGES.find(l => l.code === lang)?.flag || ''
  const countryCode = LANGUAGES.find(l => l.code === lang)?.countryCode || ''

  useEffect(() => {
    if (lang) {
      document.documentElement.lang = lang
      document.documentElement.dir = dir
      localStorage.setItem('ds_lang', lang)
    }
  }, [lang, dir])

  const t = useCallback((key, vars) => {
    let str = translations[lang]?.[key] ?? translations.en?.[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return str
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, flag, countryCode }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
