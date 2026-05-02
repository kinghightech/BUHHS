import { useState } from 'react'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

function fmtAxis(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

const tooltipDollar = {
  callbacks: { label: ctx => ` $${Math.round(ctx.raw).toLocaleString('en-US')}` },
}

function makeScales() {
  return {
    y: {
      ticks: { callback: fmtAxis, font: { size: 11 }, color: '#5B7FA5' },
      grid: { color: 'rgba(99,150,222,0.10)' },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#5B7FA5', font: { size: 10 } },
    },
  }
}

function CardWrap({ title, expanded, onToggle, children, note }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--ds-surface)',
        borderRadius: '0.875rem',
        border: '1px solid var(--ds-border)',
        boxShadow: '0 2px 10px rgba(37, 99, 235, 0.07)',
        padding: '1.25rem',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="dg-label">{title}</h3>
        <button
          onClick={onToggle}
          className="text-xs font-bold"
          style={{ color: 'var(--ds-accent)' }}
        >
          <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={14} />
        </button>
      </div>
      {children}
      {expanded && (
        <div
          className="mt-3 p-3 rounded-lg text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--ds-surface-secondary)', border: '1px solid var(--ds-border)', color: 'var(--ds-text-secondary)' }}
        >
          {note}
        </div>
      )}
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

export default function Charts({ results, inputs }) {
  const { t } = useLanguage()
  const [gaugeExp, setGaugeExp] = useState(false)
  const [dmgExp,   setDmgExp]   = useState(false)
  const [fundExp,  setFundExp]  = useState(false)

  const probPct    = results.probability * 100
  const MAX_PROB   = 100
  const gaugeColor = probPct > 30 ? '#DC2626' : probPct > 15 ? '#D97706' : '#059669'
  const gaugeLabel = probPct > 30 ? t('chart.highProb') : probPct > 15 ? t('chart.moderate') : t('chart.lowProb')

  // ── Gauge ────────────────────────────────────────────────────
  const gaugeData = {
    datasets: [{
      data: [probPct, Math.max(0, MAX_PROB - probPct)],
      backgroundColor: [gaugeColor, 'rgba(0,0,0,0.07)'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
      cutout: '72%',
    }],
  }
  const gaugeOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    animation: { duration: 900 },
  }

  // ── Damage bars ───────────────────────────────────────────────
  const dmgData = {
    labels: [
      [t('chart.homeDamage')], [t('chart.homeInsurance')], [t('chart.homeOOP')],
      [t('chart.carDamage')],  [t('chart.carInsurance')],  [t('chart.carOOP')],
    ],
    datasets: [{
      label: 'Amount',
      data: [
        results.homeDamage, results.homeInsuranceOffset, results.homeOOP,
        results.carDamage,  results.carInsuranceOffset,  results.carOOP,
      ],
      backgroundColor: [
        '#1D4ED8', '#059669', '#DC2626',
        '#1E40AF', '#34D399', '#EA580C',
      ],
      borderRadius: 4,
      borderSkipped: false,
    }],
  }
  const dmgOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipDollar },
    scales: makeScales(),
  }

  // ── Income vs fund ───────────────────────────────────────────
  const fundData = {
    labels: [[t('chart.annualIncome')], [t('chart.fundNeeded')]],
    datasets: [{
      label: 'Amount',
      data: [inputs.income, results.emergencyFund],
      backgroundColor: ['rgba(99,150,222,0.20)', '#059669'],
      borderRadius: 5,
      borderSkipped: false,
    }],
  }
  const fundOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipDollar },
    scales: makeScales(),
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Gauge card */}
      <CardWrap
        title={t('chart.probability')}
        expanded={gaugeExp}
        onToggle={() => setGaugeExp(e => !e)}
        note={
          <>
            <strong style={{ color: 'var(--ds-text-primary)' }}>{t('chart.probMethod')}</strong> {t('chart.probMethodText')}
          </>
        }
      >
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-24">
            <Doughnut data={gaugeData} options={gaugeOpts} />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5 pointer-events-none">
              <span className="text-2xl font-black tabular-nums" style={{ color: gaugeColor }}>
                {probPct.toFixed(1)}%
              </span>
              <span className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>{t('chart.annualRisk')}</span>
            </div>
          </div>
          <span
            className="mt-4 dg-badge text-white"
            style={{ backgroundColor: gaugeColor }}
          >
            {gaugeLabel}
          </span>
          <p className="text-xs mt-3 text-center" style={{ color: 'var(--ds-text-muted)' }}>
            {t('chart.probNote')}
          </p>
        </div>
      </CardWrap>

      {/* Damage breakdown card */}
      <CardWrap
        title={t('chart.damageBreakdown')}
        expanded={dmgExp}
        onToggle={() => setDmgExp(e => !e)}
        note={
          <>
            <strong style={{ color: 'var(--ds-text-primary)' }}>{t('chart.dmgMethod')}</strong> {t('chart.dmgMethodText')}
          </>
        }
      >
        <div style={{ height: '180px' }}>
          <Bar data={dmgData} options={dmgOpts} />
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          <LegendDot color="#1D4ED8" label={t('chart.damage')} />
          <LegendDot color="#059669" label={t('chart.insurance')} />
          <LegendDot color="#DC2626" label={t('chart.outOfPocket')} />
        </div>
      </CardWrap>

      {/* Income vs fund card */}
      <CardWrap
        title={t('chart.incomeVsFund')}
        expanded={fundExp}
        onToggle={() => setFundExp(e => !e)}
        note={
          <>
            <strong style={{ color: 'var(--ds-text-primary)' }}>{t('chart.emergencyFund')}</strong> {t('chart.fundMethodText')}
          </>
        }
      >
        <div style={{ height: '180px' }}>
          <Bar data={fundData} options={fundOpts} />
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          <LegendDot color="rgba(99,150,222,0.35)" label={t('chart.annualIncome')} />
          <LegendDot color="#059669"           label={t('chart.fundNeeded')} />
        </div>
      </CardWrap>

    </div>
  )
}
