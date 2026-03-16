"use client"

import { AnalysisRecord } from "@/lib/mock-history"
import { cn } from "@/lib/utils"
import { ChevronRight, AlertTriangle, Play } from "lucide-react"

interface TimelineEntryProps {
  record: AnalysisRecord
  isSelected: boolean
  onToggleSelection: () => void
  onPreviewOpen: () => void
}

export function TimelineEntry({ record, isSelected, onToggleSelection, onPreviewOpen }: TimelineEntryProps) {
  const timeStr = new Date(record.analyzedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="relative group pl-8">
      {/* Target Node joining line to rail */}
      <div className="absolute left-[-24px] top-4 w-6 h-[2px] bg-border transition-colors group-hover:bg-accent/50" />

      {/* Node Dot */}
      <div className={cn(
        "absolute left-[-29px] top-[14px] w-3 h-3 rounded-full border-2 transition-all duration-300 shadow-[0_0_0_4px_var(--bg-void)] z-10",
        record.status === 'completed' ? "border-status-success bg-status-success/20 group-hover:bg-status-success group-hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]" :
          record.status === 'failed' ? "border-status-error bg-status-error/20" :
            "border-accent bg-accent/20"
      )} />

      {/* Entry Card */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-center p-3 border border-border transition-all cursor-pointer relative overflow-hidden",
        isSelected ? "bg-accent/[0.05] border-accent" : "bg-surface hover:border-accent/50 hover:bg-surface/80"
      )} onClick={onPreviewOpen}>

        {/* Selection checkbox absolute top-left for desktop or flow for mobile */}
        <div className="absolute left-3 top-3 z-20 sm:relative sm:left-0 sm:top-0 sm:mr-4" onClick={e => e.stopPropagation()}>
          <div className={cn(
            "flex items-center justify-center w-4 h-4 border transition-colors",
            isSelected ? "border-accent bg-accent" : "border-border bg-background group-hover:border-accent/50"
          )}>
            <input
              type="checkbox"
              className="absolute opacity-0 w-full h-full cursor-pointer"
              checked={isSelected}
              onChange={onToggleSelection}
            />
            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
          </div>
        </div>

        <div className="ml-6 sm:ml-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-4 min-w-[200px]">
            <span className="font-mono text-[10px] text-muted-foreground w-12 shrink-0">{timeStr}</span>
            <div className="flex flex-col">
              <span className={cn(
                "font-mono text-sm uppercase tracking-[1px]",
                record.status === 'failed' ? "text-status-error" : "text-foreground group-hover:text-accent font-bold transition-colors"
              )}>
                {record.imageName}
              </span>
              {record.alias && (
                <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">
                  "{record.alias}"
                </span>
              )}
            </div>
          </div>

          {/* Stats Segment */}
          <div className="flex items-center gap-4 border-l border-border/50 pl-4">
            {record.status === 'completed' && record.ringCount !== null ? (
              <>
                <span className="font-mono text-xs"><span className="text-accent">{record.ringCount}</span> rings</span>
                <span className="text-muted-foreground text-[10px]">│</span>
                <span className="font-mono text-xs">{record.f1Score?.toFixed(2)} F1</span>
              </>
            ) : record.status === 'failed' ? (
              <span className="font-mono text-[10px] uppercase text-status-error flex items-center gap-1 max-w-[200px] truncate">
                <AlertTriangle className="w-3 h-3" /> {record.error}
              </span>
            ) : (
              <span className="font-mono text-xs uppercase text-accent animate-pulse tracking-[2px]">Processing...</span>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 border-l border-border/50 pl-4">
            {record.status === 'completed' ? (
              <button
                className="flex items-center gap-1 border border-border bg-background px-3 py-1 font-mono text-[10px] uppercase tracking-[1px] hover:border-accent hover:text-accent transition-colors shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  window.location.href = `/results/${record.id}`
                }}
              >
                RESULTS <ChevronRight className="w-3 h-3" />
              </button>
            ) : record.status === 'failed' ? (
              <button className="flex items-center gap-1 border border-status-error/50 bg-status-error/10 text-status-error px-3 py-1 font-mono text-[10px] uppercase tracking-[1px] hover:bg-status-error hover:text-white transition-colors shrink-0" onClick={e => e.stopPropagation()}>
                RETRY
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
