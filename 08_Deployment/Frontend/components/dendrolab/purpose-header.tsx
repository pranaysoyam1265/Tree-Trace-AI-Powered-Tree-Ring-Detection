"use client"

import { useState } from "react"
import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { Sparkles, GitCompare, Search, ChevronUp, ChevronDown, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/lib/contexts/analysis-context"

/* ═══════════════════════════════════════════════════════════════════
   PURPOSE HEADER — Landing section explaining DendroLab
   Collapses after Step 1 is complete.
   ═══════════════════════════════════════════════════════════════════ */

const OUTCOME_CARDS = [
  {
    icon: "◈",
    title: "CLIMATE STORY",
    description: "Discover which years had good or bad growing conditions",
  },
  {
    icon: "◈",
    title: "PATTERN MATCH",
    description: "Find specimens that shared the same growing conditions as yours",
  },
  {
    icon: "◈",
    title: "EVENT DETECTION",
    description: "Pinpoint drought years, exceptional years, and long-term growth trends",
  },
]

export function PurposeHeader() {
  const { state } = useDendroLab()
  const step1Done = state.completedStages.has(1)
  const [collapsed, setCollapsed] = useState(step1Done)
  const router = useRouter()
  const { reset } = useAnalysis()

  // Mock prerequisite check — count available analyses
  const analysesAvailable = 4 // In real app, pull from history context
  const hasAnalyses = analysesAvailable > 0

  if (!state.guideMode) return null

  return (
    <div className="border-2 border-[#333333] bg-[#111111] relative">
      {/* Corner accents */}
      <div className="absolute top-[-1px] left-[-1px] w-2 h-2 bg-[#ea580c] z-10" />
      <div className="absolute top-[-1px] right-[-1px] w-2 h-2 bg-[#ea580c] z-10" />

      {/* Collapse toggle bar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-[#333333] hover:bg-[#1a1a1a]"
      >
        <span className="font-mono text-xs uppercase font-bold text-[#ea580c] tracking-[1px]">
          {collapsed ? "[SHOW OVERVIEW]" : "[DENDROLAB OVERVIEW]"}
        </span>
        {collapsed ? <ChevronDown className="w-4 h-4 text-[#a3a3a3]" /> : <ChevronUp className="w-4 h-4 text-[#a3a3a3]" />}
      </button>

      {!collapsed && (
        <div className="p-6 flex flex-col gap-6">
          {/* Headline */}
          <div>
            <h2 className="font-pixel text-3xl sm:text-4xl text-white uppercase tracking-wider mb-3">
              DECODE YOUR TREE&apos;S CLIMATE HISTORY
            </h2>
            <p className="font-mono text-sm text-[#aaaaaa] leading-relaxed max-w-3xl">
              DendroLab takes your ring width measurements and connects them
              to history. Find out which years were droughts, how your tree
              responded to rainfall and temperature, and compare growth
              patterns across multiple specimens.
            </p>
          </div>

          {/* Outcome cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {OUTCOME_CARDS.map((card) => (
              <div
                key={card.title}
                className="border border-[#333333] bg-[#0a0a0a] p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#ea580c] text-lg">{card.icon}</span>
                  <span className="font-mono text-xs uppercase font-bold text-white tracking-[0.1em]">
                    {card.title}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Prerequisite check */}
          <div className="border border-[#333333] bg-[#0a0a0a] px-4 py-3 flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-[#666666] tracking-[0.15em] shrink-0">
              REQUIRES:
            </span>
            <span className="font-mono text-xs text-[#a3a3a3]">
              At least 1 completed analysis from the Analyze page
            </span>
            <div className="w-px h-4 bg-[#333333]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] shrink-0">
              STATUS:
            </span>
            {hasAnalyses ? (
              <span className="font-mono text-xs text-green-400">
                ✓ {analysesAvailable} analyses available — ready to begin
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-red-400">✗ No analyses found</span>
                <button
                  onClick={() => {
                    reset()
                    router.push("/analyze")
                  }}
                  className="font-mono text-[10px] uppercase text-[#ea580c] border border-[#ea580c] px-2 py-1 hover:bg-[#ea580c] hover:text-black tracking-[0.1em]"
                >
                  [▸ GO TO ANALYZE PAGE]
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
