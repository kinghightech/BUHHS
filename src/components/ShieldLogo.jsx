// uid avoids SVG gradient/filter ID collisions across multiple instances
let _uidCounter = 0

export default function ShieldLogo({ size = 32, className = '', style = {} }) {
  const uid = ++_uidCounter % 9999
  const g = (name) => `shl-${uid}-${name}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 112"
      width={size}
      height={Math.round(size * 1.12)}
      overflow="visible"
      className={className}
      style={{ overflow: 'visible', ...style }}
      aria-label="Custos shield logo"
    >
      <defs>
        {/* ─── GRADIENTS ─── */}

        {/* Front face: top-left lit, bottom-right in shadow */}
        <linearGradient id={g('face')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%"   stopColor="#82C4FA" />
          <stop offset="18%"  stopColor="#52A0E6" />
          <stop offset="52%"  stopColor="#2563EB" />
          <stop offset="82%"  stopColor="#1A3DBE" />
          <stop offset="100%" stopColor="#0F278C" />
        </linearGradient>

        {/* Inner recessed panel: deeper indigo-blue */}
        <linearGradient id={g('inner')} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%"   stopColor="#1E4ED0" />
          <stop offset="50%"  stopColor="#1538BC" />
          <stop offset="100%" stopColor="#0C2088" />
        </linearGradient>

        {/* Right depth side: faces away from light — very dark */}
        <linearGradient id={g('sideR')} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%"   stopColor="#08122E" />
          <stop offset="100%" stopColor="#030818" />
        </linearGradient>

        {/* Bottom tip: dark, matches side */}
        <linearGradient id={g('sideB')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#030818" />
          <stop offset="100%" stopColor="#08122E" />
        </linearGradient>

        {/* Specular: single coherent highlight, top-left source */}
        <radialGradient id={g('spec')} cx="26%" cy="17%" r="52%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.65)" />
          <stop offset="32%"  stopColor="rgba(255,255,255,0.26)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Fresnel rim: slight edge brightening toward viewer */}
        <radialGradient id={g('rim')} cx="50%" cy="50%" r="52%">
          <stop offset="62%"  stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(160,210,255,0.32)" />
        </radialGradient>

        {/* Gold $ — lit top, shadowed bottom */}
        <linearGradient id={g('gold')} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%"   stopColor="#FEF3C7" />
          <stop offset="28%"  stopColor="#FCD34D" />
          <stop offset="65%"  stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* ─── FILTERS ─── */}

        {/* Outer drop shadow for the front face */}
        <filter id={g('shadow')} x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2"
            floodColor="#010818" floodOpacity="0.25" />
        </filter>

        {/* $ depth shadow */}
        <filter id={g('dollarFx')} x="-20%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="1" stdDeviation="1"
            floodColor="rgba(0,0,0,0.30)" />
        </filter>
      </defs>

      {/* ── RIGHT DEPTH FACE (extrusion side — faces away from light) ── */}
      <path
        d="M 88,18 L 96,24 L 96,58
           C 96,78 79,95 58,106
           L 50,100
           C 70,88 88,72 88,52 Z"
        fill={`url(#${g('sideR')})`}
      />

      {/* ── BOTTOM TIP FACE ── */}
      <path
        d="M 50,100 L 58,106 C 54,110 46,110 44,106 Z"
        fill={`url(#${g('sideB')})`}
      />

      {/* ── MAIN FRONT FACE ── */}
      <path
        d="M 50,4
           C 52,4 86,12 88,18
           L 88,52
           C 88,72 70,88 50,100
           C 30,88 12,72 12,52
           L 12,18
           C 14,12 48,4 50,4 Z"
        fill={`url(#${g('face')})`}
        filter={`url(#${g('shadow')})`}
      />

      {/* ── TOP BEVEL: crown edge catches the key light ── */}
      <path
        d="M 50,4 C 52,4 86,12 88,18
           L 85.5,19.5
           C 82,14.5 52,7 50,7
           C 48,7 18,14.5 14.5,19.5
           L 12,18 C 14,12 48,4 50,4 Z"
        fill="rgba(255,255,255,0.60)"
      />

      {/* ── LEFT RIM: diffuse return light (fill light bounce) ── */}
      <path
        d="M 12,18 L 14.5,19.5 L 15.5,23 L 15.5,52
           C 15.5,70 29,85 50,95
           L 50,100 C 30,88 12,72 12,52 Z"
        fill="rgba(255,255,255,0.11)"
      />

      {/* ── INNER RECESSED PANEL ── */}
      <path
        d="M 50,13
           C 52,13 83,20 84,25
           L 84,52
           C 84,69 68,84 50,93
           C 32,84 16,69 16,52
           L 16,25 C 17,20 48,13 50,13 Z"
        fill={`url(#${g('inner')})`}
      />

      {/* ── INNER TOP BEVEL: recess edge catches same light ── */}
      <path
        d="M 50,13 C 52,13 83,20 84,25
           L 81.5,26
           C 78.5,22 52,15.5 50,15.5
           C 48,15.5 21.5,22 18.5,26
           L 16,25 C 17,20 48,13 50,13 Z"
        fill="rgba(255,255,255,0.26)"
      />

      {/* ── INNER LEFT RIM ── */}
      <path
        d="M 16,25 L 18.5,26 L 19.5,29 L 19.5,52
           C 19.5,67 31,81 50,90
           L 50,93 C 32,84 16,69 16,52 Z"
        fill="rgba(255,255,255,0.07)"
      />

      {/* ── SPECULAR (single, coherent top-left highlight) ── */}
      <path
        d="M 50,13 C 52,13 83,20 84,25 L 84,52
           C 84,69 68,84 50,93 C 32,84 16,69 16,52
           L 16,25 C 17,20 48,13 50,13 Z"
        fill={`url(#${g('spec')})`}
      />

      {/* ── FRESNEL RIM on outer face ── */}
      <path
        d="M 50,4 C 52,4 86,12 88,18 L 88,52
           C 88,72 70,88 50,100 C 30,88 12,72 12,52
           L 12,18 C 14,12 48,4 50,4 Z"
        fill={`url(#${g('rim')})`}
      />

      {/* ── $ SHADOW PASS ── */}
      <text x="52" y="75.5" textAnchor="middle"
        fill="rgba(0,0,0,0.48)"
        fontSize="40" fontWeight="900"
        fontFamily="Georgia,'Times New Roman',serif">$</text>

      {/* ── $ MAIN PASS ── */}
      <text x="50" y="73" textAnchor="middle"
        fill={`url(#${g('gold')})`}
        fontSize="40" fontWeight="900"
        fontFamily="Georgia,'Times New Roman',serif"
        filter={`url(#${g('dollarFx')})`}>$</text>

      {/* ── $ HIGHLIGHT PASS ── */}
      <text x="47.5" y="68.5" textAnchor="middle"
        fill="rgba(255,255,255,0.22)"
        fontSize="40" fontWeight="900"
        fontFamily="Georgia,'Times New Roman',serif">$</text>
    </svg>
  )
}
