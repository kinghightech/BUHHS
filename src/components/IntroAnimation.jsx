import { useState, useEffect, useMemo } from 'react'

const BILL_COUNT = 18
const COIN_COUNT = 10

const PEACE_WORDS = [
  'Secure', 'Protected', 'Prepared',
  'Resilient', 'Covered', 'Peace of Mind',
]

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function createBill(index) {
  const startX = randomBetween(-10, 110)
  const startY = randomBetween(110, 140)
  const endX = startX + randomBetween(-30, 30)
  const endY = randomBetween(-40, -10)
  const size = randomBetween(28, 52)
  const rotation = randomBetween(-180, 180)
  const delay = randomBetween(0, 1.2)
  const duration = randomBetween(1.8, 3.0)
  const opacity = randomBetween(0.25, 0.7)
  return { index, startX, startY, endX, endY, size, rotation, delay, duration, opacity }
}

function createCoin(index) {
  return {
    index,
    x: randomBetween(10, 90),
    y: randomBetween(120, 150),
    ey: randomBetween(-30, -5),
    d: randomBetween(1.5, 2.8),
    dl: randomBetween(0.2, 1.5),
  }
}

// Fixed positions spread far apart across the screen, avoiding center
const WORD_SLOTS = [
  { x: 12, y: 14 },
  { x: 82, y: 11 },
  { x: 8,  y: 78 },
  { x: 88, y: 82 },
  { x: 50, y: 6  },
  { x: 48, y: 92 },
]

