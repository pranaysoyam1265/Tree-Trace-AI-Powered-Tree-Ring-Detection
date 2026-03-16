import { type AnalysisResult, generateMockResult } from "./mock-results"

/* ═══════════════════════════════════════════════════════════════════
   BATCH PROCESSING — TYPES & ENHANCED MOCK DATA
   10-image dataset with realistic variation, 2 predetermined failures,
   and richer metadata for the redesigned batch workstation.
   ═══════════════════════════════════════════════════════════════════ */

export type ImageStatus =
  | "pending"
  | "ready"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying"

export type ProcessingStage = "preprocessing" | "detecting" | "postprocessing" | null

export interface BatchImage {
  id: string
  file: File | null
  fileName: string
  alias: string
  tags: string[]
  notes: string
  dimensions: { width: number; height: number }
  fileSize: number
  thumbnailUrl: string
  pith: { cx: number; cy: number } | null
  pithMethod: "manual" | "center" | "auto" | null
  status: ImageStatus
  processingStage: ProcessingStage
  progress: number
  startedAt: string | null
  completedAt: string | null
  processingTime: number | null
  result: AnalysisResult | null
  error: string | null
  retryCount: number
}

export type BatchHealth = "excellent" | "good" | "fair" | "poor" | null

export interface BatchSummary {
  totalImages: number
  successful: number
  failed: number
  cancelled: number
  totalRingsDetected: number
  averageRingsPerImage: number
  totalProcessingTime: number
  averageProcessingTime: number
  averagePrecision: number | null
  averageRecall: number | null
  averageF1: number | null
  averageRmse: number | null
  ringCountRange: { min: number; max: number; minImage: string; maxImage: string }
  widthRange: { min: number; max: number; minImage: string; maxImage: string }
  fastestImage: { name: string; time: number }
  slowestImage: { name: string; time: number }
}

export type BatchStatus = "configuring" | "processing" | "completed" | "cancelled"

export interface BatchState {
  id: string
  name: string
  notes: string
  tags: string[]
  status: BatchStatus
  createdAt: string
  completedAt: string | null
  images: BatchImage[]
  selectedImageId: string | null
  currentProcessingIndex: number | null
  summary: BatchSummary | null
  health: BatchHealth
}

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: "info" | "success" | "error" | "warning"
}

// ─── MOCK SAMPLE DATASET (10 IMAGES) ────────────────────────────

interface SampleSpec {
  name: string
  width: number
  height: number
  size: number
  alias: string
  tags: string[]
  // These two will be forced to fail during processing
  willFail?: boolean
  failReason?: string
}

const SAMPLE_SPECS: SampleSpec[] = [
  { name: "F02a.png", width: 2364, height: 2364, size: 4_500_000, alias: "F02a", tags: ["Pine", "Site A"] },
  { name: "F02b.png", width: 2400, height: 2400, size: 4_800_000, alias: "F02b", tags: ["Pine", "Site A"] },
  { name: "F02c.png", width: 2280, height: 2280, size: 4_200_000, alias: "F02c", tags: ["Pine", "Site A"] },
  { name: "F03a.png", width: 2100, height: 2100, size: 3_900_000, alias: "F03a", tags: ["Oak", "Site A"] },
  { name: "F03b.png", width: 2150, height: 2150, size: 4_000_000, alias: "F03b", tags: ["Oak", "Site A"] },
  { name: "F07a.png", width: 2500, height: 2600, size: 5_100_000, alias: "F07a", tags: ["Spruce", "Site B"], willFail: true, failReason: "Low contrast in outer region — insufficient ring boundary detection" },
  { name: "S01a.png", width: 1900, height: 1900, size: 3_200_000, alias: "S01a", tags: ["Cedar", "Site C"] },
  { name: "S01b.png", width: 1950, height: 1950, size: 3_350_000, alias: "S01b", tags: ["Cedar", "Site C"] },
  { name: "P04a.png", width: 2200, height: 2200, size: 4_100_000, alias: "P04a", tags: ["Birch", "Site D"] },
  { name: "P04b.png", width: 2250, height: 2250, size: 4_250_000, alias: "P04b", tags: ["Birch", "Site D"], willFail: true, failReason: "Pith outside detected wood area — recalibrate coordinates" },
]

export function getMockSampleImages(): BatchImage[] {
  return SAMPLE_SPECS.map((spec, i) => ({
    id: `sample-${i}-${spec.name.replace(".png", "")}`,
    file: null,
    fileName: spec.name,
    alias: spec.alias,
    tags: spec.tags,
    notes: "",
    dimensions: { width: spec.width, height: spec.height },
    fileSize: spec.size,
    pith: null,
    pithMethod: null,
    status: "pending" as ImageStatus,
    processingStage: null,
    progress: 0,
    startedAt: null,
    completedAt: null,
    processingTime: null,
    result: null,
    error: null,
    retryCount: 0,
    thumbnailUrl: "/illustrations/tree-ring-cross-section.svg",
  }))
}

