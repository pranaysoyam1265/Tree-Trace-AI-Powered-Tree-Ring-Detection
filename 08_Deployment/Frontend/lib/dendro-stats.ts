/**
 * dendro-stats.ts
 * ════════════════════════════════════════════════════════════
 * Pure TypeScript statistics library for dendrochronology.
 * No external dependencies — all math inlined.
 *
 * Exports:
 *   computeRWI()              — Detrend raw ring widths → RWI
 *   pearsonCorrelation()      — Pearson r, R², p-value
 *   computeMonthlyCorrelations() — 18-month correlation profile
 * ════════════════════════════════════════════════════════════
 */

import { ClimateDataset } from "./mock-dendrolab"

// ── Types ──────────────────────────────────────────────────

export interface CorrelationResult {
  r: number
  rSquared: number
  pValue: number
  significant: boolean // p < 0.05
  n: number
}

export interface MonthlyCorrelation {
  month: string       // e.g. "pJUN" or "MAR"
  label: string       // e.g. "prev Jun" or "Mar"
  isPreviousYear: boolean
  monthIndex: number   // 0-11 (Jan=0)
  r: number
  pValue: number
  significant: boolean
}

export interface RWISeries {
  years: number[]
  values: number[]    // dimensionless index, mean ≈ 1.0
}

// ── Month definitions ──────────────────────────────────────

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** 18-month window: previous Jun-Dec then current Jan-Dec */
export const MONTHLY_WINDOW: { month: string; label: string; isPreviousYear: boolean; monthIndex: number }[] = [
  // Previous year: Jun – Dec (7 months)
  { month: "pJUN", label: "prev Jun", isPreviousYear: true, monthIndex: 5 },
  { month: "pJUL", label: "prev Jul", isPreviousYear: true, monthIndex: 6 },
  { month: "pAUG", label: "prev Aug", isPreviousYear: true, monthIndex: 7 },
  { month: "pSEP", label: "prev Sep", isPreviousYear: true, monthIndex: 8 },
  { month: "pOCT", label: "prev Oct", isPreviousYear: true, monthIndex: 9 },
  { month: "pNOV", label: "prev Nov", isPreviousYear: true, monthIndex: 10 },
  { month: "pDEC", label: "prev Dec", isPreviousYear: true, monthIndex: 11 },
  // Current year: Jan – Dec (12 months)
  { month: "JAN", label: "Jan", isPreviousYear: false, monthIndex: 0 },
  { month: "FEB", label: "Feb", isPreviousYear: false, monthIndex: 1 },
  { month: "MAR", label: "Mar", isPreviousYear: false, monthIndex: 2 },
  { month: "APR", label: "Apr", isPreviousYear: false, monthIndex: 3 },
  { month: "MAY", label: "May", isPreviousYear: false, monthIndex: 4 },
  { month: "JUN", label: "Jun", isPreviousYear: false, monthIndex: 5 },
  { month: "JUL", label: "Jul", isPreviousYear: false, monthIndex: 6 },
  { month: "AUG", label: "Aug", isPreviousYear: false, monthIndex: 7 },
  { month: "SEP", label: "Sep", isPreviousYear: false, monthIndex: 8 },
  { month: "OCT", label: "Oct", isPreviousYear: false, monthIndex: 9 },
  { month: "NOV", label: "Nov", isPreviousYear: false, monthIndex: 10 },
  { month: "DEC", label: "Dec", isPreviousYear: false, monthIndex: 11 },
]

// ── Math helpers ───────────────────────────────────────────

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function stdDev(arr: number[], m?: number): number {
  const avg = m ?? mean(arr)
  const variance = arr.reduce((s, v) => s + (v - avg) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}

/**
 * Approximate the regularized incomplete beta function
 * using a continued-fraction expansion (Lentz's method).
 * Used internally for computing p-values.
 */
function betaIncomplete(a: number, b: number, x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1

  const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b)
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a

  // Lentz's continued fraction
  let f = 1, c = 1, d = 0
  for (let i = 0; i <= 200; i++) {
    const m = Math.floor(i / 2)
    let numerator: number
    if (i === 0) {
      numerator = 1
    } else if (i % 2 === 0) {
      numerator = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m))
    } else {
      numerator = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1))
    }
    d = 1 + numerator * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    d = 1 / d
    c = 1 + numerator / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    f *= c * d
    if (Math.abs(c * d - 1) < 1e-10) break
  }

  return front * (f - 1)
}

function lnGamma(z: number): number {
  // Lanczos approximation
  const g = 7
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ]
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z)
  }
  z -= 1
  let x = coef[0]
  for (let i = 1; i < g + 2; i++) {
    x += coef[i] / (z + i)
  }
  const t = z + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

/**
 * Two-tailed p-value for a Pearson correlation coefficient.
 * Uses the t-statistic: t = r * sqrt((n-2) / (1 - r²))
 */
function correlationPValue(r: number, n: number): number {
  if (n <= 2) return 1
  if (Math.abs(r) >= 1) return 0

  const t = r * Math.sqrt((n - 2) / (1 - r * r))
  const df = n - 2

  // Student's t CDF via incomplete beta
  const x = df / (df + t * t)
  const p = betaIncomplete(df / 2, 0.5, x)
  return p // two-tailed
}

