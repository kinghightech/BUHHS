/**
 * All calculation logic for DisasterSafe.
 *
 * Uses an actuarial Expected Annual Loss (EAL) model:
 *   EAL = P(H) x S(H) x E x V x Asset Value
 *
 * Where:
 *   P(H) = Annual probability of hazard event (from HAZARD_PROBABILITY)
 *   S(H) = Severity factor for property damage (from HAZARD_SEVERITY)
 *   E    = Exposure factor (property location/protection)
 *   V    = Vulnerability factor (construction quality/age)
 */

// ────────────────────────────────────────────────────────────────────────────
// HAZARD SEVERITY LABELS  (unchanged — human-readable scale per hazard type)
// ────────────────────────────────────────────────────────────────────────────
const HAZARD_SEVERITY_LABELS = {
  ERQK: {
    'Very Low':            'Magnitude 2\u20133',
    'Relatively Low':      'Magnitude 4\u20135',
    'Relatively Moderate': 'Magnitude 5\u20136',
    'Relatively High':     'Magnitude 6\u20137',
    'Very High':           'Magnitude 7+',
  },
  HRCN: {
    'Very Low':            'Category 1',
    'Relatively Low':      'Category 2',
    'Relatively Moderate': 'Category 3',
    'Relatively High':     'Category 4',
    'Very High':           'Category 5',
  },
  TRND: {
    'Very Low':            'EF0 (Minor)',
    'Relatively Low':      'EF1 (Moderate)',
    'Relatively Moderate': 'EF2 (Significant)',
    'Relatively High':     'EF3\u2013EF4 (Severe)',
    'Very High':           'EF5 (Catastrophic)',
  },
  RFLD: {
    'Very Low':            'Minor Flooding',
    'Relatively Low':      'Moderate Flooding',
    'Relatively Moderate': 'Major Flooding',
    'Relatively High':     'Severe Flooding',
    'Very High':           'Catastrophic Flooding',
  },
  CFLD: {
    'Very Low':            'Minor Storm Surge',
    'Relatively Low':      'Moderate Storm Surge',
    'Relatively Moderate': 'Major Storm Surge',
    'Relatively High':     'Severe Storm Surge',
    'Very High':           'Extreme Storm Surge',
  },
  WFIR: {
    'Very Low':            'Low Fire Danger',
    'Relatively Low':      'Moderate Fire Danger',
    'Relatively Moderate': 'High Fire Danger',
    'Relatively High':     'Very High Fire Danger',
    'Very High':           'Extreme Fire Danger',
  },
  WNTW: {
    'Very Low':            'Winter Advisory',
    'Relatively Low':      'Winter Watch',
    'Relatively Moderate': 'Winter Warning',
    'Relatively High':     'Major Winter Storm',
    'Very High':           'Extreme Blizzard',
  },
  LTNG: {
    'Very Low':            'Low Lightning Density',
    'Relatively Low':      'Moderate Lightning Density',
    'Relatively Moderate': 'High Lightning Density',
    'Relatively High':     'Very High Lightning Density',
    'Very High':           'Extreme Lightning Density',
  },
  HWAV: {
    'Very Low':            'Mild Heat Event',
    'Relatively Low':      'Moderate Heat Event',
    'Relatively Moderate': 'Severe Heat Event',
    'Relatively High':     'Extreme Heat Event',
    'Very High':           'Catastrophic Heat Event',
  },
  HAIL: {
    'Very Low':            'Pea-size Hail (<1")',
    'Relatively Low':      'Quarter-size Hail (1\u20132")',
    'Relatively Moderate': 'Golf Ball-size Hail (2\u20133")',
    'Relatively High':     'Baseball-size Hail (3"+)',
    'Very High':           'Softball-size Hail (4"+)',
  },
  DRGT: {
    'Very Low':            'D0 \u2013 Abnormally Dry',
    'Relatively Low':      'D1 \u2013 Moderate Drought',
    'Relatively Moderate': 'D2 \u2013 Severe Drought',
    'Relatively High':     'D3 \u2013 Extreme Drought',
    'Very High':           'D4 \u2013 Exceptional Drought',
  },
}

