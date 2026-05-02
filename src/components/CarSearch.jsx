import { useState } from 'react'
import { lookupCarValue } from '../data/carValues'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

export default function CarSearch({ onCarValueFound }) {
  const { t } = useLanguage()
  const [model, setModel] = useState('')
  const [year, setYear]   = useState('')
  const [matchedValue, setMatchedValue] = useState(null)

  function handleModelChange(e) { const v = e.target.value; setModel(v); tryLookup(v, year) }
  function handleYearChange(e) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
    setYear(v); tryLookup(model, v)
  }
  function tryLookup(m, y) {
    const found = lookupCarValue(m, y)
    setMatchedValue(found || null)
    if (found && onCarValueFound) onCarValueFound(found)
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ds-text-primary)' }}>
        {t('car.label')}{' '}
        <span className="font-normal" style={{ color: 'var(--ds-text-muted)' }}>{t('input.optional')}</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={model}
          onChange={handleModelChange}
          placeholder={t('car.modelPlaceholder')}
          className="dg-input"
          style={{ flex: 1 }}
        />
        <input
          type="text"
          inputMode="numeric"
          value={year}
          onChange={handleYearChange}
          placeholder={t('car.yearPlaceholder')}
          maxLength={4}
          className="dg-input"
          style={{ width: '5rem', flex: 'none' }}
        />
      </div>
      {matchedValue ? (
        <p className="text-xs mt-1 flex items-center gap-1 font-medium" style={{ color: 'var(--ds-accent)' }}>
          <Icon name="sparkles" size={14} /> {t('car.matchValue', { value: matchedValue.toLocaleString('en-US') })}
        </p>
      ) : model && year.length === 4 ? (
        <p className="text-xs mt-1" style={{ color: 'var(--ds-text-muted)' }}>
          {t('car.noMatch')}
        </p>
      ) : null}
    </div>
  )
}
