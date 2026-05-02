import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LANGUAGES } from '../i18n/LanguageContext'
import ShieldLogo from './ShieldLogo'

const N = LANGUAGES.length

// Responsive wheel size — shrinks on small phones
const WHEEL_SIZE =
  typeof window !== 'undefined' ? Math.min(300, Math.floor(window.innerWidth * 0.82)) : 300
const CENTER = WHEEL_SIZE / 2
const RADIUS = Math.round(WHEEL_SIZE * 0.353) // ~106 at 300, ~90 at 260

// For flag idx to sit at the BOTTOM (90°): idx*60 - 90 + wheelDeg = 90 → wheelDeg = 180 - idx*60
function targetDeg(idx) {
  return 180 - idx * 60
}

function shortestRotation(from, to) {
  const fromN = ((from % 360) + 360) % 360
  const toN   = ((to   % 360) + 360) % 360
  let diff = toN - fromN
  if (diff >  180) diff -= 360
  if (diff < -180) diff += 360
  return from + diff
}

export default function LanguageWheel({ currentLang, onSelect, onClose }) {
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const i = LANGUAGES.findIndex(l => l.code === currentLang)
    return i >= 0 ? i : 0
  })
  const [wheelDeg, setWheelDeg] = useState(() => {
    const i = LANGUAGES.findIndex(l => l.code === currentLang)
    return targetDeg(i >= 0 ? i : 0)
  })
  const confirmRef = useRef(null)

  // Escape key closes without selecting
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') { clearConfirm(); onClose?.() } }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => () => clearConfirm(), [])

  function clearConfirm() {
    if (confirmRef.current) { clearTimeout(confirmRef.current); confirmRef.current = null }
  }

  function handleFlagTap(idx) {
    clearConfirm()

    // Second tap on the already-active flag → confirm immediately
    if (idx === selectedIdx) {
      onSelect?.(LANGUAGES[idx].code)
      onClose?.()
      return
    }

    const newDeg = shortestRotation(wheelDeg, targetDeg(idx))
    setSelectedIdx(idx)
    setWheelDeg(newDeg)

    // Auto-confirm after animation settles
    confirmRef.current = setTimeout(() => {
      confirmRef.current = null
      onSelect?.(LANGUAGES[idx].code)
      onClose?.()
    }, 660)
  }

  const sel = LANGUAGES[selectedIdx]

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(5,12,30,0.78)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'lwFadeIn 0.22s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) { clearConfirm(); onClose?.() } }}
    >
      <div
        role="dialog"
        aria-label="Choose language"
        style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: '2rem',
          padding: '1.75rem 1.75rem 1.5rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem',
          boxShadow: '0 40px 100px rgba(0,0,0,0.38), 0 8px 28px rgba(37,99,235,0.18)',
          border: '1px solid rgba(255,255,255,0.95)',
          position: 'relative',
          width: 'min(380px, 92vw)',
          animation: 'lwSlideUp 0.40s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => { clearConfirm(); onClose?.() }}
          aria-label="Close language selector"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            width: '1.875rem', height: '1.875rem', borderRadius: '50%',
            background: 'rgba(91,127,165,0.12)', border: '1px solid rgba(91,127,165,0.22)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#5B7FA5', fontSize: '0.9rem', lineHeight: 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,127,165,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,127,165,0.12)'}
        >✕</button>

        {/* Header: current selection */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
            fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: '#5B7FA5', margin: '0 0 0.625rem',
          }}>Choose Your Language</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <img
              src={`https://flagcdn.com/w80/${sel.countryCode}.png`}
              alt={sel.name}
              style={{
                width: '44px', height: '29px', objectFit: 'cover',
                borderRadius: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.16)',
                transition: 'opacity 0.25s',
              }}
            />
            <div>
              <p style={{
                fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
                fontSize: '1.25rem', fontWeight: 800, color: '#1A3558',
                margin: 0, letterSpacing: '-0.025em', lineHeight: 1,
                transition: 'all 0.25s',
              }}>{sel.nativeName}</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
                fontSize: '0.75rem', color: '#5B7FA5', margin: '0.1rem 0 0', fontWeight: 500,
              }}>{sel.name}</p>
            </div>
          </div>
        </div>

        {/* Wheel */}
        <div style={{ position: 'relative', width: WHEEL_SIZE, height: WHEEL_SIZE, flexShrink: 0 }}>

          {/* Active slot glow (outside rotating container — stays fixed at bottom) */}
          <div style={{
            position: 'absolute',
            left: CENTER - 36, top: CENTER + RADIUS - 36,
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(37,99,235,0.07)',
            border: '2.5px solid rgba(37,99,235,0.40)',
            boxShadow: '0 0 32px rgba(37,99,235,0.22)',
            pointerEvents: 'none', zIndex: 1,
            animation: 'lwGlowPulse 2.5s ease-in-out infinite',
          }} />

          {/* Rotating container */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `rotate(${wheelDeg}deg)`,
            transition: 'transform 0.58s cubic-bezier(0.34,1.56,0.64,1)',
            willChange: 'transform',
          }}>
            {LANGUAGES.map((lang, idx) => {
              const baseDeg = idx * (360 / N) - 90
              const rad = baseDeg * Math.PI / 180
              const x = CENTER + RADIUS * Math.cos(rad)
              const y = CENTER + RADIUS * Math.sin(rad)
              const isSelected = idx === selectedIdx

              return (
                <div
                  key={lang.code}
                  style={{
                    position: 'absolute', left: x, top: y,
                    transform: `translate(-50%, -50%) rotate(${-wheelDeg}deg)`,
                    transition: 'transform 0.58s cubic-bezier(0.34,1.56,0.64,1)',
                    willChange: 'transform',
                    zIndex: isSelected ? 3 : 2,
                  }}
                >
                  <button
                    onClick={() => handleFlagTap(idx)}
                    title={`${lang.nativeName} — ${lang.name}`}
                    aria-label={`Select ${lang.name}`}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.78)',
                      border: isSelected
                        ? '2px solid rgba(37,99,235,0.55)'
                        : '1.5px solid rgba(99,150,222,0.25)',
                      borderRadius: '0.875rem',
                      padding: '0.4rem 0.45rem',
                      boxShadow: isSelected
                        ? '0 0 28px rgba(37,99,235,0.30), 0 4px 14px rgba(37,99,235,0.18)'
                        : '0 2px 8px rgba(0,0,0,0.08)',
                      transform: `scale(${isSelected ? 1.16 : 1})`,
                      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease',
                      backdropFilter: 'blur(8px)',
                      minWidth: '60px',
                      outline: 'none',
                    }}
                  >
                    <img
                      src={`https://flagcdn.com/w80/${lang.countryCode}.png`}
                      alt={lang.name}
                      style={{
                        width: '46px', height: '30px', objectFit: 'cover',
                        borderRadius: '5px', boxShadow: '0 1px 5px rgba(0,0,0,0.14)',
                        pointerEvents: 'none',
                      }}
                    />
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
                      fontSize: '0.52rem', fontWeight: 700,
                      color: isSelected ? '#1A3558' : '#3D5A80',
                      textAlign: 'center', lineHeight: 1.15,
                      whiteSpace: 'nowrap', pointerEvents: 'none',
                    }}>{lang.nativeName}</span>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
                      fontSize: '0.46rem', fontWeight: 500,
                      color: isSelected ? '#2563EB' : '#5B7FA5',
                      textAlign: 'center', lineHeight: 1.15,
                      whiteSpace: 'nowrap', pointerEvents: 'none',
                    }}>{lang.name}</span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Center: Custos shield (non-rotating) */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,0.97)',
            boxShadow: '0 4px 18px rgba(37,99,235,0.14), 0 1px 4px rgba(0,0,0,0.07)',
            border: '1.5px solid rgba(99,150,222,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 4,
          }}>
            <ShieldLogo size={30} />
          </div>
        </div>

        {/* Instruction hint */}
        <p style={{
          fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
          fontSize: '0.7rem', color: '#5B7FA5', textAlign: 'center', margin: 0,
        }}>
          Tap a flag to spin · Tap again to confirm
        </p>
      </div>

      <style>{`
        @keyframes lwFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lwSlideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.93) }
          to   { opacity: 1; transform: translateY(0)   scale(1)    }
        }
        @keyframes lwGlowPulse {
          0%,100% { box-shadow: 0 0 32px rgba(37,99,235,0.22); }
          50%     { box-shadow: 0 0 48px rgba(37,99,235,0.40); }
        }
      `}</style>
    </div>,
    document.body
  )
}
