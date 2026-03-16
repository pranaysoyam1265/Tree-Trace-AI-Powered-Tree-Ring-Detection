"use client"

import { useState } from "react"
import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react"
import { GuideTooltip } from "../guide-tooltip"
import { StepCompletionBanner } from "../step-completion-banner"

/* ═══════════════════════════════════════════════════════════════════
   STEP 2: COMPARE GROWTH PATTERNS
   Human-readable similarity display + pattern overlay chart.
   ═══════════════════════════════════════════════════════════════════ */

// Mock similarity data
const MOCK_PAIRS = [
  { a: "F02a", b: "F02b", r: 0.82, group: "very" as const },
  { a: "F02a", b: "S01a", r: 0.71, group: "very" as const },
  { a: "F02b", b: "S01a", r: 0.68, group: "somewhat" as const },
  { a: "F03a", b: "F02a", r: 0.45, group: "not" as const },
  { a: "F03a", b: "F02b", r: 0.42, group: "not" as const },
  { a: "F03a", b: "S01a", r: 0.38, group: "not" as const },
]

function SimilarityBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const filled = Math.round(pct / 10)
  return (
    <span className="font-mono text-xs">
      <span className="text-[#ea580c]">{"█".repeat(filled)}</span>
      <span className="text-[#333333]">{"░".repeat(10 - filled)}</span>
    </span>
  )
}