// ────────────────────────────────────────────────────────────────────────────
// HAZARD PROBABILITY TABLE — P(H)
// Annual probability of a significant event, keyed by (code, rating tier).
// Calibrated to FEMA NRI annualised frequency data.
// ────────────────────────────────────────────────────────────────────────────
const TIERS = ['Very Low', 'Relatively Low', 'Relatively Moderate', 'Relatively High', 'Very High']

const HAZARD_PROBABILITY = {
  // ── WINTER & ICE ─────────────────────────────────────────────────
  WNTW: [0.25, 0.40, 0.55, 0.70, 0.85],   // winter weather — very common
  CWAV: [0.08, 0.18, 0.30, 0.45, 0.60],    // cold wave
  ISTM: [0.05, 0.12, 0.22, 0.35, 0.50],    // ice storm
  // ── SEVERE WEATHER ───────────────────────────────────────────────
  LTNG: [0.15, 0.30, 0.45, 0.60, 0.75],    // lightning — fairly common
  HAIL: [0.08, 0.18, 0.30, 0.45, 0.60],    // hailstorm
  SWND: [0.10, 0.22, 0.35, 0.50, 0.65],    // strong wind
  HWAV: [0.10, 0.25, 0.40, 0.55, 0.70],    // heat wave
  DRGT: [0.10, 0.25, 0.40, 0.55, 0.70],    // drought
  // ── WATER & FLOODS ───────────────────────────────────────────────
  RFLD: [0.05, 0.12, 0.22, 0.35, 0.50],    // riverine flooding
  CFLD: [0.02, 0.06, 0.12, 0.22, 0.35],    // coastal flooding / storm surge
  TSUN: [0.001, 0.003, 0.008, 0.020, 0.05],// tsunami — extremely rare
  // ── STORMS ───────────────────────────────────────────────────────
  HRCN: [0.02, 0.06, 0.12, 0.20, 0.30],    // hurricane
  TRND: [0.01, 0.04, 0.08, 0.15, 0.25],    // tornado
  // ── FIRE & HEAT ──────────────────────────────────────────────────
  WFIR: [0.02, 0.06, 0.12, 0.22, 0.35],    // wildfire
  // ── GEOLOGIC ─────────────────────────────────────────────────────
  ERQK: [0.005, 0.015, 0.04, 0.08, 0.12],  // earthquake
  AVLN: [0.005, 0.015, 0.04, 0.08, 0.15],  // avalanche
  LNDS: [0.008, 0.025, 0.06, 0.12, 0.20],  // landslide
  VLCN: [0.0005, 0.002, 0.005, 0.012, 0.03],// volcanic activity — extremely rare
}

const DEFAULT_PROBABILITY = [0.03, 0.08, 0.15, 0.25, 0.35]

// ────────────────────────────────────────────────────────────────────────────
// HAZARD SEVERITY TABLE — S(H)
// Per-hazard severity range [min, max] interpolated across the 5 rating tiers.
// `carMult` scales home severity to car severity (preserves old car:home ratio).
// ────────────────────────────────────────────────────────────────────────────
const HAZARD_SEVERITY = {
  // ── SEVERE WEATHER ───────────────────────────────────────────────
  LTNG: { range: [0.05, 0.15], carMult: 0.27 },
  HAIL: { range: [0.10, 0.30], carMult: 2.11 },
  SWND: { range: [0.10, 0.30], carMult: 0.72 },
  HWAV: { range: [0.02, 0.08], carMult: 0.30 },
  DRGT: { range: [0.05, 0.15], carMult: 0.06 },
  // ── WINTER & ICE ─────────────────────────────────────────────────
  WNTW: { range: [0.15, 0.35], carMult: 1.01 },
  CWAV: { range: [0.12, 0.30], carMult: 0.91 },
  ISTM: { range: [0.15, 0.40], carMult: 0.89 },
  // ── WATER & FLOODS ───────────────────────────────────────────────
  RFLD: { range: [0.40, 0.75], carMult: 1.16 },
  CFLD: { range: [0.45, 0.80], carMult: 1.05 },
  TSUN: { range: [0.60, 0.95], carMult: 0.95 },
  // ── STORMS ───────────────────────────────────────────────────────
  HRCN: { range: [0.60, 0.95], carMult: 0.74 },
  TRND: { range: [0.50, 0.85], carMult: 0.93 },
  // ── FIRE ─────────────────────────────────────────────────────────
  WFIR: { range: [0.30, 0.90], carMult: 0.69 },
  // ── GEOLOGIC ─────────────────────────────────────────────────────
  ERQK: { range: [0.70, 1.00], carMult: 0.18 },
  AVLN: { range: [0.55, 0.90], carMult: 0.92 },
  LNDS: { range: [0.55, 0.92], carMult: 0.89 },
  VLCN: { range: [0.60, 0.95], carMult: 0.89 },
}

