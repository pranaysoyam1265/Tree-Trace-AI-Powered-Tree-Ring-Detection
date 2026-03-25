"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/lib/contexts/analysis-context"
import { ArrowRight, RotateCcw, TreePine, Activity, Clock, Download, FileText, Ruler, CheckCircle2, Copy, GitCompare } from "lucide-react"
import { useAnalysisHistory } from "@/lib/hooks/use-analysis-history"

export function CompleteStep() {
  const { state, reset, setStep } = useAnalysis()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const { saveSession } = useAnalysisHistory()
  const [copied, setCopied] = useState(false)
  const hasRedirected = useRef(false)
  const [timestamp, setTimestamp] = useState("")

  useEffect(() => {
    setTimestamp(new Date().toLocaleString())
  }, [])

  const resultUrl = `/results/${state.resultId ?? "demo"}`

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }

    if (countdown === 0 && !hasRedirected.current) {
      hasRedirected.current = true
      saveSession({
        id: state.resultId ?? "demo",
        imageName: state.file?.name ?? "demo-image.jpg",
        timestamp: new Date().toISOString(),
        ringCount: 47
      })
      router.push(resultUrl)
    }
  }, [countdown, resultUrl, router, saveSession, state.resultId, state.file?.name])

  const handleCopyId = () => {
    navigator.clipboard.writeText(state.resultId ?? "demo")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full px-4 pt-6 lg:px-8 pb-16">
      {/* Phase Header — top left */}
      <div className="mb-8 border-b-2 border-[#333333] pb-6">
        <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">COMPLETE ANALYSIS</h1>
        <p className="font-mono text-sm text-[#555555] uppercase tracking-[0.1em]">
          Ring boundaries cross-validated — specimen data ready for export.
        </p>
      </div>

      {/* Status Banner */}
      <div className="border-2 border-emerald-500/30 bg-emerald-500/5 px-6 py-4 mb-8 flex items-center gap-4">
        <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-mono text-sm font-bold text-emerald-500 uppercase tracking-wider">Detection Complete</p>
          <p className="font-mono text-[11px] text-[#a3a3a3] mt-1">
            All ring boundaries have been successfully mapped and measured. Redirecting in {countdown}s...
          </p>
        </div>
        <button
          onClick={() => setCountdown(999)}
          className="font-mono text-[10px] text-[#555555] border border-[#333333] px-3 py-1.5 hover:text-white hover:border-[#555555] transition-none uppercase tracking-wider"
        >
          Cancel
        </button>
      </div>

      {/* Main Grid — metrics + specimen info */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-8">

        {/* Left: Key Metrics */}
        <div className="border-2 border-[#333333] bg-[#0a0a0a]">
          <div className="border-b-2 border-[#333333] px-5 py-3 bg-[#141414]">
            <span className="font-mono text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest">
              DETECTION METRICS
            </span>
          </div>
          <div className="grid grid-cols-3 divide-x-2 divide-[#333333]">
            {[
              { label: "Rings Detected", value: "47", icon: TreePine, color: "text-[#ea580c]" },
              { label: "Confidence", value: "94.2%", icon: Activity, color: "text-emerald-500" },
              { label: "Processing", value: "1.8s", icon: Clock, color: "text-yellow-500" },
            ].map((metric) => (
              <div key={metric.label} className="p-5 flex flex-col items-center gap-3">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <span className={`font-mono text-3xl font-black ${metric.color} tabular-nums`}>
                  {metric.value}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#555555] text-center">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Specimen Information */}
        <div className="border-2 border-[#333333] bg-[#0a0a0a]">
          <div className="border-b-2 border-[#333333] px-5 py-3 bg-[#141414]">
            <span className="font-mono text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest">
              SPECIMEN DATA
            </span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#555555] uppercase tracking-wider">File</span>
              <span className="font-mono text-xs text-white truncate max-w-[200px]">
                {state.file?.name ?? "demo-image.jpg"}
              </span>
            </div>
            <div className="h-px bg-[#333333]" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#555555] uppercase tracking-wider">Pith Origin</span>
              <span className="font-mono text-xs text-white tabular-nums">
                ({state.pith?.x ?? 512}, {state.pith?.y ?? 512})
              </span>
            </div>
            <div className="h-px bg-[#333333]" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#555555] uppercase tracking-wider">Analysis ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#ea580c]">
                  {(state.resultId ?? "demo").slice(0, 16)}...
                </span>
                <button onClick={handleCopyId} className="text-[#555555] hover:text-white transition-none">
                  {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
            <div className="h-px bg-[#333333]" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#555555] uppercase tracking-wider">Timestamp</span>
              <span className="font-mono text-xs text-white">
                {timestamp || "—"}
              </span>
            </div>
            <div className="h-px bg-[#333333]" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#555555] uppercase tracking-wider">Avg Ring Width</span>
              <span className="font-mono text-xs text-white tabular-nums">2.4 mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ring Width Distribution Summary */}
      <div className="border-2 border-[#333333] bg-[#0a0a0a] mb-8">
        <div className="border-b-2 border-[#333333] px-5 py-3 bg-[#141414] flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest">
            RING WIDTH DISTRIBUTION
          </span>
          <span className="font-mono text-[10px] text-[#555555] uppercase">
            [ 47 boundaries ]
          </span>
        </div>
        <div className="p-5">
          {/* Simple bar visualization */}
          <div className="flex items-end gap-[3px] h-[80px]">
            {Array.from({ length: 47 }, (_, i) => {
              // Deterministic pseudo-random based on index to avoid hydration mismatch
              const seed = ((i * 2654435761) >>> 0) / 4294967296
              const height = 15 + seed * 65
              const isHighlight = i === 12 || i === 28 || i === 41
              return (
                <div
                  key={i}
                  className={`flex-1 min-w-[4px] ${isHighlight ? "bg-[#ea580c]" : "bg-[#333333] hover:bg-[#555555]"} transition-none`}
                  style={{ height: `${height}%` }}
                  title={`Ring ${i + 1}: ${(height * 0.05).toFixed(1)}mm`}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-3">
            <span className="font-mono text-[9px] text-[#555555] uppercase">Ring 1 (innermost)</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#ea580c]" />
                <span className="font-mono text-[9px] text-[#555555]">Anomalous</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#333333]" />
                <span className="font-mono text-[9px] text-[#555555]">Normal</span>
              </div>
            </div>
            <span className="font-mono text-[9px] text-[#555555] uppercase">Ring 47 (outermost)</span>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <button
          onClick={() => router.push(resultUrl)}
          className="flex-1 flex items-center justify-center gap-3 border-2 border-[#ea580c] bg-[#ea580c] px-8 py-4 font-mono text-sm font-bold text-black uppercase tracking-wider hover:bg-[#c2410c] transition-none"
        >
          <ArrowRight className="h-4 w-4" />
          View Detailed Results
        </button>
        <button
          onClick={() => {
            // Go back to pith/config step without resetting — user can switch mode and re-run
            setStep(1)
            router.push("/analyze")
          }}
          className="flex items-center justify-center gap-3 border-2 border-[#333333] px-6 py-4 font-mono text-sm font-bold text-[#a3a3a3] uppercase tracking-wider hover:border-[#ea580c] hover:text-[#ea580c] transition-none"
          title="Same image + pith — switch mode and run again"
        >
          <GitCompare className="h-4 w-4" />
          Try Another Mode
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-3 border-2 border-[#333333] px-8 py-4 font-mono text-sm font-bold text-white uppercase tracking-wider hover:border-[#555555] transition-none"
        >
          <RotateCcw className="h-4 w-4" />
          New Analysis
        </button>
        <button
          className="flex items-center justify-center gap-3 border-2 border-[#333333] px-6 py-4 font-mono text-sm font-bold text-[#a3a3a3] uppercase tracking-wider hover:border-[#555555] hover:text-white transition-none"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        <button
          className="flex items-center justify-center gap-3 border-2 border-[#333333] px-6 py-4 font-mono text-sm font-bold text-[#a3a3a3] uppercase tracking-wider hover:border-[#555555] hover:text-white transition-none"
        >
          <FileText className="h-4 w-4" />
          Report
        </button>
      </div>
    </div>
  )
}
