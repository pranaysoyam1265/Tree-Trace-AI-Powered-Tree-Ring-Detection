"use client"

import { useState, useMemo, useCallback } from "react"
import { CloudRain, Thermometer, Upload, Info, TrendingUp, TrendingDown, BarChart3, Droplets, X } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/* ═══════════════════════════════════════════════════════════════════
   CLIMATE CORRELATION PANEL
   Upload a climate CSV → auto-correlate with ring widths → visualize
   ═══════════════════════════════════════════════════════════════════ */

interface Props {
  result: AnalysisResult
}

interface ClimateRow {
  year: number
  values: number[] // 12 monthly values OR 1 annual value
}

interface CorrelationResult {
  month: string
  r: number
  pValue: number
  significant: boolean
}

// ── Minimal Stats for Insight Generation ──
function pearsonR(x: number[], y: number[]): number {
  const n = x.length
  if (n < 3) return 0
  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? 0 : num / denom
}

// ── CSV Parser ──

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function parseClimateCSV(text: string): { rows: ClimateRow[]; isMonthly: boolean; variable: string } {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"))
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row")

  const header = lines[0].toLowerCase().split(/[,\t;]+/).map(h => h.trim())
  const yearIdx = header.findIndex(h => h === "year")
  if (yearIdx === -1) throw new Error("CSV must have a 'year' column")

  // Detect monthly vs annual
  const isMonthly = header.length >= 13 // year + 12 months

  // Try to detect variable name from header
  const variable = header.find(h => h.includes("precip") || h.includes("rain")) ? "Precipitation"
    : header.find(h => h.includes("temp")) ? "Temperature"
      : "Climate Variable"

  const rows: ClimateRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/[,\t;]+/).map(c => c.trim())
    const year = parseInt(cols[yearIdx])
    if (isNaN(year)) continue

    if (isMonthly) {
      const values = cols.slice(1, 13).map(Number).filter(v => !isNaN(v))
      if (values.length === 12) rows.push({ year, values })
    } else {
      // Annual: take the second column
      const val = parseFloat(cols[1])
      if (!isNaN(val)) rows.push({ year, values: [val] })
    }
  }
  return { rows, isMonthly, variable }
}

// ── Dual-Axis Timeline Chart (SVG) ──

