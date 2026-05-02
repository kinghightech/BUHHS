import { useState } from 'react'
import { FEMA_HAZARD_MAP } from '../data/cities'
import { HAZARD_COLORS, hexToRgba } from './HazardPieChart'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

function riskColor(level) {
  switch (level) {
    case 'Severe':   return '#7F1D1D'
    case 'High':     return '#DC2626'
    case 'Moderate': return '#D97706'
    case 'Low':      return '#059669'
    case 'Very Low': return '#059669'
    default:         return '#059669'
  }
}
function prepColor(pct) {
  return pct >= 75 ? '#059669' : pct >= 40 ? '#D97706' : '#DC2626'
}
function ratingColor(rating = '') {
  if (rating.includes('Very High'))           return '#DC2626'
  if (rating.includes('Relatively High'))     return '#EA580C'
  if (rating.includes('Relatively Moderate')) return '#D97706'
  if (rating.includes('Relatively Low'))      return '#059669'
  return '#059669'
}

function Stat({ label, value, sub, color }) {
  return (
    <div className="text-center px-4 py-2">
      <div className="text-3xl font-black tabular-nums leading-none" style={{ color }}>
        {value}
      </div>
      <div className="dg-label mt-2">{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>{sub}</div>}
    </div>
  )
}

function HazardRow({ code, score, rating, severityLabel, t }) {
  const meta = FEMA_HAZARD_MAP[code] || { name: code, icon: 'warning' }
  const rc = ratingColor(rating)
  const hazardName = t('hazard.' + code) || meta.name
  return (
    <div
      className="py-2.5 px-3 rounded-lg"
      style={{ backgroundColor: 'var(--ds-surface-secondary)', border: '1px solid var(--ds-border)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={meta.icon} size={18} />
          <span className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>{hazardName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums font-medium" style={{ color: 'var(--ds-text-secondary)' }}>
            {score.toFixed(1)}%
          </span>
          <span className="dg-badge text-white" style={{ backgroundColor: rc, fontSize: '0.62rem' }}>
            {rating || t('dash.noRating')}
          </span>
        </div>
      </div>
      {severityLabel && (
        <p className="text-xs mt-0.5 ml-7" style={{ color: 'var(--ds-text-muted)' }}>
          {t('dash.severity')} <span className="font-semibold" style={{ color: 'var(--ds-text-secondary)' }}>{severityLabel}</span>
        </p>
      )}
    </div>
  )
}

export default function RiskDashboard({ countyName, cityData, results, selectedHazard }) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const rc = riskColor(results.riskLevel)
  const pc = prepColor(results.preparedness)
  const topHazards = results.topHazards || cityData?.topHazards || []
  const primaryIcon = topHazards[0] ? (FEMA_HAZARD_MAP[topHazards[0].code]?.icon || 'warning') : 'warning'

  const activeIcon  = selectedHazard ? (FEMA_HAZARD_MAP[selectedHazard.code]?.icon || 'warning') : primaryIcon
  const activeName  = selectedHazard
    ? (t('hazard.' + selectedHazard.code) || FEMA_HAZARD_MAP[selectedHazard.code]?.name || selectedHazard.name)
    : (t('hazard.' + topHazards[0]?.code) || cityData.disaster)
  const hazardColor = selectedHazard ? (HAZARD_COLORS[selectedHazard.code] || '#2563EB') : null
  const isPrimary   = !selectedHazard || selectedHazard.code === topHazards[0]?.code
  const headerBg    = hazardColor
    ? `linear-gradient(135deg, ${hexToRgba(hazardColor, 0.07)} 0%, ${hexToRgba(hazardColor, 0.12)} 100%)`
    : 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.10) 100%)'
  const headerBorder = hazardColor || '#2563EB'

  function prepLabel(pct) {
    if (pct >= 75) return t('dash.prepGood')
    if (pct >= 40) return t('dash.prepPartial')
    return t('dash.prepLow')
  }

  // Translate risk level
  const riskLevelMap = { 'Very Low': 'risk.veryLow', 'Low': 'risk.low', 'Moderate': 'risk.moderate', 'High': 'risk.high', 'Severe': 'risk.severe' }
  const translatedRiskLevel = t(riskLevelMap[results.riskLevel] || 'risk.moderate')

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
        className="px-6 py-5 flex items-center justify-between"
        style={{
          background: headerBg,
          borderBottom: `3px solid ${headerBorder}`,
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <div>
          <div className="dg-label mb-1.5" style={{ color: 'var(--ds-text-muted)' }}>
            {t('dash.header')}
          </div>
          <h2 className="text-2xl font-black leading-tight" style={{ color: 'var(--ds-text-primary)' }}>
            {countyName || t('dash.yourLocation')}
          </h2>
          {isPrimary ? (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span
                className="dg-badge text-white font-black tracking-wide"
                style={{ backgroundColor: hazardColor || '#2563EB', fontSize: '0.72rem', letterSpacing: '0.09em' }}
              >
                <Icon name={activeIcon} size={14} style={{ display: 'inline' }} /> {t('dash.primaryHazard')}
              </span>
              <span className="text-sm font-bold" style={{ color: hazardColor || 'var(--ds-text-primary)' }}>{activeName}</span>
            </div>
          ) : (
            <div className="text-sm mt-1.5 font-medium" style={{ color: 'var(--ds-text-secondary)' }}>
              <Icon name={activeIcon} size={16} style={{ display: 'inline' }} /> <span className="font-bold" style={{ color: hazardColor }}>{activeName}</span>
            </div>
          )}
          <div className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
            {cityData.description}
          </div>
        </div>
        <div
          className="text-4xl hidden sm:flex items-center justify-center w-16 h-16 rounded-xl shrink-0"
          style={{
            backgroundColor: hazardColor ? hexToRgba(hazardColor, 0.10) : 'rgba(37,99,235,0.08)',
            border: `1px solid ${hazardColor ? hexToRgba(hazardColor, 0.25) : 'rgba(37,99,235,0.18)'}`,
            transition: 'background-color 0.3s, border-color 0.3s',
          }}
        >
          <Icon name={activeIcon} size={36} />
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 py-5"
        style={{ borderBottom: '1px solid var(--ds-border)' }}
      >
        {[
          { label: t('dash.riskLevel'), value: translatedRiskLevel, sub: t('dash.riskScore', { score: (results.riskScore * 100).toFixed(0) }), color: rc },
          { label: t('dash.annualProb'), value: `${(results.probability * 100).toFixed(1)}%`, sub: t('dash.probSub'), color: rc },
          { label: t('dash.preparedness'), value: `${results.preparedness.toFixed(0)}%`, sub: t('dash.prepSub'), color: pc },
        ].map((s, i) => (
          <div
            key={i}
            style={i < 2 ? { borderRight: '1px solid var(--ds-border)' } : {}}
          >
            <Stat {...s} />
          </div>
        ))}
      </div>

      {/* Preparedness bar */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--ds-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="dg-label">{t('dash.insurancePrep')}</span>
          <span className="text-xs font-black tabular-nums" style={{ color: pc }}>
            {results.preparedness.toFixed(0)}%
          </span>
        </div>
        <div
          className="w-full rounded-full h-2"
          style={{ backgroundColor: 'var(--ds-border)' }}
        >
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${results.preparedness}%`, backgroundColor: pc }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--ds-text-muted)' }}>{prepLabel(results.preparedness)}</p>
      </div>

      {/* Top hazards */}
      {topHazards.length > 0 && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="dg-label">{t('dash.topHazards')}</span>
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs font-bold"
              style={{ color: 'var(--ds-accent)' }}
            >
              {expanded ? <><Icon name="chevronUp" size={12} style={{ display: 'inline' }} /> {t('dash.less')}</> : <><Icon name="chevronDown" size={12} style={{ display: 'inline' }} /> {t('dash.moreInfo')}</>}
            </button>
          </div>
          <div className="space-y-2">
            {topHazards.map(h => (
              <HazardRow key={h.code} code={h.code} score={h.score} rating={h.rating} severityLabel={h.severityLabel} t={t} />
            ))}
          </div>
          {expanded && (
            <div
              className="mt-3 p-3.5 rounded-lg text-xs leading-relaxed"
              style={{ backgroundColor: 'var(--ds-surface-secondary)', border: '1px solid var(--ds-border)', color: 'var(--ds-text-secondary)' }}
            >
              <strong style={{ color: 'var(--ds-text-primary)' }}>{t('dash.dataSource')}</strong> {t('dash.dataSourceText')}{' '}
              <a
                href="https://hazards.fema.gov/nri/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:underline"
                style={{ color: 'var(--ds-accent)' }}
              >
                FEMA NRI <Icon name="arrowRight" size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </a>
            </div>
          )}
        </div>
      )}
      <div className="h-1" />
    </div>
  )
}
