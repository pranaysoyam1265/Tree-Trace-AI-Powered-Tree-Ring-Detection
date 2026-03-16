"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Check } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   STEP COMPLETION BANNER — Success state between steps
   Auto-dismisses after 3 seconds or on click.
   ═══════════════════════════════════════════════════════════════════ */

interface Props {
  title: string
  description: string
  nextLabel: string
  onNext: () => void
}

export function StepCompletionBanner({ title, description, nextLabel, onNext }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className="border-2 border-green-500/40 bg-green-500/5 p-5 flex items-center justify-between gap-4 cursor-pointer"
      onClick={() => setVisible(false)}
    >
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 border-2 border-green-500 flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-sm font-bold text-green-400 uppercase tracking-[0.1em]">
            {title}
          </span>
          <span className="font-mono text-xs text-[#aaaaaa]">
            {description}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="flex items-center gap-2 border-2 border-[#ea580c] bg-[#ea580c] text-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-transparent hover:text-[#ea580c] shrink-0"
      >
        {nextLabel}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
