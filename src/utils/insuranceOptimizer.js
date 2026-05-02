/**
 * Insurance Optimization Engine
 *
 * Monte Carlo simulation, optimal coverage finder, gap analysis,
 * and recommendation generator. All functions are pure (no React).
 */

import { getHazardProbability, getHazardSeverityFactor } from './calculator'
import {
  BASE_PREMIUM_RATES,
  HAZARD_PREMIUM_MULTIPLIERS,
  TIER_PREMIUM_MULTIPLIERS,
  PROPERTY_TYPE_ADJUSTMENTS,
} from '../data/insuranceRates'
import { trainRiskModel, predictWithModel, getModelMetrics } from './riskModel'

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function sampleTriangular(min, mode, max) {
  const u = Math.random()
  const fc = (mode - min) / (max - min)
  return u < fc
    ? min + Math.sqrt(u * (max - min) * (mode - min))
    : max - Math.sqrt((1 - u) * (max - min) * (max - mode))
}

const TIER_ORDER = ['Very Low', 'Relatively Low', 'Relatively Moderate', 'Relatively High', 'Very High']

function highestTier(hazards) {
  let maxIdx = 0
  for (const h of hazards) {
    const idx = TIER_ORDER.indexOf(h.rating)
    if (idx > maxIdx) maxIdx = idx
  }
  return TIER_ORDER[maxIdx]
}

// ────────────────────────────────────────────────────────────────────────────
// a) Estimate Annual Premium
// ────────────────────────────────────────────────────────────────────────────

export function estimateAnnualPremium(coverage, hazards, propertyType, assetType) {
  if (coverage <= 0 || !hazards?.length) return 0

  const baseRate = assetType === 'car' ? BASE_PREMIUM_RATES.auto
    : propertyType === 'renter' ? BASE_PREMIUM_RATES.renter
    : BASE_PREMIUM_RATES.homeowner

  // Weighted hazard multiplier
  let hazardMult = 0
  for (const h of hazards) {
    const mults = HAZARD_PREMIUM_MULTIPLIERS[h.code]
    const key = assetType === 'car' ? 'car' : 'home'
    const m = mults ? mults[key] : 1.0
    hazardMult += m * (h.pct / 100)
  }

  // Tier multiplier: highest severity tier across hazards
  const tier = highestTier(hazards)
  const tierMult = TIER_PREMIUM_MULTIPLIERS[tier] ?? 1.0

  // Property type adjustment (only for home/renter, not car)
  const propAdj = assetType === 'car' ? 1.0 : (PROPERTY_TYPE_ADJUSTMENTS[propertyType] ?? 1.0)

  return (coverage / 1000) * baseRate * hazardMult * tierMult * propAdj
}

// ────────────────────────────────────────────────────────────────────────────
// b) Monte Carlo Loss Simulation
// ────────────────────────────────────────────────────────────────────────────

