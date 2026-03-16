// Mock data and types for DendroLab Workstation

export interface DendroLabState {
  // Pipeline
  currentStage: 1 | 2 | 3 | 4
  completedStages: Set<number>
  guideMode: boolean

  // Stage 1: Loaded Data
  specimens: DendroSpecimen[]

  // Stage 2: Dating
  datingConfig: Record<string, {
    method: 'sampling-year' | 'cross-dated' | 'relative' | null
    samplingYear: number | null
    uploadedSeries: { year: number; width: number }[] | null
  }>
  datedSeries: Record<string, { year: number; width: number }[]>
  overlapPeriod: { start: number; end: number } | null

  // Stage 3: Cross-Dating & Chronology
  correlationMatrix: Record<string, Record<string, number>>
  selectedForChronology: string[]
  averagingMethod: 'simple-mean' | 'biweight-robust-mean' | 'median'
  siteChronology: { year: number; value: number; sampleDepth: number }[] | null
  chronologyStats: {
    rbar: number
    eps: number
    meanSensitivity: number
    firstOrderAutocorrelation: number
    length: number
    yearRange: { start: number; end: number }
  } | null
  slidingCorrelation: {
    reference: string
    sliding: string
    windowSize: number
    results: { offset: number; correlation: number }[]
    bestOffset: number
    bestR: number
  } | null

  // Stage 4: Standardization
  detrendingInput: 'site-chronology' | string  // 'site-chronology' or specimen ID
  detrendingMethod: 'none' | 'linear' | 'negative-exp' | 'spline' | 'rcs' | 'first-diff'
  splineStiffness: number  // 0-100
  rawWidths: { year: number; value: number }[]
  fittedCurve: { year: number; value: number }[]
  rwi: { year: number; value: number }[]
  rwiStats: {
    mean: number
    stdDev: number
    meanSensitivity: number
    firstOrderAutocorrelation: number
    signalToNoiseRatio: number
  } | null

  // Stage 5: Climate Correlation
  climateDatasets: ClimateDataset[]
  activeClimateVariable: string | null
  correlationPeriod: 'annual' | 'growing-season' | 'previous-year' | 'custom'
  customMonths: { current: number[]; previous: number[] }
  correlationResult: {
    r: number
    rSquared: number
    pValue: number
    significant: boolean
    n: number
  } | null
  monthlyCorrelations: {
    month: string
    label: string
    isPreviousYear: boolean
    r: number
    pValue: number
    significant: boolean
  }[]
  regressionLine: { slope: number; intercept: number }

  // Stage 6: Events & Reconstruction
  activeTab: 'events' | 'reconstruction'

  // Events
  stressThreshold: number  // default 0.7
  droughtThreshold: number  // default 0.4
  detectedEvents: DroughtEvent[]
  multiSpecimenCheck: {
    year: number
    specimens: Record<string, { rwi: number; affected: boolean; severity: string }>
    isRegional: boolean
    affectedCount: number
    totalCount: number
  }[]
  trendAnalysis: {
    totalEvents: number
    periodYears: number
    frequency: number
    firstHalfEvents: number
    secondHalfEvents: number
    trend: 'increasing' | 'decreasing' | 'stable'
    avgRecoveryTime: number
  } | null

  // Reconstruction
  calibrationPeriod: { start: number; end: number }
  verificationPeriod: { start: number; end: number }
  reconstructionModel: {
    calibrationR2: number
    verificationR2: number
    reductionOfError: number
    coefficientOfEfficiency: number
    durbinWatson: number
    valid: boolean
    equation: { slope: number; intercept: number }
  } | null
  reconstructedValues: {
    year: number
    reconstructed: number
    observed: number | null
    lower95: number
    upper95: number
    inCalibration: boolean
  }[]
  keyFindings: {
    driestYear: { year: number; value: number; uncertainty: number }
    wettestYear: { year: number; value: number; uncertainty: number }
    meanValue: number
    trend: number  // per year
    totalChange: number  // percentage
  } | null

  // Export
  exportDrawerOpen: boolean
  selectedExports: Set<string>
  exportProgress: number | null
}

export interface DendroSpecimen {
  id: string
  name: string
  ringCount: number
  ringWidths: number[]
  dated: boolean
  yearSpan: { start: number; end: number } | null
  sourceAnalysisId: string | null  // null for imported CSVs
  f1Score: number | null
}

export interface ClimateDataset {
  id: string
  name: string
  variable: string  // 'precipitation', 'temperature', 'pdsi', 'custom'
  unit: string  // 'mm', '°C', 'index', etc.
  yearRange: { start: number; end: number }
  monthlyData: Record<number, number[]>  // year → [jan...dec]
  annualData: Record<number, number>
}

export interface DroughtEvent {
  startYear: number
  endYear: number
  duration: number
  minRWI: number
  minRWIYear: number
  severity: 'mild' | 'moderate' | 'severe'
  recoveryTime: number
  associatedClimateValue: number | null
}

// Generate realistic mock data
function generateCorrelatedSeries(base: number[], noiseLevel: number, trendSlope: number) {
  return base.map((val, i) => {
    const trend = trendSlope * i
    const noise = (Math.random() - 0.5) * noiseLevel
    return Math.max(0.1, val + noise + trend)
  })
}

