"use client"

import type { AnalysisResult, GrowthAnomaly } from "@/lib/mock-results"

interface Props {
  result: AnalysisResult
}

function AnomalyEntry({ anomaly }: { anomaly: GrowthAnomaly }) {
  const isStress = anomaly.type === 'stress'
  const arrowColor = isStress ? '#ef4444' : '#22c55e'
  const arrow = isStress ? '▼' : '▲'

  const severityColor = (() => {
    switch (anomaly.severity) {
      case 'severe': return '#ef4444'
      case 'moderate': return '#eab308'
      case 'mild': return '#a3a3a3'
      case 'exceptional': return '#22c55e'
      case 'above_average': return '#4ade80'
      default: return '#a3a3a3'
    }
  })()

  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <div className="flex items-center gap-3 font-mono text-sm">
        <span style={{ color: arrowColor }} className="font-bold">{arrow}</span>
        <span className="font-bold text-white tabular-nums w-12">{anomaly.year}</span>
        <span className="tabular-nums text-muted-foreground w-10">{anomaly.rwi}</span>
        <span className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: severityColor }}>
          {anomaly.severity.replace('_', ' ')}
        </span>
      </div>
      {anomaly.description && (
        <span className="font-mono text-[10px] text-muted-foreground ml-7 pl-1">
          &ldquo;{anomaly.description}&rdquo;
        </span>
      )}
    </div>
  )
}

export function AnomalyPanel({ result }: Props) {
  const stressEvents = result.anomalies.filter(a => a.type === 'stress')
  const favorableEvents = result.anomalies.filter(a => a.type === 'favorable')
  const totalAnoms = result.anomalies.length

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
          [GROWTH_ANOMALIES]
        </span>
      </div>

      <div className="max-h-[320px] overflow-y-auto scrollbar-brutal">
        <div className="px-4 py-3 flex flex-col">
          {/* Stress Years */}
          {stressEvents.length > 0 && (
            <>
              <span className="font-mono text-[10px] uppercase tracking-[2px] text-status-error font-bold mb-1">
                STRESS YEARS:
              </span>
              <div className="border-t border-border/50 pt-1 flex flex-col">
                {stressEvents.map((a, i) => <AnomalyEntry key={`s-${i}`} anomaly={a} />)}
              </div>
            </>
          )}

          {/* Favorable Years */}
          {favorableEvents.length > 0 && (
            <>
              <span className="font-mono text-[10px] uppercase tracking-[2px] text-status-success font-bold mt-4 mb-1">
                FAVORABLE YEARS:
              </span>
              <div className="border-t border-border/50 pt-1 flex flex-col">
                {favorableEvents.map((a, i) => <AnomalyEntry key={`f-${i}`} anomaly={a} />)}
              </div>
            </>
          )}

          {totalAnoms === 0 && (
            <p className="font-mono text-xs text-muted-foreground py-4 text-center uppercase">
              No significant anomalies detected.
            </p>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="border-t border-border bg-surface px-4 py-2 flex flex-col gap-0.5">
        <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">
          {totalAnoms} ANOMALIES IN {result.ringCount} YEARS
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">
          {stressEvents.length} STRESS │ {favorableEvents.length} FAVORABLE
        </span>
      </div>
    </div>
  )
}