function TimelineChart({ years, ringWidths, climateValues, variable, unit }:
  { years: number[]; ringWidths: number[]; climateValues: number[]; variable: string; unit: string }) {

  const W = 800, H = 250, PAD = { top: 30, right: 60, bottom: 40, left: 60 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const xMin = years[0], xMax = years[years.length - 1]
  const xRange = Math.max(1, xMax - xMin)

  const y1Min = 0, y1Max = Math.max(...ringWidths) * 1.15
  const y1Range = Math.max(1, y1Max - y1Min)

  const y2Min = Math.min(0, ...climateValues), y2Max = Math.max(...climateValues) * 1.15
  const y2Range = Math.max(1, y2Max - y2Min)

  const toX = (y: number) => PAD.left + ((y - xMin) / xRange) * chartW
  const toY1 = (v: number) => PAD.top + chartH - ((v - y1Min) / y1Range) * chartH
  const toY2 = (v: number) => PAD.top + chartH - ((v - y2Min) / y2Range) * chartH

  // Build SVG Path for climate line
  const climatePoints = years.map((y, i) => `${toX(y)},${toY2(climateValues[i])}`).join(" L ")
  const climatePath = `M ${climatePoints}`

  const isPrecip = variable === "Precipitation"
  const climColor = isPrecip ? "#3b82f6" : "#ef4444" // Blue for rain, Red for temp

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PAD.top + f * chartH
        const val1 = y1Max - f * y1Range
        const val2 = y2Max - f * y2Range
        return (
          <g key={`grid-${f}`}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#333" strokeWidth={0.5} strokeDasharray={f === 1 ? "" : "4,4"} />
            <text x={PAD.left - 8} y={y + 3} textAnchor="end" className="fill-[#888] font-mono" style={{ fontSize: 10 }}>
              {val1.toFixed(1)}
            </text>
            <text x={W - PAD.right + 8} y={y + 3} textAnchor="start" className="font-mono" style={{ fontSize: 10, fill: climColor, opacity: 0.8 }}>
              {val2.toFixed(1)}
            </text>
          </g>
        )
      })}

      {/* Years (X-axis labels) */}
      {years.filter((_, i) => i % Math.ceil(years.length / 10) === 0).map((y) => (
        <text key={`x-${y}`} x={toX(y)} y={H - Math.max(5, PAD.bottom - 20)} textAnchor="middle" className="fill-[#888] font-mono" style={{ fontSize: 10 }}>
          {y}
        </text>
      ))}

      {/* Ring Width Bars */}
      {years.map((y, i) => {
        const barW = Math.max(2, (chartW / years.length) * 0.7)
        return (
          <rect key={`bar-${y}`}
            x={toX(y) - barW / 2}
            y={toY1(ringWidths[i])}
            width={barW}
            height={chartH - (toY1(ringWidths[i]) - PAD.top)}
            fill="#ea580c" opacity={0.6} rx={1}
          >
            <title>Year {y}: Width={ringWidths[i].toFixed(1)}px</title>
          </rect>
        )
      })}

      {/* Climate Line */}
      <path d={climatePath} fill="none" stroke={climColor} strokeWidth={2.5} strokeLinejoin="round" />

      {/* Climate Points */}
      {years.map((y, i) => (
        <circle key={`pt-${y}`} cx={toX(y)} cy={toY2(climateValues[i])} r={3} fill={climColor}>
          <title>Year {y}: {variable} = {climateValues[i].toFixed(1)} {unit}</title>
        </circle>
      ))}

      {/* Legends */}
      <text x={PAD.left + 5} y={PAD.top - 10} className="fill-[#ea580c] font-mono font-bold" style={{ fontSize: 10 }}>
        ▀ Ring Width (px)
      </text>
      <text x={W - PAD.right - 5} y={PAD.top - 10} textAnchor="end" className="font-mono font-bold" style={{ fontSize: 10, fill: climColor }}>
        ● {variable} ({unit})
      </text>
    </svg>
  )
}

// ── Template Download ──

