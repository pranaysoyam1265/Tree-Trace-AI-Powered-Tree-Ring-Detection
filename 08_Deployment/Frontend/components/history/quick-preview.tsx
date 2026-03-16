"use client"

import { AnalysisRecord } from "@/lib/mock-history"
import { cn } from "@/lib/utils"
import { X, ChevronRight, Tag, Download, Trash2, Edit2 } from "lucide-react"

interface QuickPreviewProps {
  record: AnalysisRecord | null
  isOpen: boolean
  onClose: () => void
}

export function QuickPreview({ record, isOpen, onClose }: QuickPreviewProps) {
  if (!record) return null

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/20 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out lg:left-64 xl:px-[5%]",
          isOpen ? "translate-y-0" : "translate-y-full blur-md"
        )}
      >
        <div className="mx-auto w-full max-w-6xl border-t-2 border-l-2 border-r-2 border-accent bg-background shadow-[0_-20px_50px_-20px_rgba(234,88,12,0.1)]">

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="p-1 hover:bg-accent/20 hover:text-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs uppercase tracking-[2px] text-accent font-bold">
                ▼ PREVIEW: {record.imageName}
              </span>
            </div>
            {record.status === 'completed' && (
              <a
                href={`/results/${record.id}`}
                className="flex items-center gap-1 border border-accent bg-accent/10 px-3 py-1 font-mono text-xs uppercase tracking-[1px] text-accent hover:bg-accent hover:text-white transition-colors"
              >
                [FULL RESULTS] <ChevronRight className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] p-6 gap-8 relative overflow-hidden h-[60vh] md:h-[320px] overflow-y-auto dot-grid-bg">

            {/* Left: Huge visual */}
            <div className="flex flex-col gap-4">
              <div
                className="relative aspect-square w-full border border-border bg-surface overflow-hidden cursor-pointer group"
                onClick={() => { if (record.status === 'completed') window.location.href = `/results/${record.id}` }}
              >
                <div className="absolute inset-0 bg-[url('/sample-core.jpg')] bg-cover bg-center mix-blend-luminosity opacity-40 group-hover:opacity-60 transition-opacity" />
                {record.overlayUrl && (
                  <div className="absolute inset-0 bg-[url('/sample-core-overlay.png')] bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity mix-blend-screen" />
                )}
                <div className="absolute inset-0 border border-accent/0 group-hover:border-accent/50 transition-colors pointer-events-none" />
                {record.status === 'completed' && (
                  <div className="absolute bottom-2 right-2 bg-background/90 border border-border px-2 py-1 flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground group-hover:text-foreground">
                    CLICK FOR DETAILS <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Data & Actions */}
            <div className="flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 font-mono text-sm leading-relaxed">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">SPECIMEN:</span>
                    <span className="text-foreground font-bold">{record.imageName}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1 group cursor-pointer hover:border-accent/50">
                    <span className="text-muted-foreground">ALIAS:</span>
                    <span className="text-foreground group-hover:text-accent flex items-center gap-1">
                      {record.alias ? `"${record.alias}"` : "None"} <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">RINGS:</span>
                    <span className="text-accent">{record.ringCount ?? "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">AGE:</span>
                    <span className="text-foreground">{record.estimatedAge ? `~${record.estimatedAge} years` : "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">STATUS:</span>
                    <span className={cn(
                      "uppercase",
                      record.status === 'completed' ? "text-status-success" :
                        record.status === 'failed' ? "text-status-error" : "text-accent animate-pulse"
                    )}>{record.status}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">F1 SCORE:</span>
                    <span className={cn(
                      record.f1Score && record.f1Score > 0.85 ? "text-status-success" :
                        record.f1Score && record.f1Score > 0.65 ? "text-status-warning" : "text-status-error"
                    )}>{record.f1Score?.toFixed(2) ?? "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">PRECISION:</span>
                    <span className="text-foreground">{record.precision?.toFixed(2) ?? "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">RECALL:</span>
                    <span className="text-foreground">{record.recall?.toFixed(2) ?? "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">TIME:</span>
                    <span className="text-foreground">{record.processingTime ? `${record.processingTime}s` : "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1 group cursor-pointer hover:border-accent/50">
                    <span className="text-muted-foreground">TAGS:</span>
                    <span className="text-foreground flex flex-wrap gap-1 justify-end items-center group-hover:text-accent">
                      {record.tags.length > 0 ? record.tags.map(t => `[${t}]`).join(" ") : "None"}
                      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-border">
                {record.status === 'completed' && (
                  <button className="flex items-center gap-2 border border-border bg-surface px-4 py-2 font-mono text-xs uppercase tracking-[1px] text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                    <Download className="w-4 h-4" /> [EXPORT ▾]
                  </button>
                )}
                <button className="flex items-center gap-2 border border-border bg-surface px-4 py-2 font-mono text-xs uppercase tracking-[1px] text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                  <Tag className="w-4 h-4" /> [EDIT TAGS]
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-2 border border-status-error/30 bg-status-error/5 px-4 py-2 font-mono text-xs uppercase tracking-[1px] text-status-error hover:bg-status-error hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" /> [DELETE]
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
