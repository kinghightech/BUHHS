import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const MODEL = 'google/gemma-4-31b-it:free'
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const WAKE_PHRASES = [
  'hey custos','hey costos','hey costus','hey custom','hey custards',
  'hey just us','a custos','hey custis','hey christos','hey costas',
]

const ROUTE_MAP = {
  home:'/', disasters:'/disasters', assessment:'/disasters/assessment',
  claims:'/claims', 'vr-simulator':'/vr-simulator', reflections:'/reflections',
}

const SYSTEM_PROMPT = `You are Custos, an intelligent voice AI assistant for the Custos disaster risk and financial planning platform. Responses are spoken aloud.

About Custos: helps homeowners/renters understand disaster risks and protect finances. Motto: "Protect what matters most, every season."

Pages:
- Home: landing page
- Disasters (/disasters): browse earthquake, wildfire, flood, hurricane, tornado, extreme weather
- Risk Assessment (/disasters/assessment): ZIP code risk scores, FEMA data, financial impact, insurance gap analysis
- Claims (/claims): upload damage photos for AI claims estimation
- VR Simulator (/vr-simulator): simulate disaster scenarios
- Reflections (/reflections): track preparedness journey

Facts: covers 3800+ disaster events, 1 trillion dollars in tracked losses, 12+ hazard conditions, 6 languages, real FEMA data.

Navigation - append ONE tag at END of response when navigating:
[navigate:home] [navigate:disasters] [navigate:assessment] [navigate:claims] [navigate:vr-simulator] [navigate:reflections]

Response rules (TTS - CRITICAL):
- Max 2-3 sentences. Never more.
- NO markdown: no asterisks, hashtags, bullet points
- Spell numbers as words ("three thousand" not "3,000")
- Be warm, concise, professional
- Always use [navigate:X] when user asks to go somewhere`

const SpeechRec = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null

function parseResponse(raw) {
  const navMatch = raw.match(/\[navigate:([^\]]+)\]/)
  const clean = raw.replace(/\[[^\]]+\]/g,'').replace(/\*+/g,'').replace(/#+\s/g,'').trim()
  return { text: clean, navTarget: navMatch?.[1]?.trim() ?? null }
}

