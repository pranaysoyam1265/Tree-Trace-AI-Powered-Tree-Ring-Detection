"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useRef } from "react"
import { TreePine, Clock, Target, BarChart3, Ruler } from "lucide-react"
import type { AnalysisResult } from "@/lib/mock-results"
import { cn } from "@/lib/utils"

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

export function RingSummary({ result }: Props) {
  return (
    <div className="border border-border bg-background shadow-[8px_8px_0_0_rgba(234,88,12,0.2)] p-6 md:p-8 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/[0.02] blur-3xl pointer-events-none" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center relative z-10">
        {/* Ring Count — hero number */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground flex items-center gap-1.5">
            <TreePine className="h-3 w-3 text-accent" /> // RINGS_DETECTED
          </span>
          <span className="font-mono text-6xl md:text-7xl font-bold text-accent tabular-nums tracking-tighter">
            <AnimatedCounter value={result.ringCount} />
          </span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-[1px] mt-1">
            EST. AGE: ~{result.estimatedAge} YRS
          </span>
          <span className={cn(
            "mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-3 py-1 border uppercase tracking-[1px]",
            result.confidence === "high"
              ? "text-status-success border-status-success/30 bg-status-success/10"
              : result.confidence === "medium"
                ? "text-status-warning border-status-warning/30 bg-status-warning/10"
                : "text-status-error border-status-error/30 bg-status-error/10"
          )}>
            <div className={cn(
              "h-1.5 w-1.5",
              result.confidence === "high" ? "bg-status-success" : result.confidence === "medium" ? "bg-status-warning" : "bg-status-error"
            )} />
            {result.confidence} CONFIDENCE
          </span>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-full bg-border min-h-[120px]" />
        <div className="md:hidden h-px w-full bg-border" />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "PRECISION", value: result.metrics.precision ? result.metrics.precision.toFixed(2) : "N/A", icon: Target },
            { label: "RECALL", value: result.metrics.recall ? result.metrics.recall.toFixed(2) : "N/A", icon: BarChart3 },
            { label: "F1 SCORE", value: result.metrics.f1 ? result.metrics.f1.toFixed(2) : "N/A", icon: Target },
            { label: "RMSE", value: result.metrics.rmse ? `${result.metrics.rmse}px` : "N/A", icon: Ruler },
            { label: "PROCESSING", value: `${result.processingDuration}s`, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col gap-1 border border-border/50 bg-surface/50 p-3 hover:border-accent/40 transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground flex items-center gap-1.5">
                <Icon className="h-3 w-3" /> {label}
              </span>
              <span className="font-mono text-xl font-bold text-foreground tabular-nums mt-1">
                {value}
              </span>
            </div>
          ))}

          {/* Growth Trend — special styling */}
          {result.statistics && (
            <div className="flex flex-col gap-1 border border-border/50 bg-surface/50 p-3 hover:border-accent/40 transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3" /> TREND
              </span>
              <span className={cn(
                "font-mono text-xl font-bold tabular-nums mt-1",
                result.statistics.growthTrendDirection === 'increasing' ? 'text-status-success' :
                  result.statistics.growthTrendDirection === 'declining' ? 'text-status-error' :
                    'text-muted-foreground'
              )}>
                {result.statistics.growthTrendDirection === 'increasing' ? '▲' :
                  result.statistics.growthTrendDirection === 'declining' ? '▼' : '──'}{' '}
                <span className="text-sm">{result.statistics.growthTrendDirection.toUpperCase()}</span>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                ({result.statistics.growthTrendSlope} PX/YR)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
