"use client"

import { useState, useEffect, useRef, useCallback } from "react"

/* ═══════════════════════════════════════════════════════════════════
   GUIDE TOOLTIP — [?] button for technical terms
   Brutalist styled, one open at a time, dismiss on click outside / Escape
   ═══════════════════════════════════════════════════════════════════ */

interface GuideTooltipProps {
  term: string
  explanation: string
}

export function GuideTooltip({ term, explanation }: GuideTooltipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open, close])

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-4 h-4 border border-[#333333] text-[10px] font-mono text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] ml-1 align-middle"
        title={`What is ${term}?`}
      >
        ?
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 border-2 border-[#ea580c] bg-[#141414] p-3 pointer-events-auto">
          {/* Corner accents */}
          <div className="absolute top-[-1px] left-[-1px] w-1.5 h-1.5 bg-[#ea580c]" />
          <div className="absolute top-[-1px] right-[-1px] w-1.5 h-1.5 bg-[#ea580c]" />
          <div className="absolute bottom-[-1px] left-[-1px] w-1.5 h-1.5 bg-[#ea580c]" />
          <div className="absolute bottom-[-1px] right-[-1px] w-1.5 h-1.5 bg-[#ea580c]" />

          <div className="font-mono text-[10px] text-[#ea580c] uppercase tracking-[0.15em] mb-1.5">
            {term}
          </div>
          <p className="font-mono text-xs text-[#cccccc] leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </span>
  )
}
