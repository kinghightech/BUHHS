import { useState, useEffect } from 'react'
import { geocodeAddress } from '../utils/api'
import { lookupAddressValue } from '../data/addressValues'
import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

export default function AddressSearch({ zip, initialAddress, propertyDetails, onHomeValueFound }) {
  const { t } = useLanguage()
  const [address, setAddress]     = useState(initialAddress || '')
  const [zillowUrl, setZillowUrl] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [searched, setSearched]   = useState(false)
  const [preLoaded, setPreLoaded] = useState(false)
  const [matchedValue, setMatchedValue] = useState(null)

  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress)
      setZillowUrl(`https://www.zillow.com/homes/${encodeURIComponent(initialAddress)}_rb/`)
      setSearched(true)
      setPreLoaded(true)
      const val = lookupAddressValue(initialAddress)
      if (val && onHomeValueFound) { setMatchedValue(val); onHomeValueFound(val) }
    } else {
      setAddress(''); setZillowUrl(null); setSearched(false); setPreLoaded(false); setMatchedValue(null)
    }
  }, [initialAddress, zip])

  async function handleSearch(e) {
    e.preventDefault()
    if (!address.trim()) return
    setLoading(true); setPreLoaded(false)
    const val = lookupAddressValue(address.trim())
    if (val && onHomeValueFound) { setMatchedValue(val); onHomeValueFound(val) } else { setMatchedValue(null) }
    try {
      const result = await geocodeAddress(address.trim())
      setZillowUrl(result.zillowUrl); setSearched(true)
    } catch {
      setZillowUrl(`https://www.zillow.com/homes/${encodeURIComponent(address.trim())}_rb/`); setSearched(true)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
          {t('address.label')}{' '}
          <span className="font-normal" style={{ color: 'var(--ds-text-muted)' }}>{t('input.optional')}</span>
        </label>
        {preLoaded && (
          <span
            className="dg-badge"
            style={{ backgroundColor: 'rgba(37,99,235,0.10)', color: 'var(--ds-accent)', border: '1px solid rgba(37,99,235,0.20)', fontSize: '0.6rem' }}
          >
            {t('address.preloaded')}
          </span>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setPreLoaded(false) }}
          placeholder={t('address.placeholder')}
          className="dg-input"
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          disabled={loading}
          className="dg-btn-ghost disabled:opacity-50"
          style={{ whiteSpace: 'nowrap' }}
        >
          {loading ? '…' : t('address.lookup')}
        </button>
      </form>

      {preLoaded && propertyDetails && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--ds-text-secondary)' }}>
          <Icon name="home" size={14} /> {propertyDetails}
        </p>
      )}

      {matchedValue && (
        <p className="text-xs mt-1 flex items-center gap-1 font-medium" style={{ color: 'var(--ds-accent)' }}>
          <Icon name="sparkles" size={14} /> {t('address.matchValue', { value: matchedValue.toLocaleString('en-US') })}
        </p>
      )}

      {searched && zillowUrl && (
        <a
          href={zillowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 text-xs font-semibold flex items-center gap-1 hover:underline"
          style={{ color: 'var(--ds-accent)' }}
        >
          {t('address.viewZillow')}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  )
}
