import { LANGUAGES } from '../i18n/LanguageContext'
import ShieldLogo from './ShieldLogo'

const HEADING_LINES = [
  { text: 'Select Your Language', dir: 'ltr', primary: true },
  { text: 'Seleccione su idioma', dir: 'ltr', primary: false },
  { text: '选择您的语言', dir: 'ltr', primary: false },
  { text: 'अपनी भाषा चुनें', dir: 'ltr', primary: false },
  { text: 'Choisissez votre langue', dir: 'ltr', primary: false },
  { text: 'اختر لغتك', dir: 'rtl', primary: false },
]

export default function LanguageSplash({ onSelect }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{
        background: 'linear-gradient(160deg, #EFF6FF 0%, #F8FAFF 50%, #EBF4FF 100%)',
      }}
    >
      {/* Sky cloud blob decorations */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-15%',
          width: '55%', height: '70%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(147,197,253,0.32) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '45%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(186,230,253,0.28) 0%, transparent 70%)',
        }} />
      </div>

      {/* Shield + Brand */}
      <div className="flex items-center gap-3 mb-6" style={{ position: 'relative' }}>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(37,99,235,0.10)',
            border: '1.5px solid rgba(37,99,235,0.22)',
            boxShadow: '0 2px 12px rgba(37,99,235,0.12)',
          }}
        >
          <ShieldLogo size={38} />
        </div>
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{
              color: '#1A3558',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            Custos
          </h1>
          <p className="text-xs" style={{ color: '#5B7FA5', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>
            Disaster Risk &amp; Financial Planner
          </p>
        </div>
      </div>

      {/* Multilingual heading */}
      <div className="text-center mb-7" style={{ position: 'relative' }}>
        {HEADING_LINES.map(({ text, dir, primary }, i) => (
          <p
            key={i}
            className="text-sm"
            style={{
              color: primary ? '#1A3558' : '#5B7FA5',
              fontWeight: primary ? 700 : 500,
              marginBottom: '0.2rem',
              direction: dir,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {text}
          </p>
        ))}
      </div>

      {/* Language cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg" style={{ position: 'relative' }}>
        {LANGUAGES.map(({ code, name, nativeName, countryCode }) => (
          <button
            key={code}
            onClick={() => onSelect(code)}
            className="flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all"
            style={{
              backgroundColor: 'rgba(250, 252, 255, 0.92)',
              border: '1.5px solid rgba(99, 150, 222, 0.22)',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.07)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563EB'
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(37, 99, 235, 0.18)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 150, 222, 0.22)'
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(37, 99, 235, 0.07)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <img
              src={`https://flagcdn.com/w80/${countryCode}.png`}
              srcSet={`https://flagcdn.com/w160/${countryCode}.png 2x`}
              alt={`${name} flag`}
              className="w-10 h-7 object-cover rounded-sm shadow-sm"
            />
            <div>
              <p className="text-base font-bold" style={{ color: '#1A3558', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                {nativeName}
              </p>
              <p className="text-xs" style={{ color: '#5B7FA5', fontWeight: 500 }}>{name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs mt-8" style={{ color: '#5B7FA5', position: 'relative' }}>
        You can change your language anytime from the header.
      </p>
    </div>
  )
}
