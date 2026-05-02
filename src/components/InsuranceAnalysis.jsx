import { useState, useEffect, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { useLanguage } from '../i18n/LanguageContext'
import { runFullAnalysis } from '../utils/insuranceOptimizer'
import { FEMA_HAZARD_MAP } from '../data/cities'
import Icon from './Icon'

const fmt = n => `$${Math.round(n).toLocaleString('en-US')}`

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function ScoreCard({ label, value, desc, color }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ backgroundColor: 'var(--ds-surface)', border: '1px solid var(--ds-border)' }}
    >
      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--ds-text-muted)' }}>{label}</div>
      <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
      {desc && <div className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>{desc}</div>}
    </div>
  )
}

function ComparisonRow({ label, current, optimal, delta, deltaColor }) {
  return (
    <div className="grid grid-cols-4 gap-2 py-2 px-3 text-sm" style={{ borderBottom: '1px solid var(--ds-border)' }}>
      <div className="font-semibold" style={{ color: 'var(--ds-text-secondary)' }}>{label}</div>
      <div className="text-right tabular-nums" style={{ color: 'var(--ds-text-primary)' }}>{current}</div>
      <div className="text-right tabular-nums" style={{ color: 'var(--ds-text-primary)' }}>{optimal}</div>
      <div className="text-right tabular-nums font-bold" style={{ color: deltaColor }}>{delta}</div>
    </div>
  )
}

