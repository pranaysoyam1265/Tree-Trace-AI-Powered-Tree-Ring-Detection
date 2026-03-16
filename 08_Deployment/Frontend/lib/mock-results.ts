/* ═══════════════════════════════════════════════════════════════════
   MOCK RESULTS DATA
   Deterministic, realistic data for the Results page demo.
   Replace with real API integration later.
   ═══════════════════════════════════════════════════════════════════ */

// Seeded pseudo-random for deterministic values
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export interface RingData {
  id: number
  innerRadius: number
  outerRadius: number
  widthPx: number
  widthMm: number
}

export interface GrowthAnomaly {
  year: number
  ringId: number
  rwi: number
  type: 'stress' | 'favorable'
  severity: 'severe' | 'moderate' | 'mild' | 'exceptional' | 'above_average'
  description: string | null
}

export interface AnalysisResult {
  id: string
  imageName: string
  imageUrl: string | null
  ringCount: number
  estimatedAge: number
  pith: { x: number; y: number }
  rings: RingData[]
  metrics: {
    precision: number
    recall: number
    f1: number
    rmse: number
  }
  confidence: "high" | "medium" | "low"
  processingDuration: number
  timestamp: string
  config: {
    sensitivity: string
    denoising: string
    autoPith: boolean
  }

  // Extended fields
  statistics: {
    meanWidth: number
    stdDev: number
    minWidth: number
    minRing: number
    maxWidth: number
    maxRing: number
    growthTrendSlope: number
    growthTrendDirection: 'increasing' | 'stable' | 'declining'
    movingAverages: { ringId: number; value: number }[]
  }

  health: {
    score: number
    label: 'GOOD' | 'FAIR' | 'POOR'
    consistency: number
    trend: number
    resilience: number
    interpretation: string
  }

  anomalies: GrowthAnomaly[]

  ecology: {
    biomassKg: number
    carbonKgCo2: number
    estimatedDbhCm: number
  }

  biography: string

  overlayImageBase64: string | null
}

