export interface AnalysisRecord {
  id: string
  imageId: string
  imageName: string
  alias: string | null
  notes: string | null
  tags: string[]

  type: 'single' | 'batch-member'
  batchId: string | null
  batchName: string | null

  status: 'completed' | 'failed' | 'processing' | 'cancelled'
  error: string | null

  ringCount: number | null
  estimatedAge: number | null
  averageRingWidth: number | null
  ringWidths: number[]

  precision: number | null
  recall: number | null
  f1Score: number | null
  rmse: number | null

  confidence: 'high' | 'medium' | 'low' | null

  processingTime: number | null // seconds
  analyzedAt: string

  thumbnailUrl: string
  overlayUrl: string | null

  pith: { cx: number; cy: number } | null
  imageDimensions: { width: number; height: number }
}

// Helper to generate realistic ring widths following typical biological growth curves
function generateRingWidths(count: number, siteSeed: number): number[] {
  const widths: number[] = []
  let currentWidth = 15 + (Math.random() * 5) // Starts wide when young

  for (let i = 0; i < count; i++) {
    // Shared environmental noise based on siteSeed
    const environmentalNoise = Math.sin((i + siteSeed) * 0.5) * 2
    // Random individual noise
    const randomNoise = (Math.random() * 2) - 1
    // Biological age trend (exponential decay)
    const ageTrend = Math.exp(-i / 15) * 5

    currentWidth = currentWidth * 0.98 + ageTrend + environmentalNoise + randomNoise
    // Clamp
    const finalWidth = Math.max(3, Math.min(25, currentWidth))
    widths.push(Number(finalWidth.toFixed(2)))
  }

  return widths
}

// Generate 47 mock records
export const MOCK_HISTORY: AnalysisRecord[] = Array.from({ length: 47 }).map((_, i) => {
  const id = `rec-${1000 + i}`
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 14) // Span last 14 days
  const analyzedAt = new Date(now.getTime() - (daysAgo * 86400000) - Math.random() * 86400000).toISOString()

  // Status Distribution (35 completed, 5 processing/cancelled, 7 failed/batch etc)
  // Let's force specific statuses for certain indices to guarantee presence
  let status: AnalysisRecord['status'] = 'completed'
  let error: string | null = null
  let type: AnalysisRecord['type'] = 'single'
  let batchId: string | null = null
  let batchName: string | null = null

  if (i === 12 || i === 25 || i === 40) {
    status = 'failed'
    const errors = [
      "Low contrast in outer region — could not detect boundary rings",
      "Pith coordinates outside detected wood area",
      "Processing timeout — image too large (>4000px)"
    ]
    error = errors[i % 3]
  } else if (i === 5 || i === 18) {
    status = 'processing'
  } else if (i === 8 || i === 22) {
    status = 'cancelled'
  }

  // Batch Assignments
  if (i >= 30 && i < 35) {
    type = 'batch-member'
    batchId = 'batch-A'
    batchName = 'Pine Survey 2024'
  } else if (i >= 35 && i < 40) {
    // 40 is failed, but that's okay, batch items can fail
    type = 'batch-member'
    batchId = 'batch-B'
    batchName = 'Oak Control Group'
  }

  // Specimen names and properties
  const species = ["Pine", "Oak", "Spruce", "Birch"]
  const sites = ["Site-A", "Site-B", "Control", "Drought-Study"]
  const spIndex = i % species.length
  const siIndex = (i + 1) % sites.length

  const selectedSpecies = species[spIndex]
  const selectedSite = sites[siIndex]

  const imageName = type === 'batch-member'
    ? `${selectedSpecies.toUpperCase()}-${String(i).padStart(3, '0')}.png`
    : `F${String(i).padStart(2, '0')}a.png`

  const alias = Math.random() > 0.6 ? `${selectedSpecies} sample, ${selectedSite}` : null
  const notes = Math.random() > 0.8 ? `Collected during the summer expedition. Field notes indicate stressful growth period.` : null

  const tags: string[] = []
  if (Math.random() > 0.3) tags.push(selectedSpecies)
  if (Math.random() > 0.5) tags.push(selectedSite)
  if (Math.random() > 0.8) tags.push("2024")

  // Metrics (if completed)
  let ringCount: number | null = null
  let ringWidths: number[] = []
  let avgWidth: number | null = null
  let f1Score: number | null = null
  let precision: number | null = null
  let recall: number | null = null
  let rmse: number | null = null
  let confidence: 'high' | 'medium' | 'low' | null = null

  if (status === 'completed') {
    ringCount = 12 + Math.floor(Math.random() * 70) // 12 to 82 rings
    ringWidths = generateRingWidths(ringCount, siIndex)
    avgWidth = Number((ringWidths.reduce((a, b) => a + b, 0) / ringCount).toFixed(2))

    precision = 0.75 + (Math.random() * 0.23) // 0.75 - 0.98
    recall = 0.60 + (Math.random() * 0.35)    // 0.60 - 0.95
    f1Score = 2 * ((precision * recall) / (precision + recall))
    rmse = 1.0 + (Math.random() * 3.0)

    if (f1Score > 0.85) confidence = 'high'
    else if (f1Score > 0.65) confidence = 'medium'
    else confidence = 'low'
  }

  return {
    id,
    imageId: `img-${id}`,
    imageName,
    alias,
    notes,
    tags,
    type,
    batchId,
    batchName,
    status,
    error,
    ringCount,
    estimatedAge: ringCount,
    averageRingWidth: avgWidth,
    ringWidths,
    precision: precision ? Number(precision.toFixed(2)) : null,
    recall: recall ? Number(recall.toFixed(2)) : null,
    f1Score: f1Score ? Number(f1Score.toFixed(2)) : null,
    rmse: rmse ? Number(rmse.toFixed(2)) : null,
    confidence,
    processingTime: status === 'completed' || status === 'failed' ? 12 + Math.floor(Math.random() * 45) : null,
    analyzedAt,
    thumbnailUrl: "/sample-core.jpg", // We'll just use dummy paths that might not resolve to an actual distinct image, but the UI expects a string
    overlayUrl: status === 'completed' ? "/sample-core-overlay.png" : null,
    pith: status === 'completed' ? { cx: 500, cy: 500 } : null,
    imageDimensions: { width: 1000, height: 1000 }
  }
})
