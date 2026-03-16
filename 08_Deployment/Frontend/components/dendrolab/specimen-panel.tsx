"use client"

import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { X } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   SPECIMEN PANEL — Simplified sidebar showing loaded samples
   ═══════════════════════════════════════════════════════════════════ */

export function SpecimenPanel() {
  const { state } = useDendroLab()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#333333] bg-[#1a1a1a]">
        <h2 className="font-bold tracking-widest text-[#a3a3a3] text-xs flex items-center gap-2 font-mono uppercase">
          // YOUR SAMPLES [{state.specimens.length}]
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-brutal">
        {state.specimens.length === 0 ? (
          <p className="text-xs text-[#555555] italic font-mono">No samples loaded yet.</p>
        ) : (
          state.specimens.map(s => (
            <div key={s.id} className="border border-[#333333] bg-[#0a0a0a] p-3 flex flex-col gap-1 group relative">
              {/* Remove button */}
              <button className="absolute top-2 right-2 text-[#444444] hover:text-red-400 opacity-0 group-hover:opacity-100">
                <X className="w-3 h-3" />
              </button>

              {/* Line 1: Name */}
              <span className="font-bold text-sm font-mono text-white pr-4">
                {s.name.replace('.png', '')}
              </span>

              {/* Line 2: Details */}
              <span className="text-xs text-[#a3a3a3] font-mono">
                {s.ringCount} rings
              </span>

              {/* Line 3: Year range */}
              {s.yearSpan && (
                <span className="text-xs text-[#666666] font-mono">
                  {s.yearSpan.start} — {s.yearSpan.end}
                </span>
              )}
            </div>
          ))
        )}

        {/* Chronology Summary */}
        {state.siteChronology && state.chronologyStats && (
          <div className="mt-2 border-t border-[#333333] pt-4">
            <h3 className="text-xs uppercase text-[#666666] mb-3 font-mono flex items-center gap-2">
              Combined Record
            </h3>
            <div className="bg-[#ea580c]/5 border border-[#ea580c]/30 p-3 flex flex-col gap-2">
              <div className="flex justify-between text-sm font-mono">
                <span className="text-[#a3a3a3]">Span</span>
                <span className="font-bold">{state.chronologyStats.yearRange.start} - {state.chronologyStats.yearRange.end}</span>
              </div>
              <div className="flex justify-between text-sm font-mono">
                <span className="text-[#a3a3a3]">Length</span>
                <span className="font-bold">{state.chronologyStats.length} yrs</span>
              </div>
            </div>
          </div>
        )}

        {/* Climate Data Summary */}
        {state.climateDatasets.length > 0 && (
          <div className="mt-2 border-t border-[#333333] pt-4">
            <h3 className="text-xs uppercase text-[#666666] mb-3 font-mono flex items-center gap-2">
              Climate Data
            </h3>
            <div className="flex flex-col gap-2">
              {state.climateDatasets.map(c => (
                <div key={c.id} className="border border-[#333333] p-2 text-xs font-mono">
                  <div className="font-bold truncate" title={c.name}>{c.name}</div>
                  <div className="text-[#a3a3a3] flex justify-between mt-1">
                    <span>{c.variable} ({c.unit})</span>
                    <span>{c.yearRange.start}-{c.yearRange.end}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
