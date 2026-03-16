"use client"

import { useAnalysis } from "@/lib/contexts/analysis-context"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   Vertical Step Indicator — Brutalist square markers on a rail
   ═══════════════════════════════════════════════════════════════════ */

const STEPS = [
  { num: 1, label: "Upload" },
  { num: 2, label: "Set Pith" },
  { num: 3, label: "Analyze" },
  { num: 4, label: "Results" },
] as const

export function StepIndicator() {
  const { state, setStep } = useAnalysis()
  const current = state.step

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((s, i) => {
        const isComplete = current > s.num
        const isCurrent = current === s.num
        const canClick = isComplete

        return (
          <div key={s.num} className="flex items-stretch">
            {/* Vertical rail + marker */}
            <div className="flex flex-col items-center w-8 shrink-0">
              <button
                onClick={() => canClick && setStep(s.num as 1 | 2 | 3 | 4)}
                disabled={!canClick}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[10px] font-bold border-2 transition-none",
                  isCurrent && "bg-[#ea580c] text-white border-[#ea580c]",
                  isComplete && "bg-[#ea580c]/20 text-[#ea580c] border-[#ea580c]/50",
                  !isCurrent && !isComplete && "bg-[#141414] text-[#555555] border-[#333333]",
                  canClick && "cursor-pointer hover:border-[#ea580c]"
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : s.num}
              </button>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 w-[2px] min-h-[24px]">
                  <div
                    className={cn(
                      "w-full h-full",
                      current > s.num ? "bg-[#ea580c]/40" : "bg-[#333333]"
                    )}
                  />
                </div>
              )}
            </div>

            {/* Label */}
            <div className="flex items-start pt-1 pl-3 pb-6">
              <span
                className={cn(
                  "font-mono text-xs uppercase tracking-[0.15em]",
                  isCurrent ? "text-white font-bold" : "text-[#555555]",
                  canClick && "hover:text-[#ea580c] cursor-pointer"
                )}
                onClick={() => canClick && setStep(s.num as 1 | 2 | 3 | 4)}
              >
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
