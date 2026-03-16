"use client"

import { useState } from "react"
import { AnalysisRecord } from "@/lib/mock-history"

interface StatsSummaryProps {
  records: AnalysisRecord[]
  totalRecords: number
}

export function StatsSummary({ records, totalRecords }: StatsSummaryProps) {
  const [collapsed, setCollapsed] = useState(false)

  const isFiltered = records.length < totalRecords

  const totalRings = records.reduce((sum, r) => sum + (r.ringCount || 0), 0)
  const avgRings = records.length > 0 ? (totalRings / records.length).toFixed(1) : "0"

  const completed = records.filter(r => r.status === 'completed')
  const failed = records.filter(r => r.status === 'failed').length

  const avgF1 = completed.length > 0
    ? (completed.reduce((sum, r) => sum + (r.f1Score || 0), 0) / completed.length).toFixed(2)
    : "—"

  const successRate = records.length > 0
    ? Math.round((completed.length / records.length) * 100)
    : 0

  const uniqueTags = new Set<string>()
  records.forEach(r => r.tags.forEach(t => uniqueTags.add(t)))

  const batchGroups = new Set(records.filter(r => r.batchId).map(r => r.batchId))

  if (collapsed) {
    return (
      <div className="w-full border border-border bg-background dot-grid-bg p-3 mb-6 flex items-center justify-between group cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setCollapsed(false)}>
        <div className="font-mono text-xs uppercase tracking-[1px] text-muted-foreground">
          <span className="text-accent">{isFiltered ? `FILTERED: ${records.length} of ${totalRecords}` : `${records.length} RECORDS`}</span>
          <span className="mx-2">│</span>
          <span>{totalRings.toLocaleString()} RINGS</span>
        </div>
        <button className="font-mono text-xs uppercase tracking-[1px] text-muted-foreground group-hover:text-accent">
          [EXPAND ▼]
        </button>
      </div>
    )
  }

  return (
    <div className="w-full border border-border bg-background flex flex-col mb-6 relative overflow-hidden group">
      {/* Background hint */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/[0.02] blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="w-full bg-surface border-b border-border px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-surface/80" onClick={() => setCollapsed(true)}>
        <span className="font-mono text-xs uppercase tracking-[2px] text-accent">
          {"┌─ ARCHIVE STATS ────────────────"}
        </span>
        <button className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground group-hover:text-accent">
          [COLLAPSE ▲]
        </button>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 p-4 md:p-6 dot-grid-bg">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">SPECIMENS</span>
          <span className="font-mono text-lg text-foreground">{records.length}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">TOTAL RINGS</span>
          <span className="font-mono text-lg text-foreground">{totalRings.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">AVG RINGS</span>
          <span className="font-mono text-lg text-foreground">{avgRings}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">AVG F1 SCORE</span>
          <span className="font-mono text-lg text-accent">{avgF1}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">SUCCESS RATE</span>
          <span className="font-mono text-lg text-status-success">{completed.length} <span className="text-sm text-muted-foreground">({successRate}%)</span></span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">FAILED / CANCELLED</span>
          <span className="font-mono text-lg text-status-error">{failed}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">BATCHES INCLUDED</span>
          <span className="font-mono text-lg text-foreground">{batchGroups.size}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">UNIQUE TAGS</span>
          <span className="font-mono text-lg text-foreground">{uniqueTags.size}</span>
        </div>
      </div>

      {/* Bottom border line */}
      <div className="w-full bg-surface border-t border-border px-4 py-1">
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground">
          {"└"}{"─".repeat(50)}
        </span>
      </div>
    </div>
  )
}
