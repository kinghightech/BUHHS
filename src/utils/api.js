/**
 * API utilities for DisasterSafe.
 * All calls use free, public, no-API-key endpoints.
 */

/** Fetch with an abort-based timeout so a dead server doesn't hang forever. */
async function fetchWithTimeout(url, options = {}, ms = 6000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Step 1: ZIP code → { lat, lng, city, state, displayName }
 *
 * Primary:  Nominatim text search — CORS-enabled, works for all US ZIPs.
 * Fallback: api.zippopotam.us — faster but occasionally unreachable.
 */
export async function geocodeZip(zip) {
  if (!/^\d{5}$/.test(zip)) throw new Error('Please enter a valid 5-digit ZIP code.')

  // ──- Provider 1: Nominatim text search ──────────────────────────────────────
  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(zip)}&countrycodes=US&format=json&limit=1&addressdetails=1`
    const res = await fetchWithTimeout(url, { headers: { 'Accept-Language': 'en' } }, 8000)
    if (res.ok) {
      const data = await res.json()
      if (data.length) {
        const item = data[0]
        const addr = item.address || {}
        const city =
          addr.city || addr.town || addr.village || addr.suburb || addr.county || zip
        // Nominatim may return 'state_code' (e.g. "MA") or ISO3166 tag ("US-MA")
        const stateRaw = addr.state_code || addr['ISO3166-2-lvl4'] || ''
        const state = stateRaw.replace(/^US-/, '')
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          city,
          state,
          displayName: item.display_name,
        }
      }
    }
  } catch {
    // Provider 1 failed — fall through
  }

  // ── Provider 2: zippopotam.us ─────────────────────────────────────────────
  try {
    const res = await fetchWithTimeout(`https://api.zippopotam.us/us/${zip}`, {}, 6000)
    if (res.ok) {
      const data = await res.json()
      const place = data.places?.[0]
      if (place) {
        return {
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude),
          city: place['place name'],
          state: place['state abbreviation'],
          displayName: `${place['place name']}, ${place['state abbreviation']} ${zip}`,
        }
      }
    }
    if (res.status === 404) throw new Error(`ZIP code ${zip} not found. Please check and try again.`)
  } catch (e) {
    if (e.message.includes('not found')) throw e
    // Provider 2 also unreachable
  }

  throw new Error(`ZIP code ${zip} not found. Please check the number and try again.`)
}

/**
 * Step 2: lat/lng → county info via Census Bureau geocoder.
 * Returns { fips, name, stateAbbr }
 */
export async function getCountyInfo(lat, lng) {
  // benchmark=Public_AR_Current, vintage=Current_Current are the correct pair
  const url =
    `https://geocoding.geo.census.gov/geocoder/geographies/coordinates` +
    `?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`
  const res = await fetchWithTimeout(url, {}, 10000)
  if (!res.ok) throw new Error(`Census geocoder failed (${res.status}).`)
  const data = await res.json()
  const counties = data?.result?.geographies?.Counties
  if (!counties?.length) throw new Error('Could not determine county for this location.')
  const c = counties[0]
  return {
    fips: c.STATE + c.COUNTY,        // 5-digit FIPS e.g. "25027"
    name: c.NAME || 'Unknown County', // e.g. "Worcester County"
    stateAbbr: c.STATEABBRV || c.STATE,
  }
}

/**
 * Step 3: county FIPS → FEMA NRI risk data.
 * Tries multiple known endpoint formats; returns partial data if FEMA is unreachable
 * so that the map marker and county name still display.
 *
 * The returned object includes `_femaAvailable: false` when real data could not be loaded.
 */
export async function fetchFEMARisk(lat, lng) {
  // Step 1: Try Census geocoder for county FIPS — non-fatal if unreachable
  let fips = null, countyName = null, stateAbbr = null
  try {
    const countyInfo = await getCountyInfo(lat, lng)
    fips = countyInfo.fips
    countyName = countyInfo.name
    stateAbbr = countyInfo.stateAbbr
  } catch {
    // Census API unreachable (CORS or timeout) — skip FEMA lookup entirely
    return { COUNTY: null, STATE: null, RISK_SCORE: null, RISK_RATNG: null, _femaAvailable: false }
  }

  // Step 2: Try FEMA NRI endpoints with the county FIPS
  const endpoints = [
    `https://hazards.fema.gov/nri/api/stateCounty/${fips}`,
    `https://hazards.fema.gov/nri/api/counties/${fips}`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetchWithTimeout(url, {}, 8000)
      if (!res.ok) continue
      const raw = await res.json()
      const record = Array.isArray(raw) ? raw[0] : raw
      if (record && typeof record === 'object' && (record.RISK_SCORE != null || record.COUNTY)) {
        return { ...record, countyFips: fips, _femaAvailable: true }
      }
    } catch {
      // try next endpoint
    }
  }

  return {
    countyFips: fips,
    COUNTY: countyName,
    STATE: stateAbbr,
    RISK_SCORE: null,
    RISK_RATNG: null,
    _femaAvailable: false,
  }
}

/**
 * Step 4: Address → { lat, lng, displayName, zillowUrl }
 * Geocodes via Nominatim and builds a Zillow deep link.
 * Never throws — Zillow URL is always returned even if geocoding fails.
 */
export async function geocodeAddress(address) {
  const zillowUrl = `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}` +
      `&countrycodes=US&format=json&limit=1&accept-language=en`
    const res = await fetch(url)
    if (!res.ok) return { lat: null, lng: null, zillowUrl }
    const data = await res.json()
    if (!data.length) return { lat: null, lng: null, zillowUrl }
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
      zillowUrl,
    }
  } catch {
    return { lat: null, lng: null, zillowUrl }
  }
}

/**
 * Step 5: ZIP → Census ACS5 median home value (B25077_001E).
 * Returns a number or null if unavailable.
 */
export async function fetchCensusMedianValue(zip) {
  try {
    const url =
      `https://api.census.gov/data/2022/acs/acs5` +
      `?get=B25077_001E&for=zip+code+tabulation+area:${zip}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.length < 2) return null
    const val = parseInt(data[1][0], 10)
    return isNaN(val) || val < 0 ? null : val
  } catch {
    return null
  }
}