const DEFAULT_SEVERITY = { range: [0.20, 0.50], carMult: 0.50 }

// ────────────────────────────────────────────────────────────────────────────
// HAZARD WEIGHTS — for multi-hazard weighted risk index
// Based on US average annualised loss contribution (FEMA NRI national data).
// ────────────────────────────────────────────────────────────────────────────
const HAZARD_WEIGHTS = {
  WNTW: 0.38,
  RFLD: 0.20,
  LTNG: 0.13,
  HRCN: 0.11,
  HWAV: 0.08,
  TRND: 0.05,
  ERQK: 0.03,
  HAIL: 0.02,
}

const DEFAULT_WEIGHT = 0.02

// ────────────────────────────────────────────────────────────────────────────
// EXPOSURE & VULNERABILITY OPTIONS — exported for InputForm dropdowns
// ────────────────────────────────────────────────────────────────────────────
export const EXPOSURE_OPTIONS = [
  { value: 0.20, labelKey: 'exposure.wellProtected',  descKey: 'exposure.wellProtected.desc' },
  { value: 0.35, labelKey: 'exposure.protected',      descKey: 'exposure.protected.desc' },
  { value: 0.50, labelKey: 'exposure.moderate',       descKey: 'exposure.moderate.desc' },
  { value: 0.70, labelKey: 'exposure.elevated',       descKey: 'exposure.elevated.desc' },
  { value: 0.85, labelKey: 'exposure.high',           descKey: 'exposure.high.desc' },
  { value: 1.00, labelKey: 'exposure.maximum',        descKey: 'exposure.maximum.desc' },
]

export const VULNERABILITY_OPTIONS = [
  { value: 0.15, labelKey: 'vulnerability.fortified',      descKey: 'vulnerability.fortified.desc' },
  { value: 0.30, labelKey: 'vulnerability.resilient',      descKey: 'vulnerability.resilient.desc' },
  { value: 0.45, labelKey: 'vulnerability.average',        descKey: 'vulnerability.average.desc' },
  { value: 0.65, labelKey: 'vulnerability.belowAverage',   descKey: 'vulnerability.belowAverage.desc' },
  { value: 0.80, labelKey: 'vulnerability.vulnerable',     descKey: 'vulnerability.vulnerable.desc' },
  { value: 1.00, labelKey: 'vulnerability.veryVulnerable', descKey: 'vulnerability.veryVulnerable.desc' },
]

// ────────────────────────────────────────────────────────────────────────────
// RATING TIERS (for severity options UI)
// ────────────────────────────────────────────────────────────────────────────
const RATING_TIERS = [
  { rating: 'Very Low',            color: '#38BDF8' },
  { rating: 'Relatively Low',      color: '#2DD4BF' },
  { rating: 'Relatively Moderate', color: '#F59E0B' },
  { rating: 'Relatively High',     color: '#F97316' },
  { rating: 'Very High',           color: '#EF4444' },
]

// ────────────────────────────────────────────────────────────────────────────
// HELPER: tier index
// ────────────────────────────────────────────────────────────────────────────
function tierIndex(rating) {
  const idx = TIERS.indexOf(rating)
  return idx < 0 ? 2 : idx // default to middle tier
}

function tierT(rating) {
  return tierIndex(rating) / (TIERS.length - 1) // 0 → 1
}

// ────────────────────────────────────────────────────────────────────────────
// PUBLIC HELPERS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Look up severity label for a hazard code + rating.
 */
export function getSeverityLabel(code, rating, customSeverity) {
  if (customSeverity) return customSeverity
  return HAZARD_SEVERITY_LABELS[code]?.[rating] ?? rating ?? 'Unknown'
}

