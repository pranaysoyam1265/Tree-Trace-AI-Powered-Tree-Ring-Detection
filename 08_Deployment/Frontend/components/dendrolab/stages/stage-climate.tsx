"use client"

import { useState } from "react"
import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { ArrowRight, ChevronDown, ChevronRight, Upload, FileDown, Database } from "lucide-react"
import { GuideTooltip } from "../guide-tooltip"
import { StepCompletionBanner } from "../step-completion-banner"
import { MOCK_CLIMATE } from "@/lib/mock-dendrolab"

/* ═══════════════════════════════════════════════════════════════════
   STEP 3: CONNECT TO CLIMATE DATA
   Merges old Standardize + Correlate stages.
   Climate loading first, then detrending (advanced), then results.
   ═══════════════════════════════════════════════════════════════════ */

// Mock correlation results for display
const MOCK_MONTHLY = [
  { month: "pJUN", label: "prev June", r: 0.12, sig: false },
  { month: "pJUL", label: "prev July", r: 0.08, sig: false },
  { month: "pAUG", label: "prev Aug", r: -0.05, sig: false },
  { month: "pSEP", label: "prev Sep", r: 0.15, sig: false },
  { month: "pOCT", label: "prev Oct", r: 0.10, sig: false },
  { month: "pNOV", label: "prev Nov", r: -0.08, sig: false },
  { month: "pDEC", label: "prev Dec", r: 0.04, sig: false },
  { month: "JAN", label: "Jan", r: 0.18, sig: false },
  { month: "FEB", label: "Feb", r: 0.22, sig: false },
  { month: "MAR", label: "Mar", r: 0.55, sig: true },
  { month: "APR", label: "Apr", r: 0.62, sig: true },
  { month: "MAY", label: "May", r: 0.75, sig: true },
  { month: "JUN", label: "Jun", r: 0.67, sig: true },
  { month: "JUL", label: "Jul", r: 0.30, sig: false },
  { month: "AUG", label: "Aug", r: -0.05, sig: false },
  { month: "SEP", label: "Sep", r: 0.10, sig: false },
  { month: "OCT", label: "Oct", r: 0.08, sig: false },
  { month: "NOV", label: "Nov", r: -0.12, sig: false },
  { month: "DEC", label: "Dec", r: 0.05, sig: false },
]

/* Monthly Correlation Bar Chart */
function MonthlyCorrelationChart() {
  const w = 700, h = 200, padL = 30, padB = 50
  const barW = Math.floor((w - padL - 20) / MOCK_MONTHLY.length) - 2
  const maxR = 1

  return (
    <div className="border border-[#333333] bg-[#0a0a0a] p-2 overflow-x-auto">
      <svg width={w} height={h + padB} viewBox={`0 0 ${w} ${h + padB}`} className="w-full min-w-[500px]">
        {/* Zero line */}
        <line x1={padL} x2={w - 10} y1={h / 2} y2={h / 2} stroke="#333333" strokeWidth="1" />
        {/* Bars */}
        {MOCK_MONTHLY.map((m, i) => {
          const x = padL + i * (barW + 2)
          const barH = Math.abs(m.r) * (h / 2)
          const y = m.r >= 0 ? h / 2 - barH : h / 2
          return (
            <g key={m.month}>
              <rect
                x={x} y={y} width={barW} height={barH}
                fill={m.sig ? "#ea580c" : "#333333"}
              />
              <text x={x + barW / 2} y={h + 15} textAnchor="middle" fill="#666666" fontSize="8" fontFamily="monospace">
                {m.month}
              </text>
            </g>
          )
        })}
        {/* Axis labels */}
        <text x={5} y={20} fill="#555555" fontSize="9" fontFamily="monospace">+1.0</text>
        <text x={5} y={h / 2 + 3} fill="#555555" fontSize="9" fontFamily="monospace">0</text>
        <text x={5} y={h - 5} fill="#555555" fontSize="9" fontFamily="monospace">-1.0</text>
      </svg>
    </div>
  )
}

