import { useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { getSeverityLabel, getSeverityOptions } from '../utils/calculator'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

ChartJS.register(ArcElement, Tooltip, Legend)

export const HAZARD_COLORS = {
  WFIR: '#F2600C', HWAV: '#DC2626', DRGT: '#C2570A', VLCN: '#9F1239',
  RFLD: '#0EA5E9', CFLD: '#0369A1', TSUN: '#1D4ED8', CWAV: '#06B6D4',
  HRCN: '#4F46E5', TRND: '#7C3AED', ISTM: '#6366F1', SWND: '#475569',
  WNTW: '#38BDF8', HAIL: '#7DD3FC', AVLN: '#94A3B8', LTNG: '#FCD34D',
  ERQK: '#D97706', LNDS: '#92400E',
}

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function HazardPieChart({
  hazards = [], countyName, selectedCode, onHazardSelect,
  selectedSeverityRating, onSeverityChange,
}) {
  const { t } = useLanguage()
  const chartRef = useRef(null)
  if (!hazards.length) return null

  const hasSelection   = !!selectedCode
  const selectedHazard = hasSelection ? hazards.find(h => h.code === selectedCode) : null

  const bgColors = hazards.map(h => {
    const base = HAZARD_COLORS[h.code] || '#94A3B8'
    return (!hasSelection || h.code === selectedCode) ? base : hexToRgba(base, 0.18)
  })
  const borderWidths = hazards.map(h => (hasSelection && h.code === selectedCode ? 3.5 : 1.5))

  const chartData = {
    labels: hazards.map(h => t('hazard.' + h.code) || h.name),
    datasets: [{
      data: hazards.map(h => h.pct),
      backgroundColor: bgColors,
      borderColor: 'var(--ds-surface)',
      borderWidth: borderWidths,
      borderRadius: 5,
      spacing: 2,
      hoverBorderWidth: 0,
      hoverOffset: 14,
    }],
  }

  const topColor      = HAZARD_COLORS[hazards[0]?.code] || '#2563EB'
  const selectedColor = selectedHazard ? (HAZARD_COLORS[selectedHazard.code] || '#2563EB') : null

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '63%',
    animation: { animateRotate: true, animateScale: false, duration: 550, easing: 'easeInOutQuart' },
    onClick: (_e, elements) => {
      if (!onHazardSelect) return
      if (!elements.length) { onHazardSelect(null); return }
      const code = hazards[elements[0].index].code
      onHazardSelect(code === selectedCode ? null : code)
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 11.5 },
          boxWidth: 12,
          padding: 11,
          generateLabels: chart =>
            chart.data.labels.map((label, i) => {
              const h = hazards[i]
              return {
                text: `${label}  ${h.pct}%`,
                fillStyle: HAZARD_COLORS[h.code] || '#94A3B8',
                strokeStyle: '#ffffff',
                lineWidth: 1,
                hidden: false,
                index: i,
                fontColor: (hasSelection && h.code !== selectedCode) ? '#C5CFC5' : '#1A3558',
              }
            }),
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const h = hazards[ctx.dataIndex]
            const sev = getSeverityLabel(h.code, h.rating, h.severity)
            return [
              `  ${t('pie.tooltipRisk', { name: t('hazard.' + h.code) || h.name, pct: h.pct })}`,
              `  ${t('pie.tooltipSeverity', { severity: sev })}`,
              `  ${t('pie.tooltipRating', { rating: h.rating })}`,
            ]
          },
          footer: () => [`  ${t('pie.tooltipClick')}`],
        },
      },
    },
  }

  return (
    <div
      className="rounded-xl mb-8 overflow-hidden"
      style={{
        backgroundColor: 'var(--ds-surface)',
        boxShadow: 'var(--ds-shadow-md)',
        border: '1px solid var(--ds-border)',
      }}
    >
      {/* Colored accent strip */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${topColor}, ${hexToRgba(topColor, 0.35)})` }} />

      <div className="p-5">
        {/* Header */}
        <div
          className="flex items-start justify-between pb-4 mb-4"
          style={{ borderBottom: '1px solid var(--ds-border)' }}
        >
          <div>
            <h3
              className="font-bold tracking-wide uppercase"
              style={{ color: 'var(--ds-text-primary)', fontSize: '0.72rem' }}
            >
              {t('pie.title')}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
              {t('pie.subtitle', { county: countyName })}
            </p>
          </div>
          <span
            className="dg-badge text-white shrink-0 ml-4"
            style={{
              background: `linear-gradient(135deg, ${topColor}, ${hexToRgba(topColor, 0.72)})`,
              fontSize: '0.68rem',
              boxShadow: `0 2px 8px ${hexToRgba(topColor, 0.38)}`,
            }}
          >
            <Icon name={hazards[0]?.icon} size={14} style={{ display: 'inline' }} /> {t('hazard.' + hazards[0]?.code) || hazards[0]?.name}
          </span>
        </div>

        {/* Chart */}
        <div style={{ height: '270px' }}>
          <Doughnut ref={chartRef} data={chartData} options={options} />
        </div>

        {/* Selected hazard panel */}
        {selectedHazard ? (
          <div
            className="mt-4 rounded-xl p-4"
            style={{
              background: `linear-gradient(135deg, ${hexToRgba(selectedColor, 0.06)}, ${hexToRgba(selectedColor, 0.02)})`,
              border: `1.5px solid ${hexToRgba(selectedColor, 0.28)}`,
            }}
          >
            {/* Hazard title row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="rounded-lg p-1.5 shrink-0"
                  style={{ background: hexToRgba(selectedColor, 0.12) }}
                >
                  <Icon name={selectedHazard.icon} size={24} />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: 'var(--ds-text-primary)' }}>
                    {t('hazard.' + selectedHazard.code) || selectedHazard.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
                    {t('pie.activeSeverity')}{' '}
                    <span className="font-bold" style={{ color: selectedColor }}>
                      {getSeverityLabel(
                        selectedHazard.code,
                        selectedSeverityRating ?? selectedHazard.rating,
                        selectedSeverityRating ? null : selectedHazard.severity,
                      )}
                    </span>
                    {selectedSeverityRating && selectedSeverityRating !== selectedHazard.rating && (
                      <span className="ml-1.5" style={{ color: 'var(--ds-text-muted)' }}>{t('pie.overridden')}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black tabular-nums" style={{ color: selectedColor }}>
                  {selectedHazard.pct}%
                </p>
                <p className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>{t('pie.ofTotalRisk')}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="mb-3 rounded-full overflow-hidden"
              style={{ height: '5px', background: hexToRgba(selectedColor, 0.12) }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${selectedHazard.pct}%`,
                  background: `linear-gradient(90deg, ${selectedColor}, ${hexToRgba(selectedColor, 0.55)})`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>

            {/* Severity selector */}
            <div className="pt-3" style={{ borderTop: `1px solid ${hexToRgba(selectedColor, 0.18)}` }}>
              <p className="dg-label mb-2.5">{t('pie.adjustSeverity')}</p>
              <div className="grid grid-cols-5 gap-1.5">
                {getSeverityOptions(selectedHazard.code).map(({ rating, label, color }) => {
                  const isNatural = rating === selectedHazard.rating
                  const isActive  = (selectedSeverityRating ?? selectedHazard.rating) === rating
                  return (
                    <button
                      key={rating}
                      onClick={() =>
                        onSeverityChange(
                          rating === selectedHazard.rating && !selectedSeverityRating ? null : rating
                        )
                      }
                      title={label}
                      className="relative flex flex-col items-center gap-0.5 rounded-lg py-2 px-1 text-center transition-all"
                      style={{
                        border: `1.5px solid ${isActive ? color : 'rgba(99,150,222,0.18)'}`,
                        backgroundColor: isActive ? hexToRgba(color, 0.10) : 'var(--ds-surface-secondary)',
                        outline: isActive ? `2px solid ${color}` : 'none',
                        outlineOffset: '1px',
                        boxShadow: isActive ? `0 2px 8px ${hexToRgba(color, 0.25)}` : 'none',
                        transform: isActive ? 'scale(1.04)' : 'scale(1)',
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span
                        className="leading-tight font-semibold"
                        style={{ fontSize: '0.60rem', color: 'var(--ds-text-secondary)' }}
                      >
                        {label}
                      </span>
                      {isNatural && (
                        <span
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-white px-1 rounded-full font-bold"
                          style={{ backgroundColor: color, fontSize: '0.50rem', lineHeight: '1.5' }}
                        >
                          {t('pie.actual')}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center gap-2 mt-3 pt-2.5"
              style={{ borderTop: `1px solid ${hexToRgba(selectedColor, 0.14)}` }}
            >
              <p className="text-xs flex-1" style={{ color: 'var(--ds-text-secondary)' }}>
                {t('pie.recalcFooter', { name: t('hazard.' + selectedHazard.code) || selectedHazard.name })}
              </p>
              {selectedSeverityRating && (
                <button
                  onClick={() => onSeverityChange(null)}
                  className="text-xs font-bold underline whitespace-nowrap"
                  style={{ color: 'var(--ds-accent)' }}
                >
                  {t('pie.resetSeverity')}
                </button>
              )}
              <button
                onClick={() => onHazardSelect(null)}
                className="text-xs underline whitespace-nowrap"
                style={{ color: 'var(--ds-text-muted)' }}
              >
                {t('pie.deselect')}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-1.5">
            {hazards.slice(0, 5).map((h, i) => {
              const color = HAZARD_COLORS[h.code] || '#94A3B8'
              const barPct = Math.round((h.pct / hazards[0].pct) * 100)
              return (
                <button
                  key={h.code}
                  onClick={() => onHazardSelect && onHazardSelect(h.code)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:scale-[1.01]"
                  style={{
                    background: hexToRgba(color, 0.05),
                    border: `1px solid ${hexToRgba(color, 0.18)}`,
                  }}
                >
                  <span
                    className="text-xs font-black w-5 shrink-0 text-center tabular-nums"
                    style={{ color: 'var(--ds-text-muted)' }}
                  >
                    #{i + 1}
                  </span>
                  <Icon name={h.icon} size={15} />
                  <span
                    className="text-xs font-semibold flex-1 text-left truncate"
                    style={{ color: 'var(--ds-text-primary)' }}
                  >
                    {t('hazard.' + h.code) || h.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="rounded-full overflow-hidden"
                      style={{ width: '52px', height: '4px', background: hexToRgba(color, 0.15) }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${barPct}%`, background: color }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color, minWidth: '28px', textAlign: 'right' }}
                    >
                      {h.pct}%
                    </span>
                  </div>
                </button>
              )
            })}
            {hazards.length > 5 && (
              <p className="text-xs text-center pt-1" style={{ color: 'var(--ds-text-muted)' }}>
                +{hazards.length - 5} more · {t('pie.clickHint')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
