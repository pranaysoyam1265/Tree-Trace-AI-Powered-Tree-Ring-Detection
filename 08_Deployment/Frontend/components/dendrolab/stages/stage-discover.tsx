"use client"

import { useState } from "react"
import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { ChevronDown, ChevronRight, Download } from "lucide-react"
import { GuideTooltip } from "../guide-tooltip"
import { StepCompletionBanner } from "../step-completion-banner"

/* ═══════════════════════════════════════════════════════════════════
   STEP 4: DISCOVER EVENTS & TRENDS
   Card/timeline format for notable years + simplified climate reconstruction.
   ═══════════════════════════════════════════════════════════════════ */

// Mock events
const MOCK_EVENTS = [
  {
    year: "2012",
    label: "DIFFICULT YEAR",
    severity: "SEVERE" as const,
    direction: "down" as const,
    description: "Narrowest ring in the record (0.31 × average). Likely caused by drought or extreme weather.",
    confirmation: "Confirmed in 3 out of 3 samples — regional event.",
  },
  {
    year: "2003",
    label: "EXCEPTIONAL YEAR",
    severity: "EXCELLENT" as const,
    direction: "up" as const,
    description: "Widest ring in the record (1.42 × average). Best growing conditions in the entire record.",
    confirmation: null,
  },
  {
    year: "2015-2016",
    label: "CHALLENGING PERIOD",
    severity: "MODERATE" as const,
    direction: "down" as const,
    description: "Two consecutive below-average years. Growth recovered normally afterward.",
    confirmation: null,
  },
  {
    year: "2007",
    label: "STRONG YEAR",
    severity: "GOOD" as const,
    direction: "up" as const,
    description: "Above-average growth (1.18 × average). Favorable conditions across the site.",
    confirmation: null,
  },
]

const severityColors: Record<string, string> = {
  SEVERE: "text-red-400",
  MODERATE: "text-yellow-500",
  GOOD: "text-green-400",
  EXCELLENT: "text-green-400",
}