function containsWakeWord(t) {
  const s = t.toLowerCase().replace(/['\u2019`]/g,'').replace(/\s+/g,' ')
  return WAKE_PHRASES.some(p => s.includes(p))
}

export default function VoiceAssistant() {
  const navigate = useNavigate()
  // phases: 'wake' | 'idle' | 'flash' | 'listen' | 'think' | 'speak' | 'error'
  const [phase, setPhase] = useState('wake')
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [speechApiAvail] = useState(!!SpeechRec)
  const [micDenied, setMicDenied] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const textInputRef = useRef(null)

  const phaseRef      = useRef('wake')
  const wakeRecRef    = useRef(null)
  const activeRecRef  = useRef(null)
  const synthRef      = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)
  const wakeRestarts  = useRef(0)
  const micDeniedRef  = useRef(false)
  const sessionTimer  = useRef(null)   // flash → startActiveListen delay
  const wakeTimer     = useRef(null)   // wake rec restart delay
  const mountTimers   = useRef([])     // hint timers, cleaned on unmount

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { micDeniedRef.current = micDenied }, [micDenied])

  function clearSessionTimer() {
    if (sessionTimer.current) { clearTimeout(sessionTimer.current); sessionTimer.current = null }
  }
  function scheduleWakeRestart(delay = 400) {
    if (wakeTimer.current) clearTimeout(wakeTimer.current)
    wakeTimer.current = setTimeout(startWakeRec, delay)
  }

  function speak(text, onDone) {
    if (!synthRef.current) { onDone?.(); return }
    synthRef.current.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'; utt.rate = 0.94; utt.pitch = 1.06
    const voices = synthRef.current.getVoices()
    const pref = ['Samantha','Karen','Moira','Tessa','Google US English','Microsoft Zira','Microsoft Jenny']
    let voice = null
    for (const n of pref) { voice = voices.find(v => v.name.includes(n)); if (voice) break }
    if (!voice) voice = voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male'))
    if (voice) utt.voice = voice
    utt.onend = () => onDone?.(); utt.onerror = () => onDone?.()
    synthRef.current.speak(utt)
  }

  function stopWakeRec() {
    try { wakeRecRef.current?.abort(); wakeRecRef.current = null } catch(_){}
    if (wakeTimer.current) { clearTimeout(wakeTimer.current); wakeTimer.current = null }
  }

  function startWakeRec() {
    if (!SpeechRec || micDeniedRef.current) return
    if (wakeRecRef.current) { try { wakeRecRef.current.abort() } catch(_){} }
    try {
      const rec = new SpeechRec()
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US'; rec.maxAlternatives = 3
      rec.onresult = (event) => {
        if (phaseRef.current !== 'wake') return
        wakeRestarts.current = 0
        for (let i = event.resultIndex; i < event.results.length; i++) {
          for (let j = 0; j < event.results[i].length; j++) {
            if (containsWakeWord(event.results[i][j].transcript)) {
              rec.abort(); wakeRecRef.current = null; activateFromWakeWord(); return
            }
          }
        }
      }
      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          micDeniedRef.current = true; setMicDenied(true)
        }
      }
      rec.onend = () => {
        if (phaseRef.current === 'wake' && !micDeniedRef.current) {
          wakeRestarts.current++
          const delay = Math.min(300 * (1 + Math.floor(wakeRestarts.current / 5)), 3000)
          scheduleWakeRestart(delay)
        }
      }
      wakeRecRef.current = rec; rec.start()
    } catch(_) {}
  }

  // Orb click — just opens the panel to 'idle', user then taps Speak or types
  function openPanel() {
    stopWakeRec(); clearSessionTimer()
    setTranscript(''); setAiResponse(''); setErrorMsg('')
    setPanelOpen(true); setPhase('idle')
  }

  // Panel close — cancel everything and restart wake rec
  function closePanel() {
    try { activeRecRef.current?.abort(); activeRecRef.current = null } catch(_){}
    synthRef.current?.cancel(); clearSessionTimer()
    setPanelOpen(false); setPhase('wake')
    setTranscript(''); setAiResponse(''); setErrorMsg(''); setTextInput('')
    wakeRestarts.current = 0
    if (SpeechRec && !micDeniedRef.current) scheduleWakeRestart(400)
  }

  // Wake word detected — open panel and immediately start active listen
  function activateFromWakeWord() {
    clearSessionTimer()
    setTranscript(''); setAiResponse(''); setErrorMsg('')
    setPanelOpen(true); setPhase('flash')
    sessionTimer.current = setTimeout(() => { sessionTimer.current = null; startActiveListen() }, 600)
  }

  // "Tap to Speak" button — explicit listen trigger
  function startActiveListen() {
    if (!SpeechRec || micDeniedRef.current) { setPhase('idle'); return }
    stopWakeRec()
    synthRef.current?.cancel()
    try {
      const rec = new SpeechRec()
      rec.continuous = false; rec.interimResults = true; rec.lang = 'en-US'; rec.maxAlternatives = 1
      rec.onstart = () => setPhase('listen')
      rec.onresult = (event) => {
        const parts = Array.from(event.results)
        setTranscript(parts.map(r => r[0].transcript).join(' '))
        const fin = parts.find(r => r.isFinal)
        if (fin) { const text = fin[0].transcript.trim(); setTranscript(text); rec.stop(); handleQuery(text) }
      }
      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          micDeniedRef.current = true; setMicDenied(true)
          setErrorMsg('Microphone blocked — use the text box below.')
        } else if (e.error === 'no-speech') {
          setErrorMsg("Didn't catch that — tap the mic again or type below.")
        } else {
          setErrorMsg('Voice recognition error. Please try again.')
        }
        setPhase('idle')
        sessionTimer.current = setTimeout(() => { sessionTimer.current = null; setErrorMsg('') }, 4000)
      }
      rec.onend = () => { if (phaseRef.current === 'listen') setPhase('idle') }
      activeRecRef.current = rec; rec.start()
    } catch(_) { setPhase('idle') }
  }

  async function handleQuery(text) {
    setPhase('think')
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://custos.app',
          'X-Title': 'Custos Voice Assistant',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role:'system', content:SYSTEM_PROMPT }, { role:'user', content:text }],
          max_tokens: 200, temperature: 0.65,
        }),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content ?? "Having trouble right now. Please try again."
      const { text: resp, navTarget } = parseResponse(raw)
      setAiResponse(resp)
      if (navTarget && ROUTE_MAP[navTarget]) navigate(ROUTE_MAP[navTarget])
      if (speechApiAvail && !micDeniedRef.current) {
        setPhase('speak')
        speak(resp, () => setPhase('idle'))
      } else {
        setPhase('idle')
      }
    } catch {
      const fb = "Sorry, trouble connecting. Check your connection and try again."
      setAiResponse(fb)
      if (speechApiAvail && !micDeniedRef.current) {
        setPhase('speak')
        speak(fb, () => setPhase('idle'))
      } else {
        setPhase('idle')
      }
    }
  }

  useEffect(() => {
    if (!SpeechRec) return
    synthRef.current?.getVoices()
    if (synthRef.current) synthRef.current.onvoiceschanged = () => synthRef.current?.getVoices()

    // Only auto-start wake rec if microphone permission already granted (avoids surprise prompt)
    const tryWake = () => {
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' })
          .then(r => { if (r.state === 'granted') scheduleWakeRestart(1200) })
          .catch(() => scheduleWakeRestart(1200))
      } else {
        scheduleWakeRestart(1200)
      }
    }
    tryWake()

    // Hint bubble after 2.8s
    const t1 = setTimeout(() => {
      setShowHint(true)
      const t2 = setTimeout(() => setShowHint(false), 4500)
      mountTimers.current.push(t2)
    }, 2800)
    mountTimers.current.push(t1)

    return () => {
      mountTimers.current.forEach(clearTimeout); mountTimers.current = []
      clearSessionTimer()
      stopWakeRec()
      try { activeRecRef.current?.abort() } catch(_){}
      synthRef.current?.cancel()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleOrbClick() {
    if (phase === 'think') return
    if (panelOpen) {
      if (phase === 'listen') {
        try { activeRecRef.current?.stop() } catch(_){}
        setPhase('idle')
      } else if (phase === 'speak') {
        synthRef.current?.cancel(); setPhase('idle')
      } else {
        closePanel()
      }
    } else {
      openPanel()
    }
  }

  function handleTextSubmit(e) {
    e?.preventDefault()
    const q = textInput.trim()
    if (!q || phase === 'think') return
    setTextInput(''); setTranscript(q); handleQuery(q)
  }

  useEffect(() => {
    if (panelOpen && (micDenied || !speechApiAvail) && textInputRef.current) {
      const t = setTimeout(() => textInputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [panelOpen, micDenied, speechApiAvail])

  const voiceAvail = speechApiAvail && !micDenied
  const STATUS = {
    wake:   voiceAvail ? 'Say \u201cHey Custos\u201d' : 'Ask Custos AI',
    idle:   voiceAvail ? 'Tap mic to speak' : 'Type your question',
    flash:  'Activated!',
    listen: '',
    think:  'Thinking\u2026',
    speak:  'Speaking\u2026',
    error:  'Error',
  }
  const ORB_BG = {
    wake:   'linear-gradient(145deg,#60a5fa 0%,#2563EB 55%,#1a3fb8 100%)',
    idle:   'linear-gradient(145deg,#93c5fd 0%,#3b82f6 55%,#2563eb 100%)',
    flash:  'radial-gradient(circle at 35% 30%,#ffffff 0%,#93c5fd 40%,#2563eb 100%)',
    listen: 'linear-gradient(145deg,#f87171 0%,#ef4444 50%,#dc2626 100%)',
    think:  'linear-gradient(145deg,#818cf8 0%,#6366f1 50%,#4f46e5 100%)',
    speak:  'linear-gradient(145deg,#34d399 0%,#10b981 50%,#059669 100%)',
    error:  'linear-gradient(145deg,#f87171 0%,#ef4444 100%)',
  }
  const ORB_ANIM = {
    wake:   'wakeBreath 4s ease-in-out infinite',
    idle:   'none',
    flash:  'wakeFlash 0.6s ease-out forwards',
    listen: 'listenPulse 1.3s ease-in-out infinite',
    think:  'none', speak: 'speakGlow 1.5s ease-in-out infinite alternate', error: 'none',
  }
  const ORB_SHADOW = {
    wake:   '0 4px 24px rgba(37,99,235,0.30),inset 0 1px 0 rgba(255,255,255,0.30)',
    idle:   '0 4px 18px rgba(37,99,235,0.20),inset 0 1px 0 rgba(255,255,255,0.25)',
    flash:  '0 0 60px rgba(147,197,253,0.6)',
    listen: '0 4px 24px rgba(239,68,68,0.35),inset 0 1px 0 rgba(255,255,255,0.20)',
    think:  '0 4px 24px rgba(99,102,241,0.40),inset 0 1px 0 rgba(255,255,255,0.20)',
    speak:  '0 4px 24px rgba(16,185,129,0.35),inset 0 1px 0 rgba(255,255,255,0.20)',
    error:  '0 4px 24px rgba(239,68,68,0.30)',
  }
  const DOT_COLOR = {
    wake:'#2563EB', idle:'#3b82f6', flash:'#93c5fd',
    listen:'#ef4444', think:'#6366f1', speak:'#10b981', error:'#ef4444',
  }

  return (
    <>
      {panelOpen && (
        <div role="dialog" aria-label="Custos AI Assistant" className="ds-voice-panel" style={{
          position:'fixed', bottom:'5.75rem', right:'1.5rem', zIndex:9999,
          width:'min(380px,calc(100vw - 3rem))', borderRadius:'1.5rem', overflow:'hidden',
          background:'rgba(255,255,255,0.92)', backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
          border:'1px solid rgba(255,255,255,0.55)',
          boxShadow:'0 24px 60px rgba(0,0,0,0.14),0 4px 12px rgba(37,99,235,0.08),inset 0 1px 0 rgba(255,255,255,0.8)',
          animation:'vaSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Panel header */}
          <div className="ds-voice-panel-header" style={{
            padding:'0.875rem 1.25rem 0.75rem',
            background:'linear-gradient(135deg,rgba(37,99,235,0.07) 0%,rgba(96,165,250,0.04) 100%)',
            borderBottom:'1px solid rgba(99,150,222,0.14)',
            display:'flex', alignItems:'center', gap:'0.75rem',
          }}>
            <div style={{
              width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
              background: DOT_COLOR[phase] || '#2563EB',
              boxShadow:`0 0 0 3px ${DOT_COLOR[phase] || '#2563EB'}33`,
              animation:(phase==='listen'||phase==='think') ? 'dotPulse 1.2s ease-in-out infinite' : 'none',
            }}/>
            <span style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ds-text-primary)', flex:1 }}>
              Custos AI
            </span>
            <button onClick={closePanel} aria-label="Close"
              style={{ background:'rgba(99,150,222,0.10)', border:'none', borderRadius:'50%', width:'1.75rem', height:'1.75rem', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ds-text-muted)' }}>
              <Icon name="x" size={13}/>
            </button>
          </div>

          <div style={{ padding:'1rem 1.25rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.875rem' }}>

            {/* Tap-to-speak CTA — visible when idle and voice available */}
            {phase === 'idle' && voiceAvail && (
              <button
                onClick={startActiveListen}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem',
                  padding:'0.75rem 1.25rem', borderRadius:'1rem',
                  background:'linear-gradient(135deg,#2563EB,#1D4ED8)',
                  color:'#fff', border:'none', cursor:'pointer',
                  fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
                  fontWeight:700, fontSize:'0.875rem',
                  boxShadow:'0 4px 20px rgba(37,99,235,0.35)',
                  transition:'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(37,99,235,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(37,99,235,0.35)' }}
              >
                <Icon name="mic" size={18} style={{ color:'#fff' }}/>
                Tap to Speak
              </button>
            )}

            {/* Thinking indicator */}
            {phase==='think' && !aiResponse && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#6366f1', animation:'thinkDot 1.2s ease-in-out infinite', animationDelay:`${i*0.2}s` }}/>
                  ))}
                </div>
                <span style={{ fontSize:'0.8rem', color:'var(--ds-text-muted)', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>Thinking\u2026</span>
              </div>
            )}

            {/* User transcript */}
            {transcript && (
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--ds-text-muted)', marginBottom:'0.3rem', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>You said</div>
                <p style={{ margin:0, fontSize:'0.9rem', fontStyle:'italic', color:'var(--ds-text-primary)', fontWeight:600, lineHeight:1.55, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>"{transcript}"</p>
              </div>
            )}

            {/* Listening waveform */}
            {phase==='listen' && !transcript && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                <div style={{ display:'flex', gap:'3px', alignItems:'center', height:'22px' }}>
                  {[10,16,20,24,20,16,10,14,18,12].map((h,i)=>(
                    <div key={i} style={{ width:'3px', borderRadius:'99px', background:'#ef4444', height:`${h}px`, animation:'listenBar 0.6s ease-in-out infinite alternate', animationDelay:`${i*0.06}s` }}/>
                  ))}
                </div>
                <span style={{ fontSize:'0.8rem', color:'#ef4444', fontWeight:600, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>Listening...</span>
              </div>
            )}

            {/* AI response */}
            {aiResponse && (
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'#2563EB', marginBottom:'0.3rem', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>Custos</div>
                <p style={{ margin:0, fontSize:'0.9rem', color:'var(--ds-text-primary)', lineHeight:1.65, fontWeight:500, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>{aiResponse}</p>
              </div>
            )}

            {/* Error message */}
            {errorMsg && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                <p style={{ margin:0, fontSize:'0.82rem', color:'#dc2626', fontWeight:500, lineHeight:1.5, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", flex:1 }}>{errorMsg}</p>
                <button onClick={() => { setErrorMsg(''); setTranscript(''); setAiResponse('') }}
                  style={{ fontSize:'0.72rem', color:'#2563EB', fontWeight:700, background:'rgba(37,99,235,0.08)', border:'none', borderRadius:'0.5rem', padding:'0.28rem 0.55rem', cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
                  Clear
                </button>
              </div>
            )}

            {/* Text input — always visible when panel open */}
            <form onSubmit={handleTextSubmit} style={{ display:'flex', gap:'0.5rem' }}>
              <input
                ref={textInputRef}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder={voiceAvail ? 'Or type your question\u2026' : 'Type your question\u2026'}
                disabled={phase === 'think'}
                className="ds-voice-text-input"
                style={{
                  flex:1, padding:'0.55rem 0.875rem', borderRadius:'0.75rem',
                  border:'1.5px solid rgba(37,99,235,0.22)', outline:'none',
                  fontSize:'0.875rem', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
                  color:'var(--ds-text-primary)', background:'rgba(255,255,255,0.85)',
                  transition:'border-color 0.15s, background 0.15s',
                }}
                onFocus={e => e.target.style.borderColor='rgba(37,99,235,0.55)'}
                onBlur={e => e.target.style.borderColor='rgba(37,99,235,0.22)'}
              />
              <button
                type="submit"
                disabled={!textInput.trim() || phase === 'think'}
                style={{
                  padding:'0.55rem 1rem', borderRadius:'0.75rem',
                  background: textInput.trim() && phase !== 'think' ? '#2563EB' : 'rgba(37,99,235,0.18)',
                  color: textInput.trim() && phase !== 'think' ? '#fff' : 'var(--ds-text-muted)',
                  border:'none', cursor: textInput.trim() && phase !== 'think' ? 'pointer' : 'default',
                  fontWeight:700, fontSize:'0.8rem',
                  fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
                  transition:'all 0.15s', whiteSpace:'nowrap',
                }}
              >{phase === 'think' ? '\u2026' : 'Ask \u2192'}</button>
            </form>

            {micDenied && (
              <p style={{ margin:0, fontSize:'0.68rem', color:'var(--ds-text-muted)', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", textAlign:'center' }}>
                🎤 Mic blocked — type above or allow mic in browser settings
              </p>
            )}
          </div>
        </div>
      )}

      {/* Corner widget */}
      <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
        {/* Hint label */}
        {showHint && !panelOpen && (
          <div className="ds-voice-hint" style={{
            fontSize:'0.68rem', fontWeight:600, color:'var(--ds-text-primary)',
            fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
            whiteSpace:'nowrap',
            background:'rgba(255,255,255,0.97)', backdropFilter:'blur(8px)',
            padding:'0.25rem 0.7rem', borderRadius:'9999px',
            border:'1px solid rgba(37,99,235,0.30)',
            boxShadow:'0 4px 16px rgba(37,99,235,0.20)',
            animation:'vaFadeIn 0.5s ease-out',
          }}>
            {voiceAvail ? 'Say \u201cHey Custos\u201d' : 'Ask Custos AI'}
          </div>
        )}

        {/* Main orb */}
        <div style={{ position:'relative' }}>
          <button
            onClick={handleOrbClick}
            aria-label={phase==='listen'?'Stop listening':phase==='speak'?'Stop speaking':panelOpen?'Close Custos AI':'Open Custos AI'}
            title={STATUS[phase] || ''}
            style={{
              width:'64px', height:'64px', borderRadius:'50%',
              border:'2px solid rgba(255,255,255,0.50)',
              background: ORB_BG[phase] || ORB_BG.wake,
              backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
              cursor: phase==='think'?'wait':'pointer',
              position:'relative', overflow:'visible',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation: ORB_ANIM[phase] || 'none',
              boxShadow: ORB_SHADOW[phase] || ORB_SHADOW.wake,
            }}>
            {phase==='listen' && (<>
              <div style={{ position:'absolute', inset:'-10px', borderRadius:'50%', border:'2px solid rgba(239,68,68,0.45)', animation:'ripple 1.6s ease-out infinite' }}/>
              <div style={{ position:'absolute', inset:'-22px', borderRadius:'50%', border:'1.5px solid rgba(239,68,68,0.25)', animation:'ripple 1.6s ease-out infinite 0.45s' }}/>
              <div style={{ position:'absolute', inset:'-36px', borderRadius:'50%', border:'1px solid rgba(239,68,68,0.12)', animation:'ripple 1.6s ease-out infinite 0.9s' }}/>
            </>)}
            {phase==='think' && (
              <div style={{ position:'absolute', inset:'-4px', borderRadius:'50%', background:'conic-gradient(from 0deg,transparent 50%,rgba(99,102,241,0.8) 80%,rgba(165,180,252,1) 100%,transparent 100%)', animation:'thinkSpin 0.9s linear infinite' }}/>
            )}
            {phase==='speak' && (
              <div style={{ display:'flex', alignItems:'center', gap:'3.5px', height:'26px', position:'relative', zIndex:1 }}>
                {[6,14,20,26,20,14,6].map((h,i)=>(
                  <div key={i} style={{ width:'3px', borderRadius:'99px', background:'rgba(255,255,255,0.95)', height:`${h}px`, animation:'speakBar 0.55s ease-in-out infinite alternate', animationDelay:`${i*0.08}s` }}/>
                ))}
              </div>
            )}
            {(phase==='wake'||phase==='idle'||phase==='flash'||phase==='listen'||phase==='error') && (
              <Icon name={phase==='error'?'x': voiceAvail ? 'mic' : 'sparkles'} size={26} style={{ color:'rgba(255,255,255,0.95)', position:'relative', zIndex:1 }}/>
            )}
          </button>

          {/* "AI" badge */}
          <div style={{
            position:'absolute', top:'-4px', left:'-4px',
            background:'linear-gradient(135deg,#1D4ED8,#2563EB)',
            color:'#fff', fontSize:'0.55rem', fontWeight:800,
            letterSpacing:'0.06em', padding:'0.15rem 0.35rem',
            borderRadius:'9999px',
            border:'2px solid rgba(255,255,255,0.90)',
            boxShadow:'0 2px 8px rgba(37,99,235,0.35)',
            fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
            pointerEvents:'none', zIndex:1, lineHeight:1,
          }}>AI</div>
        </div>
      </div>

      <style>{`
        @keyframes vaSlideUp   { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes vaFadeIn    { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wakeBreath  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes wakeFlash   { 0%{transform:scale(1)} 35%{transform:scale(1.38)} 100%{transform:scale(1)} }
        @keyframes listenPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.09)} }
        @keyframes speakGlow   { from{box-shadow:0 4px 24px rgba(16,185,129,0.28),inset 0 1px 0 rgba(255,255,255,0.20)} to{box-shadow:0 8px 48px rgba(16,185,129,0.55),inset 0 1px 0 rgba(255,255,255,0.20)} }
        @keyframes ripple      { 0%{opacity:1;transform:scale(0.85)} 100%{opacity:0;transform:scale(1.65)} }
        @keyframes thinkSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dotPulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.72)} }
        @keyframes thinkDot    { 0%,80%,100%{transform:translateY(0);opacity:0.35} 40%{transform:translateY(-7px);opacity:1} }
        @keyframes speakBar    { 0%{transform:scaleY(0.22)} 100%{transform:scaleY(1)} }
        @keyframes listenBar   { 0%{transform:scaleY(0.30)} 100%{transform:scaleY(1)} }
      `}</style>
    </>
  )
}