/* ── Simple Line Chart (SVG) ── */
function PatternChart({ dataMode }: { dataMode: "actual" | "relative" }) {
  // Mock data for visualization
  const years = Array.from({ length: 23 }, (_, i) => 2001 + i)
  const series = [
    { name: "F02a", color: "#ea580c", data: [5.2, 4.8, 4.9, 5.1, 4.5, 4.2, 4.3, 3.8, 3.5, 3.6, 3.2, 1.1, 2.5, 3.0, 2.8, 2.9, 2.5, 2.6, 2.2, 2.4, 1.8, 1.9, 1.7] },
    { name: "F02b", color: "#a3a3a3", data: [0, 0, 0, 5.3, 4.7, 4.4, 4.5, 4.0, 3.7, 3.8, 3.4, 1.3, 2.7, 3.2, 3.0, 3.1, 2.7, 2.8, 2.4, 2.6, 2.0, 2.1, 1.9] },
    { name: "S01a", color: "#666666", data: [0, 0, 0, 0, 0, 4.0, 3.9, 3.5, 3.2, 3.3, 2.9, 0.9, 2.3, 2.8, 2.6, 2.7, 2.3, 2.4, 2.0, 2.2, 1.6, 1.7, 1.5] },
  ]

  const w = 700, h = 200, padX = 40, padY = 20
  const allVals = series.flatMap(s => s.data.filter(v => v > 0))
  const maxVal = Math.max(...allVals)
  const minVal = dataMode === "relative" ? -2 : 0

  return (
    <div className="border border-[#333333] bg-[#0a0a0a] overflow-x-auto">
      <svg width={w} height={h + 30} viewBox={`0 0 ${w} ${h + 30}`} className="w-full min-w-[500px]">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={padX} x2={w - 10} y1={padY + (1 - t) * (h - padY)} y2={padY + (1 - t) * (h - padY)} stroke="#222222" strokeWidth="1" />
        ))}
        {/* Series */}
        {series.map(s => {
          const points = s.data
            .map((v, i) => {
              if (v === 0) return null
              const x = padX + (i / (years.length - 1)) * (w - padX - 10)
              let val = v
              if (dataMode === "relative") {
                const avg = s.data.filter(d => d > 0).reduce((a, b) => a + b, 0) / s.data.filter(d => d > 0).length
                val = (v - avg) / avg
              }
              const range = dataMode === "relative" ? 4 : maxVal - minVal
              const y = padY + (1 - (val - minVal) / range) * (h - padY)
              return `${x},${y}`
            })
            .filter(Boolean)
            .join(" ")
          return <polyline key={s.name} points={points} fill="none" stroke={s.color} strokeWidth="1.5" />
        })}
        {/* Legend */}
        {series.map((s, i) => (
          <g key={s.name}>
            <line x1={padX + i * 100} x2={padX + i * 100 + 20} y1={h + 15} y2={h + 15} stroke={s.color} strokeWidth="2" />
            <text x={padX + i * 100 + 25} y={h + 19} fill="#a3a3a3" fontSize="10" fontFamily="monospace">{s.name}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function StageComparePatterns() {
  const { state, dispatch } = useDendroLab()
  const [dataMode, setDataMode] = useState<"actual" | "relative">("actual")
  const [showStats, setShowStats] = useState(false)
  const [showAdvChronology, setShowAdvChronology] = useState(false)
  const [showSliding, setShowSliding] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const guideMode = state.guideMode

  const handleComplete = () => {
    dispatch({ type: "MARK_STAGE_COMPLETED", payload: 2 })
    setShowCompletion(true)
  }

  const veryPairs = MOCK_PAIRS.filter(p => p.group === "very")
  const somePairs = MOCK_PAIRS.filter(p => p.group === "somewhat")
  const notPairs = MOCK_PAIRS.filter(p => p.group === "not")

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto">
      <div className="border-b-2 border-[#333333] pb-6">
        <h2 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">
          COMPARE GROWTH PATTERNS
        </h2>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          {guideMode ? "See how your samples grew — side by side comparison" : "Cross-dating validation and site chronology construction"}
        </p>
      </div>

      {showCompletion && (
        <StepCompletionBanner
          title="✓ PATTERNS COMPARED"
          description={`F02a, F02b, and S01a grew very similarly. Combined sample covers 23 years (2001-2023).`}
          nextLabel="CONNECT TO CLIMATE DATA"
          onNext={() => dispatch({ type: "SET_STAGE", payload: 3 })}
        />
      )}

      {/* ── Pattern Overlay Chart ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
            // GROWTH PATTERN OVERLAY
          </span>
          <div className="flex">
            <button
              onClick={() => setDataMode("actual")}
              className={`font-mono text-[10px] uppercase px-3 py-1.5 border-2 ${dataMode === "actual" ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]" : "border-[#333333] text-[#a3a3a3]"}`}
            >
              [ACTUAL WIDTHS]
            </button>
            <button
              onClick={() => setDataMode("relative")}
              className={`font-mono text-[10px] uppercase px-3 py-1.5 border-2 border-l-0 ${dataMode === "relative" ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]" : "border-[#333333] text-[#a3a3a3]"}`}
            >
              [RELATIVE GROWTH]
            </button>
          </div>
        </div>
        {guideMode && dataMode === "relative" && (
          <p className="font-mono text-[11px] text-[#777777]">
            Shows growth as above or below average for that tree — makes comparing different-sized trees easier.
          </p>
        )}
        <PatternChart dataMode={dataMode} />
      </div>

      {/* ── How Similar Are Your Samples? ── */}
      <div className="border border-[#333333] bg-[#0a0a0a] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
            // HOW SIMILAR ARE YOUR SAMPLES?
            {guideMode && <GuideTooltip term="Correlation" explanation="A measure of how closely two things move together. 100% = perfectly in sync. 0% = no relationship." />}
          </span>
          <button
            onClick={() => setShowStats(!showStats)}
            className="font-mono text-[10px] text-[#666666] hover:text-[#a3a3a3] uppercase"
          >
            [{showStats ? "HIDE" : "SHOW"} STATISTICS]
          </button>
        </div>

        {/* Grouped similarity display */}
        {veryPairs.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] text-green-400 uppercase tracking-[0.15em]">
              VERY SIMILAR (likely same climate):
            </span>
            {veryPairs.map((p, i) => (
              <div key={i} className="flex items-center gap-3 pl-4 font-mono text-xs">
                <span className="text-[#666666]">├──</span>
                <span className="text-white">{p.a} ↔ {p.b}</span>
                <span className="text-[#a3a3a3]">────</span>
                <span className="text-white font-bold">{Math.round(p.r * 100)}% similar</span>
                <SimilarityBar value={p.r} />
                {showStats && <span className="text-[#555555] text-[10px]">r={p.r.toFixed(2)}</span>}
              </div>
            ))}
          </div>
        )}
        {somePairs.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] text-yellow-500 uppercase tracking-[0.15em]">
              SOMEWHAT SIMILAR:
            </span>
            {somePairs.map((p, i) => (
              <div key={i} className="flex items-center gap-3 pl-4 font-mono text-xs">
                <span className="text-[#666666]">└──</span>
                <span className="text-white">{p.a} ↔ {p.b}</span>
                <span className="text-[#a3a3a3]">────</span>
                <span className="text-white font-bold">{Math.round(p.r * 100)}% similar</span>
                <SimilarityBar value={p.r} />
                {showStats && <span className="text-[#555555] text-[10px]">r={p.r.toFixed(2)}</span>}
              </div>
            ))}
          </div>
        )}
        {notPairs.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] text-red-400 uppercase tracking-[0.15em]">
              NOT SIMILAR (different climate or location):
            </span>
            {notPairs.map((p, i) => (
              <div key={i} className="flex items-center gap-3 pl-4 font-mono text-xs">
                <span className="text-[#666666]">└──</span>
                <span className="text-white">{p.a} ↔ {p.b}</span>
                <span className="text-[#a3a3a3]">────</span>
                <span className="text-white font-bold">{Math.round(p.r * 100)}% similar</span>
                <SimilarityBar value={p.r} />
                {showStats && <span className="text-[#555555] text-[10px]">r={p.r.toFixed(2)}</span>}
              </div>
            ))}
          </div>
        )}
        {guideMode && (
          <p className="font-mono text-xs text-[#777777] leading-relaxed border-t border-[#222222] pt-3 mt-1">
            &ldquo;F02a and F02b grew very similarly — they likely
            experienced the same weather conditions each year.
            Consider combining them for a stronger analysis.&rdquo;
          </p>
        )}
      </div>

      {/* ── Combine Similar Samples ── */}
      <div className="border border-[#333333] bg-[#0a0a0a] p-5 flex flex-col gap-4">
        <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
          // COMBINE SIMILAR SAMPLES
        </span>
        {guideMode && (
          <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
            Combining similar samples creates a stronger, more reliable
            record of local climate history. Think of it as averaging
            multiple measurements for better accuracy.
          </p>
        )}

        {/* Quality display */}
        <div className="border border-[#333333] bg-[#111111] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#a3a3a3] uppercase">COMBINED SAMPLE QUALITY:</span>
            <span className="font-mono text-xs text-green-400 font-bold uppercase">
              {"██████████"} EXCELLENT
            </span>
          </div>
          {guideMode && (
            <p className="font-mono text-[11px] text-[#777777]">
              Your combined sample is strong enough for climate analysis.
              The three samples agree closely with each other.
            </p>
          )}
          {showStats && (
            <div className="flex gap-6 mt-2 text-[10px] text-[#555555] font-mono">
              <span>Rbar: 0.74 <GuideTooltip term="Rbar" explanation="How similarly your individual specimens grew — higher means they responded to the same conditions." /></span>
              <span>EPS: 0.87 <GuideTooltip term="EPS" explanation="A measure of how reliably your combined sample captures the local climate signal. Above 85% is good." /></span>
            </div>
          )}
        </div>

        {/* Advanced: averaging method */}
        <button
          onClick={() => setShowAdvChronology(!showAdvChronology)}
          className="flex items-center gap-2 font-mono text-xs text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em]"
        >
          {showAdvChronology ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          [ADVANCED OPTIONS]
        </button>
        {showAdvChronology && (
          <div className="border border-[#222222] bg-[#111111] p-4 flex flex-col gap-3">
            <label className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.1em]">Averaging Method:</label>
            <select className="bg-[#000000] border border-[#333333] px-3 py-2 text-sm font-mono text-white focus:border-[#ea580c] focus:outline-none">
              <option>Bi-weight Robust Mean (Recommended)</option>
              <option>Simple Mean</option>
              <option>Median</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Advanced: Sliding Correlation ── */}
      <button
        onClick={() => setShowSliding(!showSliding)}
        className="flex items-center gap-2 font-mono text-xs text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em]"
      >
        {showSliding ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        [▸ ADVANCED: FIND THE DATE FOR AN UNDATED SAMPLE]
      </button>
      {showSliding && (
        <div className="border border-[#222222] bg-[#0a0a0a] p-5 flex flex-col gap-3">
          <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
            If you don&apos;t know exactly when a sample was taken,
            we can compare its growth pattern against your
            other samples to find the best matching years.
          </p>
          <div className="border border-[#333333] bg-[#111111] p-4 text-center text-[#555555] font-mono text-xs">
            Select an undated specimen to begin sliding correlation analysis.
          </div>
        </div>
      )}

      {/* Proceed */}
      <div className="flex justify-end pt-4 border-t border-[#333333] shrink-0">
        <button
          onClick={handleComplete}
          className="bg-[#ea580c] text-black hover:bg-[#ea580c]/90 px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-2 font-mono text-sm"
        >
          Continue to Climate Data
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