/* ── Drought Timeline Chart (SVG) ── */
function DroughtTimeline() {
  const years = Array.from({ length: 23 }, (_, i) => 2001 + i)
  const rwi = [1.1, 1.0, 1.05, 1.42, 0.95, 0.90, 1.18, 0.85, 0.78, 0.80, 0.72, 0.31, 0.55, 0.68, 0.62, 0.65, 0.56, 0.58, 0.50, 0.54, 0.42, 0.44, 0.40]
  const w = 700, h = 160, padL = 30, padB = 20
  const maxR = 1.5

  return (
    <div className="border border-[#333333] bg-[#0a0a0a] p-2 overflow-x-auto">
      <svg width={w} height={h + padB + 20} viewBox={`0 0 ${w} ${h + padB + 20}`} className="w-full min-w-[500px]">
        {/* 1.0 reference line */}
        <line x1={padL} x2={w - 10} y1={h * (1 - 1 / maxR)} y2={h * (1 - 1 / maxR)} stroke="#333333" strokeWidth="1" strokeDasharray="4 4" />
        <text x={5} y={h * (1 - 1 / maxR) + 3} fill="#555555" fontSize="8" fontFamily="monospace">1.0</text>

        {/* Bars */}
        {rwi.map((val, i) => {
          const barW = Math.floor((w - padL - 20) / years.length) - 1
          const x = padL + i * (barW + 1)
          const barH = (val / maxR) * h
          const y = h - barH
          const isStress = val < 0.7
          const isExcellent = val > 1.2
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={barH}
                fill={isStress ? "#ef4444" : isExcellent ? "#22c55e" : "#ea580c"}
                opacity={isStress || isExcellent ? 1 : 0.5}
              />
              {i % 3 === 0 && (
                <text x={x + barW / 2} y={h + 15} textAnchor="middle" fill="#555555" fontSize="8" fontFamily="monospace">
                  {years[i]}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function StageDiscover() {
  const { state, dispatch } = useDendroLab()
  const [activeTab, setActiveTab] = useState<"events" | "climate">("events")
  const [sensitivity, setSensitivity] = useState(5)
  const [showReliability, setShowReliability] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const guideMode = state.guideMode

  const handleComplete = () => {
    dispatch({ type: "MARK_STAGE_COMPLETED", payload: 4 })
    setShowCompletion(true)
  }

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto">
      <div className="border-b-2 border-[#333333] pb-6">
        <h2 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">
          DISCOVER EVENTS & TRENDS
        </h2>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          {guideMode ? "What happened during your tree's life and when" : "Extreme event detection and climate reconstruction"}
        </p>
      </div>

      {showCompletion && (
        <StepCompletionBanner
          title="✓ ANALYSIS COMPLETE"
          description={`Your tree's story spans 23 years. ${MOCK_EVENTS.length} notable events detected. Full report ready for export.`}
          nextLabel="EXPORT RESULTS"
          onNext={() => dispatch({ type: "TOGGLE_EXPORT_DRAWER", payload: true })}
        />
      )}

      {/* Tab toggle */}
      <div className="flex">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 font-mono text-xs uppercase font-bold tracking-[1px] px-4 py-2 border-2 ${activeTab === "events"
              ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]"
              : "border-[#333333] text-[#a3a3a3]"
            }`}
        >
          {guideMode ? "YOUR TREE'S HISTORY" : "EXTREME EVENTS"}
        </button>
        <button
          onClick={() => setActiveTab("climate")}
          className={`flex-1 font-mono text-xs uppercase font-bold tracking-[1px] px-4 py-2 border-2 border-l-0 ${activeTab === "climate"
              ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]"
              : "border-[#333333] text-[#a3a3a3]"
            }`}
        >
          {guideMode ? "WHAT WAS THE CLIMATE LIKE?" : "CLIMATE RECONSTRUCTION"}
        </button>
      </div>

      {activeTab === "events" && (
        <>
          {/* ── Sensitivity slider ── */}
          <button
            onClick={() => { }}
            className="flex items-center gap-3 border border-[#333333] bg-[#0a0a0a] p-4"
          >
            <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.15em] shrink-0">
              {guideMode ? "SENSITIVITY:" : "THRESHOLD:"}
            </span>
            <input
              type="range"
              min="1" max="10"
              value={sensitivity}
              onChange={e => setSensitivity(Number(e.target.value))}
              className="flex-1 accent-[#ea580c] h-1"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-[#ea580c] font-bold uppercase w-20 text-center">
                {sensitivity <= 3 ? "LOW" : sensitivity <= 7 ? "MODERATE" : "HIGH"}
              </span>
            </div>
            {guideMode && (
              <span className="font-mono text-[10px] text-[#555555] shrink-0">
                {sensitivity <= 3 ? "(fewer events)" : sensitivity <= 7 ? "" : "(more events)"}
              </span>
            )}
          </button>

          {/* ── Notable Years Cards ── */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // NOTABLE YEARS IN YOUR TREE&apos;S LIFE
            </span>

            {MOCK_EVENTS.map((event, i) => (
              <div key={i} className="border border-[#333333] bg-[#0a0a0a] p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-white">{event.year}</span>
                    <span className="font-mono text-xs text-[#a3a3a3]">—</span>
                    <span className="font-mono text-xs font-bold text-white uppercase">{event.label}</span>
                  </div>
                  <span className={`font-mono text-xs font-bold uppercase ${severityColors[event.severity] || "text-[#a3a3a3]"}`}>
                    {event.direction === "down" ? "▼" : "▲"} {event.severity}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#aaaaaa] leading-relaxed">
                  {event.description}
                </p>
                {event.confirmation && (
                  <p className="font-mono text-[11px] text-[#777777] italic">
                    {event.confirmation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ── Drought Timeline ── */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // GROWTH TIMELINE
              {guideMode && <GuideTooltip term="Ring Width Index (RWI)" explanation="A way of measuring ring widths as 'above or below normal' — removes the fact that young trees always grow faster." />}
            </span>
            <DroughtTimeline />
            {guideMode && (
              <p className="font-mono text-[11px] text-[#777777]">
                Red = stress years (below 0.7× average). Green = exceptional years (above 1.2× average).
              </p>
            )}
          </div>
        </>
      )}

      {activeTab === "climate" && (
        <>
          {/* ── Reconstruction Summary ── */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // ESTIMATED CLIMATE — 2001 TO 2023
            </span>
            {guideMode && (
              <p className="font-mono text-xs text-[#a3a3a3]">
                Based on your tree&apos;s rings, we estimate past climate conditions:
              </p>
            )}

            <div className="border-2 border-[#333333] bg-[#111111] p-5 flex flex-col gap-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-[#a3a3a3]">DRIEST YEAR</span>
                <span className="text-white font-bold">2012 — est. 380mm rainfall</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a3a3a3]">WETTEST YEAR</span>
                <span className="text-white font-bold">2003 — est. 890mm rainfall</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a3a3a3]">AVERAGE</span>
                <span className="text-white font-bold">est. 620mm per year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a3a3a3]">TREND</span>
                <span className="text-red-400 font-bold">DECLINING (-12% overall)</span>
              </div>
            </div>
          </div>

          {/* ── Reconstruction Chart ── */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // RECONSTRUCTED RAINFALL
              {guideMode && <GuideTooltip term="Reconstruction" explanation="Using the tree's growth record to estimate past climate before weather stations existed." />}
            </span>
            {/* Simplified chart */}
            <div className="border border-[#333333] bg-[#0a0a0a] h-40 flex items-center justify-center">
              <span className="font-mono text-xs text-[#555555]">
                Reconstruction chart renders here with observed vs. estimated rainfall
              </span>
            </div>
          </div>

          {/* ── Reliability ── */}
          <button
            onClick={() => setShowReliability(!showReliability)}
            className="flex items-center gap-2 font-mono text-xs text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em]"
          >
            {showReliability ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            [▸ HOW RELIABLE IS THIS?]
          </button>
          {showReliability && (
            <div className="border border-[#222222] bg-[#0a0a0a] p-5 flex flex-col gap-3">
              <p className="font-mono text-xs text-[#aaaaaa] leading-relaxed">
                This estimate is based on the relationship between
                your tree&apos;s growth and the climate data you provided.
                The model explains 45% of climate variation.
              </p>
              <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
                With only 23 years of data, treat this as an
                indication rather than a precise measurement.
                Longer records produce more reliable estimates.
              </p>
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="font-mono text-[10px] text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em] self-start"
              >
                [{showTechnical ? "HIDE" : "SHOW"} TECHNICAL VALIDATION]
              </button>
              {showTechnical && (
                <div className="border-t border-[#333333] pt-3 font-mono text-[10px] text-[#555555] flex gap-6 flex-wrap">
                  <span>RE = 0.42</span>
                  <span>CE = 0.38</span>
                  <span>R² = 0.45</span>
                  <span>Durbin-Watson = 1.82</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Complete */}
      <div className="flex justify-end pt-4 border-t border-[#333333] shrink-0">
        <button
          onClick={handleComplete}
          className="bg-[#ea580c] text-black hover:bg-[#ea580c]/90 px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-2 font-mono text-sm"
        >
          <Download className="w-4 h-4" />
          Complete & Export Results
        </button>
      </div>
    </div>
  )
}
