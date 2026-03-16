"use client"

import { useMemo, useState } from "react"
import { BarChart3, FileX } from "lucide-react"
import type { AnalysisResult } from "@/lib/mock-results"
import { getRingStats } from "@/lib/mock-results"
import { cn } from "@/lib/utils"

interface Props {
  result: AnalysisResult
  selectedRing: number | null
  onSelectRing: (ringId: number | null) => void
}

export function WidthChart({ result, selectedRing, onSelectRing }: Props) {
  const stats = useMemo(() => getRingStats(result.rings), [result.rings])
  const maxWidth = useMemo(
    () => result.rings.length > 0 ? Math.max(...result.rings.map((r) => r.widthPx)) : 100,
    [result.rings]
  )
  const [hoverRing, setHoverRing] = useState<number | null>(null)
  const maxValue = maxWidth

  return (
    <div className="border border-border bg-background flex flex-col relative w-full">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent z-20 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 relative z-20">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3 w-3 text-accent" />
          <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
            [WIDTH DISTRIBUTION]
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground tracking-[1px]">
          N={result.rings.length}
        </span>
      </div>

      {/* Chart Area */}
      <div className="relative h-[250px] w-full bg-background px-8 pt-6 pb-8 dot-grid-bg">
        {result.rings.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50">
            <div className="flex h-10 w-10 items-center justify-center bg-surface border border-border text-muted-foreground">
              <FileX className="h-4 w-4" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[2px] text-muted-foreground">NO GROWTH DATA</p>
          </div>
        ) : (
          <div className="relative w-full h-full border-l border-b border-border flex items-end">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ top: 0, bottom: 0, left: 0, transform: 'translateY(1px)' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute w-full" style={{ top: `${i * 25}%` }}>
                  <div className="border-t border-dashed border-border/40 w-full" />
                  <span className="absolute -left-6 -top-[6px] text-[8px] font-mono text-muted-foreground/80 w-5 text-right bg-background">
                    {Math.round(maxValue - (maxValue / 4) * i)}
                  </span>
                </div>
              ))}
            </div>

            {/* Y-Axis Label */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[9px] font-mono tracking-[2px] text-muted-foreground pointer-events-none uppercase">
              WIDTH (PX)
            </div>

            {/* Bars container */}
            <div className="absolute inset-0 left-px bottom-px flex items-end gap-[1px] md:gap-[2px] px-1 pb-px pt-1">
              {result.rings.map((ring) => {
                const heightPercent = (ring.widthPx / maxValue) * 100
                const isSelected = selectedRing === ring.id
                const isHovered = hoverRing === ring.id

                // Anomaly coloring
                const rwi = stats.avg > 0 ? ring.widthPx / stats.avg : 1
                const isStress = rwi < 0.7
                const isFavorable = rwi > 1.4

                return (
                  <div
                    key={ring.id}
                    className="relative flex-1 h-full flex flex-col justify-end group cursor-pointer"
                    onMouseEnter={() => setHoverRing(ring.id)}
                    onMouseLeave={() => setHoverRing(null)}
                    onClick={() => onSelectRing(isSelected ? null : ring.id)}
                  >
                    <div
                      className={cn(
                        "w-full transition-all duration-75 min-h-[1px]",
                        isSelected
                          ? "bg-accent shadow-[0_0_8px_var(--color-accent)] z-10 relative"
                          : isHovered
                            ? "bg-accent/80"
                            : isStress
                              ? "bg-accent/30 border-t border-status-error/40"
                              : isFavorable
                                ? "bg-[#f97316] border-t border-[#f97316]/60"
                                : "bg-surface border-t border-accent/40"
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                        <div className="border border-accent bg-background p-2 flex flex-col gap-1 shadow-[0_4px_12px_rgba(234,88,12,0.15)] backdrop-blur-sm whitespace-nowrap min-w-[70px] items-center">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-1 w-full text-center">
                            R_{ring.id}
                          </span>
                          <span className="font-mono text-xs font-bold text-accent">
                            {ring.widthPx}px
                          </span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 border-r border-b border-accent bg-background origin-top-left -rotate-45" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* SVG Overlays: Mean line + Moving Average */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" style={{ left: '1px', bottom: '1px', width: 'calc(100% - 1px)', height: 'calc(100% - 1px)' }}>
              {/* Mean reference line (dashed) */}
              <line
                x1="0" y1={`${100 - (stats.avg / maxValue) * 100}%`}
                x2="100%" y2={`${100 - (stats.avg / maxValue) * 100}%`}
                stroke="#a3a3a3" strokeWidth="1" strokeDasharray="8 4"
              />

              {/* Moving average line (white solid) */}
              {result.statistics?.movingAverages && result.statistics.movingAverages.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  points={result.statistics.movingAverages.map((ma) => {
                    const x = ((ma.ringId - 1) / (result.rings.length - 1)) * 100
                    const y = 100 - (ma.value / maxValue) * 100
                    return `${x}%,${y}%`
                  }).join(' ')}
                />
              )}
            </svg>

            {/* Mean label */}
            <div
              className="absolute right-1 font-mono text-[8px] text-muted-foreground pointer-events-none z-10 bg-background px-1"
              style={{ top: `${100 - (stats.avg / maxValue) * 100}%`, transform: 'translateY(-50%)' }}
            >
              MEAN: {stats.avg}
            </div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between px-8 py-2 border-t border-border/50 bg-surface/30">
        <span className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground/60">INNERMOST</span>
        <span className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground/60">OUTERMOST</span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border divide-x divide-border">
        {[
          { label: "AVG WIDTH", value: `${stats.avgMm}mm` },
          { label: "MIN WIDTH", value: `${stats.minMm}mm`, sub: `R_${stats.minRing}` },
          { label: "MAX WIDTH", value: `${stats.maxMm}mm`, sub: `R_${stats.maxRing}` },
          { label: "STD DEV", value: `${stats.stdDev}px` },
        ].map((s) => (
          <div key={s.label} className="flex flex-col p-3 bg-surface/50 justify-center">
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground">
              {s.label}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-sm font-bold text-foreground">
                {s.value}
              </span>
              {s.sub && (
                <span className="font-mono text-[9px] text-accent">[{s.sub}]</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
