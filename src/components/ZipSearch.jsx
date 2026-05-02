import { useState } from 'react'
import { lookupZip } from '../data/zipRiskData'
import { liveZipLookup, transformFEMARecord } from '../utils/liveZipLookup'
import { fetchFEMARisk, fetchCensusMedianValue } from '../utils/api'
import Icon from './Icon'
import StateSelect from './StateSelect'

/**
 * Geocodes a free-text US address via Nominatim.
 * Returns { lat, lng, city, state, postcode } or throws a user-facing error.
 */
async function geocodeAddress(text) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(text)}&countrycodes=US&format=json&limit=1&addressdetails=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Location service unavailable. Try a 5-digit ZIP code instead.')
  const data = await res.json()
  if (!data.length) throw new Error('Address not found. Please be more specific or enter a 5-digit ZIP code.')

  const item = data[0]
  const addr = item.address || {}
  const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || text
  const stateRaw = addr.state_code || addr['ISO3166-2-lvl4'] || ''
  const state = stateRaw.replace(/^US-/, '')
  const postcode = addr.postcode || ''

  if (!state) throw new Error('Only U.S. locations are supported. Try a city, state, or ZIP code.')

  return {
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    city,
    state,
    postcode,
  }
}

export default function ZipSearch({ onResult, onClear }) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showStateSelect, setShowStateSelect] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setError(null)
    setShowStateSelect(false)

    // ── 5-digit ZIP code path ──────────────────────────────────────────────
    if (/^\d{5}$/.test(trimmed)) {
      // Instant local lookup first
      const local = lookupZip(trimmed)
      if (local) { onResult(local); return }

      setLoading(true)
      try {
        const entry = await liveZipLookup(trimmed)
        onResult(entry)
      } catch (err) {
        setError(err.message || `ZIP ${trimmed} not found. Try a full address or select your state below.`)
        setShowStateSelect(true)
      } finally {
        setLoading(false)
      }
      return
    }

    // ── Address / city / state path ────────────────────────────────────────
    setLoading(true)
    try {
      const geo = await geocodeAddress(trimmed)

      // fetchFEMARisk never throws — returns { _femaAvailable: false } on CORS/timeout
      const femaRecord = await fetchFEMARisk(geo.lat, geo.lng)

      let defaultHomeValue = null
      if (/^\d{5}$/.test(geo.postcode)) {
        try { defaultHomeValue = await fetchCensusMedianValue(geo.postcode) } catch { /* non-fatal */ }
      }

      const entry = transformFEMARecord({
        zip: geo.postcode || geo.city,
        city: geo.city,
        state: geo.state,
        lat: geo.lat,
        lng: geo.lng,
        femaRecord,
        defaultHomeValue,
      })
      onResult(entry)
    } catch (err) {
      setError(err.message || 'Could not find that location. Try a 5-digit ZIP code.')
    } finally {
      setLoading(false)
    }
  }

  function handleStateResult(entry) {
    setShowStateSelect(false)
    setError(null)
    onResult(entry)
  }

  return (
    <div
      className="px-4 py-3.5"
      style={{ backgroundColor: 'var(--ds-surface-secondary)', borderBottom: '1px solid var(--ds-border)' }}
    >
      <p className="dg-label mb-2.5">Step 1 — Enter your address or ZIP code</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            fontSize: '1rem', pointerEvents: 'none', lineHeight: 1,
          }}>
            📍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setError(null)
              setShowStateSelect(false)
              if (e.target.value === '' && onClear) onClear()
            }}
            placeholder="123 Main St, Houston TX  or  77001"
            className="dg-input"
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '2.25rem' }}
            disabled={loading}
          />
        </div>

        <button type="submit" className="dg-btn" disabled={loading || !query.trim()}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Icon name="loader" size={14} className="animate-spin" />
              Looking up…
            </span>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {error && (
        <p className="text-xs mt-2" style={{ color: '#EA580C', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
          <Icon name="warning" size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
          <span>{error}</span>
        </p>
      )}

      {showStateSelect && <StateSelect onResult={handleStateResult} />}
    </div>
  )
}
