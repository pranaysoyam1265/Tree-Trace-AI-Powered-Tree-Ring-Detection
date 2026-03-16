"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, RotateCcw } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"
import { SummaryMetrics } from "../results/summary-metrics"
import { HighlightsPanel } from "../results/highlights-panel"
import { ComparisonChart } from "../results/comparison-chart"
import { ResultsTable } from "../results/results-table"
import { ExportDrawer } from "../results/export-drawer"
import { BatchHealthBadge } from "../shared/batch-health"

export function ResultsPhase() {
  const { state, resetBatch } = useBatch()
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <section className="flex flex-1 flex-col pt-4 pb-16 px-4 sm:px-8 w-full gap-8">
      {/* Header with batch info & actions */}
      <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-2 border-[#333333] pb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-pixel text-3xl text-white uppercase tracking-wider">{state.name || "Untitled Batch"}</h1>
            <BatchHealthBadge />
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#a3a3a3]">
            <span>Completed {state.completedAt ? new Date(state.completedAt).toLocaleTimeString() : "Just now"}</span>
            <span className="text-[#555555]"> • </span>
            <span>{state.summary?.totalImages || 0} images analyzed</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setExportOpen(true)}
            className="flex h-10 items-center justify-center gap-2 border-2 border-[#ea580c] bg-[#ea580c] px-6 font-mono text-xs font-bold text-black shadow-[0_0_15px_rgba(234,88,12,0.2)] hover:bg-[#c2410c] transition-none"
          >
            <Download className="h-4 w-4" /> Export All
          </button>
          <button
            onClick={resetBatch}
            className="flex h-10 items-center justify-center gap-2 border-2 border-[#333333] bg-transparent px-6 font-mono text-xs font-bold text-white hover:border-[#a3a3a3] transition-none"
          >
            <RotateCcw className="h-4 w-4" /> New Batch
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <SummaryMetrics />

      {/* Chart + Highlights two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
        <ComparisonChart />
        <HighlightsPanel />
      </div>

      {/* Full results table */}
      <ResultsTable />

      {/* Export drawer */}
      <ExportDrawer open={exportOpen} onClose={() => setExportOpen(false)} />
    </section>
  )
}