// ── Core functions ─────────────────────────────────────────

/**
 * Compute Pearson correlation between two arrays.
 */
export function pearsonCorrelation(x: number[], y: number[]): CorrelationResult {
  const n = Math.min(x.length, y.length)
  if (n < 3) {
    return { r: 0, rSquared: 0, pValue: 1, significant: false, n }
  }

  const mx = mean(x.slice(0, n))
  const my = mean(y.slice(0, n))

  let sumXY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    sumXY += dx * dy
    sumX2 += dx * dx
    sumY2 += dy * dy
  }

  const denom = Math.sqrt(sumX2 * sumY2)
  const r = denom === 0 ? 0 : sumXY / denom
  const pValue = correlationPValue(r, n)

  return {
    r: Math.round(r * 1000) / 1000,
    rSquared: Math.round(r * r * 1000) / 1000,
    pValue: Math.round(pValue * 10000) / 10000,
    significant: pValue < 0.05,
    n
  }
}

/**
 * Compute Standardized Ring Width Index (RWI).
 * Method: ratio of observed / fitted curve.
 * Supports: 'negative-exp', 'linear', 'none'
 */
export function computeRWI(
  years: number[],
  rawWidths: number[],
  method: string = "negative-exp"
): RWISeries {
  const n = rawWidths.length
  if (n === 0) return { years: [], values: [] }

  if (method === "none") {
    // Raw widths normalized by mean
    const m = mean(rawWidths)
    return {
      years: [...years],
      values: rawWidths.map(v => v / m)
    }
  }

  if (method === "linear") {
    // Fit y = a + bx via least squares
    const xBar = (n - 1) / 2
    const yBar = mean(rawWidths)
    let num = 0, den = 0
    for (let i = 0; i < n; i++) {
      num += (i - xBar) * (rawWidths[i] - yBar)
      den += (i - xBar) ** 2
    }
    const slope = den === 0 ? 0 : num / den
    const intercept = yBar - slope * xBar

    return {
      years: [...years],
      values: rawWidths.map((v, i) => {
        const fitted = Math.max(0.01, intercept + slope * i)
        return v / fitted
      })
    }
  }

  // Default: negative exponential → y = a * exp(-bx) + c
  // Simplified: use linear detrending in log-space
  const logWidths = rawWidths.map(w => Math.log(Math.max(0.01, w)))
  const xBar = (n - 1) / 2
  const yBar = mean(logWidths)
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xBar) * (logWidths[i] - yBar)
    den += (i - xBar) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = yBar - slope * xBar

  return {
    years: [...years],
    values: rawWidths.map((v, i) => {
      const fitted = Math.max(0.01, Math.exp(intercept + slope * i))
      return v / fitted
    })
  }
}

/**
 * Compute monthly correlations between RWI and a climate dataset.
 * Returns 19 correlations: prev Jun-Dec + current Jan-Dec.
 */
export function computeMonthlyCorrelations(
  rwi: RWISeries,
  climate: ClimateDataset
): MonthlyCorrelation[] {
  const results: MonthlyCorrelation[] = []

  // Find overlapping years
  const climateYears = Object.keys(climate.monthlyData).map(Number).sort()
  const rwiMap = new Map<number, number>()
  rwi.years.forEach((y, i) => rwiMap.set(y, rwi.values[i]))

  for (const def of MONTHLY_WINDOW) {
    const rwiVals: number[] = []
    const climVals: number[] = []

    for (const year of rwi.years) {
      const climateYear = def.isPreviousYear ? year - 1 : year

      if (
        rwiMap.has(year) &&
        climate.monthlyData[climateYear] &&
        climate.monthlyData[climateYear].length > def.monthIndex
      ) {
        rwiVals.push(rwiMap.get(year)!)
        climVals.push(climate.monthlyData[climateYear][def.monthIndex])
      }
    }

    const corr = pearsonCorrelation(rwiVals, climVals)

    results.push({
      month: def.month,
      label: def.label,
      isPreviousYear: def.isPreviousYear,
      monthIndex: def.monthIndex,
      r: corr.r,
      pValue: corr.pValue,
      significant: corr.significant
    })
  }

  return results
}

/**
 * Get aligned arrays for scatter plot: RWI vs climate for a specific month.
 */
export function getScatterData(
  rwi: RWISeries,
  climate: ClimateDataset,
  monthDef: { isPreviousYear: boolean; monthIndex: number }
): { rwiVal: number; climVal: number; year: number }[] {
  const rwiMap = new Map<number, number>()
  rwi.years.forEach((y, i) => rwiMap.set(y, rwi.values[i]))

  const points: { rwiVal: number; climVal: number; year: number }[] = []

  for (const year of rwi.years) {
    const climateYear = monthDef.isPreviousYear ? year - 1 : year
    if (
      rwiMap.has(year) &&
      climate.monthlyData[climateYear] &&
      climate.monthlyData[climateYear].length > monthDef.monthIndex
    ) {
      points.push({
        year,
        rwiVal: rwiMap.get(year)!,
        climVal: climate.monthlyData[climateYear][monthDef.monthIndex],
      })
    }
  }

  return points
}
