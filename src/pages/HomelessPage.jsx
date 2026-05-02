import { useState } from 'react'
import HavenShell, { useHavenPalette } from '../components/HavenShell'
import { generateHomelessPlan, generateTimeline } from '../utils/beaconAI'
import {
  PlanListView, PlanTimelineView, PlanQRCard, PlanErrorBoundary, encodePlan,
} from '../components/BeaconPlan'
import { useLanguage } from '../i18n/LanguageContext'
import { makeT } from '../i18n/havenStrings'

const EXAMPLES_BY_LANG = {
  en: [
    "I have two kids and we're sleeping in my car in Dorchester.",
    "I just got evicted from my apartment in Roxbury and need somewhere safe tonight.",
    "I'm a veteran with PTSD and I lost my housing last week.",
    "I'm 19, I aged out of foster care and I have nowhere to go.",
  ],
  es: [
    "Tengo dos hijos y dormimos en mi auto en Dorchester.",
    "Me desalojaron de mi apartamento en Roxbury y necesito un lugar seguro esta noche.",
    "Soy veterano con TEPT y perdí mi vivienda la semana pasada.",
    "Tengo 19 años, salí del sistema de acogida y no tengo a dónde ir.",
  ],
  zh: [
    "我有两个孩子，我们睡在多切斯特的车里。",
    "我刚被罗克斯伯里的公寓赶出来，今晚需要一个安全的地方。",
    "我是一名患有创伤后应激障碍的退伍军人，上周失去了住所。",
    "我19岁，刚脱离寄养系统，没有地方可去。",
  ],
  hi: [
    "मेरे दो बच्चे हैं और हम डोरचेस्टर में अपनी कार में सो रहे हैं।",
    "मुझे रोक्सबरी में अपने अपार्टमेंट से निकाल दिया गया और आज रात सुरक्षित जगह चाहिए।",
    "मैं PTSD से पीड़ित एक वेटरन हूं और पिछले हफ्ते मेरा घर छिन गया।",
    "मैं 19 साल का हूं, मैंने फॉस्टर केयर छोड़ी है और मेरे पास जाने को कहीं नहीं है।",
  ],
  fr: [
    "J'ai deux enfants et nous dormons dans ma voiture à Dorchester.",
    "Je viens d'être expulsé de mon appartement à Roxbury et j'ai besoin d'un endroit sûr ce soir.",
    "Je suis un vétéran avec ESPT et j'ai perdu mon logement la semaine dernière.",
    "J'ai 19 ans, j'ai quitté le placement familial et je n'ai nulle part où aller.",
  ],
  ar: [
    "لدي طفلان وننام في سيارتي في دورتشستر.",
    "تم إخلائي للتو من شقتي في روكسبري وأحتاج مكانًا آمنًا الليلة.",
    "أنا محارب قديم مصاب باضطراب ما بعد الصدمة وفقدت سكني الأسبوع الماضي.",
    "عمري 19 عامًا، خرجت من نظام الرعاية ولا مكان أذهب إليه.",
  ],
}