export function generateMockResult(id: string): AnalysisResult {
  // --- GRACEFUL ERROR / EMPTY STATE ---
  if (id === "error" || id === "empty") {
    return {
      id,
      imageName: id === "error" ? "corrupted_sample.png" : "empty_sample.png",
      imageUrl: null,
      ringCount: 0,
      estimatedAge: 0,
      pith: { x: 0, y: 0 },
      rings: [],
      metrics: { precision: 0, recall: 0, f1: 0, rmse: 0 },
      confidence: "low",
      processingDuration: 0,
      timestamp: new Date().toISOString(),
      config: { sensitivity: "High", denoising: "Low", autoPith: true },
      statistics: {
        meanWidth: 0, stdDev: 0, minWidth: 0, minRing: 0,
        maxWidth: 0, maxRing: 0, growthTrendSlope: 0,
        growthTrendDirection: 'stable', movingAverages: []
      },
      health: { score: 0, label: 'POOR', consistency: 0, trend: 0, resilience: 0, interpretation: 'No data available.' },
      anomalies: [],
      ecology: { biomassKg: 0, carbonKgCo2: 0, estimatedDbhCm: 0 },
      biography: '',
      overlayImageBase64: null
    }
  }

  const rand = seededRandom(hashCode(id))
  const ringCount = Math.floor(rand() * 12) + 18 // 18-30 rings
  const rings: RingData[] = []
  const baseYear = 2023

  let radius = 12
  for (let i = 0; i < ringCount; i++) {
    const inner = radius
    let baseWidth = 25 - i * 0.4 + (rand() - 0.5) * 12
    if (i >= 10 && i <= 14) {
      baseWidth *= 0.55 + rand() * 0.3
    }
    const widthPx = Math.max(4, Math.round(baseWidth))
    radius += widthPx

    rings.push({
      id: i + 1,
      innerRadius: inner,
      outerRadius: radius,
      widthPx,
      widthMm: parseFloat((widthPx * 0.15).toFixed(2)),
    })
  }

  // --- Compute statistics ---
  const widths = rings.map(r => r.widthPx)
  const sum = widths.reduce((a, b) => a + b, 0)
  const meanWidth = sum / widths.length
  const variance = widths.reduce((a, w) => a + (w - meanWidth) ** 2, 0) / widths.length
  const stdDev = Math.sqrt(variance)
  const minWidth = Math.min(...widths)
  const maxWidth = Math.max(...widths)
  const minRing = widths.indexOf(minWidth) + 1
  const maxRing = widths.indexOf(maxWidth) + 1

  // Linear regression slope
  const n = widths.length
  const xMean = (n - 1) / 2
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (widths[i] - meanWidth)
    den += (i - xMean) ** 2
  }
  const growthTrendSlope = parseFloat((num / den).toFixed(2))
  const growthTrendDirection: 'increasing' | 'stable' | 'declining' =
    growthTrendSlope > 0.02 ? 'increasing' : growthTrendSlope < -0.02 ? 'declining' : 'stable'

  // 5-year moving averages
  const movingAverages: { ringId: number; value: number }[] = []
  for (let i = 2; i < widths.length - 2; i++) {
    const avg = (widths[i - 2] + widths[i - 1] + widths[i] + widths[i + 1] + widths[i + 2]) / 5
    movingAverages.push({ ringId: i + 1, value: parseFloat(avg.toFixed(1)) })
  }

  const statistics = {
    meanWidth: parseFloat(meanWidth.toFixed(1)),
    stdDev: parseFloat(stdDev.toFixed(1)),
    minWidth, minRing, maxWidth, maxRing,
    growthTrendSlope, growthTrendDirection, movingAverages
  }

  // --- Compute anomalies ---
  const anomalies: GrowthAnomaly[] = []
  for (let i = 0; i < widths.length; i++) {
    const rwi = parseFloat((widths[i] / meanWidth).toFixed(2))
    const year = baseYear - ringCount + i + 1

    if (rwi < 0.7) {
      const severity: 'severe' | 'moderate' | 'mild' =
        rwi < 0.4 ? 'severe' : rwi < 0.6 ? 'moderate' : 'mild'
      anomalies.push({
        year, ringId: i + 1, rwi, type: 'stress', severity,
        description: severity === 'severe' ? 'Significant growth reduction — likely drought' : null
      })
    } else if (rwi > 1.4) {
      const severity: 'exceptional' | 'above_average' = rwi > 1.6 ? 'exceptional' : 'above_average'
      anomalies.push({
        year, ringId: i + 1, rwi, type: 'favorable', severity,
        description: severity === 'exceptional' ? 'Best growth year in record' : null
      })
    }
  }
  // Sort stress by rwi ascending, favorable by rwi descending
  anomalies.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'stress' ? -1 : 1
    return a.type === 'stress' ? a.rwi - b.rwi : b.rwi - a.rwi
  })

  // --- Compute health ---
  const consistency = Math.max(0, Math.min(100, Math.round(100 - (stdDev / meanWidth) * 100)))
  const trendScore = Math.max(0, Math.min(100, Math.round(50 + growthTrendSlope * 100)))
  const stressCount = anomalies.filter(a => a.type === 'stress').length
  const resilience = Math.max(0, Math.min(100, Math.round(100 - stressCount * 15)))
  const healthScore = Math.round(consistency * 0.35 + trendScore * 0.3 + resilience * 0.35)
  const healthLabel: 'GOOD' | 'FAIR' | 'POOR' =
    healthScore >= 70 ? 'GOOD' : healthScore >= 40 ? 'FAIR' : 'POOR'

  const interpretParts: string[] = []
  if (healthLabel === 'GOOD') interpretParts.push('Good overall health.')
  else if (healthLabel === 'FAIR') interpretParts.push('Fair overall health with some concerns.')
  else interpretParts.push('Poor health indicators detected.')
  if (resilience >= 70) interpretParts.push('Strong recovery after stress events')
  else interpretParts.push('Slow recovery after stress events')
  if (growthTrendDirection === 'declining') interpretParts.push('but declining growth trend.')
  else if (growthTrendDirection === 'increasing') interpretParts.push('with positive growth trend.')
  else interpretParts.push('with stable growth rate.')

  const health = {
    score: healthScore, label: healthLabel,
    consistency, trend: trendScore, resilience,
    interpretation: interpretParts.join(' ')
  }

  // --- Ecology estimates ---
  const totalRadiusPx = rings[rings.length - 1]?.outerRadius || 0
  const estimatedDbhCm = parseFloat((totalRadiusPx * 0.15 * 2 / 10).toFixed(1))
  const biomassKg = parseFloat((estimatedDbhCm ** 2.3 * 0.05).toFixed(1))
  const carbonKgCo2 = parseFloat((biomassKg * 0.5 * 3.67).toFixed(1))
  const ecology = { biomassKg, carbonKgCo2, estimatedDbhCm }

  // --- Biography ---
  const startYear = baseYear - ringCount + 1
  const widestYear = baseYear - ringCount + maxRing
  const narrowestYear = baseYear - ringCount + minRing
  const biography = `This tree began its life around ${startYear}, during a period of ${growthTrendDirection === 'declining' ? 'favorable' : 'variable'} growing conditions. Its widest growth ring occurred in ${widestYear} (${maxWidth}px), suggesting optimal moisture and temperature that year. A significant stress event in ${narrowestYear} produced the narrowest ring in the record (${minWidth}px), likely corresponding to a regional drought. The tree showed ${resilience >= 70 ? 'strong' : 'moderate'} resilience, recovering to above-average growth within ${resilience >= 70 ? '2' : '4'} years. Overall, this specimen shows a ${growthTrendDirection === 'declining' ? 'gradual decline in growth rate' : growthTrendDirection === 'increasing' ? 'positive growth trend' : 'stable growth pattern'} (${growthTrendSlope} px/year), consistent with natural aging, but maintains ${healthLabel.toLowerCase()} health with a consistency score of ${consistency}%.`

  // --- Original fields ---
  const precision = 0.88 + rand() * 0.1
  const recall = 0.85 + rand() * 0.12
  const f1 = (2 * precision * recall) / (precision + recall)

  return {
    id,
    imageName: "F02a.png",
    imageUrl: null,
    ringCount,
    estimatedAge: ringCount,
    pith: { x: 1182, y: 1182 },
    rings,
    metrics: {
      precision: parseFloat(precision.toFixed(3)),
      recall: parseFloat(recall.toFixed(3)),
      f1: parseFloat(f1.toFixed(3)),
      rmse: parseFloat((1.2 + rand() * 2).toFixed(2)),
    },
    confidence: precision > 0.92 ? "high" : precision > 0.85 ? "medium" : "low",
    processingDuration: parseFloat((18 + rand() * 20).toFixed(1)),
    timestamp: new Date().toISOString(),
    config: {
      sensitivity: "Medium",
      denoising: "Low",
      autoPith: id !== "demo-manual",
    },
    statistics,
    health,
    anomalies,
    ecology,
    biography,
    overlayImageBase64: null
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash) || 1
}

// Pre-compute ring statistics
export function getRingStats(rings: RingData[]) {
  const widths = rings.map((r) => r.widthPx)
  const sum = widths.reduce((a, b) => a + b, 0)
  const avg = sum / widths.length
  const min = Math.min(...widths)
  const max = Math.max(...widths)
  const variance = widths.reduce((a, w) => a + (w - avg) ** 2, 0) / widths.length
  const stdDev = Math.sqrt(variance)
  return {
    avg: parseFloat(avg.toFixed(1)),
    min,
    max,
    stdDev: parseFloat(stdDev.toFixed(1)),
    minRing: widths.indexOf(min) + 1,
    maxRing: widths.indexOf(max) + 1,
    avgMm: parseFloat((avg * 0.15).toFixed(2)),
    minMm: parseFloat((min * 0.15).toFixed(2)),
    maxMm: parseFloat((max * 0.15).toFixed(2)),
  }
}
