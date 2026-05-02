/**
 * TensorFlow.js Neural Risk Model
 *
 * A small feedforward neural network trained in-browser on synthetic
 * actuarial data for risk scoring and loss prediction.
 *
 * Architecture:
 *   Input: 12 features
 *   Hidden: 32 → 16 (ReLU)
 *   Output: 3 (predicted home loss, predicted car loss, risk confidence)
 */

import { getHazardProbability, getHazardSeverityFactor } from './calculator'

let tf = null

async function loadTF() {
  if (tf) return tf
  try {
    tf = await import('@tensorflow/tfjs')
    return tf
  } catch {
    return null
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Feature extraction
// ────────────────────────────────────────────────────────────────────────────

const TIER_ORDER = ['Very Low', 'Relatively Low', 'Relatively Moderate', 'Relatively High', 'Very High']

function ratingToIndex(rating) {
  const idx = TIER_ORDER.indexOf(rating)
  return idx >= 0 ? idx / 4 : 0.5 // normalize to 0–1
}

function extractFeatures({ hazards, E, V, homeValue, carValue, isRenter, riskRating }) {
  // Top 3 hazard probabilities and severities (pad with 0 if < 3 hazards)
  const probs = [0, 0, 0]
  const sevs = [0, 0, 0]
  const top3 = (hazards || []).slice(0, 3)
  for (let i = 0; i < top3.length; i++) {
    probs[i] = getHazardProbability(top3[i].code, top3[i].rating)
    sevs[i] = getHazardSeverityFactor(top3[i].code, top3[i].rating).homeSeverity
  }

  return [
    probs[0], probs[1], probs[2],
    sevs[0], sevs[1], sevs[2],
    E,
    V,
    homeValue > 0 ? Math.log10(homeValue) / 7 : 0, // normalize log-scaled (7 = log10(10M))
    carValue > 0 ? Math.log10(carValue) / 6 : 0,    // normalize log-scaled (6 = log10(1M))
    isRenter ? 1 : 0,
    ratingToIndex(riskRating),
  ]
}

// ────────────────────────────────────────────────────────────────────────────
// Synthetic data generation
// ────────────────────────────────────────────────────────────────────────────

function generateSyntheticData(hazards, baseE, baseV, sampleCount = 500) {
  const inputs = []
  const outputs = []

  const homeValues = [50000, 100000, 150000, 200000, 300000, 500000, 750000, 1000000]
  const carValues = [5000, 10000, 15000, 25000, 35000, 50000]
  const exposures = [0.2, 0.35, 0.5, 0.7, 0.85, 1.0]
  const vulns = [0.15, 0.3, 0.45, 0.65, 0.8, 1.0]

  for (let i = 0; i < sampleCount; i++) {
    const hv = homeValues[Math.floor(Math.random() * homeValues.length)]
    const cv = carValues[Math.floor(Math.random() * carValues.length)]
    const E = exposures[Math.floor(Math.random() * exposures.length)]
    const V = vulns[Math.floor(Math.random() * vulns.length)]
    const isRenter = Math.random() < 0.3

    const features = extractFeatures({
      hazards, E, V, homeValue: hv, carValue: cv, isRenter,
      riskRating: TIER_ORDER[Math.floor(Math.random() * TIER_ORDER.length)],
    })

    // Compute ground-truth losses from actuarial model
    let homeLoss = 0, carLoss = 0
    for (const h of hazards) {
      const prob = getHazardProbability(h.code, h.rating)
      const { homeSeverity, carSeverity } = getHazardSeverityFactor(h.code, h.rating)
      homeLoss += prob * (isRenter ? homeSeverity * 0.55 : homeSeverity) * E * V * hv
      carLoss += prob * carSeverity * E * V * cv
    }

    // Normalize outputs for training (divide by max expected values)
    const normHomeLoss = Math.min(homeLoss / 100000, 1)
    const normCarLoss = Math.min(carLoss / 50000, 1)
    // Confidence: higher when inputs are in typical ranges
    const confidence = Math.min(1, 0.5 + (E + V) / 4)

    inputs.push(features)
    outputs.push([normHomeLoss, normCarLoss, confidence])
  }

  return { inputs, outputs }
}

// ────────────────────────────────────────────────────────────────────────────
// Model training
// ────────────────────────────────────────────────────────────────────────────

let modelMetrics = null

export async function trainRiskModel(hazards, E, V) {
  const tfLib = await loadTF()
  if (!tfLib) return null

  const { inputs, outputs } = generateSyntheticData(hazards, E, V, 500)

  const model = tfLib.sequential()
  model.add(tfLib.layers.dense({ inputShape: [12], units: 32, activation: 'relu' }))
  model.add(tfLib.layers.dense({ units: 16, activation: 'relu' }))
  model.add(tfLib.layers.dense({ units: 3, activation: 'sigmoid' }))

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' })

  const xs = tfLib.tensor2d(inputs)
  const ys = tfLib.tensor2d(outputs)

  const history = await model.fit(xs, ys, { epochs: 50, batchSize: 32, verbose: 0 })

  xs.dispose()
  ys.dispose()

  const finalLoss = history.history.loss[history.history.loss.length - 1]
  modelMetrics = {
    loss: finalLoss,
    epochs: 50,
    samples: 500,
    features: 12,
    layers: '32 → 16 → 3',
  }

  return model
}

// ────────────────────────────────────────────────────────────────────────────
// Inference
// ────────────────────────────────────────────────────────────────────────────

export async function predictWithModel(model, inputData) {
  const tfLib = await loadTF()
  if (!tfLib || !model) return null

  const features = extractFeatures(inputData)
  const input = tfLib.tensor2d([features])
  const prediction = model.predict(input)
  const [normHomeLoss, normCarLoss, confidence] = await prediction.data()

  input.dispose()
  prediction.dispose()

  return {
    predictedHomeLoss: normHomeLoss * 100000,
    predictedCarLoss: normCarLoss * 50000,
    riskConfidence: Math.min(1, Math.max(0, confidence)),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Metrics
// ────────────────────────────────────────────────────────────────────────────

export function getModelMetrics() {
  return modelMetrics
}
