"use client"

import { useState, useMemo } from "react"
import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { ArrowRight, ChevronDown, ChevronRight, Upload, FileDown, Database, Droplets, Thermometer } from "lucide-react"
import { GuideTooltip } from "../guide-tooltip"
import { StepCompletionBanner } from "../step-completion-banner"
import { MOCK_CLIMATE, MOCK_SPECIMENS } from "@/lib/mock-dendrolab"
import {
  computeRWI,
  computeMonthlyCorrelations,
  getScatterData,
  pearsonCorrelation,
  MonthlyCorrelation,
  MONTHLY_WINDOW,
} from "@/lib/dendro-stats"

/* ═══════════════════════════════════════════════════════════════════
   STEP 3: CONNECT TO CLIMATE DATA
   Climate correlation interface with real Pearson coefficients.
   Shows dual-variable (Precipitation + Temperature) bar charts
   with statistically significant correlations highlighted.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Monthly Correlation Dual Bar Chart ── */
function CorrelationBarChart({
  precipCorrelations,
  tempCorrelations,
  activeVariable,
  selectedMonth,
  onSelectMonth,
}: {
  precipCorrelations: MonthlyCorrelation[]
  tempCorrelations: MonthlyCorrelation[]
  activeVariable: "Precipitation" | "Temperature" | "both"
  selectedMonth: string | null
  onSelectMonth: (month: string) => void
}) {
  const w = 760, h = 220, padL = 40, padR = 10, padT = 15, padB = 55
  const chartW = w - padL - padR
  const chartH = h - padT - padB
  const midY = padT + chartH / 2

  const showPrecip = activeVariable === "Precipitation" || activeVariable === "both"
  const showTemp = activeVariable === "Temperature" || activeVariable === "both"

  const correlations = showPrecip ? precipCorrelations : tempCorrelations
  const barCount = correlations.length
  const barGroupW = chartW / barCount
  const barW = activeVariable === "both" ? Math.floor(barGroupW * 0.35) : Math.floor(barGroupW * 0.7)

  return (
    <div className="border border-[#333333] bg-[#0a0a0a] p-3 overflow-x-auto">
      <svg width={w} height={h + 5} viewBox={`0 0 ${w} ${h + 5}`} className="w-full min-w-[600px]">
        {/* Grid lines */}
        {[-1, -0.5, 0, 0.5, 1].map(v => {
          const y = midY - (v * chartH / 2)
          return (
            <g key={v}>
              <line x1={padL} x2={w - padR} y1={y} y2={y}
                stroke={v === 0 ? "#444444" : "#1a1a1a"} strokeWidth={v === 0 ? 1.5 : 0.5} />
              <text x={padL - 5} y={y + 3} textAnchor="end"
                fill="#555555" fontSize="9" fontFamily="monospace">
                {v > 0 ? `+${v}` : v}
              </text>
            </g>
          )
        })}

        {/* Significance threshold lines at ±critical r (approx 0.42 for n=20) */}
        {[0.42, -0.42].map(v => {
          const y = midY - (v * chartH / 2)
          return (
            <line key={`sig-${v}`} x1={padL} x2={w - padR} y1={y} y2={y}
              stroke="#ea580c" strokeWidth={0.5} strokeDasharray="4,4" opacity={0.4} />
          )
        })}

        {/* Previous year separator */}
        {(() => {
          const sepX = padL + 7 * barGroupW
          return (
            <>
              <line x1={sepX} x2={sepX} y1={padT} y2={h - padB + 5}
                stroke="#333333" strokeWidth={0.5} strokeDasharray="2,2" />
              <text x={padL + 3.5 * barGroupW} y={h - padB + 48} textAnchor="middle"
                fill="#555555" fontSize="8" fontFamily="monospace">PREVIOUS YEAR</text>
              <text x={padL + 7 * barGroupW + (barCount - 7) * barGroupW / 2} y={h - padB + 48}
                textAnchor="middle" fill="#555555" fontSize="8" fontFamily="monospace">CURRENT YEAR</text>
            </>
          )
        })()}

        {/* Bars */}
        {correlations.map((m, i) => {
          const groupX = padL + i * barGroupW
          const isSelected = selectedMonth === m.month

          // Precipitation bar
          const precipBar = showPrecip ? (() => {
            const pc = precipCorrelations[i]
            const barH = Math.abs(pc.r) * (chartH / 2)
            const y = pc.r >= 0 ? midY - barH : midY
            const x = activeVariable === "both"
              ? groupX + barGroupW * 0.1
              : groupX + (barGroupW - barW) / 2

            return (
              <g key={`p-${m.month}`}>
                <rect x={x} y={y} width={barW} height={Math.max(1, barH)}
                  fill={pc.significant ? "#38bdf8" : "#1e3a5f"}
                  opacity={pc.significant ? 1 : 0.45}
                  rx={1}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onSelectMonth(m.month)}
                />
                {pc.significant && (
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                    fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">★</text>
                )}
              </g>
            )
          })() : null

          // Temperature bar
          const tempBar = showTemp ? (() => {
            const tc = tempCorrelations[i]
            const barH = Math.abs(tc.r) * (chartH / 2)
            const y = tc.r >= 0 ? midY - barH : midY
            const x = activeVariable === "both"
              ? groupX + barGroupW * 0.55
              : groupX + (barGroupW - barW) / 2

            return (
              <g key={`t-${m.month}`}>
                <rect x={x} y={y} width={barW} height={Math.max(1, barH)}
                  fill={tc.significant ? "#f97316" : "#5c2d0e"}
                  opacity={tc.significant ? 1 : 0.45}
                  rx={1}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onSelectMonth(m.month)}
                />
                {tc.significant && (
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                    fill="#f97316" fontSize="9" fontFamily="monospace" fontWeight="bold">★</text>
                )}
              </g>
            )
          })() : null

          // Month label
          return (
            <g key={m.month}>
              {precipBar}
              {tempBar}
              <text
                x={groupX + barGroupW / 2}
                y={h - padB + 14}
                textAnchor="middle"
                fill={isSelected ? "#ea580c" : "#666666"}
                fontSize="8"
                fontFamily="monospace"
                fontWeight={isSelected ? "bold" : "normal"}
                className="cursor-pointer"
                onClick={() => onSelectMonth(m.month)}
              >
                {m.month}
              </text>
            </g>
          )
        })}

        {/* Selection highlight */}
        {selectedMonth && (() => {
          const idx = correlations.findIndex(m => m.month === selectedMonth)
          if (idx < 0) return null
          const x = padL + idx * barGroupW
          return (
            <rect x={x} y={padT} width={barGroupW} height={chartH}
              fill="#ea580c" opacity={0.06} rx={2} />
          )
        })()}

        {/* Y-axis label */}
        <text x={10} y={midY} textAnchor="middle" fill="#555555" fontSize="9"
          fontFamily="monospace" transform={`rotate(-90, 10, ${midY})`}>
          Pearson r
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 px-2 font-mono text-[10px]">
        {showPrecip && (
          <span className="flex items-center gap-1.5 text-[#38bdf8]">
            <span className="inline-block w-3 h-2 bg-[#38bdf8] rounded-[1px]" /> Precipitation
          </span>
        )}
        {showTemp && (
          <span className="flex items-center gap-1.5 text-[#f97316]">
            <span className="inline-block w-3 h-2 bg-[#f97316] rounded-[1px]" /> Temperature
          </span>
        )}
        <span className="flex items-center gap-1.5 text-[#555555]">
          ★ = significant (p &lt; 0.05)
        </span>
        <span className="flex items-center gap-1.5 text-[#555555]">
          <span className="inline-block w-4 border-t border-dashed border-[#ea580c] opacity-40" /> ≈ significance threshold
        </span>
      </div>
    </div>
  )
}

