/**
 * Live ZIP code lookup pipeline.
 *
 * Orchestrates: geocodeZip → fetchFEMARisk → fetchCensusMedianValue
 * and transforms the raw FEMA NRI record into the same shape used by zipRiskData.js.
 *
 * When FEMA/Census APIs are unreachable (common CORS issue), falls back to
 * the comprehensive state-level hazard profiles in stateHazardProfiles.js so
 * the pie chart always shows meaningful regional disaster data.
 */

import { geocodeZip, fetchFEMARisk, fetchCensusMedianValue } from './api'
import { FEMA_HAZARD_MAP } from '../data/cities'
import { STATE_RISK_DATA } from '../data/stateRiskData'

const RATING_ORDER = [
  'Very High',
  'Relatively High',
  'Relatively Moderate',
  'Relatively Low',
  'Very Low',
]

function normalizeRating(raw) {
  if (!raw) return 'Unknown'
  const s = String(raw).trim()
  for (const r of RATING_ORDER) {
    if (s.toLowerCase().includes(r.toLowerCase())) return r
  }
  return s
}

/**
 * Derives hazard array from a raw FEMA NRI record.
 * Reads {CODE}_RISKV (percentile 0–100) and {CODE}_RISKR per hazard.
 * Returns hazards sorted descending by pct, skipping those with pct ≤ 0.
 */
function extractHazards(record) {
  const hazards = []
  for (const [code, meta] of Object.entries(FEMA_HAZARD_MAP)) {
    const pctRaw = record[`${code}_RISKV`]
    const ratingRaw = record[`${code}_RISKR`]
    const pct = pctRaw != null ? Math.round(Number(pctRaw)) : null
    if (pct == null || pct <= 0) continue
    hazards.push({
      code,
      name: meta.name,
      icon: meta.icon,
      pct: Math.min(pct, 100),
      rating: normalizeRating(ratingRaw),
    })
  }
  return hazards.sort((a, b) => b.pct - a.pct)
}

/**
 * Transforms a FEMA NRI record + geocode result into the local zipData shape.
 * When FEMA data is unavailable or returns no hazards, automatically uses the
 * state-level hazard profile so the pie chart is always populated.
 */
export function transformFEMARecord({ zip, city, state, lat, lng, femaRecord, defaultHomeValue }) {
  const countyName = femaRecord?.COUNTY
    ? `${femaRecord.COUNTY}, ${femaRecord.STATE || state}`
    : `${city || state}, ${state}`

  const femaHazards = femaRecord ? extractHazards(femaRecord) : []
  const femaAvailable = femaRecord?._femaAvailable === true && femaHazards.length > 0

  // Use state-level profile when FEMA data is absent or empty (CORS-blocked)
  const stateProfile = STATE_RISK_DATA[(state || '').toUpperCase()]
  const hazards = femaAvailable ? femaHazards : (stateProfile?.hazards ?? [])
  const riskRating = femaAvailable
    ? normalizeRating(femaRecord?.RISK_RATNG)
    : (stateProfile?.riskRating ?? 'Relatively Moderate')

  return {
    zip,
    city,
    state,
    countyName,
    lat,
    lng,
    riskRating,
    hazards,
    defaultHomeValue: defaultHomeValue ?? null,
    _isLive: true,
    _femaAvailable: femaAvailable,
  }
}

/**
 * Full live lookup for a ZIP code.
 * Returns a zipData-compatible entry or throws with a user-facing error message.
 */
export async function liveZipLookup(zip) {
  const geo = await geocodeZip(zip)

  // fetchFEMARisk never throws — returns { _femaAvailable: false } on any error
  const femaRecord = await fetchFEMARisk(geo.lat, geo.lng)

  let defaultHomeValue = null
  try {
    defaultHomeValue = await fetchCensusMedianValue(zip)
  } catch { /* non-fatal */ }

  return transformFEMARecord({
    zip,
    city: geo.city,
    state: geo.state,
    lat: geo.lat,
    lng: geo.lng,
    femaRecord,
    defaultHomeValue,
  })
}

/**
 * State-level lookup using a geographic centroid lat/lng.
 * Used as a fallback when ZIP lookup fails entirely.
 */
export async function stateLevelLookup(stateCentroid) {
  const { abbr, name, lat, lng } = stateCentroid
  const femaRecord = await fetchFEMARisk(lat, lng)

  return transformFEMARecord({
    zip: abbr,
    city: name,
    state: abbr,
    lat,
    lng,
    femaRecord,
    defaultHomeValue: null,
  })
}
