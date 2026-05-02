// Haven dove logo — iconic peace-dove silhouette in flight.
// Slender body, swept wings, fan tail, olive branch in beak.

let _uid = 0

export default function HavenLogo({ size = 32, color, className = '', style = {}, withWordmark = false, wordmarkColor }) {
  const uid = ++_uid % 99999
  const g = (k) => `hv-${uid}-${k}`
  const fill = color || 'currentColor'
  const wordColor = wordmarkColor || color || 'currentColor'

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-label="Haven"
    >
      <defs>
        <linearGradient id={g('body')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={fill} stopOpacity="1" />
          <stop offset="60%"  stopColor={fill} stopOpacity="0.92" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id={g('wing')} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%"   stopColor={fill} stopOpacity="0.95" />
          <stop offset="55%"  stopColor={fill} stopOpacity="0.80" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.50" />
        </linearGradient>
        <linearGradient id={g('tail')} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%"   stopColor={fill} stopOpacity="0.90" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* ─── BACK WING — sweeps upward, suggests lift ─── */}
      <path
        d="M 28 28
           Q 18 14 8 16
           Q 12 22 22 26
           Q 18 30 14 32
           Q 22 32 30 30 Z"
        fill={`url(#${g('wing')})`}
        opacity="0.75"
      />

      {/* ─── TAIL FEATHERS — fanned, behind body ─── */}
      <path
        d="M 16 36
           L 6 38
           L 8 42
           L 16 41
           L 14 45
           L 22 42
           L 22 38 Z"
        fill={`url(#${g('tail')})`}
        opacity="0.92"
      />

      {/* ─── BODY — slender, elongated, in flight ─── */}
      <path
        d="M 22 38
           Q 18 32 22 28
           Q 28 22 38 24
           Q 46 26 50 30
           Q 48 34 42 36
           L 38 38
           Q 32 42 26 41
           Q 22 40 22 38 Z"
        fill={`url(#${g('body')})`}
      />

      {/* ─── HEAD — small, proportional ─── */}
      <circle cx="48" cy="28" r="4.5" fill={`url(#${g('body')})`} />

      {/* ─── BEAK — pointed, holding olive branch ─── */}
      <path
        d="M 52 27.5 L 58 28 L 52 30 Z"
        fill={fill}
        opacity="0.92"
      />

      {/* ─── EYE ─── */}
      <circle cx="49" cy="27" r="0.8" fill="#ffffff" opacity="0.95" />
      <circle cx="49" cy="27" r="0.4" fill={fill} opacity="0.6" />

      {/* ─── FRONT WING — spread upward, defines the silhouette ─── */}
      <path
        d="M 28 30
           Q 22 18 28 8
           Q 36 12 38 22
           Q 42 18 46 18
           Q 44 24 40 28
           Q 36 32 30 32
           Q 28 32 28 30 Z"
        fill={`url(#${g('wing')})`}
      />

      {/* Wing detail strokes (feather suggestion) */}
      <path d="M 30 22 Q 33 18 36 16" stroke={fill} strokeWidth="0.7" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M 32 26 Q 35 22 38 21" stroke={fill} strokeWidth="0.7" fill="none" opacity="0.40" strokeLinecap="round" />
      <path d="M 34 29 Q 37 26 40 25" stroke={fill} strokeWidth="0.7" fill="none" opacity="0.35" strokeLinecap="round" />

      {/* ─── OLIVE BRANCH (peace symbol) — held in beak ─── */}
      <g opacity="0.85">
        <path d="M 58 28 Q 62 26 64 23" stroke={fill} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.85" />
        <ellipse cx="60.5" cy="26.6" rx="1.6" ry="0.85" fill={fill} opacity="0.75" transform="rotate(-30 60.5 26.6)" />
        <ellipse cx="62.5" cy="25"   rx="1.6" ry="0.85" fill={fill} opacity="0.75" transform="rotate(-30 62.5 25)" />
        <ellipse cx="63.8" cy="23.4" rx="1.3" ry="0.7"  fill={fill} opacity="0.75" transform="rotate(-30 63.8 23.4)" />
      </g>
    </svg>
  )

  if (!withWordmark) return svg

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size > 28 ? '0.55rem' : '0.4rem', ...style }} className={className}>
      {svg}
      <span style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontWeight: 700, letterSpacing: '-0.025em',
        fontSize: Math.round(size * 0.78) + 'px',
        color: wordColor, lineHeight: 1,
      }}>Haven</span>
    </span>
  )
}