export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState('playing') // playing | lifting | done

  const bills = useMemo(() => Array.from({ length: BILL_COUNT }, (_, i) => createBill(i)), [])
  const coins = useMemo(() => Array.from({ length: COIN_COUNT }, (_, i) => createCoin(i)), [])

  // Words with fixed spread positions
  const words = useMemo(() => PEACE_WORDS.map((word, i) => ({
    word,
    x: WORD_SLOTS[i].x + randomBetween(-3, 3),
    y: WORD_SLOTS[i].y + randomBetween(-2, 2),
    delay: 1.0 + i * 0.2,
  })), [])

  // Distance from center for each word — used to time the wave
  const waveWords = useMemo(() => words.map(w => {
    const dist = Math.sqrt((w.x - 50) ** 2 + (w.y - 50) ** 2)
    return { ...w, dist }
  }), [words])

  // Sort by distance so the wave spreads outward from center
  const sortedByDist = useMemo(() => [...waveWords].sort((a, b) => a.dist - b.dist), [waveWords])
  const waveDelays = useMemo(() => {
    const map = {}
    sortedByDist.forEach((w, i) => { map[w.word] = 2.2 + i * 0.15 })
    return map
  }, [sortedByDist])

  useEffect(() => {
    const liftTimer = setTimeout(() => setPhase('lifting'), 3600)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 4600)
    return () => { clearTimeout(liftTimer); clearTimeout(doneTimer) }
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        pointerEvents: phase === 'lifting' ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0a1628 0%, #0f2d5e 40%, #1a3f7a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: phase === 'lifting' ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 1s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      >
        {/* Floating money bills */}
        {bills.map(b => (
          <div
            key={b.index}
            style={{
              position: 'absolute',
              left: `${b.startX}%`,
              top: `${b.startY}%`,
              fontSize: `${b.size}px`,
              opacity: 0,
              animation: `flyMoney ${b.duration}s ${b.delay}s ease-out forwards`,
              '--endX': `${b.endX - b.startX}vw`,
              '--endY': `${b.endY - b.startY}vh`,
              '--rot': `${b.rotation}deg`,
              '--peakOpacity': b.opacity,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          >
            <svg width="1em" height="0.5em" viewBox="0 0 60 30" fill="none" style={{ filter: 'drop-shadow(0 2px 8px rgba(37,99,235,0.35))' }}>
              <rect x="1" y="1" width="58" height="28" rx="3" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1.5" />
              <rect x="5" y="5" width="50" height="20" rx="1.5" fill="none" stroke="#93C5FD80" strokeWidth="0.75" />
              <circle cx="30" cy="15" r="8" fill="none" stroke="#93C5FD90" strokeWidth="0.75" />
              <text x="30" y="19" textAnchor="middle" fill="#BFDBFE" fontSize="12" fontWeight="900" fontFamily="serif">$</text>
            </svg>
          </div>
        ))}

        {/* Coin particles */}
        {coins.map(c => (
          <div
            key={`coin-${c.index}`}
            style={{
              position: 'absolute',
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24, #d4a017)',
              boxShadow: '0 0 8px rgba(251,191,36,0.5)',
              opacity: 0,
              animation: `flyCoin ${c.d}s ${c.dl}s ease-out forwards`,
              '--coinEndY': `${c.ey - c.y}vh`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Spread words — drop in then single wave lights them up from center outward */}
        {waveWords.map((w, i) => (
          <div
            key={`word-${i}`}
            style={{
              position: 'absolute',
              left: `${w.x}%`,
              top: `${w.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              opacity: 0,
              animation: `wordDrop 0.7s ${w.delay}s cubic-bezier(0.22, 1, 0.36, 1) forwards, wordWave 1.2s ${waveDelays[w.word]}s ease-in-out forwards`,
              pointerEvents: 'none',
            }}
          >
            {w.word}
          </div>
        ))}

        {/* Expanding wave ring from center */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            animation: 'waveRing 1.8s 2.1s ease-out forwards',
            background: 'radial-gradient(circle, rgba(96,165,250,0.25) 0%, rgba(37,99,235,0.15) 40%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Radial glow behind brand */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        />

        {/* Center brand */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            animation: 'brandReveal 1s 0.3s ease-out both',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(3rem, 8vw, 5.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              fontFamily: "'Fraunces', serif",
              color: '#ffffff',
              textShadow: '0 0 40px rgba(96,165,250,0.6), 0 0 80px rgba(37,99,235,0.3)',
              lineHeight: 1,
            }}
          >
            Custos
          </div>
          <div
            style={{
              fontWeight: 600,
              color: '#93C5FD',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginTop: '0.75rem',
              opacity: 0,
              animation: 'subtitleFade 0.8s 1s ease-out forwards',
            }}
          >
            Medical & Disaster Financial Planning
          </div>

          {/* Shield icon + tagline */}
          <div
            style={{
              marginTop: '1.5rem',
              opacity: 0,
              animation: 'shieldPulse 0.6s 1.8s ease-out forwards',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 32 32" style={{ opacity: 0.6 }}>
              <path d="M16 2 L28 7 L28 17 C28 23.5 22.5 29 16 30 C9.5 29 4 23.5 4 17 L4 7 Z" fill="#1a3f7a" />
              <text x="16" y="21" textAnchor="middle" fill="#F0B840" fontSize="14" fontWeight="900" fontFamily="serif">$</text>
            </svg>
            <span
              style={{
                fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Your safety, your finances, your peace of mind
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flyMoney {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          15% { opacity: var(--peakOpacity); }
          85% { opacity: var(--peakOpacity); }
          100% { transform: translate(var(--endX), var(--endY)) rotate(var(--rot)); opacity: 0; }
        }

        @keyframes flyCoin {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 0.7; transform: translateY(calc(var(--coinEndY) * 0.2)) scale(1); }
          80% { opacity: 0.5; }
          100% { transform: translateY(var(--coinEndY)) scale(0.3); opacity: 0; }
        }

        @keyframes brandReveal {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }

        @keyframes subtitleFade {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        @keyframes wordDrop {
          0% {
            opacity: 0;
            transform: translate(-50%, -80%) scale(0.7);
            filter: blur(5px);
            color: rgba(37,99,235,0.0);
            text-shadow: none;
          }
          60% {
            opacity: 1;
            transform: translate(-50%, -46%) scale(1.03);
            filter: blur(0);
            color: rgba(96,165,250,0.35);
            text-shadow: 0 0 10px rgba(37,99,235,0.15);
          }
          80% {
            transform: translate(-50%, -52%) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            color: rgba(96,165,250,0.25);
            text-shadow: 0 0 6px rgba(37,99,235,0.08);
          }
        }

        @keyframes wordWave {
          0% {
            color: rgba(96,165,250,0.25);
            text-shadow: 0 0 6px rgba(37,99,235,0.08);
          }
          25% {
            color: #93C5FD;
            text-shadow:
              0 0 20px rgba(147,197,253,0.8),
              0 0 50px rgba(37,99,235,0.4),
              0 0 12px rgba(240,184,64,0.4);
          }
          50% {
            color: #BAE6FD;
            text-shadow:
              0 0 18px rgba(186,230,253,0.7),
              0 0 40px rgba(147,197,253,0.3),
              0 0 8px rgba(37,99,235,0.3);
          }
          100% {
            color: rgba(147,197,253,0.35);
            text-shadow:
              0 0 8px rgba(147,197,253,0.12),
              0 0 4px rgba(37,99,235,0.08);
          }
        }

        @keyframes waveRing {
          0% {
            width: 10px; height: 10px;
            opacity: 0.6;
          }
          100% {
            width: 200vmax; height: 200vmax;
            opacity: 0;
          }
        }

        @keyframes shieldPulse {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