/**
 * Returns the ordered list of severity options for a given hazard code.
 */
export function getSeverityOptions(code) {
  const labels = HAZARD_SEVERITY_LABELS[code] || {}
  return RATING_TIERS.map(({ rating, color }) => ({
    rating,
    label: labels[rating] ?? rating,
    color,
  }))
}

/**
 * P(H) — Annual probability for a hazard at a given rating tier.
 */
export function getHazardProbability(code, rating) {
  const probs = HAZARD_PROBABILITY[code] ?? DEFAULT_PROBABILITY
  return probs[tierIndex(rating)]
}

/**
 * S(H) — Severity factors for home and car at a given rating tier.
 * Home severity is interpolated from the [min, max] range.
 * Car severity = homeSeverity × carMult.
 */
export function getHazardSeverityFactor(code, rating) {
  const { range, carMult } = HAZARD_SEVERITY[code] ?? DEFAULT_SEVERITY
  const t = tierT(rating)
  const homeSeverity = range[0] + t * (range[1] - range[0])
  const carSeverity  = homeSeverity * carMult
  return { homeSeverity, carSeverity }
}

/**
 * Multi-hazard weighted risk index (0–100).
 * Formula: sum(wi × Pi × Si × E × V) × 100
 */
export function computeMultiHazardRiskIndex(hazards, E, V) {
  let score = 0
  for (const h of hazards) {
    const w = HAZARD_WEIGHTS[h.code] ?? DEFAULT_WEIGHT
    const p = getHazardProbability(h.code, h.rating)
    const { homeSeverity } = getHazardSeverityFactor(h.code, h.rating)
    score += w * p * homeSeverity * E * V
  }
  return score * 100
}

/**
 * 5-tier risk classification from the weighted risk index (0–100).
 */
export function classifyRiskLevel(score) {
  if (score >= 70) return 'Severe'
  if (score >= 50) return 'High'
  if (score >= 30) return 'Moderate'
  if (score >= 15) return 'Low'
  return 'Very Low'
}

// ────────────────────────────────────────────────────────────────────────────
// DEPRECATED — kept for backward compatibility
// ────────────────────────────────────────────────────────────────────────────
/** @deprecated Use getHazardProbability() instead */
export function calculateRiskScore(riskValue) {
  return riskValue / 5
}
/** @deprecated Use getHazardProbability() instead */
export function calculateProbability(riskScore) {
  return riskScore * 0.15
}

// ────────────────────────────────────────────────────────────────────────────
// BUILD CITY DATA
// ────────────────────────────────────────────────────────────────────────────
const RATING_TO_RISK_VALUE = {
  'Very High':           4.5,
  'Relatively High':     3.5,
  'Relatively Moderate': 2.5,
  'Relatively Low':      1.5,
  'Very Low':            0.5,
}

function ratingToColor(ratingStr = '') {
  if (ratingStr.includes('Very High'))           return '#ef4444'
  if (ratingStr.includes('Relatively High'))     return '#f97316'
  if (ratingStr.includes('Relatively Moderate')) return '#f59e0b'
  if (ratingStr.includes('Relatively Low'))      return '#84cc16'
  return '#22c55e'
}

/**
 * Build a cityData-compatible object from a local ZIP database entry.
 */
