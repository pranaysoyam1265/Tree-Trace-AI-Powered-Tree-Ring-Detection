"use client"

import { useBatch } from "@/lib/contexts/batch-context"
import type { BatchHealth } from "@/lib/mock-batch"

const HEALTH_CONFIG: Record<Exclude<BatchHealth, null>, { color: string; bg: string; label: string; emoji: string }> = {
  excellent: { color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500 border-2", label: "Excellent", emoji: "🟢" },
  good: { color: "text-emerald-500", bg: "bg-emerald-500/10 border-[#333333] border-2", label: "Good", emoji: "🟢" },
  fair: { color: "text-yellow-500", bg: "bg-yellow-500/10 border-[#333333] border-2", label: "Fair", emoji: "🟡" },
  poor: { color: "text-red-500", bg: "bg-red-500/10 border-red-500 border-2", label: "Poor", emoji: "🔴" },
}

export function BatchHealthBadge() {
  const { state } = useBatch()
  if (!state.health || !state.summary) return null

  const cfg = HEALTH_CONFIG[state.health]
  const s = state.summary

  return (
    <div className="group relative inline-flex">
      <div className={`flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
        <span>{cfg.emoji}</span>
        <span>{cfg.label}</span>
      </div>
      {/* Hover tooltip */}
      <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-[var(--bg-void)]/95 p-3 opacity-0 shadow-xl backdrop-blur-md transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <p className="font-mono text-xs text-text-accent font-semibold mb-1">{cfg.label} Health</p>
        <div className="space-y-0.5 font-mono text-[10px] text-muted-foreground/60">
          <p>{s.successful}/{s.totalImages} succeeded</p>
          {s.averageF1 !== null && <p>Avg F1: {(s.averageF1 * 100).toFixed(1)}%</p>}
          {s.averagePrecision !== null && <p>Avg Precision: {(s.averagePrecision * 100).toFixed(1)}%</p>}
        </div>
      </div>
    </div>
  )
}
