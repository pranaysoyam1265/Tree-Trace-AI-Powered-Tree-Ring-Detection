"use client"

import { useMemo } from "react"
import { TrendingUp, FileX } from "lucide-react"
import type { AnalysisResult } from "@/lib/mock-results"

interface Props {
  result: AnalysisResult
  selectedRing: number | null
  onSelectRing: (ringId: number | null) => void
}

export function CumulativeGrowthChart({ result, selectedRing, onSelectRing }: Props) {
  const cumulativeData = useMemo(() => {
    let total = 0
    return result.rings.map((ring) => {
      total += ring.widthPx
      return { ringId: ring.id, cumulative: total }
    })
  }, [result.rings])

  const maxCumulative = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1].cumulative : 100
  const totalGrowth = maxCumulative

  // Growth rates
  const recentRate = useMemo(() => {
    if (result.rings.length < 5) return 0
    const last5 = result.rings.slice(-5)
    return parseFloat((last5.reduce((a, r) => a + r.widthPx, 0) / 5).toFixed(1))
  }, [result.rings])

  const earlyRate = useMemo(() => {
    if (result.rings.length < 5) return 0
    const first5 = result.rings.slice(0, 5)
    return parseFloat((first5.reduce((a, r) => a + r.widthPx, 0) / 5).toFixed(1))
  }, [result.rings])

  return (
    <div className="border border-border bg-background flex flex-col relative w-full">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent z-20 pointer-events-none" />

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
          <div className="relative w-full h-full border-l border-b border-border">
            {/* Y-Axis Grid */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ top: 0, bottom: 0, left: 0, transform: 'translateY(1px)' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute w-full" style={{ top: `${i * 25}%` }}>
                  <div className="border-t border-dashed border-border/40 w-full" />
                  <span className="absolute -left-7 -top-[6px] text-[8px] font-mono text-muted-foreground/80 w-6 text-right bg-background">
                    {Math.round(maxCumulative - (maxCumulative / 4) * i)}
                  </span>
                </div>
              ))}
            </div>

            {/* Y-Axis Label */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[9px] font-mono tracking-[2px] text-muted-foreground pointer-events-none uppercase">
              CUMULATIVE (PX)
            </div>

            {/* SVG Line */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {/* Filled area under curve */}
              <polygon
                fill="rgba(234, 88, 12, 0.08)"
                points={[
                  '0%,100%',
                  ...cumulativeData.map((d, i) =>
                    `${(i / (cumulativeData.length - 1)) * 100}%,${100 - (d.cumulative / maxCumulative) * 100}%`
                  ),
                  '100%,100%'
                ].join(' ')}
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke="#ea580c"
                strokeWidth="2"
                strokeLinejoin="round"
                points={cumulativeData.map((d, i) =>
                  `${(i / (cumulativeData.length - 1)) * 100}%,${100 - (d.cumulative / maxCumulative) * 100}%`
                ).join(' ')}
              />
              {/* Data points */}
              {cumulativeData.map((d, i) => (
                <rect
                  key={d.ringId}
                  x={`${(i / (cumulativeData.length - 1)) * 100}%`}
                  y={`${100 - (d.cumulative / maxCumulative) * 100}%`}
                  width="4" height="4" fill={selectedRing === d.ringId ? '#ffffff' : '#ea580c'}
                  transform="translate(-2, -2)"
                  className="cursor-pointer"
                  onClick={() => onSelectRing(selectedRing === d.ringId ? null : d.ringId)}
                />
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between px-8 py-2 border-t border-border/50 bg-surface/30">
        <span className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground/60">INNERMOST</span>
        <span className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground/60">OUTERMOST</span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
        {[
          { label: "TOTAL GROWTH", value: `${totalGrowth}px` },
          { label: "RECENT 5yr RATE", value: `${recentRate} px/yr` },
          { label: "EARLY 5yr RATE", value: `${earlyRate} px/yr` },
        ].map((s) => (
          <div key={s.label} className="flex flex-col p-3 bg-surface/50 justify-center">
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground">
              {s.label}
            </span>
            <span className="font-mono text-sm font-bold text-foreground mt-1">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