export function buildCityDataFromLocal(zipEntry) {
  if (!zipEntry) return null

  const { riskRating = 'Relatively Moderate', hazards = [], zip, countyName } = zipEntry

  const riskValue = RATING_TO_RISK_VALUE[riskRating] ?? 2.5
  const color = ratingToColor(riskRating)

  const topHazards = hazards.slice(0, 3).map((h) => ({
    code: h.code,
    score: h.pct,
    rating: h.rating,
    severityLabel: getSeverityLabel(h.code, h.rating, h.severity),
  }))

  const primaryHazard = hazards[0]?.name || 'Multiple Hazards'
  const primaryIcon   = hazards[0]?.icon || '\u26A0\uFE0F'

  return {
    riskValue,
    color,
    disaster: primaryHazard,
    primaryIcon,
    description: `${countyName} \u2014 Risk Rating: ${riskRating}`,
    countyName,
    riskRating,
    topHazards,
    allHazards: hazards,
    zip,
    femaUnavailable: false,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN CALCULATION ENGINE
// ────────────────────────────────────────────────────────────────────────────

/**
 * Run all calculations for a location and user inputs.
 *
 * EAL per asset = P(H) x S(H) x E x V x AssetValue
 * Multi-hazard risk index = sum(wi x Pi x Si x E x V) x 100
 *
 * @param {{ topHazards: array, allHazards?: array }} cityData
 * @param {object} inputs
 * @param {{ code, rating, name, icon, pct, severity? }|null} overrideHazard
 */
export function calculateAll(cityData, inputs, overrideHazard = null) {
  const { topHazards = [], allHazards = [] } = cityData
  const {
    ownershipType = 'owner',
    homeValue = 0,
    carValue = 0,
    homeInsuranceCoverage = 0,
    carInsuranceCoverage = 0,
    exposureFactor = 0.50,
    vulnerabilityFactor = 0.45,
  } = inputs

  const isRenter = ownershipType === 'renter'
  const E = exposureFactor
  const V = vulnerabilityFactor

  // ── Active hazard (for per-hazard damage calc) ────────────────────────
  const activeHazard  = overrideHazard ?? topHazards[0] ?? null
  const primaryCode   = activeHazard?.code   ?? 'DEFAULT'
  const primaryRating = activeHazard?.rating ?? 'Relatively Moderate'
  const primarySeverityLabel = getSeverityLabel(primaryCode, primaryRating, activeHazard?.severity)

  // ── P(H) — annual probability of active hazard ────────────────────────
  const probability = getHazardProbability(primaryCode, primaryRating)

  // ── S(H) — severity factor ────────────────────────────────────────────
  const { homeSeverity, carSeverity } = getHazardSeverityFactor(primaryCode, primaryRating)

  // ── EAL = P(H) x S(H) x E x V x Asset Value ─────────────────────────
  // Renters: personal belongings only — S(H) × 0.55
  const homeDamage          = probability * (isRenter ? homeSeverity * 0.55 : homeSeverity) * E * V * homeValue
  const homeInsuranceOffset = Math.min(homeInsuranceCoverage, homeDamage)
  const homeOOP             = Math.max(homeDamage - homeInsuranceCoverage, 0)

  const carDamage           = probability * carSeverity * E * V * carValue
  const carInsuranceOffset  = Math.min(carInsuranceCoverage, carDamage)
  const carOOP              = Math.max(carDamage - carInsuranceCoverage, 0)

  const totalOOP             = homeOOP + carOOP
  const totalDamage          = homeDamage + carDamage
  const totalInsuranceOffset = homeInsuranceOffset + carInsuranceOffset

  // Emergency fund = disaster OOP × 1.2, with a $1,500 hard minimum so it
  // is never $0 — a fund of zero is not a meaningful safety net.
  const disasterFund          = totalOOP * 1.2
  const emergencyFundAtMinimum = disasterFund < 1500
  const emergencyFund         = Math.max(disasterFund, 1500)

  const preparedness =
    totalDamage > 0 ? Math.min((totalInsuranceOffset / totalDamage) * 100, 100) : 100

  // ── Multi-hazard weighted risk index ──────────────────────────────────
  const hazardsForIndex = allHazards.length > 0 ? allHazards : topHazards
  const riskIndex = computeMultiHazardRiskIndex(hazardsForIndex, E, V)
  const riskScore = riskIndex / 100  // 0–1 for backward compat
  const riskLevel = classifyRiskLevel(riskIndex)

  return {
    riskScore,
    probability,
    isRenter,
    primaryCode,
    primaryRating,
    primarySeverityLabel,
    homeDamage,
    homeInsuranceOffset,
    homeOOP,
    carDamage,
    carInsuranceOffset,
    carOOP,
    totalOOP,
    totalDamage,
    totalInsuranceOffset,
    emergencyFund,
    emergencyFundAtMinimum,
    preparedness,
    riskLevel,
    topHazards,
    damage: totalDamage,     // alias for Charts.jsx
    outOfPocket: totalOOP,   // alias for Charts.jsx
  }
}