/* ── Scatter Plot ── */
function ScatterPlot({
  data,
  climateLabel,
  climateUnit,
  variable,
}: {
  data: { rwiVal: number; climVal: number; year: number }[]
  climateLabel: string
  climateUnit: string
  variable: "Precipitation" | "Temperature"
}) {
  if (data.length < 3) return null

  const w = 380, h = 260, pad = 45
  const chartW = w - pad * 2
  const chartH = h - pad * 2

  const rwiVals = data.map(d => d.rwiVal)
  const climVals = data.map(d => d.climVal)

  const rwiMin = Math.min(...rwiVals) * 0.9
  const rwiMax = Math.max(...rwiVals) * 1.1
  const climMin = Math.min(...climVals) * 0.9
  const climMax = Math.max(...climVals) * 1.1

  const toX = (v: number) => pad + ((v - climMin) / (climMax - climMin)) * chartW
  const toY = (v: number) => pad + chartH - ((v - rwiMin) / (rwiMax - rwiMin)) * chartH

  // Regression line
  const corr = pearsonCorrelation(climVals, rwiVals)
  const climMean = climVals.reduce((s, v) => s + v, 0) / climVals.length
  const rwiMean = rwiVals.reduce((s, v) => s + v, 0) / rwiVals.length
  let num = 0, den = 0
  for (let i = 0; i < data.length; i++) {
    num += (climVals[i] - climMean) * (rwiVals[i] - rwiMean)
    den += (climVals[i] - climMean) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = rwiMean - slope * climMean

  const regY1 = slope * climMin + intercept
  const regY2 = slope * climMax + intercept

  const dotColor = variable === "Precipitation" ? "#38bdf8" : "#f97316"
  const lineColor = variable === "Precipitation" ? "#0ea5e9" : "#ea580c"

  return (
    <div className="border border-[#333333] bg-[#0a0a0a] p-3">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
        {/* Grid */}
        {[0.25, 0.5, 0.75].map(f => {
          const y = pad + chartH * f
          return <line key={f} x1={pad} x2={w - pad} y1={y} y2={y} stroke="#1a1a1a" strokeWidth={0.5} />
        })}

        {/* Regression line */}
        <line
          x1={toX(climMin)} y1={toY(regY1)}
          x2={toX(climMax)} y2={toY(regY2)}
          stroke={lineColor} strokeWidth={1.5} opacity={0.6} strokeDasharray="4,3"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(d.climVal)} cy={toY(d.rwiVal)} r={4}
              fill={dotColor} opacity={0.7} stroke={dotColor} strokeWidth={0.5} />
            <title>{d.year}: {climateLabel}={d.climVal.toFixed(1)}{climateUnit}, RWI={d.rwiVal.toFixed(2)}</title>
          </g>
        ))}

        {/* Axes labels */}
        <text x={w / 2} y={h - 5} textAnchor="middle" fill="#666666" fontSize="9" fontFamily="monospace">
          {climateLabel} ({climateUnit})
        </text>
        <text x={12} y={h / 2} textAnchor="middle" fill="#666666" fontSize="9"
          fontFamily="monospace" transform={`rotate(-90, 12, ${h / 2})`}>
          Ring Width Index
        </text>

        {/* Correlation stats */}
        <text x={w - pad} y={pad + 12} textAnchor="end" fill={lineColor} fontSize="10" fontFamily="monospace" fontWeight="bold">
          r = {corr.r.toFixed(3)}
        </text>
        <text x={w - pad} y={pad + 24} textAnchor="end" fill="#666666" fontSize="9" fontFamily="monospace">
          R² = {corr.rSquared.toFixed(3)}, p = {corr.pValue < 0.001 ? "<0.001" : corr.pValue.toFixed(3)}
        </text>
        <text x={w - pad} y={pad + 36} textAnchor="end"
          fill={corr.significant ? "#22c55e" : "#ef4444"} fontSize="9" fontFamily="monospace">
          {corr.significant ? "★ SIGNIFICANT" : "NOT SIGNIFICANT"}
        </text>
      </svg>
    </div>
  )
}