export default function HomelessPage() {
  const palette = useHavenPalette()
  const { lang, dir } = useLanguage()
  const t = makeT(lang)

  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [view, setView] = useState('timeline')

  async function submit() {
    if (!situation.trim() || loading) return
    setLoading(true); setError(''); setPlan(null); setTimeline([])
    try {
      const p = await generateHomelessPlan(situation.trim())
      setPlan(p)
      // Timeline call is non-blocking — failure does NOT crash the plan
      generateTimeline(p, situation.trim()).then(t => setTimeline(t)).catch(() => {})
    } catch (e) {
      setError(e?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setPlan(null); setTimeline([]); setSituation(''); setError('')
  }
  function printPlan() { window.print() }

  // Encode ONLY the plan (not the timeline) so QR stays scannable.
  const encoded = plan ? encodePlan({ plan, situation }) : ''
  const examples = EXAMPLES_BY_LANG[lang] || EXAMPLES_BY_LANG.en

  return (
    <div dir={dir}>
      <HavenShell palette={palette} backTo="/situation">
        {/* SMS Banner — always visible */}
        <div className="no-print" style={{
          background: 'linear-gradient(90deg, #DC2626, #F97316)',
          color: '#fff', padding: '0.6rem 1.5rem', textAlign: 'center',
          fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.01em',
          boxShadow: '0 4px 14px rgba(220,38,38,0.30)',
        }}>📱 {t('homeless.sms')}</div>

        <main style={{ maxWidth: '54rem', margin: '0 auto', padding: '2rem 1.5rem 4rem', width: '100%' }}>
          {!plan && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="no-print">
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.20em',
                  color: '#F87171', margin: '0 0 1rem',
                }}>🕊️ {t('homeless.eyebrow')}</p>
                <h1 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(1.85rem, 4vw, 2.65rem)', fontWeight: 300,
                  margin: '0 0 0.85rem', letterSpacing: '-0.025em', lineHeight: 1.15,
                  color: palette.text,
                }}>
                  {t('homeless.h1a')}<br />
                  <span style={{ fontWeight: 700 }}>{t('homeless.h1b')}</span>
                </h1>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '1rem', color: palette.textDim,
                  maxWidth: '34rem', margin: '0 auto', lineHeight: 1.6,
                }}>{t('homeless.sub')}</p>
              </div>

              {/* Input card */}
              <div className="no-print" style={{
                background: palette.surface,
                borderRadius: '1.25rem', padding: '1.5rem',
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadow,
                backdropFilter: 'blur(14px)',
              }}>
                <textarea
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  placeholder={t('homeless.placeholder')}
                  rows={5}
                  disabled={loading}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: `1.5px solid ${palette.borderStrong}`,
                    borderRadius: '0.75rem',
                    padding: '0.95rem 1.1rem', fontSize: '1rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: palette.text, outline: 'none', resize: 'vertical', minHeight: '120px',
                    background: palette.isDark ? 'rgba(10,20,38,0.65)' : 'rgba(255,255,255,0.95)',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = palette.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${palette.accent}33` }}
                  onBlur={e => { e.currentTarget.style.borderColor = palette.borderStrong; e.currentTarget.style.boxShadow = 'none' }}
                />

                <div style={{ marginTop: '0.85rem' }}>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.10em',
                    color: palette.textMuted, textTransform: 'uppercase', margin: '0 0 0.5rem',
                  }}>{t('homeless.tryone')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {examples.map((ex, i) => (
                      <button key={i}
                        onClick={() => setSituation(ex)}
                        disabled={loading}
                        style={{
                          background: palette.isDark ? 'rgba(124,185,255,0.12)' : 'rgba(37,99,235,0.07)',
                          border: `1px solid ${palette.accent}33`,
                          borderRadius: '9999px', padding: '0.35rem 0.85rem',
                          fontSize: '0.78rem', fontWeight: 500, color: palette.accent,
                          fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = palette.accent; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = palette.isDark ? 'rgba(124,185,255,0.12)' : 'rgba(37,99,235,0.07)'; e.currentTarget.style.color = palette.accent }}
                      >{ex.length > 60 ? ex.slice(0, 60) + '…' : ex}</button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={submit}
                  disabled={loading || !situation.trim()}
                  style={{
                    marginTop: '1.25rem', width: '100%',
                    background: loading || !situation.trim()
                      ? (palette.isDark ? 'rgba(255,255,255,0.10)' : '#94A3B8')
                      : 'linear-gradient(135deg, #EF4444, #B91C1C)',
                    color: '#fff', border: 'none', borderRadius: '0.75rem',
                    padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: loading || !situation.trim() ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.1s, box-shadow 0.15s',
                    boxShadow: loading || !situation.trim() ? 'none' : '0 8px 24px rgba(239,68,68,0.30)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {loading ? `⏳ ${t('homeless.loading')}` : `🕊️ ${t('homeless.cta')}`}
                </button>

                {error && (
                  <div style={{
                    marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '0.625rem',
                    background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.30)',
                    color: '#fca5a5', fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>⚠️ {error}</div>
                )}
              </div>

              {/* Why */}
              <div className="no-print" style={{
                marginTop: '2rem', display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem',
              }}>
                {[
                  { e: '⚡', t: t('homeless.feature1.t'), d: t('homeless.feature1.d') },
                  { e: '📄', t: t('homeless.feature2.t'), d: t('homeless.feature2.d') },
                  { e: '📲', t: t('homeless.feature3.t'), d: t('homeless.feature3.d') },
                ].map((b, i) => (
                  <div key={i} style={{
                    background: palette.surface, borderRadius: '0.875rem',
                    padding: '1rem 1.1rem', border: `1px solid ${palette.border}`,
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{b.e}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: palette.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{b.t}</div>
                    <div style={{ fontSize: '0.82rem', color: palette.textDim, marginTop: '0.15rem', lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{b.d}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {plan && (
            <PlanErrorBoundary>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.18em',
                  color: '#F87171', margin: '0 0 0.5rem',
                }} className="no-print">🕊️ HAVEN PLAN · {new Date().toLocaleDateString()}</p>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700,
                  margin: '0 0 0.4rem', letterSpacing: '-0.02em', color: palette.text,
                }}>{t('homeless.your_plan')}</h2>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: palette.textMuted, margin: 0, fontStyle: 'italic' }}>
                  {t('homeless.situation_label')} "{situation.length > 140 ? situation.slice(0, 140) + '…' : situation}"
                </p>
              </div>

              {/* Action bar */}
              <div className="no-print" style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem',
                padding: '0.45rem', background: palette.surface, borderRadius: '0.75rem',
                border: `1px solid ${palette.border}`, alignItems: 'center',
              }}>
                <div style={{
                  display: 'inline-flex', borderRadius: '9999px',
                  background: palette.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,150,222,0.10)', padding: '0.2rem',
                }}>
                  {[{ k:'timeline', l: '📅 ' + t('homeless.viewTimeline') }, { k:'list', l: '📋 ' + t('homeless.viewList') }].map(v => (
                    <button key={v.k} onClick={() => setView(v.k)}
                      style={{
                        background: view === v.k ? (palette.isDark ? '#fff' : '#0C1A2E') : 'transparent',
                        color: view === v.k ? (palette.isDark ? '#0C1A2E' : '#fff') : palette.textMuted,
                        border: 'none', borderRadius: '9999px',
                        padding: '0.42rem 0.95rem', fontSize: '0.78rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>{v.l}</button>
                  ))}
                </div>
                <button onClick={printPlan} style={actionBtnStyle(palette.accent)}>🖨 {t('homeless.print')}</button>
                <button onClick={reset} style={actionBtnStyle(palette.textMuted, true)}>↺ {t('homeless.new')}</button>
              </div>

              {/* Plan grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="plan-grid">
                <div>
                  {view === 'timeline' && timeline.length > 0
                    ? <PlanTimelineView timeline={timeline} palette={palette} />
                    : <PlanListView plan={plan} palette={palette} sectionLabels={{
                        urgent: t('plan.section.urgent'),
                        health: t('plan.section.health'),
                        benefits: t('plan.section.benefits'),
                        housing: t('plan.section.housing'),
                        food: t('plan.section.food'),
                      }} />}
                  {view === 'timeline' && timeline.length === 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <PlanListView plan={plan} palette={palette} sectionLabels={{
                        urgent: t('plan.section.urgent'),
                        health: t('plan.section.health'),
                        benefits: t('plan.section.benefits'),
                        housing: t('plan.section.housing'),
                        food: t('plan.section.food'),
                      }} />
                    </div>
                  )}
                </div>

                <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <PlanQRCard encoded={encoded} palette={palette} labels={{
                    title: t('plan.qr.title'),
                    scan: t('plan.qr.scan'),
                    subtitle: t('plan.qr.subtitle'),
                  }} />
                  <div style={{
                    background: palette.surface,
                    border: `1px solid ${palette.border}`,
                    borderRadius: '1rem', padding: '1rem 1.2rem',
                  }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.16em', color: palette.textMuted, margin: '0 0 0.3rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t('homeless.emergency_title')}</p>
                    <p style={{ fontSize: '0.85rem', color: palette.text, margin: '0 0 0.2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t('homeless.emergency_msg')}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📞 911</p>
                    <p style={{ fontSize: '0.78rem', color: palette.textMuted, margin: '0.5rem 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t('homeless.emergency_211')}</p>
                  </div>
                </div>
              </div>
            </PlanErrorBoundary>
          )}
        </main>
      </HavenShell>

      <style>{`
        @media (min-width: 900px) {
          .plan-grid { grid-template-columns: 1fr 280px !important; }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          main { padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  )
}

function actionBtnStyle(color, ghost = false) {
  return {
    background: ghost ? 'transparent' : color,
    color: ghost ? color : '#fff',
    border: ghost ? `1px solid ${color}55` : 'none',
    borderRadius: '9999px',
    padding: '0.42rem 0.9rem', fontSize: '0.78rem', fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer',
  }
}
