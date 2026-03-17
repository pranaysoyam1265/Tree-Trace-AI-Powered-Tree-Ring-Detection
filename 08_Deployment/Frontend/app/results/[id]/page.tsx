"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/ascii-hub/navigation"
import { Footer } from "@/components/ascii-hub/footer"
import { ResultsHeader } from "@/components/results/results-header"
import { RingSummary } from "@/components/results/ring-summary"
import { RingBoundaryMap } from "@/components/results/ring-boundary-map"
import { WidthChart } from "@/components/results/width-chart"
import { CumulativeGrowthChart } from "@/components/results/cumulative-growth-chart"
import { RingTable } from "@/components/results/ring-table"
import { ExportPanel } from "@/components/results/export-panel"
import { HealthScoreCard } from "@/components/results/health-score-card"
import { AnomalyPanel } from "@/components/results/anomaly-panel"
import { EcologyCard } from "@/components/results/ecology-card"
import { SpecimenBiography } from "@/components/results/specimen-biography"
import { OverlayPngCard } from "@/components/results/overlay-png-card"
import { getCachedResult, cacheResult } from "@/lib/result-storage"
import { apiClient } from "@/lib/api-client"
import type { AnalysisResult } from "@/lib/types"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

/* ═══════════════════════════════════════════════════════════════════
   /RESULTS/[ID] — Premium Analysis Dashboard
   Loads real analysis data from localStorage cache or API.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 flex flex-col gap-8 animate-pulse">
      <div className="flex items-center justify-between border-b-2 border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-32 bg-surface border border-border" />
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div className="h-4 w-24 bg-surface border border-border" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-surface border border-border" />
          <div className="h-6 w-32 bg-surface border border-border" />
        </div>
      </div>
      <div className="border border-border bg-background dot-grid-bg p-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-24 bg-surface border border-border" />
            <div className="h-16 w-20 bg-surface border border-border" />
            <div className="h-3 w-40 bg-surface border border-border" />
          </div>
          <div className="hidden md:block w-px h-24 bg-border" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-border bg-surface p-3">
                <div className="h-2 w-12 bg-border mb-2" />
                <div className="h-5 w-10 bg-border" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8">
        <div className="flex flex-col gap-8">
          <div className="border border-border bg-background h-[560px]" />
          <div className="border border-border bg-background h-[220px]" />
        </div>
        <div className="flex flex-col gap-8">
          <div className="border border-border bg-background h-[420px]" />
          <div className="border border-border bg-background h-[180px]" />
        </div>
      </div>
    </div>
  )
}

/* ── Error State ── */
function ErrorState({ id, message }: { id: string; message?: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 flex flex-col items-center text-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center bg-status-error/10 border-2 border-status-error">
        <AlertCircle className="h-8 w-8 text-status-error" />
      </div>
      <div>
        <h2 className="font-mono text-xl uppercase tracking-[2px] font-bold text-status-error">
          // RESULT_NOT_FOUND
        </h2>
        <p className="font-mono text-sm text-muted-foreground mt-2 max-w-sm">
          {message || (
            <>No analysis result was found for ID <code className="text-accent bg-surface border border-border px-1.5 py-0.5 text-xs">{id}</code>. It may have been deleted or the backend may not have this result saved.</>
          )}
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/history"
          className="group flex items-center gap-2 border border-border bg-surface hover:bg-accent hover:text-white px-6 py-3 font-mono text-sm font-bold text-muted-foreground uppercase tracking-[1px] transition-colors"
        >
          [▸ GO TO HISTORY]
        </Link>
        <Link
          href="/analyze"
          className="group flex items-center gap-2 border border-accent bg-accent/10 hover:bg-accent hover:text-white px-6 py-3 font-mono text-sm font-bold text-accent uppercase tracking-[1px] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          [NEW ANALYSIS]
        </Link>
      </div>
    </div>
  )
}

/* ── Chart Tab Toggle ── */
function ChartTabs({
  activeTab,
  onTabChange
}: {
  activeTab: 'widths' | 'cumulative'
  onTabChange: (tab: 'widths' | 'cumulative') => void
}) {
  return (
    <div className="flex">
      <button
        onClick={() => onTabChange('widths')}
        className={`flex-1 font-mono text-xs uppercase font-bold tracking-[1px] px-4 py-2 border-2 transition-none ${activeTab === 'widths'
          ? 'bg-accent text-white border-accent'
          : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
          }`}
      >
        █ RING WIDTHS
      </button>
      <button
        onClick={() => onTabChange('cumulative')}
        className={`flex-1 font-mono text-xs uppercase font-bold tracking-[1px] px-4 py-2 border-2 border-l-0 transition-none ${activeTab === 'cumulative'
          ? 'bg-accent text-white border-accent'
          : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
          }`}
      >
        ░ CUMULATIVE GROWTH
      </button>
    </div>
  )
}


export default function ResultsPage() {
  const params = useParams<{ id: string }>()
  const analysisId = params?.id || "demo"
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chartTab, setChartTab] = useState<'widths' | 'cumulative'>('widths')
  const [selectedRing, setSelectedRing] = useState<number | null>(null)

  useEffect(() => {
    async function loadResult() {
      setLoading(true)

      // 1. Check localStorage cache first (instant load after just analyzing)
      const cached = getCachedResult(analysisId)
      if (cached) {
        setResult(cached)
        setLoading(false)
        return
      }

      // 2. Fall back to API call (for direct URL navigation or page refresh)
      try {
        const data = await apiClient.getResult(analysisId)
        setResult(data)
        cacheResult(data) // Cache for future visits
      } catch (err) {
        setError(err instanceof Error ? err.message : "Result not found")
      } finally {
        setLoading(false)
      }
    }

    loadResult()
  }, [analysisId])

  return (
    <div className="min-h-screen bg-bg-void text-text-primary">
      <Navigation />
      <div className="h-[80px]" />

      {loading ? (
        <LoadingSkeleton />
      ) : error || !result ? (
        <ErrorState id={analysisId} message={error ?? undefined} />
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 flex flex-col gap-8">
          {/* ── Section 1: Header Toolbar ── */}
          <ResultsHeader result={result} />

          {/* ── Section 2: Ring Summary Card ── */}
          <RingSummary result={result} />

          {/* ── Two-Column Layout ── */}
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
            {/* Left: Visualization + Chart */}
            <div className="flex flex-col gap-8">
              <RingBoundaryMap
                result={result}
                selectedRing={selectedRing}
                onSelectRing={setSelectedRing}
              />
              <OverlayPngCard
                overlayImageBase64={result.overlay_image_base64}
                imageName={result.image_name}
              />
              <div className="flex flex-col">
                <ChartTabs activeTab={chartTab} onTabChange={setChartTab} />
                {chartTab === 'widths' ? (
                  <WidthChart
                    result={result}
                    selectedRing={selectedRing}
                    onSelectRing={setSelectedRing}
                  />
                ) : (
                  <CumulativeGrowthChart
                    result={result}
                    selectedRing={selectedRing}
                    onSelectRing={setSelectedRing}
                  />
                )}
              </div>
            </div>

            {/* Right: Summary + Health + Anomalies + Ecology */}
            <div className="flex flex-col gap-8">
              <HealthScoreCard result={result} />
              <AnomalyPanel result={result} />
              <EcologyCard result={result} />
            </div>
          </div>

          {/* ── Full-Width Sections ── */}
          <RingTable
            result={result}
            selectedRing={selectedRing}
            onSelectRing={setSelectedRing}
          />
          <SpecimenBiography result={result} />
          <ExportPanel result={result} />
        </main>
      )}

      <Footer />
    </div>
  )
}
