import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSplash from './LanguageSplash'
import ShieldLogo from './ShieldLogo'
import Footer from './Footer'
import ClaimsEstimator from './ClaimsEstimator'
import Icon from './Icon'

const DEFAULT_INPUTS = {
  ownershipType: 'owner',
  homeValue: 0,
  homeInsuranceCoverage: 0,
}

function fmtComma(n) {
  return n ? n.toLocaleString('en-US') : ''
}

function parseNum(str) {
  return Number(String(str).replace(/,/g, '')) || 0
}

export default function ClaimsPage({ embedded = false }) {
  const navigate = useNavigate()
  const { lang, setLang, t, dir, flag, countryCode } = useLanguage()
  const [inputs, setInputs] = useState(DEFAULT_INPUTS)

  if (!lang && !embedded) return <LanguageSplash onSelect={setLang} />

  function updateInput(key, raw) {
    const value = parseNum(raw)
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={embedded ? '' : 'min-h-screen flex flex-col'} style={{ backgroundColor: 'var(--ds-bg)' }} dir={dir}>
      {/* Header — only shown when not embedded */}
      {!embedded && (
        <header className="dg-header">
          <div className="dg-header-top" />
          <div className="dg-header-content">
            <div className="dg-brand">
              <div className="dg-brand-icon">
                <ShieldLogo size={20} />
              </div>
              <div className="dg-brand-text">
                <h1>Custos</h1>
                <p>{t('claims.pageSubtitle')}</p>
              </div>
            </div>

            <div className="dg-header-actions">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 hover:opacity-90"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <Icon name="arrowLeft" size={16} /> {t('claims.backHome')}
              </button>

              <button className="dg-lang-btn" onClick={() => setLang(null)} title={t('app.langSwitcher.tooltip')}>
                {countryCode ? (
                  <img
                    src={`https://flagcdn.com/w40/${countryCode}.png`}
                    srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
                    alt={flag}
                  />
                ) : (
                  <Icon name="globe" size={20} />
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="dg-main">
        {/* Inputs bar */}
        <div
          className="rounded-xl overflow-hidden mb-6"
          style={{
            backgroundColor: 'var(--ds-surface)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
            border: '1px solid var(--ds-border)',
          }}
        >
          <div
            className="px-6 py-3"
            style={{ borderBottom: '1px solid var(--ds-border)', backgroundColor: 'var(--ds-surface)' }}
          >
            <span className="dg-label" style={{ color: 'var(--ds-text-primary)', fontSize: '0.75rem' }}>
              {t('claims.inputsTitle')}
            </span>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
              {t('claims.inputsSubtitle')}
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Home Value */}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ds-text-primary)' }}>
                  {t('input.homeValue')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--ds-text-muted)' }}>$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={fmtComma(inputs.homeValue)}
                    onChange={e => updateInput('homeValue', e.target.value)}
                    placeholder="300,000"
                    className="w-full pl-7 pr-3 py-2 rounded-lg text-sm"
                    style={{ border: '1px solid var(--ds-border)', outline: 'none', background: 'var(--ds-bg)', color: 'var(--ds-text-primary)' }}
                  />
                </div>
              </div>

              {/* Insurance Coverage */}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ds-text-primary)' }}>
                  {t('input.homeInsurance')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--ds-text-muted)' }}>$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={fmtComma(inputs.homeInsuranceCoverage)}
                    onChange={e => updateInput('homeInsuranceCoverage', e.target.value)}
                    placeholder="250,000"
                    className="w-full pl-7 pr-3 py-2 rounded-lg text-sm"
                    style={{ border: '1px solid var(--ds-border)', outline: 'none', background: 'var(--ds-bg)', color: 'var(--ds-text-primary)' }}
                  />
                </div>
              </div>

              {/* Ownership Type */}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ds-text-primary)' }}>
                  {t('input.iAmA')}
                </label>
                <div className="flex gap-2">
                  {['owner', 'renter'].map(type => (
                    <button
                      key={type}
                      onClick={() => setInputs(prev => ({ ...prev, ownershipType: type }))}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: inputs.ownershipType === type ? 'var(--ds-accent)' : 'var(--ds-surface)',
                        color: inputs.ownershipType === type ? '#fff' : 'var(--ds-text-primary)',
                        border: `1px solid ${inputs.ownershipType === type ? 'var(--ds-accent)' : 'var(--ds-border)'}`,
                      }}
                    >
                      {type === 'owner' ? t('input.homeowner') : t('input.renter')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claims Estimator (always expanded on this page) */}
        <ClaimsEstimator inputs={inputs} fullPage />

        {/* Back to map button */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--ds-accent)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(15,45,94,0.25)',
          }}
        >
          <Icon name="arrowLeft" size={18} />
          {t('claims.backToMap')}
        </button>
      </main>

      {!embedded && <Footer />}
    </div>
  )
}
