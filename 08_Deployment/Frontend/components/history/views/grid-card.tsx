"use client"

import { AnalysisRecord } from "@/lib/mock-history"
import { cn } from "@/lib/utils"
import { MoreHorizontal, AlertTriangle, Clock } from "lucide-react"

interface GridCardProps {
  record: AnalysisRecord
  isSelected: boolean
  onToggleSelection: () => void
  onPreviewOpen: () => void
}

export function GridCard({ record, isSelected, onToggleSelection, onPreviewOpen }: GridCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col border p-4 transition-all duration-200 ease-out",
        isSelected
          ? "border-accent bg-accent/[0.03] shadow-[4px_4px_0_0_rgba(234,88,12,0.2)]"
          : "border-border bg-background hover:bg-surface hover:-translate-y-1 hover:border-accent/40"
      )}
    >
      {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-accent" />}

      {/* Header: Checkbox & Menu */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 cursor-pointer z-10" onClick={(e) => e.stopPropagation()}>
          <div className={cn(
            "flex items-center justify-center w-4 h-4 border transition-colors",
            isSelected ? "border-accent bg-accent" : "border-border bg-surface group-hover:border-accent/50"
          )}>
            <input
              type="checkbox"
              className="absolute opacity-0 w-full h-full cursor-pointer"
              checked={isSelected}
              onChange={onToggleSelection}
            />
            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
          </div>
        </label>

        <button className="text-muted-foreground hover:text-accent transition-colors z-10" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnail */}
      <div
        className="relative aspect-square w-full mb-4 border border-border/50 bg-surface/50 overflow-hidden cursor-pointer group-hover:border-accent/30"
        onClick={onPreviewOpen}
      >
        <div className="absolute inset-0 bg-[url('/sample-core.jpg')] bg-cover bg-center mix-blend-luminosity opacity-40 group-hover:opacity-60 transition-opacity" />
        {record.overlayUrl && (
          <div className="absolute inset-0 bg-[url('/sample-core-overlay.png')] bg-cover bg-center opacity-70 group-hover:opacity-100 transition-opacity mix-blend-screen" />
        )}

        {/* Status Overlays */}
        {record.status === 'failed' && (
          <div className="absolute inset-0 bg-destructive/10 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-background/90 border border-destructive px-3 py-1 text-status-error font-mono text-xs uppercase tracking-[1px] flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> FAILED
            </div>
          </div>
        )}
        {record.status === 'processing' && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="font-mono text-xs text-accent animate-pulse uppercase tracking-[2px]">
              PROCESSING...
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 cursor-pointer" onClick={onPreviewOpen}>
        <h3 className="font-mono text-sm text-foreground uppercase tracking-[1px] truncate">
          {record.imageName}
        </h3>

        <p className="font-mono text-[10px] text-muted-foreground truncate h-4">
          {record.alias ? `"${record.alias}"` : ""}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-2 mt-3 h-8">
          {record.status === 'completed' && record.ringCount !== null && (
            <>
              <div className="px-2 py-1 border border-border bg-surface font-mono text-xs text-foreground">
                <span className="text-accent">{record.ringCount}</span> R
              </div>
              <div className="px-2 py-1 border border-border bg-surface font-mono text-xs flex items-center gap-1">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  record.confidence === 'high' ? "bg-status-success" :
                    record.confidence === 'medium' ? "bg-status-warning" : "bg-status-error"
                )} />
                <span className="text-muted-foreground uppercase">{record.confidence}</span>
              </div>
            </>
          )}

          {(record.status === 'completed' || record.status === 'failed') && record.processingTime && (
            <div className="px-2 py-1 border border-border bg-surface font-mono text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" /> {record.processingTime}s
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3 h-5 overflow-hidden">
          {record.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-px border border-border/50 bg-surface/50 font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground">
              [{tag}]
            </span>
          ))}
          {record.tags.length > 3 && (
            <span className="px-1.5 py-px font-mono text-[9px] text-muted-foreground">+{record.tags.length - 3}</span>
          )}
        </div>

        {/* Relative Time */}
        <div className="mt-4 pt-3 border-t border-border/50 text-center">
          <span className="font-mono text-[9px] uppercase tracking-[2px] text-muted-foreground/60">
            ── {new Date(record.analyzedAt).toLocaleDateString()} ──
          </span>
        </div>
      </div>
    </div>
  )
}