/* ── Detailed Stats Table ── */
function StatsTable({
  precipCorrelations,
  tempCorrelations,
}: {
  precipCorrelations: MonthlyCorrelation[]
  tempCorrelations: MonthlyCorrelation[]
}) {
  return (
    <div className="overflow-x-auto border border-[#333333] bg-[#0a0a0a]">
      <table className="w-full font-mono text-xs border-collapse">
        <thead>
          <tr className="bg-[#111111]">
            <th className="border border-[#222222] px-3 py-2 text-left text-[#666666] uppercase text-[10px] tracking-wider">Month</th>
            <th className="border border-[#222222] px-3 py-2 text-center text-[#38bdf8] uppercase text-[10px] tracking-wider" colSpan={4}>
              <Droplets className="inline w-3 h-3 mr-1" />Precipitation
            </th>
            <th className="border border-[#222222] px-3 py-2 text-center text-[#f97316] uppercase text-[10px] tracking-wider" colSpan={4}>
              <Thermometer className="inline w-3 h-3 mr-1" />Temperature
            </th>
          </tr>
          <tr className="bg-[#0d0d0d]">
            <th className="border border-[#222222] px-3 py-1.5 text-left text-[#555555] text-[10px]" />
            {["r", "R²", "p", "Sig."].map(h => (
              <th key={`p-${h}`} className="border border-[#222222] px-2 py-1.5 text-center text-[#555555] text-[10px]">{h}</th>
            ))}
            {["r", "R²", "p", "Sig."].map(h => (
              <th key={`t-${h}`} className="border border-[#222222] px-2 py-1.5 text-center text-[#555555] text-[10px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {precipCorrelations.map((pc, i) => {
            const tc = tempCorrelations[i]
            return (
              <tr key={pc.month} className="hover:bg-[#111111] transition-colors">
                <td className="border border-[#222222] px-3 py-1.5 text-[#a3a3a3] font-bold">
                  {pc.isPreviousYear && <span className="text-[#555555] mr-1">←</span>}
                  {pc.label}
                </td>
                {/* Precipitation */}
                <td className={`border border-[#222222] px-2 py-1.5 text-center ${pc.significant ? "text-[#38bdf8] font-bold" : "text-[#666666]"}`}>
                  {pc.r >= 0 ? "+" : ""}{pc.r.toFixed(3)}
                </td>
                <td className="border border-[#222222] px-2 py-1.5 text-center text-[#666666]">
                  {(pc.r * pc.r).toFixed(3)}
                </td>
                <td className="border border-[#222222] px-2 py-1.5 text-center text-[#666666]">
                  {pc.pValue < 0.001 ? "<.001" : pc.pValue.toFixed(3)}
                </td>
                <td className="border border-[#222222] px-2 py-1.5 text-center">
                  {pc.significant
                    ? <span className="text-[#22c55e] font-bold">★</span>
                    : <span className="text-[#333333]">—</span>}
                </td>
                {/* Temperature */}
                <td className={`border border-[#222222] px-2 py-1.5 text-center ${tc.significant ? "text-[#f97316] font-bold" : "text-[#666666]"}`}>
                  {tc.r >= 0 ? "+" : ""}{tc.r.toFixed(3)}
                </td>
                <td className="border border-[#222222] px-2 py-1.5 text-center text-[#666666]">
                  {(tc.r * tc.r).toFixed(3)}
                </td>
                <td className="border border-[#222222] px-2 py-1.5 text-center text-[#666666]">
                  {tc.pValue < 0.001 ? "<.001" : tc.pValue.toFixed(3)}
                </td>
                <td className="border border-[#222222] px-2 py-1.5 text-center">
                  {tc.significant
                    ? <span className="text-[#22c55e] font-bold">★</span>
                    : <span className="text-[#333333]">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */

export function StageClimate() {
  const { state, dispatch } = useDendroLab()
  const [climateLoaded, setClimateLoaded] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showDetrending, setShowDetrending] = useState(false)
  const [showDetailedStats, setShowDetailedStats] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [activeVariable, setActiveVariable] = useState<"Precipitation" | "Temperature" | "both">("both")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [detrendMethod, setDetrendMethod] = useState("negative-exp")
  const guideMode = state.guideMode

  // Compute RWI from loaded specimens
  const rwi = useMemo(() => {
    // Use the first dated specimen with ring widths
    const specimen = state.specimens.length > 0
      ? state.specimens.find(s => s.dated && s.yearSpan && s.ringWidths.length > 0)
      : MOCK_SPECIMENS.find(s => s.dated && s.yearSpan && s.ringWidths.length > 0)

    if (!specimen || !specimen.yearSpan) return null

    const years = Array.from(
      { length: specimen.ringWidths.length },
      (_, i) => specimen.yearSpan!.start + i
    )
    return computeRWI(years, specimen.ringWidths, detrendMethod)
  }, [state.specimens, detrendMethod])

  // Compute correlations for both variables
  const precipCorrelations = useMemo(() => {
    if (!rwi || !climateLoaded) return []
    const precipDataset = MOCK_CLIMATE.find(c => c.variable === "Precipitation")
    if (!precipDataset) return []
    return computeMonthlyCorrelations(rwi, precipDataset)
  }, [rwi, climateLoaded])

  const tempCorrelations = useMemo(() => {
    if (!rwi || !climateLoaded) return []
    const tempDataset = MOCK_CLIMATE.find(c => c.variable === "Temperature")
    if (!tempDataset) return []
    return computeMonthlyCorrelations(rwi, tempDataset)
  }, [rwi, climateLoaded])

  // Find strongest correlations
  const strongestPrecip = useMemo(() =>
    [...precipCorrelations].sort((a, b) => Math.abs(b.r) - Math.abs(a.r))[0] ?? null,
    [precipCorrelations]
  )

  const strongestTemp = useMemo(() =>
    [...tempCorrelations].sort((a, b) => Math.abs(b.r) - Math.abs(a.r))[0] ?? null,
    [tempCorrelations]
  )

  const significantPrecipCount = precipCorrelations.filter(m => m.significant).length
  const significantTempCount = tempCorrelations.filter(m => m.significant).length

  // Scatter data for selected month
  const scatterData = useMemo(() => {
    if (!rwi || !selectedMonth) return null
    const monthDef = MONTHLY_WINDOW.find(m => m.month === selectedMonth)
    if (!monthDef) return null

    const precipDataset = MOCK_CLIMATE.find(c => c.variable === "Precipitation")!
    const tempDataset = MOCK_CLIMATE.find(c => c.variable === "Temperature")!

    return {
      precip: getScatterData(rwi, precipDataset, monthDef),
      temp: getScatterData(rwi, tempDataset, monthDef),
      label: monthDef.label,
    }
  }, [rwi, selectedMonth])

  const handleLoadSample = () => {
    dispatch({ type: "LOAD_CLIMATE_DATA", payload: MOCK_CLIMATE })
    if (state.specimens.length === 0) {
      dispatch({ type: "SET_SPECIMENS", payload: MOCK_SPECIMENS })
    }
    setClimateLoaded(true)
    setSelectedMonth("MAY") // Pre-select a likely significant month
  }

  const handleComplete = () => {
    dispatch({ type: "MARK_STAGE_COMPLETED", payload: 3 })
    setShowCompletion(true)
  }

  // Get the absolute strongest month across both variables
  const overallStrongest = (() => {
    const allCorr = [
      ...precipCorrelations.map(c => ({ ...c, variable: "Precipitation" as const })),
      ...tempCorrelations.map(c => ({ ...c, variable: "Temperature" as const })),
    ]
    return allCorr.sort((a, b) => Math.abs(b.r) - Math.abs(a.r))[0] ?? null
  })()

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto">
      <div className="border-b-2 border-[#333333] pb-6">
        <h2 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">
          CLIMATE CORRELATION
        </h2>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          {guideMode
            ? "Find out what drove your tree's growth"
            : "Pearson correlation analysis between RWI and monthly climate variables"}
        </p>
      </div>

      {showCompletion && overallStrongest && (
        <StepCompletionBanner
          title="✓ CLIMATE CORRELATION COMPLETE"
          description={`${overallStrongest.label} ${overallStrongest.variable.toLowerCase()} is the strongest driver (r = ${overallStrongest.r.toFixed(2)}). ${significantPrecipCount + significantTempCount} months are statistically significant.`}
          nextLabel="DISCOVER EVENTS & TRENDS"
          onNext={() => dispatch({ type: "SET_STAGE", payload: 4 })}
        />
      )}

      {/* ── Climate Data Loading ── */}
      {!climateLoaded ? (
        <div className="border border-[#333333] bg-[#0a0a0a] p-6 flex flex-col gap-5">
          <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
            // LOAD CLIMATE DATA
          </span>
          {guideMode && (
            <p className="font-mono text-sm text-[#aaaaaa] leading-relaxed">
              To compute Pearson correlation coefficients between your tree&apos;s
              standardized ring width index (RWI) and climate variables, we need
              monthly precipitation and temperature records for your location.
            </p>
          )}

          {guideMode && (
            <div className="border border-[#222222] bg-[#111111] p-4">
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.15em] block mb-2">
                WHAT THIS ANALYSIS DOES:
              </span>
              <ol className="font-mono text-xs text-[#a3a3a3] flex flex-col gap-1.5 list-decimal pl-5">
                <li>Detrends your ring widths into a <strong className="text-white">Standardized Ring Width Index (RWI)</strong></li>
                <li>Computes <strong className="text-white">Pearson r</strong> for each of 19 months (prev Jun → current Dec)</li>
                <li>Tests statistical significance at <strong className="text-white">p &lt; 0.05</strong></li>
                <li>Highlights which months <strong className="text-[#ea580c]">most influence growth</strong></li>
              </ol>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleLoadSample}
              className="border-2 border-[#ea580c] bg-[#ea580c] text-black px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-transparent hover:text-[#ea580c] transition-colors"
            >
              <Database className="w-3.5 h-3.5 inline mr-2" />
              [▸ USE SAMPLE DATA]
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="border-2 border-[#333333] text-[#a3a3a3] hover:border-[#ea580c] hover:text-[#ea580c] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors"
            >
              <Upload className="w-3.5 h-3.5 inline mr-2" />
              [▸ UPLOAD MY DATA]
            </button>
            <button
              className="border-2 border-[#333333] text-[#a3a3a3] hover:border-[#ea580c] hover:text-[#ea580c] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 inline mr-2" />
              [▸ DOWNLOAD CSV TEMPLATE]
            </button>
          </div>

          {/* CSV format explanation */}
          {showUpload && (
            <div className="border border-[#333333] bg-[#111111] p-5 flex flex-col gap-3">
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.15em]">
                YOUR CSV SHOULD LOOK LIKE THIS:
              </span>
              <div className="overflow-x-auto">
                <table className="font-mono text-xs text-[#aaaaaa] border-collapse">
                  <thead>
                    <tr className="text-[#ea580c]">
                      <th className="border border-[#333333] px-3 py-1.5">Year</th>
                      <th className="border border-[#333333] px-3 py-1.5">Jan</th>
                      <th className="border border-[#333333] px-3 py-1.5">Feb</th>
                      <th className="border border-[#333333] px-3 py-1.5">Mar</th>
                      <th className="border border-[#333333] px-3 py-1.5">...</th>
                      <th className="border border-[#333333] px-3 py-1.5">Dec</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#333333] px-3 py-1.5">2001</td>
                      <td className="border border-[#333333] px-3 py-1.5">45.2</td>
                      <td className="border border-[#333333] px-3 py-1.5">38.1</td>
                      <td className="border border-[#333333] px-3 py-1.5">52.6</td>
                      <td className="border border-[#333333] px-3 py-1.5">...</td>
                      <td className="border border-[#333333] px-3 py-1.5">40.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="font-mono text-[11px] text-[#777777]">
                One file per variable. Each row = one year. Columns = monthly values (mm for precip, °C for temp).
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Climate data loaded confirmation */}
          <div className="border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-3 font-mono text-xs">
            <span className="text-green-400">✓</span>
            <span className="text-green-400 font-bold uppercase">Climate data loaded</span>
            <span className="text-[#a3a3a3]">
              — <Droplets className="inline w-3 h-3 mr-0.5" /> Precipitation (2000-2023)
              + <Thermometer className="inline w-3 h-3 mr-0.5" /> Temperature (2000-2023)
              • Dehradun region sample
            </span>
          </div>

          {/* ── Advanced: Detrending ── */}
          <button
            onClick={() => setShowDetrending(!showDetrending)}
            className="flex items-center gap-2 font-mono text-xs text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em] transition-colors"
          >
            {showDetrending ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            [▸ ADVANCED: DETRENDING METHOD]
          </button>
          {showDetrending && (
            <div className="border border-[#222222] bg-[#0a0a0a] p-5 flex flex-col gap-3">
              <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
                Before correlating with climate, we remove the natural age-related
                growth trend to isolate the climate signal.
                <GuideTooltip term="Detrending" explanation="Removing the natural slowdown in growth as trees age, so we can see the climate signal more clearly." />
              </p>
              <div className="flex items-center gap-3">
                <label className="font-mono text-[10px] text-[#666666] uppercase shrink-0">METHOD:</label>
                <select
                  value={detrendMethod}
                  onChange={(e) => setDetrendMethod(e.target.value)}
                  className="bg-[#000000] border border-[#333333] px-3 py-2 text-sm font-mono text-white focus:border-[#ea580c] focus:outline-none flex-1"
                >
                  <option value="negative-exp">Negative Exponential (Recommended)</option>
                  <option value="linear">Linear</option>
                  <option value="none">None (Raw Widths / Mean)</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Variable Toggle ── */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.15em]">SHOW:</span>
            {(["both", "Precipitation", "Temperature"] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveVariable(v)}
                className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${activeVariable === v
                    ? "border-[#ea580c] text-[#ea580c] bg-[#ea580c]/10"
                    : "border-[#333333] text-[#555555] hover:border-[#555555]"
                  }`}
              >
                {v === "both" ? (
                  <>
                    <Droplets className="inline w-3 h-3 mr-1" />
                    <Thermometer className="inline w-3 h-3 mr-1" />
                    BOTH
                  </>
                ) : v === "Precipitation" ? (
                  <>
                    <Droplets className="inline w-3 h-3 mr-1" />
                    PRECIP
                  </>
                ) : (
                  <>
                    <Thermometer className="inline w-3 h-3 mr-1" />
                    TEMP
                  </>
                )}
              </button>
            ))}
          </div>

          {/* ── Monthly Correlation Chart ── */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // PEARSON CORRELATION COEFFICIENTS BY MONTH
            </span>
            <CorrelationBarChart
              precipCorrelations={precipCorrelations}
              tempCorrelations={tempCorrelations}
              activeVariable={activeVariable}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
            {guideMode && (
              <p className="font-mono text-[11px] text-[#777777]">
                Each bar shows the Pearson <em>r</em> between the RWI and that month&apos;s climate.
                &ldquo;p&rdquo; prefix = previous year (e.g., pJUN = last June).
                Click any bar to see the scatter plot. ★ = statistically significant (p &lt; 0.05).
              </p>
            )}
          </div>

          {/* ── Lead Finding Card ── */}
          {overallStrongest && (
            <div className="border-2 border-[#ea580c] bg-[#0a0a0a] p-6 flex flex-col gap-4">
              <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
                // KEY FINDING — STRONGEST CLIMATE DRIVER
              </span>

              <div className="border border-[#333333] bg-[#111111] p-5 flex flex-col gap-3">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.15em]">THE STRONGEST INFLUENCE:</span>
                <p className="font-mono text-sm text-white leading-relaxed">
                  <strong className="text-[#ea580c]">
                    {overallStrongest.label.toUpperCase()} {overallStrongest.variable === "Precipitation" ? "RAINFALL" : "TEMPERATURE"}
                  </strong>
                  {" "}explains{" "}
                  <strong className="text-white">
                    {Math.round(overallStrongest.r * overallStrongest.r * 100)}%
                  </strong>
                  {" "}of growth variation in your tree (r = {overallStrongest.r.toFixed(3)}, p = {overallStrongest.pValue < 0.001 ? "<0.001" : overallStrongest.pValue.toFixed(3)}).
                </p>

                {/* Strength meter */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#666666] uppercase">STRENGTH:</span>
                  <div className="flex gap-[1px]">
                    {Array.from({ length: 10 }, (_, i) => {
                      const threshold = (i + 1) * 0.1
                      const active = Math.abs(overallStrongest.r) >= threshold
                      return (
                        <div key={i} className={`w-3 h-2 ${active ? "bg-[#ea580c]" : "bg-[#222222]"}`} />
                      )
                    })}
                  </div>
                  <span className="font-mono text-[10px] text-[#ea580c] font-bold uppercase">
                    {Math.abs(overallStrongest.r) > 0.7 ? "STRONG" :
                      Math.abs(overallStrongest.r) > 0.4 ? "MODERATE" : "WEAK"}
                  </span>
                </div>
              </div>

              {/* Significant months summary */}
              <div className="flex flex-col gap-2 font-mono text-xs">
                {significantPrecipCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3 h-3 text-[#38bdf8]" />
                    <span className="text-[#38bdf8] font-bold">{significantPrecipCount}</span>
                    <span className="text-[#aaaaaa]">significant precipitation months</span>
                    <span className="text-[#555555]">({precipCorrelations.filter(m => m.significant).map(m => m.label).join(", ")})</span>
                  </div>
                )}
                {significantTempCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3 h-3 text-[#f97316]" />
                    <span className="text-[#f97316] font-bold">{significantTempCount}</span>
                    <span className="text-[#aaaaaa]">significant temperature months</span>
                    <span className="text-[#555555]">({tempCorrelations.filter(m => m.significant).map(m => m.label).join(", ")})</span>
                  </div>
                )}
                {significantPrecipCount === 0 && significantTempCount === 0 && (
                  <div className="text-[#777777]">
                    No statistically significant correlations found at p &lt; 0.05.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Scatter Plot for Selected Month ── */}
          {selectedMonth && scatterData && (
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
                // SCATTER PLOT — {selectedMonth}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeVariable === "Precipitation" || activeVariable === "both") && (
                  <ScatterPlot
                    data={scatterData.precip}
                    climateLabel={`${scatterData.label} Precipitation`}
                    climateUnit="mm"
                    variable="Precipitation"
                  />
                )}
                {(activeVariable === "Temperature" || activeVariable === "both") && (
                  <ScatterPlot
                    data={scatterData.temp}
                    climateLabel={`${scatterData.label} Temperature`}
                    climateUnit="°C"
                    variable="Temperature"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Detailed Statistics Table ── */}
          <button
            onClick={() => setShowDetailedStats(!showDetailedStats)}
            className="flex items-center gap-2 font-mono text-xs text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em] transition-colors"
          >
            {showDetailedStats ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            [{showDetailedStats ? "HIDE" : "SHOW"} DETAILED STATISTICS TABLE]
          </button>

          {showDetailedStats && precipCorrelations.length > 0 && (
            <StatsTable
              precipCorrelations={precipCorrelations}
              tempCorrelations={tempCorrelations}
            />
          )}
        </>
      )}

      {/* Proceed */}
      {climateLoaded && (
        <div className="flex justify-end pt-4 border-t border-[#333333] shrink-0">
          <button
            onClick={handleComplete}
            className="bg-[#ea580c] text-black hover:bg-[#ea580c]/90 px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-2 font-mono text-sm transition-colors"
          >
            Discover Events & Trends
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
