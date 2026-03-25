"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useRef } from "react"
import { TreePine, Clock, Target, BarChart3, Ruler, Info } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Props {
  result: AnalysisResult
}

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" })
    return controls.stop
  }, [value, count, duration])

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v)
    })
    return unsubscribe
  }, [rounded])

  return <span ref={ref}>0</span>
}

/* Click-triggered info button */
function InfoPopover({ tip }: { tip: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-accent/20 transition-colors focus:outline-none"
          aria-label="More info"
        >
          <Info className="h-3 w-3 opacity-40 hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[220px] border border-accent/20 bg-background text-foreground font-mono text-[10px] leading-relaxed p-3 !z-50">
        {tip}
      </PopoverContent>
    </Popover>
  )
}

export function RingSummary({ result }: Props) {
  return (
    <div className="border border-border bg-background shadow-[8px_8px_0_0_rgba(234,88,12,0.2)] p-6 md:p-8 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/[0.02] blur-3xl pointer-events-none" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center relative z-10">
        {/* Ring Count — hero number */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground flex items-center gap-1.5">
            <TreePine className="h-3 w-3 text-accent" /> // RINGS_DETECTED
            <InfoPopover tip="The absolute number of valid annual growth boundaries identified from pith to bark." />
          </span>
          <span className="font-mono text-6xl md:text-7xl font-bold text-accent tabular-nums tracking-tighter">
            <AnimatedCounter value={result.ring_count} />
          </span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-[1px] mt-1 flex items-center gap-1">
            EST. AGE: ~{result.estimated_age} YRS
            <InfoPopover tip="The chronological age estimate derived directly from the AI's ring count." />
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={cn(
                "mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-3 py-1 border uppercase tracking-[1px] cursor-pointer transition-all hover:opacity-80",
                result.health.label === "Excellent" || result.health.label === "Good"
                  ? "text-status-success border-status-success/30 bg-status-success/10 hover:border-status-success"
                  : result.health.label === "Fair"
                    ? "text-status-warning border-status-warning/30 bg-status-warning/10 hover:border-status-warning"
                    : "text-status-error border-status-error/30 bg-status-error/10 hover:border-status-error"
              )}>
                <div className={cn(
                  "h-1.5 w-1.5",
                  result.health.label === "Excellent" || result.health.label === "Good" ? "bg-status-success" : result.health.label === "Fair" ? "bg-status-warning" : "bg-status-error"
                )} />
                {result.health.label.toUpperCase()}
                <Info className="h-3 w-3 opacity-40" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[250px] border border-accent/20 bg-background text-foreground font-mono text-[10px] leading-relaxed p-3 !z-50">
              A proprietary 0-100 score mapping ring width variance and sequential detection confidence. Low scores may indicate stressful climate years or specimen damage.
            </PopoverContent>
          </Popover>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-full bg-border min-h-[120px]" />
        <div className="md:hidden h-px w-full bg-border" />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "DETECTION MODE", value: (result.preprocessing?.mode || 'ADAPTIVE').replace('_', ' ').toUpperCase(), icon: Target, tip: "The algorithmic approach used. Adaptive modes automatically adjust histogram thresholds to combat low contrast." },
            { label: "PRECISION", value: result.metrics.precision ? result.metrics.precision.toFixed(2) : "N/A", icon: Target, tip: "Ratio of correctly identified rings versus total boundaries detected (minimizing false positives)." },
            { label: "RECALL", value: result.metrics.recall ? result.metrics.recall.toFixed(2) : "N/A", icon: BarChart3, tip: "The percentage of true rings successfully identified by the CS-TRD model." },
            { label: "F1 SCORE", value: result.metrics.f1_score ? result.metrics.f1_score.toFixed(2) : "N/A", icon: Target, tip: "Combined harmonic mean of precision and recall. High F1 means the AI traced unbroken valid boundaries." },
            { label: "RMSE", value: result.metrics.rmse ? `${result.metrics.rmse}px` : "N/A", icon: Ruler, tip: "Root Mean Square Error. The average pixel deviation of the detected boundary from an ideal ring." },
            { label: "PROCESSING", value: `${result.processing_time_seconds}s`, icon: Clock, tip: "Total chronological time taken by the backend server to execute the CS-TRD algorithm." },
          ].map(({ label, value, icon: Icon, tip }) => (
            <div key={label} className="flex flex-col gap-1 border border-border/50 bg-surface/50 p-3">
              <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Icon className="h-3 w-3" /> {label}</span>
                <InfoPopover tip={tip} />
              </span>
              <span className="font-mono text-xl font-bold text-foreground tabular-nums mt-1">
                {value}
              </span>
            </div>
          ))}

          {/* Growth Trend — special styling */}
          {result.trend && (
            <div className="flex flex-col gap-1 border border-border/50 bg-surface/50 p-3">
              <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5"><BarChart3 className="h-3 w-3" /> TREND</span>
                <InfoPopover tip="The overall trajectory of sequential ring widths. Increasing indicates accelerating growth; decreasing typically indicates age maturation or encroaching environmental stress." />
              </span>
              <span className={cn(
                "font-mono text-xl font-bold tabular-nums mt-1",
                result.trend.direction.toLowerCase().includes('increas') ? 'text-status-success' :
                  result.trend.direction.toLowerCase().includes('decreas') ? 'text-status-error' :
                    'text-muted-foreground'
              )}>
                {result.trend.direction.toLowerCase().includes('increas') ? '▲' :
                  result.trend.direction.toLowerCase().includes('decreas') ? '▼' : '──'}{' '}
                <span className="text-sm">{result.trend.direction.toUpperCase()}</span>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                ({result.trend.slope.toFixed(2)} PX/YR)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
