import { useState, useRef, useCallback } from 'react'

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

const glass = {
  background: 'rgba(250,252,255,0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(99,150,222,0.18)',
  borderRadius: '1rem',
  padding: '1.5rem',
}

export default function DamagePhotoAnalyzer() {
  const [photo, setPhoto] = useState(null)       // { dataUrl, file }
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setPhoto({ dataUrl: e.target.result, file })
    reader.readAsDataURL(file)
    setResult(null)
    setError(null)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }, [processFile])

  const analyzePhoto = useCallback(async () => {
    if (!photo) return
    setLoading(true)
    setError(null)
    setResult(null)

    const base64 = photo.dataUrl.split(',')[1]
    const mimeType = photo.dataUrl.split(';')[0].split(':')[1]

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Custos',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              {
                type: 'text',
                text: `You are an expert insurance claims adjuster AI for Custos disaster risk platform.
Analyze this damage photo and draft a formal insurance claim document.

Structure your response EXACTLY as follows (use these exact headings):

## DAMAGE ASSESSMENT
Describe what you see: type of damage, extent, affected areas/items.

## ESTIMATED DAMAGE CATEGORIES
List each damaged category with estimated severity:
- Structural damage: [None/Minor/Moderate/Severe/Total loss]
- Contents damage: [None/Minor/Moderate/Severe/Total loss]  
- Water/fire/weather damage: [None/Minor/Moderate/Severe/Total loss]
- Vehicle damage (if visible): [None/Minor/Moderate/Severe/N/A]

## CLAIM NARRATIVE
Write a formal 2-3 sentence claim narrative suitable for submission to an insurance company.

## RECOMMENDED NEXT STEPS
1. [Step 1]
2. [Step 2]
3. [Step 3]

## DOCUMENTATION CHECKLIST
List 5 items the homeowner should document/gather for this claim type.`,
              },
            ],
          }],
          max_tokens: 900,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      setResult(data.choices?.[0]?.message?.content || 'No response received.')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [photo])

  const copyResult = useCallback(() => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  // Parse sections from markdown
  const sections = result ? result.split(/^## /m).filter(Boolean).map(s => {
    const [title, ...body] = s.split('\n')
    return { title: title.trim(), body: body.join('\n').trim() }
  }) : []

  return (
    <div style={{ ...glass, marginBottom: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '0.6rem',
            background: 'linear-gradient(135deg, #2563EB, #1A3DBE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>📸</div>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.3rem', fontWeight: 700, color: '#1A3558', margin: 0 }}>
              AI Damage Photo Analyzer
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', color: '#5B7FA5', margin: 0 }}>
              Upload a damage photo → AI auto-drafts your insurance claim
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: photo ? '1fr 1fr' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Upload zone */}
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#2563EB' : 'rgba(99,150,222,0.40)'}`,
              borderRadius: '0.875rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'rgba(37,99,235,0.04)' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {photo ? (
              <img
                src={photo.dataUrl}
                alt="Damage photo"
                style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '0.5rem' }}
              />
            ) : (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏚️</div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#3D5A80', margin: '0 0 0.25rem' }}>
                  <strong>Drop a damage photo here</strong>
                </p>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', color: '#5B7FA5', margin: 0 }}>
                  or click to browse · JPG, PNG, WebP
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => processFile(e.target.files[0])}
            />
          </div>

          {photo && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.625rem' }}>
              <button
                onClick={analyzePhoto}
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? 'rgba(37,99,235,0.5)' : '#0C1A2E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.7rem 1.25rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Analyzing…
                  </>
                ) : '🔍 Analyze & Draft Claim'}
              </button>
              <button
                onClick={() => { setPhoto(null); setResult(null); setError(null) }}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#EF4444',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '9999px',
                  padding: '0.7rem 1rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.625rem' }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: '#DC2626', margin: 0 }}>⚠ {error}</p>
            </div>
          )}
        </div>

        {/* Results panel */}
        {(loading || sections.length > 0) && (
          <div>
            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(37,99,235,0.2)', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#3D5A80' }}>AI is analyzing your damage…</p>
              </div>
            )}

            {sections.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    ✓ Claim Draft Ready
                  </span>
                  <button
                    onClick={copyResult}
                    style={{
                      background: 'rgba(37,99,235,0.08)',
                      border: '1px solid rgba(37,99,235,0.18)',
                      borderRadius: '9999px',
                      padding: '0.3rem 0.75rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#2563EB',
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {sections.map((sec, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(99,150,222,0.14)', borderRadius: '0.75rem', padding: '0.875rem' }}>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.375rem' }}>
                        {sec.title}
                      </p>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.825rem', color: '#1A3558', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                        {sec.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