function downloadTemplate() {
  const header = "year,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec"
  const rows = Array.from({ length: 5 }, (_, i) => {
    const y = 2019 + i
    const vals = Array.from({ length: 12 }, () => (Math.random() * 200 + 20).toFixed(1))
    return `${y},${vals.join(",")}`
  })
  const csv = [header, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "climate_template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

// ── Demo Data Generator ──

function generateDemoClimate(years: number[]) {
  const headerWithVar = "# Climate Data for Correlation Analysis\n# Variable: Rainfall\n# Unit: mm\nyear,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec"
  const rows = years.map(y => {
    // Simulate a severe drought roughly in the middle of the dataset
    const isDrought = y === years[Math.floor(years.length / 2)]
    const baseVal = isDrought ? 15 : 60
    const vals = Array.from({ length: 12 }, () => (Math.random() * baseVal + baseVal / 2).toFixed(1))
    return `${y},${vals.join(",")}`
  })
  return [headerWithVar, ...rows].join("\n")
}

// ── Main Component ──

export function ClimateCorrelation({ result }: Props) {
  const [csvData, setCsvData] = useState<{ rows: ClimateRow[]; isMonthly: boolean; variable: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  // Build ring width series keyed by year
  const ringByYear = useMemo(() => {
    const map: Record<number, number> = {}
    result.rings.forEach(r => {
      map[r.estimated_year] = r.width_px
    })
    return map
  }, [result.rings])

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = parseClimateCSV(ev.target?.result as string)
        if (parsed.rows.length < 3) throw new Error("Need at least 3 overlapping years for correlation")
        setCsvData(parsed)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        setCsvData(null)
      }
    }
    reader.readAsText(file)
  }, [])

  const handleLoadDemo = useCallback(() => {
    const years = Object.keys(ringByYear).map(Number).sort((a, b) => a - b)
    if (years.length < 3) {
      setError("Need at least 3 years of tree ring data to generate demo climate.")
      return
    }
    const csvString = generateDemoClimate(years)
    const fileNameStr = "Demo_Precipitation_Data.csv"
    setFileName(fileNameStr)

    // Download the generated CSV file
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileNameStr
    a.click()
    URL.revokeObjectURL(url)

    try {
      const parsed = parseClimateCSV(csvString)
      setCsvData(parsed)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setCsvData(null)
    }
  }, [ringByYear])

  // Compute correlations
  const analysis = useMemo(() => {
    if (!csvData) return null

    // Find overlapping years
    const overlapYears = csvData.rows
      .filter(r => ringByYear[r.year] !== undefined)
      .sort((a, b) => a.year - b.year)

    if (overlapYears.length < 3) return null

    const years = overlapYears.map(r => r.year)
    const widths = years.map(y => ringByYear[y])

    if (csvData.isMonthly) {
      // For the timeline, we just use the annual sum of the monthly values
      const annualClimate = overlapYears.map(r => r.values.reduce((a, b) => a + b, 0))
      const r = pearsonR(widths, annualClimate)

      // Calculate extremes & derived climate metrics
      const maxCIdx = annualClimate.indexOf(Math.max(...annualClimate))
      const minCIdx = annualClimate.indexOf(Math.min(...annualClimate))
      const maxWIdx = widths.indexOf(Math.max(...widths))
      const minWIdx = widths.indexOf(Math.min(...widths))
      const climMean = annualClimate.reduce((a, b) => a + b, 0) / annualClimate.length
      const climStd = Math.sqrt(annualClimate.reduce((s, v) => s + (v - climMean) ** 2, 0) / annualClimate.length)
      const droughtYears = years.filter((_, i) => annualClimate[i] < climMean - climStd)
      const excessYears = years.filter((_, i) => annualClimate[i] > climMean + climStd)

      const extremes = {
        maxClimate: { year: years[maxCIdx], value: annualClimate[maxCIdx] },
        minClimate: { year: years[minCIdx], value: annualClimate[minCIdx] },
        maxGrowth: { year: years[maxWIdx], value: widths[maxWIdx] },
        minGrowth: { year: years[minWIdx], value: widths[minWIdx] },
        climMean, climStd, droughtYears, excessYears,
      }

      return {
        years, widths, climateValues: annualClimate, overlapCount: overlapYears.length,
        variable: csvData.variable, r, extremes,
        unit: csvData.variable === "Precipitation" ? "mm" : csvData.variable === "Temperature" ? "°C" : "units"
      }
    } else {
      // Annual
      const climVals = overlapYears.map(r => r.values[0])
      const r = pearsonR(widths, climVals)

      // Calculate extremes & derived climate metrics
      const maxCIdx = climVals.indexOf(Math.max(...climVals))
      const minCIdx = climVals.indexOf(Math.min(...climVals))
      const maxWIdx = widths.indexOf(Math.max(...widths))
      const minWIdx = widths.indexOf(Math.min(...widths))
      const climMean = climVals.reduce((a, b) => a + b, 0) / climVals.length
      const climStd = Math.sqrt(climVals.reduce((s, v) => s + (v - climMean) ** 2, 0) / climVals.length)
      const droughtYears = years.filter((_, i) => climVals[i] < climMean - climStd)
      const excessYears = years.filter((_, i) => climVals[i] > climMean + climStd)

      const extremes = {
        maxClimate: { year: years[maxCIdx], value: climVals[maxCIdx] },
        minClimate: { year: years[minCIdx], value: climVals[minCIdx] },
        maxGrowth: { year: years[maxWIdx], value: widths[maxWIdx] },
        minGrowth: { year: years[minWIdx], value: widths[minWIdx] },
        climMean, climStd, droughtYears, excessYears,
      }

      return {
        years, widths, climateValues: climVals, overlapCount: overlapYears.length,
        variable: csvData.variable, r, extremes,
        unit: csvData.variable === "Precipitation" ? "mm" : csvData.variable === "Temperature" ? "°C" : "units"
      }
    }
  }, [csvData, ringByYear])

  return (
    <div className="border-[3px] border-border bg-background flex flex-col relative mb-8 shadow-[6px_6px_0px_#111111] dark:shadow-[6px_6px_0px_#000000]">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-[3px] border-l-[3px] border-accent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-[3px] border-r-[3px] border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-[3px] border-l-[3px] border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[3px] border-r-[3px] border-accent z-20 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col border-b-[3px] border-border bg-surface">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <CloudRain className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
              [ENVIRONMENTAL_TIMELINE & EVENTS]
            </span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground hover:text-accent transition-colors">
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[260px] border border-accent/20 bg-background font-mono text-[10px] leading-relaxed p-3">
              Upload climate history to visualize environmental impact directly on top of the tree ring growth chronology. This visually reveals how weather events affect radial growth over time.
            </PopoverContent>
          </Popover>
        </div>

        {/* Climate context explanation */}
        <div className="px-5 py-4 bg-background/50 flex items-start border-b border-border/30 relative">
          <div className="w-1 h-full bg-accent absolute left-0 top-0 bottom-0 opacity-50" />
          <p className="font-mono text-[12px] text-muted-foreground leading-relaxed w-full">
            <strong className="text-foreground">CLIMATE VARIABLES & RADIAL GROWTH:</strong> Tree rings act as biological weather stations.
            Wide rings generally indicate favorable growing conditions (e.g., high precipitation, optimal temperatures),
            while narrow rings point to environmental stress (e.g., severe droughts, extreme cold). Correlating these variables
            reveals the exact historical climate factors that governed this specimen&apos;s life.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!csvData && (
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="border-2 border-dashed border-border/60 bg-surface/30 rounded-sm p-8 w-full flex flex-col items-center gap-3 hover:border-accent/40 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground/40" />
            <p className="font-mono text-xs text-muted-foreground text-center uppercase tracking-wider">
              Upload climate data CSV
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/60 text-center max-w-sm">
              Format: <code className="bg-surface px-1 py-0.5 border border-border text-accent">year,jan,feb,...,dec</code> (monthly) or <code className="bg-surface px-1 py-0.5 border border-border text-accent">year,value</code> (annual)
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <label className="cursor-pointer border-2 border-accent bg-accent text-white px-5 py-2.5 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-accent transition-all shadow-[sidebar_hover_shift]">
                <input type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleUpload} />
                Upload Custom CSV
              </label>
              <button
                onClick={handleLoadDemo}
                className="border-2 border-border bg-surface text-foreground font-bold px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent transition-colors"
              >
                Generate CSV data for {result.image_name ? result.image_name.replace(/\.[^/.]+$/, "") : "this given image"}
              </button>
              <button
                onClick={downloadTemplate}
                className="border-2 border-border text-muted-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:border-accent/50 hover:text-accent transition-colors"
              >
                Download Template
              </button>
            </div>
          </div>
          {error && (
            <p className="font-mono text-xs text-status-error bg-status-error/10 border border-status-error/20 px-3 py-2 w-full">
              ⚠ {error}
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {csvData && analysis && (
        <div className="flex flex-col">
          {/* File Info Bar */}
          <div className="flex items-center justify-between bg-surface/50 border-b border-border/50 px-4 py-2">
            <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
              {analysis.variable === "Precipitation"
                ? <CloudRain className="h-3 w-3 text-blue-400" />
                : <Thermometer className="h-3 w-3 text-red-400" />}
              <span>{fileName}</span>
              <span className="text-border">│</span>
              <span className="text-foreground font-bold">{analysis.variable}</span>
              <span className="bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 text-[9px] font-bold">{analysis.unit}</span>
              <span className="text-border">│</span>
              <span>{analysis.overlapCount} overlapping years</span>
              <span className="text-border">│</span>
              <span>{analysis.years[0]}–{analysis.years[analysis.years.length - 1]}</span>
            </div>
            <button
              onClick={() => { setCsvData(null); setFileName(null); setError(null) }}
              className="text-muted-foreground hover:text-status-error transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Visual Timeline Chart */}

          {/* Visual Timeline Chart */}
          <div className="p-4 md:p-6 border-b-[3px] border-border bg-surface/5">
            <TimelineChart
              ringWidths={analysis.widths}
              climateValues={analysis.climateValues}
              years={analysis.years}
              variable={analysis.variable}
              unit={analysis.unit}
            />

            {/* Chart Legend */}
            <div className="mt-4 pt-4 border-t border-border/30">
              <span className="font-mono text-[9px] uppercase tracking-[2px] text-muted-foreground font-bold block mb-3">HOW TO READ THIS CHART</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 font-mono text-[10px]">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-3 bg-[#ea580c] opacity-60 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Orange Bars</strong> {"\u2014"} Tree ring width (px) for each year. Taller bar = wider ring = better growth.</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-0.5 shrink-0 mt-2 bg-blue-500" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Blue/Red Line</strong> {"\u2014"} Annual climate variable overlaid on the same timeline.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#888] font-bold text-xs shrink-0 mt-0.5">{"\u25C2"} L</span>
                  <span className="text-muted-foreground"><strong className="text-foreground">Left Axis</strong> {"\u2014"} Ring width scale in pixels.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-xs shrink-0 mt-0.5">R {"\u25B8"}</span>
                  <span className="text-muted-foreground"><strong className="text-foreground">Right Axis</strong> {"\u2014"} Climate variable scale.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#888] font-bold text-xs shrink-0 mt-0.5">{"\u2194"}</span>
                  <span className="text-muted-foreground"><strong className="text-foreground">X-Axis</strong> {"\u2014"} Chronological years of the specimen.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xs shrink-0 mt-0.5">{"\u2726"}</span>
                  <span className="text-muted-foreground">Hover any bar or dot for exact values.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Climate Event Summary */}
          <div className="border-t-[3px] border-border">

            {/* Key Metrics Row (Redesigned Info Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-surface/5">

              {/* Peak Card */}
              <div className="flex flex-col p-6 border-b md:border-b-0 md:border-r border-border/30 hover:bg-surface/10 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground font-bold">PEAK {analysis.variable}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-4xl font-bold text-blue-400 tabular-nums">{analysis.extremes.maxClimate.value.toFixed(1)}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{analysis.unit}</span>
                </div>
                <div className="font-mono text-xs text-foreground mb-4">
                  Recorded in <strong className="bg-blue-500/10 text-blue-400 px-1 py-0.5">{analysis.extremes.maxClimate.year}</strong>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed mt-auto border-t border-border/20 pt-3">
                  {analysis.variable === "Precipitation"
                    ? "Wettest year on record. High rainfall typically promotes vigorous, wide ring formation."
                    : "Warmest year recorded. Elevated temperatures can either accelerate or inhibit growth depending on the species."}
                </p>
              </div>

              {/* Lowest Card */}
              <div className="flex flex-col p-6 border-b md:border-b-0 md:border-r border-border/30 hover:bg-surface/10 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground font-bold">LOWEST {analysis.variable}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-4xl font-bold text-red-400 tabular-nums">{analysis.extremes.minClimate.value.toFixed(1)}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{analysis.unit}</span>
                </div>
                <div className="font-mono text-xs text-foreground mb-4">
                  Recorded in <strong className="bg-red-500/10 text-red-400 px-1 py-0.5">{analysis.extremes.minClimate.year}</strong>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed mt-auto border-t border-border/20 pt-3">
                  {analysis.variable === "Precipitation"
                    ? "Driest year recorded. Severe water deficit often produces the narrowest rings and stress markers."
                    : "Coldest year recorded. Frost damage may cause missing rings or false ring formation."}
                </p>
              </div>

              {/* Average Card */}
              <div className="flex flex-col p-6 hover:bg-surface/10 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground font-bold">HISTORICAL AVERAGE</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-4xl font-bold text-foreground tabular-nums">{analysis.extremes.climMean.toFixed(1)}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{analysis.unit}</span>
                </div>
                <div className="font-mono text-xs text-muted-foreground mb-4">
                  Volatility: ±{analysis.extremes.climStd.toFixed(1)} {analysis.unit} (1σ)
                </div>
                <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed mt-auto border-t border-border/20 pt-3">
                  Baseline {analysis.variable.toLowerCase()} across the entire observed period. Years deviating beyond 1 standard deviation are flagged below as extreme events.
                </p>
              </div>
            </div>

            {/* Drought & Excess Year Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 border-t-[2px] border-border">
              {/* Drought Card */}
              <div className="border-b lg:border-b-0 lg:border-r border-border/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                    <Droplets className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-red-400 font-bold block">
                      {analysis.variable === "Precipitation" ? "Drought Years" : "Cold Stress Years"}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      {analysis.variable} {"<"} {(analysis.extremes.climMean - analysis.extremes.climStd).toFixed(0)} {analysis.unit} (below 1{"\u03c3"})
                    </span>
                  </div>
                  <span className="ml-auto font-mono text-2xl font-bold text-red-400 tabular-nums">{analysis.extremes.droughtYears.length}</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed mb-4">
                  {analysis.variable === "Precipitation"
                    ? "Years with rainfall significantly below the long-term average. Drought conditions limit water availability to the cambium, producing characteristically narrow rings and potential stress markers."
                    : "Years with temperatures well below average. Prolonged cold can shorten the growing season, cause frost damage to the cambium, and produce anomalously narrow or malformed rings."}
                </p>
                {analysis.extremes.droughtYears.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.extremes.droughtYears.map(y => (
                      <span key={y} className="font-mono text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 tabular-nums font-bold">{y}</span>
                    ))}
                  </div>
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground/60 italic">No extreme low-{analysis.variable.toLowerCase()} years detected in this period.</span>
                )}
              </div>

              {/* Excess Card */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                    <CloudRain className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-blue-400 font-bold block">
                      {analysis.variable === "Precipitation" ? "Excess Rainfall Years" : "Heat Stress Years"}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      {analysis.variable} {">"} {(analysis.extremes.climMean + analysis.extremes.climStd).toFixed(0)} {analysis.unit} (above 1{"\u03c3"})
                    </span>
                  </div>
                  <span className="ml-auto font-mono text-2xl font-bold text-blue-400 tabular-nums">{analysis.extremes.excessYears.length}</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed mb-4">
                  {analysis.variable === "Precipitation"
                    ? "Years with rainfall significantly above average. Excess moisture can promote vigorous growth in well-drained soils, but in poorly drained sites it may cause root hypoxia and fungal pathogenesis."
                    : "Years with temperatures well above average. Heat stress can accelerate evapotranspiration, deplete soil moisture reserves, and reduce net photosynthetic gain despite a longer growing season."}
                </p>
                {analysis.extremes.excessYears.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.extremes.excessYears.map(y => (
                      <span key={y} className="font-mono text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 tabular-nums font-bold">{y}</span>
                    ))}
                  </div>
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground/60 italic">No extreme high-{analysis.variable.toLowerCase()} years detected in this period.</span>
                )}
              </div>
            </div>

            {/* Plain English Insight */}
            <div className="bg-accent/5 p-5 flex gap-3 items-start border-t border-border/30">
              <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p className="font-mono text-[11px] text-foreground leading-relaxed max-w-[80ch]">
                {analysis.r > 0.4
                  ? `The timeline shows a strong visual alignment between ${analysis.variable.toLowerCase()} and ring growth. Years with higher ${analysis.variable.toLowerCase()} consistently correspond to wider rings, confirming ${analysis.variable.toLowerCase()} as a key growth driver.`
                  : analysis.r > 0.15
                    ? `A mild positive trend is visible. Peak ${analysis.variable.toLowerCase()} years like ${analysis.extremes.maxClimate.year} tend to coincide with above-average growth, though other factors moderate the relationship.`
                    : analysis.r > -0.15
                      ? `The tree appears largely resilient to ${analysis.variable.toLowerCase()} variation. Growth patterns are independent of climate swings, suggesting other factors (soil, canopy, elevation) dominate.`
                      : analysis.r > -0.4
                        ? `An inverse pattern is visible: excess ${analysis.variable.toLowerCase()} appears to suppress growth. The narrowest ring in ${analysis.extremes.minGrowth.year} may relate to climate stress that year.`
                        : `Strong inverse impact detected. High ${analysis.variable.toLowerCase()} years clearly coincide with suppressed growth, marking ${analysis.variable.toLowerCase()} as a primary environmental stressor.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}