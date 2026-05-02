import { useState, useRef } from 'react'
import { Bar } from 'react-chartjs-2'
import Icon from './Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { runClaimsAnalysis } from '../utils/claimsModel'

const fmt = n => `$${Math.round(n).toLocaleString('en-US')}`
const fmtComma = n => n ? n.toLocaleString('en-US') : ''
const parseNum = str => Number(String(str).replace(/,/g, '')) || 0

const CONSTRUCTION_OPTIONS = [
  { value: 'wood-frame', labelKey: 'claims.constWood' },
  { value: 'concrete',   labelKey: 'claims.constConcrete' },
  { value: 'steel',      labelKey: 'claims.constSteel' },
  { value: 'masonry',    labelKey: 'claims.constMasonry' },
  { value: 'mixed',      labelKey: 'claims.constMixed' },
]

const SEVERITY_COLORS = {
  minor:    '#10B981',
  moderate: '#D97706',
  severe:   '#EA580C',
  total:    '#DC2626',
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function SeverityBadge({ severity, confidence, t }) {
  const color = SEVERITY_COLORS[severity] || 'var(--ds-text-muted)'
  return (
    <div className="text-center">
      <div
        className="inline-block px-5 py-2 rounded-lg text-white text-lg font-black"
        style={{ backgroundColor: color }}
      >
        {t(`claims.severity${severity.charAt(0).toUpperCase() + severity.slice(1)}`)}
      </div>
      <div className="mt-2 text-xs" style={{ color: 'var(--ds-text-muted)' }}>
        {t('claims.confidence')}: {Math.round(confidence * 100)}%
      </div>
      <div className="mt-1 mx-auto h-2 rounded-full overflow-hidden" style={{ width: '120px', backgroundColor: 'rgba(0,0,0,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${confidence * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function ClassProbBars({ classProbs, t }) {
  const classes = [
    { key: 'minor',    labelKey: 'claims.severityMinor',    color: '#10B981' },
    { key: 'moderate', labelKey: 'claims.severityModerate', color: '#D97706' },
    { key: 'severe',   labelKey: 'claims.severitySevere',   color: '#EA580C' },
    { key: 'total',    labelKey: 'claims.severityTotal',    color: '#DC2626' },
  ]
  return (
    <div className="space-y-2">
      {classes.map(c => {
        const pct = Math.round((classProbs[c.key] || 0) * 100)
        return (
          <div key={c.key} className="flex items-center gap-2">
            <div className="text-xs w-20 text-right font-semibold" style={{ color: 'var(--ds-text-secondary)' }}>
              {t(c.labelKey)}
            </div>
            <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
              <div
                className="h-full rounded transition-all"
                style={{ width: `${pct}%`, backgroundColor: c.color }}
              />
            </div>
            <div className="text-xs w-10 tabular-nums font-bold" style={{ color: c.color }}>
              {pct}%
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CostCard({ label, value, sub, color }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--ds-surface)', border: '1px solid var(--ds-border)' }}>
      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--ds-text-muted)' }}>{label}</div>
      <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>{sub}</div>}
    </div>
  )
}

function IndicatorDots({ indicators, t }) {
  const items = [
    { key: 'fire',     label: t('claims.indFire'),    color: '#EF4444' },
    { key: 'water',    label: t('claims.indWater'),   color: '#3B82F6' },
    { key: 'darkness', label: t('claims.indStruct'),  color: '#6B7280' },
    { key: 'texture',  label: t('claims.indDebris'),  color: '#D97706' },
    { key: 'variance', label: t('claims.indComplex'), color: '#8B5CF6' },
  ]
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(it => {
        const val = indicators[it.key] || 0
        const pct = Math.round(val * 100)
        return (
          <div key={it.key} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: it.color, opacity: 0.3 + val * 0.7 }}
            />
            <span>{it.label}</span>
            <span className="tabular-nums font-semibold" style={{ color: pct > 30 ? it.color : 'var(--ds-text-muted)' }}>
              {pct}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────

export default function ClaimsEstimator({ inputs, fullPage = false }) {
  const { t } = useLanguage()
  const fileInputRef = useRef(null)
  const [expanded, setExpanded] = useState(fullPage)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [propertyDetails, setPropertyDetails] = useState({
    squareFootage: 1500,
    constructionType: 'wood-frame',
    homeAge: 20,
    deductible: 1000,
  })

  const homeValue = inputs.homeValue || 0
  const insuranceCoverage = inputs.homeInsuranceCoverage || 0

  function handleFiles(newFiles) {
    const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return

    const combined = [...files, ...imageFiles].slice(0, 5)
    const urls = combined.map(f => URL.createObjectURL(f))

    // Revoke old URLs
    previews.forEach(u => URL.revokeObjectURL(u))

    setFiles(combined)
    setPreviews(urls)
    setResults(null)
    setError(null)
  }

  function removeImage(index) {
    URL.revokeObjectURL(previews[index])
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setFiles(newFiles)
    setPreviews(newPreviews)
    setResults(null)
  }

  function clearAll() {
    previews.forEach(u => URL.revokeObjectURL(u))
    setFiles([])
    setPreviews([])
    setResults(null)
  }

  async function handleAnalyze() {
    if (!files.length || homeValue <= 0) return
    setLoading(true)
    setError(null)

    try {
      const imageElements = await Promise.all(
        previews.map(url => new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error('Failed to load image'))
          img.src = url
        }))
      )

      const analysisResults = await runClaimsAnalysis(
        imageElements,
        { ...propertyDetails, homeValue },
        insuranceCoverage,
      )
      setResults(analysisResults)
    } catch (err) {
      console.error('Claims analysis error:', err)
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function updateDetail(key, value) {
    setPropertyDetails(prev => ({ ...prev, [key]: value }))
    setResults(null)
  }

  // ── Collapsed: just show the button ─────────────────────────────────
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-xl overflow-hidden text-left transition-all hover:shadow-lg"
        style={{
          backgroundColor: 'var(--ds-surface)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
          border: '1px solid var(--ds-border)',
        }}
      >
        <div className="px-6 py-5 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
          >
            <Icon name="camera" size={24} style={{ color: '#fff' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold" style={{ color: 'var(--ds-text-primary)' }}>
              {t('claims.buttonTitle')}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
              {t('claims.buttonSubtitle')}
            </p>
          </div>
          <Icon name="arrowRight" size={20} style={{ color: '#059669' }} />
        </div>
      </button>
    )
  }

  // ── Expanded: full estimator UI ─────────────────────────────────────
  const canAnalyze = files.length > 0 && homeValue > 0 && !loading

  // Histogram chart data for per-image scores
  const perImageData = results ? {
    labels: results.perImageAnalyses.map((_, i) => `${t('claims.image')} ${i + 1}`),
    datasets: [{
      label: 'Damage Score',
      data: results.perImageAnalyses.map(a => Math.round(a.damageScore * 100)),
      backgroundColor: results.perImageAnalyses.map(a => SEVERITY_COLORS[a.severity]),
      borderRadius: 4,
      borderSkipped: false,
    }],
  } : null

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw}%` } } },
    scales: {
      y: { min: 0, max: 100, ticks: { callback: v => `${v}%`, font: { size: 10 }, color: 'var(--ds-text-muted)' }, grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false } },
      x: { ticks: { font: { size: 10 }, color: 'var(--ds-text-muted)' }, grid: { display: false } },
    },
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--ds-surface)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
        border: '1px solid var(--ds-border)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--ds-border)', backgroundColor: 'var(--ds-surface-secondary)' }}
      >
        <div>
          <h2 className="dg-label" style={{ color: 'var(--ds-text-primary)', fontSize: '0.75rem' }}>
            {t('claims.title')}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
            {t('claims.subtitle')}
          </p>
        </div>
        {!fullPage && (
          <button
            onClick={() => { setExpanded(false); clearAll() }}
            className="text-xs font-bold"
            style={{ color: 'var(--ds-text-muted)' }}
          >
            <><Icon name="x" size={12} /> {t('claims.close')}</>
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Upload area */}
        <div
          className="rounded-lg p-6 text-center cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragOver ? '#10B981' : 'var(--ds-border)'}`,
            backgroundColor: dragOver ? 'rgba(16,185,129,0.05)' : 'var(--ds-surface-secondary)',
          }}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
          onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
          onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }}
          onDrop={e => {
            e.preventDefault(); e.stopPropagation(); setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
          />
          <div className="mb-2"><Icon name="camera" size={32} /></div>
          <p className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
            {t('claims.dropzone')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--ds-text-muted)' }}>
            {t('claims.dropzoneSub')}
          </p>
        </div>

        {/* Image previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((url, i) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt={`Upload ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                  style={{ border: '1px solid var(--ds-border)' }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg flex items-center justify-center text-xl"
                style={{ border: '2px dashed var(--ds-border)', color: 'var(--ds-text-muted)' }}
              >
                +
              </button>
            )}
          </div>
        )}

        {/* Property details form */}
        {previews.length > 0 && (
          <div
            className="rounded-lg p-4 space-y-3"
            style={{ backgroundColor: 'var(--ds-surface-secondary)', border: '1px solid var(--ds-border)' }}
          >
            <span className="dg-label" style={{ fontSize: '0.7rem' }}>{t('claims.propertyDetails')}</span>

            <div className="grid grid-cols-2 gap-3">
              {/* Square footage */}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ds-text-secondary)' }}>
                  {t('claims.sqft')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={fmtComma(propertyDetails.squareFootage)}
                  onChange={e => updateDetail('squareFootage', parseNum(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md text-sm"
                  style={{ border: '1px solid var(--ds-border)', outline: 'none', background: 'var(--ds-bg)', color: 'var(--ds-text-primary)' }}
                />
              </div>

              {/* Home age */}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ds-text-secondary)' }}>
                  {t('claims.homeAge')}
                </label>
                <input
                  type="number"
                  value={propertyDetails.homeAge}
                  onChange={e => updateDetail('homeAge', Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-md text-sm"
                  style={{ border: '1px solid var(--ds-border)', outline: 'none', background: 'var(--ds-bg)', color: 'var(--ds-text-primary)' }}
                />
              </div>

              {/* Construction type */}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ds-text-secondary)' }}>
                  {t('claims.constructionType')}
                </label>
                <select
                  value={propertyDetails.constructionType}
                  onChange={e => updateDetail('constructionType', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md text-sm"
                  style={{ border: '1px solid var(--ds-border)', outline: 'none', backgroundColor: 'var(--ds-bg)', color: 'var(--ds-text-primary)' }}
                >
                  {CONSTRUCTION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                  ))}
                </select>
              </div>

              {/* Deductible */}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ds-text-secondary)' }}>
                  {t('claims.deductible')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={fmtComma(propertyDetails.deductible)}
                  onChange={e => updateDetail('deductible', parseNum(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md text-sm"
                  style={{ border: '1px solid var(--ds-border)', outline: 'none', background: 'var(--ds-bg)', color: 'var(--ds-text-primary)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analyze button */}
        {previews.length > 0 && (
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full py-3 rounded-lg text-white font-bold text-sm transition-all"
            style={{
              background: canAnalyze ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : '#D1D5DB',
              cursor: canAnalyze ? 'pointer' : 'not-allowed',
              opacity: canAnalyze ? 1 : 0.7,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('claims.analyzing')}
              </span>
            ) : (
              t('claims.analyzeButton')
            )}
          </button>
        )}

        {homeValue <= 0 && previews.length > 0 && (
          <p className="text-xs text-center" style={{ color: '#DC2626' }}>
            {t('claims.needHomeValue')}
          </p>
        )}

        {error && (
          <div className="rounded-lg p-3 text-sm text-center" style={{ backgroundColor: '#FEF2F2', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* ═══════════════ RESULTS ═══════════════ */}
        {results && (
          <div className="space-y-4 pt-2" style={{ borderTop: '2px solid rgba(16,185,129,0.2)' }}>

            {/* Severity classification */}
            <div className="rounded-lg p-4" style={{ border: '1px solid var(--ds-border)' }}>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <SeverityBadge
                    severity={results.damageAnalysis.severity}
                    confidence={results.damageAnalysis.confidence}
                    t={t}
                  />
                </div>
                <div className="flex-1 w-full">
                  <ClassProbBars classProbs={results.damageAnalysis.classProbs} t={t} />
                </div>
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--ds-text-secondary)' }}>
                  {t('claims.detectedIndicators')}
                </div>
                <IndicatorDots indicators={results.damageAnalysis.indicators} t={t} />
              </div>
            </div>

            {/* Cost estimation cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <CostCard
                label={t('claims.repairCost')}
                value={fmt(results.repairCost.predicted)}
                sub={`${fmt(results.repairCost.low)} – ${fmt(results.repairCost.high)}`}
                color="#DC2626"
              />
              <CostCard
                label={t('claims.insurancePayout')}
                value={fmt(results.insuranceImpact.payout)}
                sub={t('claims.afterDeductible', { d: fmt(results.insuranceImpact.deductible) })}
                color="#10B981"
              />
              <CostCard
                label={t('claims.outOfPocket')}
                value={fmt(results.insuranceImpact.outOfPocket)}
                color={results.insuranceImpact.outOfPocket > 0 ? '#DC2626' : '#10B981'}
              />
              <CostCard
                label={t('claims.coverageGap')}
                value={results.insuranceImpact.gap > 0 ? fmt(results.insuranceImpact.gap) : '—'}
                sub={results.insuranceImpact.isUnderinsured ? t('claims.underinsured') : t('claims.adequate')}
                color={results.insuranceImpact.isUnderinsured ? '#DC2626' : '#10B981'}
              />
            </div>

            {/* Visual coverage bar */}
            <div className="rounded-lg p-3" style={{ border: '1px solid var(--ds-border)' }}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--ds-text-secondary)' }} className="font-semibold">{t('claims.coverageVsCost')}</span>
                <span className="tabular-nums" style={{ color: 'var(--ds-text-muted)' }}>
                  {fmt(insuranceCoverage)} / {fmt(results.repairCost.predicted)}
                </span>
              </div>
              <div className="relative h-6 rounded-md overflow-hidden" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                <div
                  className="absolute top-0 left-0 h-full transition-all"
                  style={{
                    width: `${Math.min(100, results.repairCost.predicted > 0
                      ? (insuranceCoverage / results.repairCost.predicted) * 100 : 0)}%`,
                    backgroundColor: '#10B981',
                    opacity: 0.8,
                  }}
                />
                <div className="absolute inset-0 flex items-center px-2 text-xs font-semibold">
                  {insuranceCoverage > 0 && (
                    <span style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                      {fmt(insuranceCoverage)}
                    </span>
                  )}
                  {results.insuranceImpact.gap > 0 && (
                    <span className="ml-auto" style={{ color: '#991B1B' }}>
                      {t('claims.gapLabel')}: {fmt(results.insuranceImpact.gap)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981', opacity: 0.8 }} />
                  <span style={{ color: 'var(--ds-text-secondary)' }}>{t('claims.covered')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }} />
                  <span style={{ color: 'var(--ds-text-secondary)' }}>{t('claims.uncovered')}</span>
                </div>
              </div>
            </div>

            {/* Per-image chart (if multiple images) */}
            {results.perImageAnalyses.length > 1 && perImageData && (
              <div className="rounded-lg p-3" style={{ border: '1px solid var(--ds-border)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--ds-text-secondary)' }}>
                  {t('claims.perImageTitle')}
                </div>
                <div style={{ height: '120px' }}>
                  <Bar data={perImageData} options={chartOpts} />
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: `1px solid ${results.insuranceImpact.isUnderinsured
                  ? 'rgba(220,38,38,0.18)' : 'rgba(16,185,129,0.18)'}`,
              }}
            >
              <div
                className="px-4 py-2.5"
                style={{
                  backgroundColor: results.insuranceImpact.isUnderinsured ? 'rgba(239,68,68,0.10)' : 'rgba(16,185,129,0.10)',
                  borderBottom: `2px solid ${results.insuranceImpact.isUnderinsured ? 'var(--ds-danger)' : 'var(--ds-positive)'}`,
                }}
              >
                <span className="dg-label" style={{
                  color: results.insuranceImpact.isUnderinsured ? 'var(--ds-danger)' : 'var(--ds-positive)',
                  fontSize: '0.7rem',
                }}>
                  {t('claims.recommendation')}
                </span>
              </div>
              <div className="px-4 py-3" style={{ backgroundColor: 'var(--ds-surface)' }}>
                <div className="flex gap-3">
                  <span className="text-xl mt-0.5 shrink-0">
                    <Icon name={results.insuranceImpact.isUnderinsured ? 'warning' : 'checkCircle'} size={24} />
                  </span>
                  <div>
                    <p className="text-sm font-bold mb-0.5" style={{
                      color: results.insuranceImpact.isUnderinsured ? 'var(--ds-danger)' : 'var(--ds-positive)',
                    }}>
                      {results.insuranceImpact.isUnderinsured
                        ? t('claims.recUnderinsured')
                        : t('claims.recAdequate')}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--ds-text-secondary)' }}>
                      {results.insuranceImpact.isUnderinsured
                        ? t('claims.recUnderinsuredText', {
                          recommended: fmt(results.insuranceImpact.recommendedCoverage),
                          gap: fmt(results.insuranceImpact.gap),
                        })
                        : t('claims.recAdequateText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Model info */}
            <div className="text-xs text-center" style={{ color: 'var(--ds-text-muted)' }}>
              {t('claims.modelInfo', { images: results.damageAnalysis.imageCount })} ·{' '}
              {results.damageAnalysis.modelType === 'cnn' ? 'CNN' : t('claims.fallbackModel')}
            </div>

            {/* Disclaimer */}
            <div
              className="rounded-lg p-3 text-xs leading-relaxed"
              style={{ backgroundColor: 'var(--ds-surface-secondary)', border: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)' }}
            >
              {t('claims.disclaimer')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