function RecommendationItem({ rec, t }) {
  const isIncrease = rec.type === 'increase'
  const isDecrease = rec.type === 'decrease'

  const icon = isIncrease ? 'arrowUp' : isDecrease ? 'arrowDown' : 'checkCircle'
  const borderColor = isIncrease ? 'rgba(220,38,38,0.2)' : isDecrease ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'
  const bgColor = isIncrease ? 'rgba(254,242,242,0.5)' : isDecrease ? 'rgba(255,251,235,0.5)' : 'rgba(236,253,245,0.5)'
  const textColor = isIncrease ? '#991B1B' : isDecrease ? '#92400E' : '#065F46'

  const assetLabel = rec.asset === 'car' ? t('insurance.assetCar')
    : rec.asset === 'renter' ? t('insurance.assetRenter')
    : t('insurance.assetHome')

  const title = isIncrease
    ? (rec.reason === 'noCoverage' ? t('insurance.recNoCoverage', { asset: assetLabel }) : t('insurance.recUnderinsured', { asset: assetLabel }))
    : isDecrease
      ? t('insurance.recOverinsured', { asset: assetLabel })
      : t('insurance.wellOptimized')

  const detail = isIncrease
    ? t('insurance.recIncrease', { amount: fmt(rec.amount), current: fmt(rec.currentCoverage), optimal: fmt(rec.optimalCoverage) })
    : isDecrease
      ? t('insurance.recDecrease', { amount: fmt(rec.amount), savings: fmt(rec.estimatedSavings) })
      : t('insurance.wellOptimizedText')

  const priorityLabel = rec.priority === 'high' ? t('insurance.priorityHigh')
    : rec.priority === 'medium' ? t('insurance.priorityMedium')
    : t('insurance.priorityLow')
  const priorityColor = rec.priority === 'high' ? '#DC2626' : rec.priority === 'medium' ? '#D97706' : '#059669'

  return (
    <div className="px-4 py-3" style={{ backgroundColor: bgColor, borderBottom: `1px solid ${borderColor}` }}>
      <div className="flex gap-3">
        <Icon name={icon} size={20} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold" style={{ color: textColor }}>{title}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-semibold"
              style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}
            >
              {priorityLabel}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ds-text-secondary)' }}>{detail}</p>
          {rec.estimatedSavings > 0 && (
            <p className="text-xs mt-1 font-semibold" style={{ color: '#059669' }}>
              {t('insurance.potentialSavings')}: {fmt(rec.estimatedSavings)}/yr
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function HazardRow({ h, t }) {
  const adequacyColor = h.adequacy >= 100 ? '#059669' : h.adequacy >= 50 ? '#D97706' : '#DC2626'
  const barWidth = Math.min(100, h.adequacy)
  const hazardInfo = FEMA_HAZARD_MAP[h.code]

  return (
    <div className="flex items-center gap-3 py-2 px-3" style={{ borderBottom: '1px solid var(--ds-border)' }}>
      <Icon name={hazardInfo?.icon || 'warning'} size={20} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold truncate" style={{ color: 'var(--ds-text-primary)' }}>
            {h.name || hazardInfo?.name || h.code}
          </span>
          <span className="text-xs tabular-nums ml-2 shrink-0" style={{ color: 'var(--ds-text-muted)' }}>
            {(h.probability * 100).toFixed(1)}% {t('insurance.annualProb')}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--ds-border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${barWidth}%`, backgroundColor: adequacyColor }}
            />
          </div>
          <span className="text-xs tabular-nums font-semibold shrink-0" style={{ color: adequacyColor }}>
            {Math.round(h.adequacy)}%
          </span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
          {t('insurance.expectedLoss')}: {fmt(h.expectedLoss)}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────

export default function InsuranceAnalysis({ zipData, inputs, results, effectiveHazard }) {
  const { t } = useLanguage()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailExpanded, setDetailExpanded] = useState(false)

  // Stable key to avoid re-running on every render
  const analysisKey = useMemo(() => {
    if (!zipData || !results) return null
    return JSON.stringify({
      zip: zipData.zip,
      hv: inputs.homeValue,
      cv: inputs.carValue,
      hic: inputs.homeInsuranceCoverage,
      cic: inputs.carInsuranceCoverage,
      ot: inputs.ownershipType,
      ef: inputs.exposureFactor,
      vf: inputs.vulnerabilityFactor,
      eh: effectiveHazard?.code,
      er: effectiveHazard?.rating,
    })
  }, [zipData, inputs, results, effectiveHazard])

  useEffect(() => {
    if (!analysisKey || !zipData || !results) {
      setAnalysis(null)
      return
    }
    let cancelled = false
    setLoading(true)
    runFullAnalysis(zipData, inputs, results).then(result => {
      if (!cancelled) {
        setAnalysis(result)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [analysisKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!zipData || !results) return null

  if (loading && !analysis) {
    return (
      <div
        className="rounded-xl overflow-hidden p-8 text-center"
        style={{
          backgroundColor: 'var(--ds-surface)',
          boxShadow: '0 2px 10px rgba(37, 99, 235, 0.07)',
          border: '1px solid var(--ds-border)',
        }}
      >
        <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm" style={{ color: 'var(--ds-text-secondary)' }}>{t('insurance.aiTraining')}</p>
      </div>
    )
  }

  if (!analysis) return null

  const { overallScore, gapAnalysis, recommendations, mcResults, optimalResult, aiPrediction } = analysis
  const scoreColor = overallScore >= 70 ? '#059669' : overallScore >= 40 ? '#D97706' : '#DC2626'
  const allWellOptimized = gapAnalysis.homeStatus === 'wellOptimized' && gapAnalysis.carStatus === 'wellOptimized'
  const aiAvailable = !!aiPrediction

  // ── Monte Carlo histogram chart data ────────────────────────────
  const histogramData = {
    labels: mcResults.histogramLabels.map(v => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`),
    datasets: [{
      label: 'Frequency',
      data: mcResults.histogram,
      backgroundColor: 'rgba(16,185,129,0.6)',
      borderRadius: 2,
      borderSkipped: false,
    }],
  }
  const histogramOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} scenarios` } } },
    scales: {
      y: {
        ticks: { font: { size: 10 }, color: '#5B7FA5' },
        grid: { color: 'rgba(99,150,222,0.10)' },
        border: { display: false },
      },
      x: {
        ticks: { font: { size: 9 }, color: '#5B7FA5', maxRotation: 45 },
        grid: { display: false },
      },
    },
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--ds-surface)',
        boxShadow: '0 2px 10px rgba(37, 99, 235, 0.07)',
        border: '1px solid var(--ds-border)',
      }}
    >
      {/* A) Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--ds-border)", backgroundColor: "var(--ds-surface-secondary)" }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="dg-label" style={{ color: 'var(--ds-text-primary)', fontSize: '0.75rem' }}>
              {t('insurance.title')}
            </h2>
            {aiAvailable && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#059669' }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#059669' }} />
                AI Model
              </span>
            )}
            {!aiAvailable && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--ds-text-muted)' }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--ds-text-muted)' }} />
                {t('insurance.aiFallback')}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
            {t('insurance.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xs font-semibold" style={{ color: 'var(--ds-text-muted)' }}>{t('insurance.overallScore')}</div>
            <div
              className="text-2xl font-black tabular-nums"
              style={{ color: scoreColor }}
            >
              {overallScore}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* B) Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ScoreCard
            label={t('insurance.premiumEfficiency')}
            value={`${Math.round(gapAnalysis.premiumEfficiency)}%`}
            desc={t('insurance.premiumEfficiencyDesc')}
            color={gapAnalysis.premiumEfficiency >= 70 ? '#059669' : gapAnalysis.premiumEfficiency >= 40 ? '#D97706' : '#DC2626'}
          />
          <ScoreCard
            label={t('insurance.riskExposure')}
            value={Math.round(gapAnalysis.riskExposureIndex)}
            desc={t('insurance.riskExposureDesc')}
            color={gapAnalysis.riskExposureIndex <= 30 ? '#059669' : gapAnalysis.riskExposureIndex <= 60 ? '#D97706' : '#DC2626'}
          />
          <ScoreCard
            label={t('insurance.coverageGap')}
            value={fmt(gapAnalysis.totalGap)}
            desc={t('insurance.coverageGapDesc')}
            color={gapAnalysis.totalGap === 0 ? '#059669' : '#DC2626'}
          />
          <ScoreCard
            label={t('insurance.potentialSavings')}
            value={fmt(Math.max(0, optimalResult.expectedSavings))}
            desc={t('insurance.potentialSavingsDesc')}
            color="#059669"
          />
        </div>

        {/* B2) AI Risk Prediction */}
        {aiAvailable && (
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--ds-accent)' }}>{t('insurance.aiPrediction')}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <div className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>{t('insurance.aiVsActuarial')}</div>
                <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--ds-text-primary)' }}>
                  AI: {fmt(aiPrediction.predictedHomeLoss + aiPrediction.predictedCarLoss)}
                </div>
                <div className="text-sm tabular-nums" style={{ color: 'var(--ds-text-secondary)' }}>
                  Actuarial: {fmt(mcResults.mean)}
                </div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--ds-text-muted)' }}>{t('insurance.aiConfidence')}</div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--ds-border)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(aiPrediction.riskConfidence * 100)}%`,
                      backgroundColor: aiPrediction.riskConfidence > 0.7 ? '#059669' : '#D97706',
                    }}
                  />
                </div>
                <div className="text-xs mt-0.5 tabular-nums" style={{ color: 'var(--ds-text-secondary)' }}>
                  {Math.round(aiPrediction.riskConfidence * 100)}%
                </div>
              </div>
            </div>
            <div className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>
              {t('insurance.aiModelInfo')}
            </div>
          </div>
        )}

        {/* C) Current vs Optimal Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--ds-border)' }}
        >
          <div className="px-3 py-2" style={{ backgroundColor: 'var(--ds-surface-secondary)', borderBottom: '1px solid var(--ds-border)' }}>
            <span className="dg-label" style={{ fontSize: '0.7rem' }}>{t('insurance.comparison')}</span>
          </div>
          {/* Header row */}
          <div className="grid grid-cols-4 gap-2 py-2 px-3 text-xs font-semibold" style={{ color: 'var(--ds-text-muted)', borderBottom: '1px solid var(--ds-border)' }}>
            <div></div>
            <div className="text-right">{t('insurance.current')}</div>
            <div className="text-right">{t('insurance.optimal')}</div>
            <div className="text-right">{t('insurance.delta')}</div>
          </div>
          <ComparisonRow
            label={t('insurance.homeCoverage')}
            current={fmt(inputs.homeInsuranceCoverage || 0)}
            optimal={fmt(optimalResult.optimalHomeCoverage)}
            delta={(() => {
              const d = optimalResult.optimalHomeCoverage - (inputs.homeInsuranceCoverage || 0)
              return d > 0 ? `+${fmt(d)}` : d < 0 ? `-${fmt(Math.abs(d))}` : '—'
            })()}
            deltaColor={
              gapAnalysis.homeStatus === 'wellOptimized' ? '#059669'
              : gapAnalysis.homeStatus === 'underInsured' ? '#DC2626'
              : '#D97706'
            }
          />
          <ComparisonRow
            label={t('insurance.carCoverage')}
            current={fmt(inputs.carInsuranceCoverage || 0)}
            optimal={fmt(optimalResult.optimalCarCoverage)}
            delta={(() => {
              const d = optimalResult.optimalCarCoverage - (inputs.carInsuranceCoverage || 0)
              return d > 0 ? `+${fmt(d)}` : d < 0 ? `-${fmt(Math.abs(d))}` : '—'
            })()}
            deltaColor={
              gapAnalysis.carStatus === 'wellOptimized' ? '#059669'
              : gapAnalysis.carStatus === 'underInsured' ? '#DC2626'
              : '#D97706'
            }
          />
          <ComparisonRow
            label={t('insurance.estPremium')}
            current={fmt(gapAnalysis.currentHomePremium + gapAnalysis.currentCarPremium)}
            optimal={fmt(optimalResult.optimalHomePremium + optimalResult.optimalCarPremium)}
            delta={(() => {
              const d = (optimalResult.optimalHomePremium + optimalResult.optimalCarPremium) - (gapAnalysis.currentHomePremium + gapAnalysis.currentCarPremium)
              return d > 0 ? `+${fmt(d)}` : d < 0 ? `-${fmt(Math.abs(d))}` : '—'
            })()}
            deltaColor="var(--ds-text-secondary)"
          />
        </div>

        {/* D) Recommendations */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--ds-border)' }}
        >
          <div className="px-3 py-2" style={{ backgroundColor: 'var(--ds-surface-secondary)', borderBottom: '1px solid var(--ds-border)' }}>
            <span className="dg-label" style={{ fontSize: '0.7rem' }}>{t('insurance.recommendations')}</span>
          </div>
          {recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <RecommendationItem key={`${rec.asset}-${rec.type}-${i}`} rec={rec} t={t} />
            ))
          ) : allWellOptimized ? (
            <div className="px-4 py-3" style={{ backgroundColor: 'rgba(236,253,245,0.5)' }}>
              <div className="flex gap-3">
                <Icon name="checkCircle" size={20} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#059669' }}>{t('insurance.wellOptimized')}</p>
                  <p className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>{t('insurance.wellOptimizedText')}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Toggle for detailed analysis */}
        <button
          onClick={() => setDetailExpanded(e => !e)}
          className="w-full text-center text-xs font-bold py-2"
          style={{ color: 'var(--ds-accent)' }}
        >
          {detailExpanded ? `▲ ${t('insurance.hideDetail')}` : `▼ ${t('insurance.showDetail')}`}
        </button>

        {detailExpanded && (
          <div className="space-y-4">
            {/* E) Monte Carlo Histogram */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--ds-border)' }}
            >
              <div className="px-3 py-2" style={{ backgroundColor: 'var(--ds-surface-secondary)', borderBottom: '1px solid var(--ds-border)' }}>
                <span className="dg-label" style={{ fontSize: '0.7rem' }}>{t('insurance.mcTitle')}</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>{t('insurance.mcSubtitle')}</p>
              </div>
              <div className="p-3">
                <div style={{ height: '200px' }}>
                  <Bar data={histogramData} options={histogramOpts} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>{t('insurance.mcMean')}</div>
                    <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--ds-text-primary)' }}>{fmt(mcResults.mean)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>{t('insurance.mcMedian')}</div>
                    <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--ds-text-primary)' }}>{fmt(mcResults.median)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>{t('insurance.mcP95')}</div>
                    <div className="text-sm font-bold tabular-nums" style={{ color: '#D97706' }}>{fmt(mcResults.p95)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>{t('insurance.mcMax')}</div>
                    <div className="text-sm font-bold tabular-nums" style={{ color: '#DC2626' }}>{fmt(mcResults.max)}</div>
                  </div>
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--ds-text-muted)' }}>
                  {t('insurance.mcExplain')}
                </p>
              </div>
            </div>

            {/* F) Per-Hazard Breakdown */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--ds-border)' }}
            >
              <div className="px-3 py-2" style={{ backgroundColor: 'var(--ds-surface-secondary)', borderBottom: '1px solid var(--ds-border)' }}>
                <span className="dg-label" style={{ fontSize: '0.7rem' }}>{t('insurance.hazardBreakdown')}</span>
              </div>
              {gapAnalysis.hazardBreakdown.map(h => (
                <HazardRow key={h.code} h={h} t={t} />
              ))}
            </div>
          </div>
        )}

        {/* G) Disclaimer */}
        <div
          className="rounded-lg p-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--ds-surface-secondary)', border: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)' }}
        >
          {t('insurance.disclaimer')}
        </div>
      </div>
    </div>
  )
}