export function monteCarloLossSimulation(hazards, homeValue, carValue, E, V, isRenter, iterations = 10000) {
  const homeLosses = new Float64Array(iterations)
  const carLosses = new Float64Array(iterations)
  const totalLosses = new Float64Array(iterations)

  for (let i = 0; i < iterations; i++) {
    let hLoss = 0
    let cLoss = 0

    for (const h of hazards) {
      const prob = getHazardProbability(h.code, h.rating)
      if (Math.random() > prob) continue // no event this year

      const { homeSeverity, carSeverity } = getHazardSeverityFactor(h.code, h.rating)

      // Triangular distribution around severity
      const sMin = homeSeverity * 0.5
      const sMax = Math.min(homeSeverity * 1.5, 1.0)
      const sampledHomeSev = sampleTriangular(sMin, homeSeverity, sMax)

      const cMin = carSeverity * 0.5
      const cMax = Math.min(carSeverity * 1.5, 1.0)
      const sampledCarSev = sampleTriangular(cMin, carSeverity, cMax)

      hLoss += sampledHomeSev * E * V * homeValue * (isRenter ? 0.55 : 1.0)
      cLoss += sampledCarSev * E * V * carValue
    }

    homeLosses[i] = hLoss
    carLosses[i] = cLoss
    totalLosses[i] = hLoss + cLoss
  }

  // Sort for percentiles
  const sorted = Array.from(totalLosses).sort((a, b) => a - b)
  const homeArr = Array.from(homeLosses)
  const carArr = Array.from(carLosses)

  const sum = (arr) => arr.reduce((s, v) => s + v, 0)
  const mean = sum(sorted) / iterations
  const homeMean = sum(homeArr) / iterations
  const carMean = sum(carArr) / iterations
  const median = sorted[Math.floor(iterations * 0.5)]
  const p75 = sorted[Math.floor(iterations * 0.75)]
  const p90 = sorted[Math.floor(iterations * 0.90)]
  const p95 = sorted[Math.floor(iterations * 0.95)]
  const p99 = sorted[Math.floor(iterations * 0.99)]
  const max = sorted[iterations - 1]

  // 20-bin histogram
  const binCount = 20
  const histogram = new Array(binCount).fill(0)
  const binMax = max > 0 ? max : 1
  for (let i = 0; i < iterations; i++) {
    const bin = Math.min(Math.floor((sorted[i] / binMax) * binCount), binCount - 1)
    histogram[bin]++
  }
  const binWidth = binMax / binCount
  const histogramLabels = histogram.map((_, i) => Math.round(i * binWidth))

  return {
    mean, median, p75, p90, p95, p99, max,
    homeMean, carMean,
    histogram, histogramLabels, binWidth,
    samples: sorted,
    homeSamples: homeArr,
    carSamples: carArr,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// c) Find Optimal Coverage
// ────────────────────────────────────────────────────────────────────────────

export function findOptimalCoverage(hazards, homeValue, carValue, E, V, isRenter) {
  const propertyType = isRenter ? 'renter' : 'owner'
  const mc = monteCarloLossSimulation(hazards, homeValue, carValue, E, V, isRenter)

  // Grid search: 0%, 10%, 20% ... 120% of asset value
  const candidates = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]
  const N = mc.samples.length

  function findBest(assetValue, assetType, samples) {
    let bestC = 0, bestCost = Infinity, bestPremium = 0
    for (const frac of candidates) {
      const C = Math.round(frac * assetValue)
      const premium = estimateAnnualPremium(C, hazards, propertyType, assetType)
      let uncoveredSum = 0
      for (let i = 0; i < N; i++) {
        uncoveredSum += Math.max(0, samples[i] - C)
      }
      const expectedUncovered = uncoveredSum / N
      const totalCost = premium + expectedUncovered
      if (totalCost < bestCost) {
        bestCost = totalCost
        bestC = C
        bestPremium = premium
      }
    }
    return { coverage: bestC, premium: bestPremium, totalCost: bestCost }
  }

  const homeOpt = findBest(homeValue, 'home', mc.homeSamples)
  const carOpt = findBest(carValue, 'car', mc.carSamples)

  const currentHomePremium = estimateAnnualPremium(homeValue, hazards, propertyType, 'home')
  const currentCarPremium = estimateAnnualPremium(carValue, hazards, propertyType, 'car')

  return {
    optimalHomeCoverage: homeOpt.coverage,
    optimalCarCoverage: carOpt.coverage,
    optimalHomePremium: homeOpt.premium,
    optimalCarPremium: carOpt.premium,
    optimalHomeTotalCost: homeOpt.totalCost,
    optimalCarTotalCost: carOpt.totalCost,
    currentHomePremium,
    currentCarPremium,
    expectedSavings: (currentHomePremium + currentCarPremium) - (homeOpt.premium + carOpt.premium),
    mcResults: mc,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// d) Analyze Insurance Gaps
// ────────────────────────────────────────────────────────────────────────────

export function analyzeInsuranceGaps(inputs, results, hazards, optimalResult) {
  const { homeInsuranceCoverage = 0, carInsuranceCoverage = 0 } = inputs
  const { optimalHomeCoverage, optimalCarCoverage } = optimalResult

  function classify(current, optimal) {
    const gap = optimal - current
    if (gap > 500) return 'underInsured'
    if (current > optimal * 1.15) return 'overInsured'
    return 'wellOptimized'
  }

  const homeStatus = classify(homeInsuranceCoverage, optimalHomeCoverage)
  const carStatus = classify(carInsuranceCoverage, optimalCarCoverage)

  // Premium efficiency: 100 × (1 - |currentCost - optimalCost| / optimalCost)
  const currentHomePrem = estimateAnnualPremium(homeInsuranceCoverage, hazards, inputs.ownershipType, 'home')
  const currentCarPrem = estimateAnnualPremium(carInsuranceCoverage, hazards, inputs.ownershipType, 'car')
  const currentTotal = currentHomePrem + currentCarPrem
  const optimalTotal = optimalResult.optimalHomePremium + optimalResult.optimalCarPremium
  const premiumEfficiency = optimalTotal > 0
    ? Math.max(0, Math.min(100, 100 * (1 - Math.abs(currentTotal - optimalTotal) / optimalTotal)))
    : 100

  // Risk exposure index: residual uncovered risk (0-100)
  const mc = optimalResult.mcResults
  const homeUncovered = mc.homeMean > 0
    ? Math.max(0, mc.homeMean - homeInsuranceCoverage) / mc.homeMean
    : 0
  const carUncovered = mc.carMean > 0
    ? Math.max(0, mc.carMean - carInsuranceCoverage) / mc.carMean
    : 0
  const riskExposureIndex = Math.min(100, ((homeUncovered + carUncovered) / 2) * 100)

  // Coverage gap in dollars
  const homeGap = Math.max(0, optimalHomeCoverage - homeInsuranceCoverage)
  const carGap = Math.max(0, optimalCarCoverage - carInsuranceCoverage)
  const totalGap = homeGap + carGap

  // Per-hazard breakdown
  const hazardBreakdown = hazards.map(h => {
    const prob = getHazardProbability(h.code, h.rating)
    const { homeSeverity, carSeverity } = getHazardSeverityFactor(h.code, h.rating)
    const E = inputs.exposureFactor
    const V = inputs.vulnerabilityFactor
    const isRenter = inputs.ownershipType === 'renter'
    const expHomeLoss = prob * (isRenter ? homeSeverity * 0.55 : homeSeverity) * E * V * (inputs.homeValue || 0)
    const expCarLoss = prob * carSeverity * E * V * (inputs.carValue || 0)
    const totalExpLoss = expHomeLoss + expCarLoss
    const totalCoverage = homeInsuranceCoverage + carInsuranceCoverage
    const adequacy = totalExpLoss > 0 ? Math.min(200, (totalCoverage / totalExpLoss) * 100) : 200

    return {
      code: h.code,
      name: h.name,
      icon: h.icon,
      pct: h.pct,
      probability: prob,
      expectedLoss: totalExpLoss,
      adequacy,
    }
  })

  return {
    homeStatus,
    carStatus,
    premiumEfficiency,
    riskExposureIndex,
    totalGap,
    homeGap,
    carGap,
    currentHomePremium: currentHomePrem,
    currentCarPremium: currentCarPrem,
    hazardBreakdown,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// e) Generate Recommendations
// ────────────────────────────────────────────────────────────────────────────

export function generateRecommendations(gapAnalysis, inputs, optimalResult) {
  const recommendations = []
  const { homeInsuranceCoverage = 0, carInsuranceCoverage = 0 } = inputs
  const { optimalHomeCoverage, optimalCarCoverage } = optimalResult

  // Home recommendations
  if (gapAnalysis.homeStatus === 'underInsured') {
    const increase = optimalHomeCoverage - homeInsuranceCoverage
    recommendations.push({
      type: 'increase',
      asset: inputs.ownershipType === 'renter' ? 'renter' : 'home',
      amount: increase,
      currentCoverage: homeInsuranceCoverage,
      optimalCoverage: optimalHomeCoverage,
      reason: homeInsuranceCoverage === 0 ? 'noCoverage' : 'underinsured',
      estimatedSavings: 0,
      priority: increase > optimalHomeCoverage * 0.5 ? 'high' : 'medium',
    })
  } else if (gapAnalysis.homeStatus === 'overInsured') {
    const excess = homeInsuranceCoverage - optimalHomeCoverage
    const savingsEst = gapAnalysis.currentHomePremium - optimalResult.optimalHomePremium
    recommendations.push({
      type: 'decrease',
      asset: inputs.ownershipType === 'renter' ? 'renter' : 'home',
      amount: excess,
      currentCoverage: homeInsuranceCoverage,
      optimalCoverage: optimalHomeCoverage,
      reason: 'overinsured',
      estimatedSavings: Math.max(0, savingsEst),
      priority: savingsEst > 500 ? 'high' : 'low',
    })
  }

  // Car recommendations
  if (gapAnalysis.carStatus === 'underInsured') {
    const increase = optimalCarCoverage - carInsuranceCoverage
    recommendations.push({
      type: 'increase',
      asset: 'car',
      amount: increase,
      currentCoverage: carInsuranceCoverage,
      optimalCoverage: optimalCarCoverage,
      reason: carInsuranceCoverage === 0 ? 'noCoverage' : 'underinsured',
      estimatedSavings: 0,
      priority: increase > optimalCarCoverage * 0.5 ? 'high' : 'medium',
    })
  } else if (gapAnalysis.carStatus === 'overInsured') {
    const excess = carInsuranceCoverage - optimalCarCoverage
    const savingsEst = gapAnalysis.currentCarPremium - optimalResult.optimalCarPremium
    recommendations.push({
      type: 'decrease',
      asset: 'car',
      amount: excess,
      currentCoverage: carInsuranceCoverage,
      optimalCoverage: optimalCarCoverage,
      reason: 'overinsured',
      estimatedSavings: Math.max(0, savingsEst),
      priority: savingsEst > 300 ? 'high' : 'low',
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

// ────────────────────────────────────────────────────────────────────────────
// f) Run Full Analysis — Master Orchestrator
// ────────────────────────────────────────────────────────────────────────────

let cachedModel = null

export async function runFullAnalysis(zipData, inputs, results) {
  if (!zipData?.hazards?.length || !results) return null

  const hazards = zipData.hazards
  const E = inputs.exposureFactor
  const V = inputs.vulnerabilityFactor
  const isRenter = inputs.ownershipType === 'renter'

  // c) Optimal coverage (includes Monte Carlo)
  const optimalResult = findOptimalCoverage(
    hazards, inputs.homeValue || 0, inputs.carValue || 0, E, V, isRenter
  )

  // d) Gap analysis
  const gapAnalysis = analyzeInsuranceGaps(inputs, results, hazards, optimalResult)

  // e) Recommendations
  const recommendations = generateRecommendations(gapAnalysis, inputs, optimalResult)

  // TF.js AI prediction
  let aiPrediction = null
  try {
    if (!cachedModel) {
      cachedModel = await trainRiskModel(hazards, E, V)
    }
    if (cachedModel) {
      aiPrediction = await predictWithModel(cachedModel, {
        hazards,
        E, V,
        homeValue: inputs.homeValue || 0,
        carValue: inputs.carValue || 0,
        isRenter,
        riskRating: zipData.riskRating || 'Relatively Moderate',
      })
      aiPrediction.metrics = getModelMetrics(cachedModel)
    }
  } catch {
    // Graceful fallback — actuarial-only mode
    aiPrediction = null
  }

  // Overall score
  const coverageScore = (gapAnalysis.homeStatus === 'wellOptimized' ? 50 : 0)
    + (gapAnalysis.carStatus === 'wellOptimized' ? 50 : 0)
  const overallScore = Math.round(
    gapAnalysis.premiumEfficiency * 0.4
    + (100 - gapAnalysis.riskExposureIndex) * 0.3
    + coverageScore * 0.3
  )

  return {
    overallScore,
    optimalResult,
    gapAnalysis,
    recommendations,
    aiPrediction,
    mcResults: optimalResult.mcResults,
  }
}
