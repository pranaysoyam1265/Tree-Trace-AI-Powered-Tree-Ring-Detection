"use client"

import { useRef, useEffect } from "react"
import { Navigation } from "@/components/ascii-hub/navigation"
import { AnalysisProvider, useAnalysis } from "@/lib/contexts/analysis-context"
import { StepIndicator } from "@/components/analysis/step-indicator"
import { UploadStep } from "@/components/analysis/upload-step"
import { PithStep } from "@/components/analysis/pith-step"
import { ProcessingStep } from "@/components/analysis/processing-step"
import { CompleteStep } from "@/components/analysis/complete-step"
import { Footer } from "@/components/ascii-hub/footer"

/* ═══════════════════════════════════════════════════════════════════
   /ANALYZE — Brutalist analysis workspace with vertical step rail
   ═══════════════════════════════════════════════════════════════════ */

function AnalysisFlow() {
  const { state } = useAnalysis()
  const contentRef = useRef<HTMLDivElement>(null)

  /* Auto-scroll to top when step changes */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0 })
      }
      window.scrollTo({ top: 0 })
    }, 50)
    return () => clearTimeout(timer)
  }, [state.step])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navigation />

      {/* Spacer for fixed nav */}
      <div className="h-[80px] shrink-0" />

      <div className="flex-1 flex w-full px-0 pb-16">
        {/* Active Step Content vertically stacked without numbers */}
        <div ref={contentRef} className="flex-1 w-full pt-0">

          {/* Step Content — instant cuts */}
          {state.step === 1 && <UploadStep />}
          {state.step === 2 && <PithStep />}
          {state.step === 3 && <ProcessingStep />}
          {state.step === 4 && <CompleteStep />}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function AnalyzePage() {
  return (
    <AnalysisProvider>
      <AnalysisFlow />
    </AnalysisProvider>
  )
}
