import AddressSearch from './AddressSearch'
import CarSearch from './CarSearch'
import { EXPOSURE_OPTIONS, VULNERABILITY_OPTIONS } from '../utils/calculator'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

function CurrencyInput({ label, id, value, onChange, placeholder, hint, preLoadedHint }) {
  const displayValue = value === 0 ? '' : value.toLocaleString('en-US')

  function handleChange(e) {
    const digits = e.target.value.replace(/[^0-9]/g, '')
    onChange(digits === '' ? 0 : parseInt(digits, 10))
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ds-text-primary)' }}>
        {label}
      </label>
      <div className="relative">
        <span
          className="dg-currency-sign absolute left-3 top-1/2 -translate-y-1/2 select-none font-semibold text-sm"
          style={{ color: 'var(--ds-text-muted)' }}
        >
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="dg-input dg-input-currency"
          style={{ paddingLeft: '1.6rem' }}
        />
      </div>
      {preLoadedHint && (
        <p className="text-xs mt-1 flex items-center gap-1 font-medium" style={{ color: 'var(--ds-accent)' }}>
          <Icon name="sparkles" size={14} /> {preLoadedHint}
        </p>
      )}
      {!preLoadedHint && hint && (
        <p className="text-xs mt-1" style={{ color: 'var(--ds-text-muted)' }}>{hint}</p>
      )}
    </div>
  )
}

function SelectInput({ label, id, value, options, onChange, t }) {
  const selected = options.find(o => o.value === value)
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ds-text-primary)' }}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="dg-input"
        style={{ appearance: 'auto' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{t(o.labelKey)} ({(o.value * 100).toFixed(0)}%)</option>
        ))}
      </select>
      {selected?.descKey && (
        <p className="text-xs mt-1" style={{ color: 'var(--ds-text-muted)' }}>{t(selected.descKey)}</p>
      )}
    </div>
  )
}

export default function InputForm({
  inputs, onChange, zip, defaultAddress, propertyDetails,
  defaultHomeValue, canShowResults, onShowResults,
}) {
  const { t } = useLanguage()
  const update = (field) => (value) => onChange({ ...inputs, [field]: value })
  const isRenter = inputs.ownershipType === 'renter'
  const homeValuePreloaded = defaultHomeValue && inputs.homeValue === defaultHomeValue

  return (
    <div className="dg-card p-6">
      <div className="mb-5">
        <h2 className="dg-label">{t('input.stepLabel')}</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--ds-text-muted)' }}>
          {t('input.stepHint')}
        </p>
      </div>

      {/* Ownership toggle - full width */}
      <div className="mb-5">
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>{t('input.iAmA')}</p>
        <div
          className="flex rounded-lg overflow-hidden text-sm font-semibold"
          style={{ border: '1.5px solid var(--ds-border)', maxWidth: '24rem' }}
        >
          {[
            { value: 'owner', icon: 'home', label: t('input.homeowner') },
            { value: 'renter', icon: 'building', label: t('input.renter') },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...inputs, ownershipType: value })}
              className="flex-1 py-2 transition-all"
              style={
                inputs.ownershipType === value
                  ? { backgroundColor: 'var(--ds-accent)', color: '#ffffff' }
                  : { backgroundColor: 'var(--ds-surface-secondary)', color: 'var(--ds-text-secondary)' }
              }
            >
              <><Icon name={icon} size={14} style={{ display: 'inline' }} /> {label}</>
            </button>
          ))}
        </div>
        {isRenter && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--ds-text-muted)' }}>
            {t('input.renterNote')}
          </p>
        )}
      </div>

      <hr className="dg-rule mb-5" />

      {/* Address search - full width */}
      <div className="mb-5">
        <AddressSearch
          zip={zip}
          initialAddress={defaultAddress}
          propertyDetails={propertyDetails}
          onHomeValueFound={(val) => onChange({ ...inputs, homeValue: val })}
        />
      </div>

      <hr className="dg-rule mb-5" />

      {/* Multi-column grid for form fields */}
      <div className="dg-form-grid mb-5">
        <CurrencyInput
          label={isRenter ? t('input.personalPropertyValue') : t('input.homeValue')}
          id="homeValue"
          value={inputs.homeValue}
          onChange={update('homeValue')}
          placeholder={isRenter ? '20,000' : '300,000'}
          hint={isRenter ? t('input.renterPropertyHint') : null}
          preLoadedHint={
            !isRenter && homeValuePreloaded
              ? t('input.preloadedHint', { address: defaultAddress })
              : null
          }
        />
        <CurrencyInput
          label={t('input.income')}
          id="income"
          value={inputs.income}
          onChange={update('income')}
          placeholder="75,000"
        />
        <CurrencyInput
          label={t('input.carValue')}
          id="carValue"
          value={inputs.carValue}
          onChange={update('carValue')}
          placeholder="25,000"
        />
        <div>
          <label htmlFor="insuranceProvider" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ds-text-primary)' }}>
            {t('input.insuranceProvider')}{' '}
            <span className="font-normal" style={{ color: 'var(--ds-text-muted)' }}>{t('input.optional')}</span>
          </label>
          <input
            id="insuranceProvider"
            type="text"
            value={inputs.insuranceProvider}
            onChange={(e) => onChange({ ...inputs, insuranceProvider: e.target.value })}
            placeholder={t('input.insurancePlaceholder')}
            className="dg-input"
          />
        </div>
        <CurrencyInput
          label={isRenter ? t('input.rentersInsurance') : t('input.homeInsurance')}
          id="homeInsuranceCoverage"
          value={inputs.homeInsuranceCoverage}
          onChange={update('homeInsuranceCoverage')}
          placeholder={isRenter ? '10,000' : '200,000'}
          hint={isRenter ? t('input.rentersInsuranceHint') : t('input.homeInsuranceHint')}
        />
        <CurrencyInput
          label={t('input.carInsurance')}
          id="carInsuranceCoverage"
          value={inputs.carInsuranceCoverage}
          onChange={update('carInsuranceCoverage')}
          placeholder="15,000"
          hint={t('input.carInsuranceHint')}
        />
      </div>

      {/* Car search - full width */}
      <div className="mb-5">
        <CarSearch onCarValueFound={(val) => onChange({ ...inputs, carValue: val })} />
      </div>

      <hr className="dg-rule mb-5" />

      {/* Property characteristics */}
      <div className="mb-5">
        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--ds-text-primary)' }}>{t('input.propCharacteristics')}</p>
        <p className="text-xs mb-3" style={{ color: 'var(--ds-text-muted)' }}>
          {t('input.propCharHint')}
        </p>
        <div className="dg-form-grid">
          <div>
            <SelectInput
              label={t('input.exposureLabel')}
              id="exposureFactor"
              value={inputs.exposureFactor}
              options={EXPOSURE_OPTIONS}
              onChange={update('exposureFactor')}
              t={t}
            />
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--ds-text-muted)' }}>
              {t('input.exposureExplain')}
            </p>
          </div>
          <div>
            <SelectInput
              label={t('input.vulnerabilityLabel')}
              id="vulnerabilityFactor"
              value={inputs.vulnerabilityFactor}
              options={VULNERABILITY_OPTIONS}
              onChange={update('vulnerabilityFactor')}
              t={t}
            />
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--ds-text-muted)' }}>
              {t('input.vulnerabilityExplain')}
            </p>
          </div>
        </div>
      </div>

      {canShowResults && (
        <button
          onClick={onShowResults}
          className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #1D4ED8, #1E40AF)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB, #1D4ED8)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {t('input.viewResults')}
        </button>
      )}
    </div>
  )
}