/** Check whether a sample spec is predetermined to fail */
export function shouldImageFail(fileName: string): { fail: boolean; reason: string } {
  const spec = SAMPLE_SPECS.find(s => s.name === fileName)
  if (spec?.willFail) return { fail: true, reason: spec.failReason || "Unknown error" }
  return { fail: false, reason: "" }
}

// ─── SUMMARY COMPUTATION ────────────────────────────────────────

export function calculateBatchSummary(images: BatchImage[]): BatchSummary {
  const successful = images.filter(img => img.status === "completed" && img.result)
  const failed = images.filter(img => img.status === "failed")
  const cancelled = images.filter(img => img.status === "cancelled")

  const totalRings = successful.reduce((sum, img) => sum + (img.result?.ringCount || 0), 0)
  const totalTime = successful.reduce((sum, img) => sum + (img.processingTime || 0), 0)
  const avgTime = successful.length > 0 ? totalTime / successful.length : 0

  let avgPrec = 0, avgRec = 0, avgF1 = 0, avgRmse = 0
  if (successful.length > 0) {
    avgPrec = successful.reduce((s, i) => s + (i.result?.metrics.precision || 0), 0) / successful.length
    avgRec = successful.reduce((s, i) => s + (i.result?.metrics.recall || 0), 0) / successful.length
    avgF1 = successful.reduce((s, i) => s + (i.result?.metrics.f1 || 0), 0) / successful.length
    avgRmse = successful.reduce((s, i) => s + (i.result?.metrics.rmse || 0), 0) / successful.length
  }

  // Ring count range
  let minRings = Infinity, maxRings = -Infinity, minRingsImg = "", maxRingsImg = ""
  successful.forEach(img => {
    const rc = img.result?.ringCount || 0
    if (rc < minRings) { minRings = rc; minRingsImg = img.alias }
    if (rc > maxRings) { maxRings = rc; maxRingsImg = img.alias }
  })

  // Width range (average ring width per image)
  let minWidth = Infinity, maxWidth = -Infinity, minWidthImg = "", maxWidthImg = ""
  successful.forEach(img => {
    if (!img.result?.rings.length) return
    const avgW = img.result.rings.reduce((s, r) => s + r.widthPx, 0) / img.result.rings.length
    if (avgW < minWidth) { minWidth = avgW; minWidthImg = img.alias }
    if (avgW > maxWidth) { maxWidth = avgW; maxWidthImg = img.alias }
  })

  // Fastest / slowest
  let fastest = { name: "", time: Infinity }
  let slowest = { name: "", time: -Infinity }
  successful.forEach(img => {
    const t = img.processingTime || 0
    if (t < fastest.time) fastest = { name: img.alias, time: t }
    if (t > slowest.time) slowest = { name: img.alias, time: t }
  })

  return {
    totalImages: images.length,
    successful: successful.length,
    failed: failed.length,
    cancelled: cancelled.length,
    totalRingsDetected: totalRings,
    averageRingsPerImage: successful.length > 0 ? parseFloat((totalRings / successful.length).toFixed(1)) : 0,
    totalProcessingTime: parseFloat(totalTime.toFixed(1)),
    averageProcessingTime: parseFloat(avgTime.toFixed(1)),
    averagePrecision: successful.length > 0 ? parseFloat(avgPrec.toFixed(3)) : null,
    averageRecall: successful.length > 0 ? parseFloat(avgRec.toFixed(3)) : null,
    averageF1: successful.length > 0 ? parseFloat(avgF1.toFixed(3)) : null,
    averageRmse: successful.length > 0 ? parseFloat(avgRmse.toFixed(2)) : null,
    ringCountRange: {
      min: minRings === Infinity ? 0 : minRings,
      max: maxRings === -Infinity ? 0 : maxRings,
      minImage: minRingsImg,
      maxImage: maxRingsImg,
    },
    widthRange: {
      min: minWidth === Infinity ? 0 : parseFloat(minWidth.toFixed(1)),
      max: maxWidth === -Infinity ? 0 : parseFloat(maxWidth.toFixed(1)),
      minImage: minWidthImg,
      maxImage: maxWidthImg,
    },
    fastestImage: fastest.time === Infinity ? { name: "", time: 0 } : fastest,
    slowestImage: slowest.time === -Infinity ? { name: "", time: 0 } : slowest,
  }
}

// ─── HEALTH COMPUTATION ─────────────────────────────────────────

export function calculateBatchHealth(summary: BatchSummary): BatchHealth {
  if (summary.totalImages === 0) return null
  const successRate = summary.successful / summary.totalImages
  const f1 = summary.averageF1 || 0

  if (successRate >= 0.9 && f1 >= 0.9) return "excellent"
  if (successRate >= 0.7 && f1 >= 0.8) return "good"
  if (successRate >= 0.5) return "fair"
  return "poor"
}

// ─── HELPERS ────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}