// Base signal (simulates a site-wide climate response)
// Includes a severe drought in index 11 (2012 if aligned to 2023)
const baseWidthsList = [
  5.2, 4.8, 4.9, 5.1, 4.5, 4.2, 4.3, 3.8, 3.5, 3.6, // early years
  3.2, 1.1, 2.5, 3.0, 2.8, 2.9, 2.5, 2.6, 2.2, 2.4, // mid years (with drought at index 11)
  1.8, 1.9, 1.7                                     // recent years (slower growth)
]

export const MOCK_SPECIMENS: DendroSpecimen[] = [
  {
    id: "spec_f02a",
    name: "F02a.png",
    ringCount: 23,
    ringWidths: generateCorrelatedSeries(baseWidthsList, 0.4, -0.05),
    dated: true,
    yearSpan: { start: 2001, end: 2023 },
    sourceAnalysisId: "analysis_1",
    f1Score: 0.92
  },
  {
    id: "spec_f02b",
    name: "F02b.png",
    ringCount: 20,
    ringWidths: generateCorrelatedSeries(baseWidthsList.slice(3), 0.5, -0.04),
    dated: true,
    yearSpan: { start: 2004, end: 2023 },
    sourceAnalysisId: "analysis_2",
    f1Score: 0.88
  },
  {
    id: "spec_f03a",
    name: "F03a.png",
    ringCount: 24,
    // Weakly correlated pattern
    ringWidths: [4.1, 4.3, 3.9, 2.5, 4.8, 4.1, 3.5, 3.7, 3.9, 3.2, 2.8, 2.9, 3.1, 2.5, 2.1, 1.9, 2.4, 2.0, 1.8, 1.7, 1.5, 1.6, 1.4, 1.2],
    dated: false,
    yearSpan: null,
    sourceAnalysisId: "analysis_3",
    f1Score: 0.74
  },
  {
    id: "spec_s01a",
    name: "S01a.png",
    ringCount: 18,
    ringWidths: generateCorrelatedSeries(baseWidthsList.slice(5), 0.6, -0.06),
    dated: true,
    yearSpan: { start: 2006, end: 2023 },
    sourceAnalysisId: "analysis_4",
    f1Score: 0.85
  }
]

// Mock Completed History for Stage 1 selection table
export const MOCK_HISTORY_ANALYSES = [
  ...MOCK_SPECIMENS,
  {
    id: "spec_f07a",
    name: "F07a.png",
    ringCount: 15,
    ringWidths: [3.1, 3.2, 2.8],
    dated: false,
    yearSpan: null,
    sourceAnalysisId: "analysis_5",
    f1Score: 0.45 // Low F1
  },
  {
    id: "spec_p04b",
    name: "P04b.png",
    ringCount: 0,
    ringWidths: [],
    dated: false,
    yearSpan: null,
    sourceAnalysisId: "analysis_error",
    f1Score: null // Failed
  }
]

// Mock Climate Data
const years = Array.from({ length: 24 }, (_, i) => 2000 + i)

const generateMonthlyPrecip = (yearIndex: number) => {
  // Drought in 2012 (index 12)
  if (yearIndex === 12) {
    return [25, 20, 30, 45, 60, 80, 110, 120, 80, 50, 35, 25]
  }
  // Wet in 2003 (index 3)
  if (yearIndex === 3) {
    return [55, 45, 65, 95, 120, 160, 240, 260, 180, 100, 65, 50]
  }
  return [45, 38, 52, 78, 95, 120, 185, 210, 145, 82, 55, 40].map(v => v + (Math.random() - 0.5) * 40)
}

const generateMonthlyTemp = (yearIndex: number) => {
  // Hot summer in 2012
  if (yearIndex === 12) {
    return [-2, 1, 6, 14, 22, 28, 32, 31, 24, 15, 8, 1]
  }
  return [-4, -1, 4, 10, 17, 23, 26, 25, 19, 12, 5, -1].map(v => v + (Math.random() - 0.5) * 4)
}

export const MOCK_CLIMATE: ClimateDataset[] = [
  {
    id: "clim_p_01",
    name: "Site_Precip_2000-2023.csv",
    variable: "Precipitation",
    unit: "mm",
    yearRange: { start: 2000, end: 2023 },
    monthlyData: Object.fromEntries(years.map((y, i) => [y, generateMonthlyPrecip(i)])),
    annualData: Object.fromEntries(years.map((y, i) => [y, generateMonthlyPrecip(i).reduce((a, b) => a + b, 0)]))
  },
  {
    id: "clim_t_01",
    name: "Site_Temp_2000-2023.csv",
    variable: "Temperature",
    unit: "°C",
    yearRange: { start: 2000, end: 2023 },
    monthlyData: Object.fromEntries(years.map((y, i) => [y, generateMonthlyTemp(i)])),
    annualData: Object.fromEntries(years.map((y, i) => [y, generateMonthlyTemp(i).reduce((a, b) => a + b, 0) / 12]))
  }
]
