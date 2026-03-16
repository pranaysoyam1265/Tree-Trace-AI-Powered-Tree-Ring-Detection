"use client"

import type { AnalysisResult } from "@/lib/mock-results"

interface Props {
  result: AnalysisResult
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 bg-[#222222] border border-[#333333]">
      <div className="h-full transition-none" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  )
}

export function HealthScoreCard({ result }: Props) {
  const { health } = result
  const color = health.label === 'GOOD' ? '#22c55e' : health.label === 'FAIR' ? '#eab308' : '#ef4444'

  return (
    <div className="border border-border bg-background flex flex-col relative">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent z-20 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center border-b border-border bg-surface px-4 py-2">
        <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
          [SPECIMEN_HEALTH]
        </span>
      </div>

      {/* Score Display */}
      <div className="flex flex-col items-center py-6 gap-2">
        <span className="font-mono text-5xl font-bold text-white tabular-nums">{health.score}</span>
        <span className="font-mono text-sm font-bold uppercase tracking-[2px]" style={{ color }}>
          {health.label}
        </span>
        <div className="w-3/4 mt-2">
          <ScoreBar value={health.score} color={color} />
        </div>
      </div>

      {/* Separator */}
      <div className="mx-4 font-mono text-[10px] text-[#333333] select-none">
        ════════════════════════════════════
      </div>

      {/* Sub-factors */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {[
          { label: "CONSISTENCY", value: health.consistency },
          { label: "TREND", value: health.trend },
          { label: "RESILIENCE", value: health.resilience },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">{label}</span>
              <span className="font-mono text-xs font-bold text-foreground tabular-nums">{value}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#222222] border border-[#333333]">
              <div className="h-full bg-accent transition-none" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="mx-4 font-mono text-[10px] text-[#333333] select-none">
        ════════════════════════════════════
      </div>

      {/* Interpretation */}
      <div className="px-4 py-4">
        <p className="font-mono text-sm text-muted-foreground leading-relaxed">
          &ldquo;{health.interpretation}&rdquo;
        </p>
      </div>
    </div>
  )
}
