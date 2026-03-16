"use client"

export const dynamic = "force-dynamic"

import { Navigation } from "@/components/ascii-hub/navigation"
import { Footer } from "@/components/ascii-hub/footer"
import { BatchProvider, useBatch } from "@/lib/contexts/batch-context"
import { PhaseIndicator } from "@/components/batch/shared/phase-indicator"
import { UploadPhase } from "@/components/batch/phases/upload-phase"
import { ProcessingPhase } from "@/components/batch/phases/processing-phase"
import { ResultsPhase } from "@/components/batch/phases/results-phase"

/* ═══════════════════════════════════════════════════════════════════
   /BATCH — Brutalist Batch Analysis Workstation
   ═══════════════════════════════════════════════════════════════════ */

function BatchFlow() {
  const { state } = useBatch()

  const phase = state.status
  const isConfiguring = phase === "configuring"
  const isProcessing = phase === "processing"
  const isFinished = phase === "completed" || phase === "cancelled"

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative">
      <Navigation />

      {/* Spacer for fixed nav */}
      <div className="h-[80px] shrink-0" />



      <main className="flex-1 flex flex-col w-full">
        {/* Phase Containers — instant cuts, no crossfade */}
        {isConfiguring && (
          <div className="w-full flex-1 flex flex-col">
            <UploadPhase />
          </div>
        )}

        {isProcessing && (
          <div className="w-full flex-1 flex flex-col">
            <ProcessingPhase />
          </div>
        )}

        {isFinished && (
          <div className="w-full flex-1 flex flex-col">
            <ResultsPhase />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function BatchPage() {
  return (
    <BatchProvider>
      <BatchFlow />
    </BatchProvider>
  )
}
