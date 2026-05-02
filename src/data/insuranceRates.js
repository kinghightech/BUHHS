/**
 * Actuarial rate tables for insurance optimization engine.
 * Pure data exports — no logic.
 */

// Annual $ per $1,000 of coverage
export const BASE_PREMIUM_RATES = {
  homeowner: 3.50, // ~$1,050/yr on $300K home
  renter: 0.85,    // ~$170/yr on $200K contents
  auto: 2.80,      // ~$700/yr on $25K car
}

// Per-hazard premium multipliers: { home, car }
export const HAZARD_PREMIUM_MULTIPLIERS = {
  HRCN: { home: 2.40, car: 1.80 },
  ERQK: { home: 2.60, car: 1.20 },
  CFLD: { home: 2.50, car: 1.70 },
  WFIR: { home: 2.30, car: 1.40 },
  TRND: { home: 2.00, car: 1.60 },
  RFLD: { home: 2.20, car: 1.90 },
  HAIL: { home: 1.50, car: 2.10 },
  WNTW: { home: 1.30, car: 1.40 },
  TSUN: { home: 2.80, car: 1.50 },
  AVLN: { home: 2.00, car: 1.30 },
  LNDS: { home: 1.80, car: 1.20 },
  ISTM: { home: 1.40, car: 1.50 },
  CWAV: { home: 1.15, car: 1.20 },
  SWND: { home: 1.60, car: 1.50 },
  VLCN: { home: 2.50, car: 1.40 },
  DRGT: { home: 1.02, car: 1.02 },
  HWAV: { home: 1.05, car: 1.10 },
  LTNG: { home: 1.20, car: 1.10 },
}

// Rating tier → premium factor
export const TIER_PREMIUM_MULTIPLIERS = {
  'Very Low': 0.70,
  'Relatively Low': 0.85,
  'Relatively Moderate': 1.00,
  'Relatively High': 1.25,
  'Very High': 1.60,
}

// Deductible as % of coverage → premium discount
export const DEDUCTIBLE_DISCOUNT_CURVE = [
  { deductiblePct: 0.00, premiumDiscount: 0.00 },
  { deductiblePct: 0.01, premiumDiscount: 0.08 },
  { deductiblePct: 0.02, premiumDiscount: 0.15 },
  { deductiblePct: 0.05, premiumDiscount: 0.25 },
  { deductiblePct: 0.10, premiumDiscount: 0.35 },
]

// Ownership type → premium adjustment
export const PROPERTY_TYPE_ADJUSTMENTS = {
  owner: 1.00,
  renter: 0.45,
}
