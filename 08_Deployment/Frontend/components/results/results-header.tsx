"use client"

import Link from "next/link"
import { ArrowLeft, Share2, Clock, Check } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Props {
  result: AnalysisResult
}

export function ResultsHeader({ result }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ago = getRelativeTime(result.analyzed_at)

  const confidenceLabel = result.health.label === "Excellent" || result.health.label === "Good"
    ? "high" : result.health.label === "Fair" ? "medium" : "low"

  return (
    <div className="border border-border bg-background px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-accent" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-accent" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent" />

      {/* Left */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href="/analyze"
          className="group flex items-center gap-1.5 border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-[1px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          [NEW ANALYSIS]
        </Link>

        <div className="h-5 w-px bg-border hidden sm:block" />

        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold text-foreground uppercase tracking-[1px]">
            {result.image_name}
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground tracking-[1px] mt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {ago}
            </span>
            <span>│</span>
            <span>PITH: ({result.pith.cx}, {result.pith.cy})</span>
            <span>│</span>
            <span>BORN: ~{result.birth_year}</span>
          </div>
        </div>
      </div>

      {/* Right — badges + share */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[1px] font-bold text-accent border border-accent/50 bg-accent/10 px-2 py-1">
          {result.ring_count} RINGS
        </span>
        <span className={cn(
          "font-mono text-[10px] uppercase tracking-[1px] font-bold px-2 py-1 border",
          confidenceLabel === "high"
            ? "text-status-success border-status-success/30 bg-status-success/10"
            : confidenceLabel === "medium"
              ? "text-status-warning border-status-warning/30 bg-status-warning/10"
              : "text-status-error border-status-error/30 bg-status-error/10"
        )}>
          {result.health.label.toUpperCase()}
        </span>

        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        <button
          onClick={handleShare}
          className={cn(
            "relative flex items-center gap-1.5 border px-3 py-2 font-mono text-xs uppercase tracking-[1px] transition-colors",
            copied
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface text-muted-foreground hover:border-accent hover:text-accent"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          [{copied ? "COPIED" : "SHARE"}]
        </button>
      </div>
    </div>
  )
}

function getRelativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "JUST NOW"
  if (mins < 60) return `${mins}M AGO`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}H AGO`
  return `${Math.floor(hrs / 24)}D AGO`
}