export function StageClimate() {
  const { state, dispatch } = useDendroLab()
  const [climateLoaded, setClimateLoaded] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showDetrending, setShowDetrending] = useState(false)
  const [showDetailedStats, setShowDetailedStats] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const guideMode = state.guideMode

  const handleLoadSample = () => {
    setClimateLoaded(true)
  }

  const handleComplete = () => {
    dispatch({ type: "MARK_STAGE_COMPLETED", payload: 3 })
    setShowCompletion(true)
  }

  // Find the strongest monthly correlation
  const strongest = [...MOCK_MONTHLY].sort((a, b) => Math.abs(b.r) - Math.abs(a.r))[0]
  const significantMonths = MOCK_MONTHLY.filter(m => m.sig)

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto">
      <div className="border-b-2 border-[#333333] pb-6">
        <h2 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">
          CONNECT TO CLIMATE DATA
        </h2>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          {guideMode
            ? "Find out what drove your tree's growth"
            : "Climate correlation and growth detrending analysis"}
        </p>
      </div>

      {showCompletion && (
        <StepCompletionBanner
          title="✓ CLIMATE CONNECTION FOUND"
          description={`${strongest.label} rainfall is the strongest driver of growth. 2012 stands out as the most unusual year.`}
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
              To find out what drove your tree&apos;s growth, we need
              climate data — rainfall and temperature records for
              your location.
            </p>
          )}

          {guideMode && (
            <div className="border border-[#222222] bg-[#111111] p-4">
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.15em] block mb-2">
                HOW TO GET CLIMATE DATA:
              </span>
              <ol className="font-mono text-xs text-[#a3a3a3] flex flex-col gap-1 list-decimal pl-5">
                <li>Try our sample data for Dehradun region</li>
                <li>Download data from a weather station near your site</li>
                <li>Upload your own data as a CSV file</li>
              </ol>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleLoadSample}
              className="border-2 border-[#ea580c] bg-[#ea580c] text-black px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-transparent hover:text-[#ea580c]"
            >
              <Database className="w-3.5 h-3.5 inline mr-2" />
              [▸ USE SAMPLE DATA]
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="border-2 border-[#333333] text-[#a3a3a3] hover:border-[#ea580c] hover:text-[#ea580c] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.1em]"
            >
              <Upload className="w-3.5 h-3.5 inline mr-2" />
              [▸ UPLOAD MY DATA]
            </button>
            <button
              className="border-2 border-[#333333] text-[#a3a3a3] hover:border-[#ea580c] hover:text-[#ea580c] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.1em]"
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
                      <th className="border border-[#333333] px-3 py-1.5">Apr</th>
                      <th className="border border-[#333333] px-3 py-1.5">May</th>
                      <th className="border border-[#333333] px-3 py-1.5">Jun</th>
                      <th className="border border-[#333333] px-3 py-1.5">...</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#333333] px-3 py-1.5">2001</td>
                      <td className="border border-[#333333] px-3 py-1.5">45</td>
                      <td className="border border-[#333333] px-3 py-1.5">38</td>
                      <td className="border border-[#333333] px-3 py-1.5">52</td>
                      <td className="border border-[#333333] px-3 py-1.5">78</td>
                      <td className="border border-[#333333] px-3 py-1.5">95</td>
                      <td className="border border-[#333333] px-3 py-1.5">120</td>
                      <td className="border border-[#333333] px-3 py-1.5">...</td>
                    </tr>
                    <tr>
                      <td className="border border-[#333333] px-3 py-1.5">2002</td>
                      <td className="border border-[#333333] px-3 py-1.5">41</td>
                      <td className="border border-[#333333] px-3 py-1.5">35</td>
                      <td className="border border-[#333333] px-3 py-1.5">55</td>
                      <td className="border border-[#333333] px-3 py-1.5">82</td>
                      <td className="border border-[#333333] px-3 py-1.5">98</td>
                      <td className="border border-[#333333] px-3 py-1.5">115</td>
                      <td className="border border-[#333333] px-3 py-1.5">...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="font-mono text-[11px] text-[#777777]">
                Each row = one year. Each column after Year = monthly rainfall (mm) or temperature (°C).
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
            <span className="text-[#a3a3a3]">— Precipitation (2000-2023) + Temperature (2000-2023) • Dehradun region sample</span>
          </div>

          {/* ── Advanced: Detrending ── */}
          <button
            onClick={() => setShowDetrending(!showDetrending)}
            className="flex items-center gap-2 font-mono text-xs text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em]"
          >
            {showDetrending ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            [▸ ADVANCED: GROWTH ADJUSTMENT SETTINGS]
          </button>
          {showDetrending && (
            <div className="border border-[#222222] bg-[#0a0a0a] p-5 flex flex-col gap-3">
              <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
                Before comparing with climate, we remove the natural
                slowdown in growth that all trees show as they age.
                The default setting works well for most trees.
                <GuideTooltip term="Detrending" explanation="Removing the natural slowdown in growth as trees age, so we can see the climate signal more clearly." />
              </p>
              <div className="flex items-center gap-3">
                <label className="font-mono text-[10px] text-[#666666] uppercase shrink-0">METHOD:</label>
                <select className="bg-[#000000] border border-[#333333] px-3 py-2 text-sm font-mono text-white focus:border-[#ea580c] focus:outline-none flex-1">
                  <option>Negative Exponential (Recommended)</option>
                  <option>Linear</option>
                  <option>Cubic Smoothing Spline</option>
                  <option>Regional Curve Standardization (RCS)</option>
                  <option>First Differences</option>
                  <option>None (Raw Widths)</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Lead Finding Card ── */}
          <div className="border-2 border-[#ea580c] bg-[#0a0a0a] p-6 flex flex-col gap-4">
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // WHAT DRIVES GROWTH IN YOUR TREE?
            </span>

            <div className="border border-[#333333] bg-[#111111] p-5 flex flex-col gap-3">
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.15em]">THE STRONGEST INFLUENCE:</span>
              <p className="font-mono text-sm text-white leading-relaxed">
                <strong className="text-[#ea580c]">{strongest.label.toUpperCase()} RAINFALL</strong> accounts for{" "}
                <strong className="text-white">{Math.round(strongest.r * strongest.r * 100)}%</strong> of growth
                variation in your tree.
              </p>
              <p className="font-mono text-xs text-[#a3a3a3]">
                More rain in {strongest.label} → wider rings that year.
                Less rain in {strongest.label} → narrower rings that year.
              </p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#666666] uppercase">STRENGTH:</span>
                <span className="text-[#ea580c]">{"████████"}</span>
                <span className="text-[#333333]">{"░░"}</span>
                <span className="font-mono text-[10px] text-[#ea580c] font-bold uppercase">MODERATE</span>
              </div>
            </div>

            {/* Also Significant */}
            <div className="flex flex-col gap-1 font-mono text-xs">
              <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] mb-1">ALSO SIGNIFICANT:</span>
              {significantMonths.filter(m => m !== strongest).map((m, i) => (
                <div key={m.month} className="flex items-center gap-2 pl-2 text-[#aaaaaa]">
                  <span className="text-[#666666]">{i < significantMonths.length - 2 ? "├──" : "└──"}</span>
                  <span>{m.label} rainfall</span>
                  <span className="text-[#555555]">────</span>
                  <span>moderate influence</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1 font-mono text-xs">
              <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] mb-1">NOT SIGNIFICANT:</span>
              <div className="flex items-center gap-2 pl-2 text-[#777777]">
                <span className="text-[#666666]">└──</span>
                <span>Temperature</span>
                <span className="text-[#555555]">────</span>
                <span>weak influence on growth</span>
              </div>
            </div>

            {showDetailedStats && (
              <div className="border-t border-[#333333] pt-3 font-mono text-[10px] text-[#555555] flex gap-6 flex-wrap">
                <span>r = {strongest.r.toFixed(2)}</span>
                <span>p &lt; 0.001</span>
                <span>R² = {(strongest.r * strongest.r).toFixed(2)}</span>
              </div>
            )}

            <button
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              className="font-mono text-[10px] text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em] self-start"
            >
              [{showDetailedStats ? "HIDE" : "SHOW"} DETAILED STATISTICS]
            </button>
          </div>

          {/* ── Monthly Correlation Chart ── */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // WHICH MONTHS MATTER MOST?
            </span>
            <MonthlyCorrelationChart />
            {guideMode && (
              <p className="font-mono text-[11px] text-[#777777]">
                &ldquo;p&rdquo; = previous year (e.g., pJUN = last June&apos;s rainfall).
                Orange bars = statistically significant.
              </p>
            )}
          </div>
        </>
      )}

      {/* Proceed */}
      {climateLoaded && (
        <div className="flex justify-end pt-4 border-t border-[#333333] shrink-0">
          <button
            onClick={handleComplete}
            className="bg-[#ea580c] text-black hover:bg-[#ea580c]/90 px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-2 font-mono text-sm"
          >
            Discover Events & Trends
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
