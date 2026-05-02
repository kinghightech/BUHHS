import { useState } from 'react'
import { STATE_RISK_DATA } from '../data/stateRiskData'
import { STATE_CENTROIDS } from '../data/stateCentroids'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

/**
 * Fallback component shown when ZIP lookup fails.
 * Lets the user pick their state for an instant static regional estimate.
 */
export default function StateSelect({ onResult }) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState(false)

  function handleChange(e) {
    const abbr = e.target.value
    if (!abbr) return
    const entry = STATE_RISK_DATA[abbr]
    if (entry) {
      setSelected(true)
      onResult(entry)
    }
  }

  return (
    <div className="px-4 pt-3 pb-3.5 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
      <p className="dg-label mb-2.5">{t('state.label')}</p>
      <div className="relative">
        <select
          className="dg-input w-full appearance-none pr-8"
          defaultValue=""
          onChange={handleChange}
        >
          <option value="" disabled>
            {t('state.placeholder')}
          </option>
          {STATE_CENTROIDS.map((s) => (
            <option key={s.abbr} value={s.abbr}>
              {s.name} ({s.abbr})
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon name="chevronDown" size={14} />
        </span>
      </div>
      {selected && (
        <p className="text-xs mt-2 flex items-start gap-1.5" style={{ color: '#6B7280' }}>
          <Icon name="warning" size={14} className="mt-px shrink-0" />
          <span>{t('zip.partialData')}</span>
        </p>
      )}
    </div>
  )
}
