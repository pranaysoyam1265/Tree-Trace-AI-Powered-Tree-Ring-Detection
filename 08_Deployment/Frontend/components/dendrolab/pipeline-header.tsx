"use client"

import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { Check, Download } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   PIPELINE HEADER — 4-step progress tracker with Guide Mode toggle
   ═══════════════════════════════════════════════════════════════════ */

const STEPS = [
  { id: 1 as const, label: "ADD SPECIMENS", short: "ADD", description: "Your tree data" },
  { id: 2 as const, label: "COMPARE", short: "COMPARE", description: "Side by side comparison" },
  { id: 3 as const, label: "CLIMATE", short: "CLIMATE", description: "What drove growth" },
  { id: 4 as const, label: "DISCOVER", short: "DISCOVER", description: "What happened and when" },
]

export function PipelineHeader() {
  const { state, dispatch } = useDendroLab()

  return (
    <div className="border border-[#333333] bg-[#111111] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

      {/* Progress Tracker */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
        {STEPS.map((step, i) => {
          const isActive = state.currentStage === step.id
          const isCompleted = state.completedStages.has(step.id)
          const isSelectable = isCompleted || state.currentStage === step.id || (step.id > 1 && state.completedStages.has(step.id - 1))

          return (
            <div key={step.id} className="flex items-center shrink-0">
              <button
                disabled={!isSelectable}
                onClick={() => isSelectable && dispatch({ type: "SET_STAGE", payload: step.id })}
                className={`
                  relative flex flex-col px-4 py-2 border
                  ${isActive
                    ? 'border-[#ea580c] bg-[#ea580c]/10 text-white'
                    : isCompleted
                      ? 'border-[#333333] hover:border-[#ea580c]/50 text-[#cccccc]'
                      : 'border-[#222222] text-[#666666] cursor-not-allowed'}
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`
                    w-5 h-5 flex items-center justify-center text-[10px] font-bold
                    ${isActive ? 'bg-[#ea580c] text-white' : isCompleted ? 'bg-[#333333]' : 'bg-[#222222]'}
                  `}>
                    {isCompleted && !isActive ? <Check className="w-3 h-3" /> : step.id}
                  </div>
                  <span className="font-bold tracking-wider text-sm hidden sm:block whitespace-nowrap font-mono">{step.label}</span>
                  <span className="font-bold tracking-wider text-sm sm:hidden font-mono">{step.short}</span>
                </div>
                {/* Plain description under step name (guide mode) */}
                {state.guideMode && (
                  <span className="text-[9px] text-[#555555] font-mono mt-0.5 hidden sm:block">{step.description}</span>
                )}
              </button>

              {i < STEPS.length - 1 && (
                <div className="w-4 h-px bg-[#333333] mx-1" />
              )}
            </div>
          )
        })}
      </div>

      {/* Right: Guide Mode + Export */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Guide Mode Toggle */}
        <button
          onClick={() => dispatch({ type: "SET_GUIDE_MODE", payload: !state.guideMode })}
          className={`font-mono text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 border-2 ${state.guideMode
              ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]"
              : "border-[#333333] text-[#a3a3a3] hover:text-white hover:border-[#555555]"
            }`}
        >
          [GUIDE MODE: {state.guideMode ? "ON_" : "OFF"}]
        </button>

        {/* Step counter */}
        <div className="flex flex-col text-right mr-2 hidden lg:flex">
          <span className="text-xs text-[#a3a3a3] font-mono">STEP {state.currentStage}/4</span>
          <span className="text-sm font-bold truncate max-w-[150px] font-mono">
            {state.specimens.length > 0
              ? `${state.specimens.length} SAMPLES`
              : "NONE LOADED"}
          </span>
        </div>

        <button
          onClick={() => dispatch({ type: "TOGGLE_EXPORT_DRAWER", payload: true })}
          className="border border-[#ea580c] text-[#ea580c] hover:bg-[#ea580c] hover:text-black px-4 py-2 flex items-center gap-2 uppercase font-bold text-sm font-mono"
        >
          <Download className="w-4 h-4" />
          <span>[▸ EXPORT]</span>
        </button>
      </div>
    </div>
  )
}
