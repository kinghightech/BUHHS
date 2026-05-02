import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

const fmt = n => `$${Math.round(n).toLocaleString('en-US')}`

function InsuranceSuggestions({ results, inputs, t }) {
  const isRenter = results.isRenter
  const suggestions = []

  if (results.homeOOP > 0) {
    const cur = inputs.homeInsuranceCoverage || 0
    const rec = Math.ceil(results.homeDamage / 1000) * 1000
    const inc = rec - cur
    const vars = { current: fmt(cur), damage: fmt(results.homeDamage), increase: fmt(inc), recommended: fmt(rec), gap: fmt(results.homeOOP) }
    suggestions.push({
      icon: isRenter ? 'building' : 'home',
      title: isRenter
        ? (cur === 0 ? t('results.getRentersIns') : t('results.increaseRentersIns'))
        : t('results.increaseHomeIns'),
      detail: isRenter
        ? (cur === 0
          ? t('results.noRentersIns', vars)
          : inc > 0
            ? t('results.rentersGap', vars)
            : t('results.rentersExceeds', vars))
        : (inc > 0
          ? t('results.homeGap', vars)
          : t('results.homeExceeds', vars)),
      currentCoverage: cur,
      estimatedCost: results.homeDamage,
      outOfPocket: results.homeOOP,
    })
  }

  if (results.carOOP > 0) {
    const cur = inputs.carInsuranceCoverage || 0
    const rec = Math.ceil(results.carDamage / 500) * 500
    const inc = rec - cur
    const vars = { current: fmt(cur), damage: fmt(results.carDamage), increase: fmt(inc), recommended: fmt(rec), gap: fmt(results.carOOP) }
    suggestions.push({
      icon: 'car',
      title: t('results.increaseCarIns'),
      detail: inc > 0
        ? t('results.carGap', vars)
        : t('results.carExceeds', vars),
      currentCoverage: cur,
      estimatedCost: results.carDamage,
      outOfPocket: results.carOOP,
    })
  }

  if (!suggestions.length) return null

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(220,38,38,0.18)' }}
    >
      <div
        className="px-4 py-3"
        style={{ backgroundColor: '#FEF2F2', borderBottom: '2px solid #DC2626' }}
      >
        <p className="dg-label" style={{ color: '#991B1B' }}>
          {t('results.insRecommendations')}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#B91C1C' }}>
          {t('results.insRecSub')}
        </p>
      </div>
      <div>
        {suggestions.map((s, i) => {
          const coveragePercent = s.estimatedCost > 0 ? Math.min((s.currentCoverage / s.estimatedCost) * 100, 100) : 0
          const gapPercent = s.estimatedCost > 0 ? Math.min((s.outOfPocket / s.estimatedCost) * 100, 100) : 0

          return (
            <div
              key={s.title}
              className="px-4 py-3.5"
              style={{
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(220,38,38,0.08)' : 'none',
                backgroundColor: '#fff',
              }}
            >
              <div className="flex gap-3">
                <Icon name={s.icon} size={22} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--ds-text-primary)' }}>{s.title}</p>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--ds-text-secondary)' }}>{s.detail}</p>

                  {/* Visual comparison bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--ds-text-muted)' }}>Insurance vs. Estimated Cost</span>
                      <span style={{ color: 'var(--ds-text-secondary)' }} className="font-medium">
                        {fmt(s.currentCoverage)} / {fmt(s.estimatedCost)}
                      </span>
                    </div>
                    <div className="relative h-6 rounded-md overflow-hidden" style={{ backgroundColor: '#FEE2E2' }}>
                      {/* Insurance coverage bar */}
                      <div
                        className="absolute top-0 left-0 h-full transition-all duration-300"
                        style={{
                          width: `${coveragePercent}%`,
                          backgroundColor: '#059669',
                          opacity: 0.8,
                        }}
                      />
                      {/* Labels */}
                      <div className="absolute inset-0 flex items-center px-2 text-xs font-semibold">
                        {s.currentCoverage > 0 && (
                          <span style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {fmt(s.currentCoverage)}
                          </span>
                        )}
                        {s.outOfPocket > 0 && (
                          <span
                            className="ml-auto"
                            style={{ color: '#991B1B' }}
                          >
                            Gap: {fmt(s.outOfPocket)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#059669', opacity: 0.8 }} />
                        <span style={{ color: 'var(--ds-text-secondary)' }}>Current Coverage</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FEE2E2' }} />
                        <span style={{ color: 'var(--ds-text-secondary)' }}>Uncovered</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Row({ label, value, sub, type }) {
  const isHighlight = type === 'highlight'
  const valueColor = type === 'danger' ? '#DC2626' : type === 'good' ? '#059669' : 'var(--ds-text-primary)'

  return (
    <div
      className="flex items-center justify-between py-3 px-4 rounded-lg"
      style={isHighlight
        ? { backgroundColor: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.18)' }
        : {}}
    >
      <div>
        <div className="text-sm font-semibold" style={{ color: isHighlight ? 'var(--ds-text-primary)' : 'var(--ds-text-secondary)' }}>
          {label}
        </div>
        {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>{sub}</div>}
      </div>
      <div
        className="text-lg font-black tabular-nums"
        style={{ color: valueColor }}
      >
        {value}
      </div>
    </div>
  )
}

function SectionLabel({ label }) {
  return (
    <div className="px-4 pt-3 pb-0.5">
      <span className="dg-label">{label}</span>
    </div>
  )
}

export default function ResultsPanel({ results, inputs }) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const isRenter = results.isRenter
  const homeFullyCovered = results.homeOOP === 0
  const carFullyCovered = results.carOOP === 0
  const totalFullyCovered = results.totalOOP === 0
  const incomeRatio = inputs.income > 0 ? (results.emergencyFund / inputs.income) * 100 : 0

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--ds-surface)',
        boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08), 0 6px 20px rgba(37, 99, 235, 0.05)',
        border: '1px solid var(--ds-border)',
      }}
    >
      {/* Card header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--ds-border)', backgroundColor: 'var(--ds-surface-secondary)' }}
      >
        <div>
          <h2 className="dg-label" style={{ color: 'var(--ds-text-primary)', fontSize: '0.75rem' }}>
            {t('results.title')}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
            {t('results.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs font-bold"
          style={{ color: 'var(--ds-accent)' }}
        >
          {expanded ? `▲ ${t('results.lessInfo')}` : `▼ ${t('results.moreInfo')}`}
        </button>
      </div>

      <div className="pb-2">
        {/* Home / Property */}
        <SectionLabel label={isRenter ? t('results.personalProperty') : t('results.home')} />
        <Row
          label={isRenter ? t('results.estPropertyLoss') : t('results.estHomeDamage')}
          value={fmt(results.homeDamage)}
          sub={isRenter ? t('results.propertyLossSub') : t('results.homeDamageSub')}
          type="danger"
        />
        <Row
          label={isRenter ? t('results.rentersInsOffset') : t('results.homeInsOffset')}
          value={`− ${fmt(results.homeInsuranceOffset)}`}
          sub={isRenter ? t('results.rentersInsSub') : t('results.homeInsSub')}
          type="good"
        />
        <Row
          label={isRenter ? t('results.propertyOOP') : t('results.homeOOP')}
          value={fmt(results.homeOOP)}
          sub={homeFullyCovered
            ? (isRenter ? t('results.rentersCoveredSub') : t('results.homeCoveredSub'))
            : (isRenter ? t('results.propertyRemainSub') : t('results.homeRemainSub'))}
          type={homeFullyCovered ? 'good' : 'danger'}
        />

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', margin: '0.25rem 1rem' }} />

        {/* Vehicle */}
        <SectionLabel label={t('results.vehicle')} />
        <Row
          label={t('results.estCarDamage')}
          value={fmt(results.carDamage)}
          sub={t('results.carDamageSub')}
          type="danger"
        />
        <Row
          label={t('results.carInsOffset')}
          value={`− ${fmt(results.carInsuranceOffset)}`}
          sub={t('results.carInsSub')}
          type="good"
        />
        <Row
          label={t('results.carOOP')}
          value={fmt(results.carOOP)}
          sub={carFullyCovered ? t('results.carCoveredSub') : t('results.carRemainSub')}
          type={carFullyCovered ? 'good' : 'danger'}
        />

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', margin: '0.25rem 1rem' }} />

        {/* Emergency fund highlight */}
        <div className="px-4 pt-1 pb-3">
          <Row
            label={t('results.recFund')}
            value={fmt(results.emergencyFund)}
            sub={results.emergencyFundAtMinimum ? t('results.recFundSubMin') : t('results.recFundSub')}
            type="highlight"
          />
        </div>
      </div>

      {/* Coverage status */}
      {totalFullyCovered ? (
        <div
          className="mx-4 mb-4 p-3 rounded-lg"
          style={{ backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.20)' }}
        >
          <p className="text-xs" style={{ color: '#059669' }}>
            <span className="font-bold">{t('results.wellCovered')}</span> {t('results.wellCoveredText')}
          </p>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <InsuranceSuggestions results={results} inputs={inputs} t={t} />
        </div>
      )}

      {/* Methodology */}
      {expanded && (
        <div
          className="mx-4 mb-4 p-3.5 rounded-lg text-xs leading-relaxed space-y-1.5"
          style={{ backgroundColor: 'var(--ds-surface-secondary)', border: '1px solid var(--ds-border)', color: 'var(--ds-text-secondary)' }}
        >
          <p>
            <strong style={{ color: 'var(--ds-text-primary)' }}>{t('results.methodActuarial')}</strong>{' '}
            {t('results.methodActuarialText')}
          </p>
          <p>
            <strong style={{ color: 'var(--ds-text-primary)' }}>{t('results.methodMultiHazard')}</strong>{' '}
            {t('results.methodMultiHazardText')}
          </p>
          {results.primarySeverityLabel && (
            <p>
              <strong style={{ color: 'var(--ds-text-primary)' }}>{t('results.methodActiveSeverity')}</strong>{' '}
              {t('results.methodActiveSeverityText', { label: results.primarySeverityLabel })}
            </p>
          )}
          <p>
            <strong style={{ color: 'var(--ds-text-primary)' }}>{t('results.methodHomeDamage')}</strong>{' '}
            {t('results.methodHomeDamageText')}{' '}
            {results.isRenter ? t('results.methodRenterNote') : t('results.methodOwnerNote')}
          </p>
          <p>
            <strong style={{ color: 'var(--ds-text-primary)' }}>{t('results.methodCarDamage')}</strong>{' '}
            {t('results.methodCarDamageText')}
          </p>
          <p>
            <strong style={{ color: 'var(--ds-text-primary)' }}>{t('results.methodEmergencyFund')}</strong>{' '}
            {t('results.methodEmergencyFundText')}
          </p>
          <p style={{ color: 'var(--ds-text-muted)' }}>
            {t('results.methodDisclaimer')}
          </p>
        </div>
      )}
    </div>
  )
}
