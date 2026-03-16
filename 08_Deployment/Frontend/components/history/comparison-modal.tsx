"use client"

import { AnalysisRecord } from "@/lib/mock-history"
import { X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComparisonModalProps {
  records: AnalysisRecord[]
  isOpen: boolean
  onClose: () => void
}

export function ComparisonModal({ records, isOpen, onClose }: ComparisonModalProps) {
  if (!isOpen || records.length === 0) return null

  const colors = ["#ea580c", "#22c55e", "#3b82f6", "#eab308", "#a855f7"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-6xl h-full max-h-[900px] border-2 border-accent bg-[#0a0a0a] shadow-[0_0_100px_rgba(234,88,12,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-border/50 bg-[#141414] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl uppercase tracking-[2px] text-white">
              // PATTERN_COMPARISON
            </span>
            <span className="font-mono text-sm text-accent tracking-[1px] hidden md:inline">
              ── {records.length} SPECIMENS
            </span>
          </div>
          <button onClick={onClose} className="p-2 border border-border bg-surface hover:border-accent hover:text-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 dot-grid-bg">

          {/* Main Chart Area */}
          <div className="w-full h-[400px] border border-border bg-surface/50 mb-8 relative p-6 flex flex-col">
            <span className="font-mono text-xs uppercase tracking-[2px] text-muted-foreground mb-4">
              [RING WIDTH PROFILE / CROSS-DATING]
            </span>
            <div className="flex-1 w-full border-l border-b border-border/50 relative flex items-end px-2 pb-2">
              {/* Fake grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

              {/* Fake chart lines representing widths */}
              {records.map((record, i) => (
                <div key={record.id} className="absolute bottom-0 left-0 w-full h-full flex items-end pointer-events-none">
                  {/* Just drawing dummy zigzags for the mockup using SVG */}
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    <polyline
                      points={record.ringWidths.map((w, index) => `${(index / (record.ringCount || 1)) * 100}%, ${(1 - (w / 30)) * 100}%`).join(" ")}
                      fill="none"
                      stroke={colors[i]}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-80"
                    />
                  </svg>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute top-6 right-6 flex flex-col gap-2 bg-[#0a0a0a] border border-border p-3">
              {records.map((record, i) => (
                <div key={record.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i] }} />
                  <span className="font-mono text-xs text-foreground uppercase tracking-[1px] truncate w-32">{record.imageName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thumbnails Comparison */}
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs uppercase tracking-[2px] text-accent border-b border-border/50 pb-2">
                // VISUAL_REFERENCE
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map((record, i) => (
                  <div key={record.id} className="flex flex-col gap-2 group cursor-pointer relative" onClick={() => window.location.href = `/results/${record.id}`}>
                    <div className="absolute -left-2 top-0 bottom-0 w-1" style={{ backgroundColor: colors[i] }} />
                    <div className="relative aspect-square border border-border bg-surface overflow-hidden group-hover:border-accent/50 transition-colors">
                      <div className="absolute inset-0 bg-[url('/sample-core.jpg')] bg-cover bg-center mix-blend-luminosity opacity-40 group-hover:opacity-70 transition-opacity" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground group-hover:text-white truncate">{record.imageName}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlation Matrix */}
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs uppercase tracking-[2px] text-accent border-b border-border/50 pb-2">
                // PEARSON_CORRELATION
              </span>
              <div className="w-full overflow-x-auto border border-border bg-surface/30">
                <table className="w-full text-center font-mono text-[10px] md:text-xs">
                  <thead className="bg-surface border-b border-border text-muted-foreground">
                    <tr>
                      <th className="p-2 border-r border-border min-w-[60px]" />
                      {records.map((r, i) => (
                        <th key={r.id} className="p-2 border-r border-border truncate max-w-[80px]" style={{ color: colors[i] }}>{r.imageName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r1, i) => (
                      <tr key={r1.id} className="border-b border-border/50">
                        <th className="p-2 border-r border-border bg-surface text-muted-foreground text-left max-w-[80px] truncate" style={{ borderLeftColor: colors[i], borderLeftWidth: '2px' }}>
                          {r1.imageName}
                        </th>
                        {records.map((r2, j) => {
                          const val = i === j ? 1.00 : 0.35 + (Math.random() * 0.5)
                          const isHigh = val > 0.70 && i !== j
                          return (
                            <td key={r2.id} className={cn(
                              "p-2 border-r border-border/50",
                              isHigh ? "text-status-success font-bold bg-status-success/10" : "text-foreground"
                            )}>
                              {val.toFixed(2)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed mt-2 border-l-2 border-accent/50 pl-3">
                Correlation &gt; 0.7 suggests strong cross-dating likelihood. Specimens sharing high environmental overlap may originate from identical geographic coordinates or micro-climates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
