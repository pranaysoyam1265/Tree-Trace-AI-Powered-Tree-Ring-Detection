/* ═══════════════════════════════════════════════════════════════════
   TREETRACE API TYPES
   TypeScript interfaces matching the FastAPI backend response shape.
   Every component imports types from here — never from mock files.
   ═══════════════════════════════════════════════════════════════════ */

export interface PithCoords {
  cx: number
  cy: number
}

export interface ImageDimensions {
  width: number
  height: number
}

export interface RingShape {
  ring_number: number
  label: string
  inner_radius_px: number
  outer_radius_px: number
  width_px: number
  estimated_year: number
  eccentricity: number
  points: number[][]
}

export interface Statistics {
  mean: number
  median: number
  std: number
  cv_percent: number
  min: number
  max: number
  range: number
  moving_averages: { ring: number; value: number }[]
}

export interface TrendData {
  direction: string
  slope: number
  interpretation: string
  early_growth: number
  late_growth: number
  change_percent: number
}

export interface HealthComponents {
  growth_rate: number
  consistency: number
  stress_resistance: number
  recovery_ability: number
}

export interface HealthData {
  score: number
  label: string
  detail: string
  components: HealthComponents
}

export interface AnomalyItem {
  ring: number
  year: number
  width: number
  deviation: number
  type: string
  label: string
  interpretation: string
}

export interface PhaseItem {
  name: string
  years: string
  avg_width: number
  description: string
}

export interface CarbonData {
  estimated_biomass_kg: number
  carbon_stored_kg: number
  co2_equivalent_kg: number
  car_km_offset: number
  note: string
}

export interface MetricsData {
  precision: number | null
  recall: number | null
  f1_score: number | null
  rmse: number | null
}

export interface AnalysisResult {
  id: string
  image_name: string
  analyzed_at: string
  processing_time_seconds: number

  pith: PithCoords
  image_dimensions: ImageDimensions

  ring_count: number
  estimated_age: number
  birth_year: number

  rings: RingShape[]

  statistics: Statistics
  trend: TrendData
  health: HealthData
  anomalies: AnomalyItem[]
  phases: PhaseItem[]
  biography: string
  carbon: CarbonData

  preprocessing?: {
    log: string[]
    params_used: Record<string, any>
    preset: string
    mode?: string
  }

  metrics: MetricsData

  overlay_image_base64: string | null
}

export interface AnalysisResultSummary {
  id: string
  image_name: string
  ring_count: number | null
  estimated_age: number | null
  health_score: number | null
  health_label: string | null
  f1_score: number | null
  processing_time_seconds: number | null
  analyzed_at: string
}

export interface SampleImage {
  name: string
  filename: string
  cx: number
  cy: number
  gt_ring_count?: number | null
  thumbnail_url: string
}

export interface HealthCheckResponse {
  status: string
  version: string
  cstrd_available: boolean
  results_dir: string
}
