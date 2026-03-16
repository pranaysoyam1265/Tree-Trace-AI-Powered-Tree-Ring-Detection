"use client"

import { AnalysisRecord } from "@/lib/mock-history"
import { cn } from "@/lib/utils"
import { ChevronRight, MoreHorizontal, AlertTriangle } from "lucide-react"

interface TableRowProps {
  record: AnalysisRecord
  isSelected: boolean
  onToggleSelection: (shiftKey: boolean) => void
  onPreviewOpen: () => void
}

export function TableRow({ record, isSelected, onToggleSelection, onPreviewOpen }: TableRowProps) {
  return (
    <tr
      className={cn(
        "group transition-colors cursor-pointer text-xs md:text-sm",
        isSelected ? "bg-accent/[0.05]" : "hover:bg-surface/50"
      )}
      onClick={onPreviewOpen}
    >
      <td className="px-3 py-3 text-center border-l-2 transition-colors relative" style={{ borderLeftColor: isSelected ? 'var(--accent)' : 'transparent' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            // @ts-ignore - React synthetic events have nativeEvent for shiftKey
            onToggleSelection(e.nativeEvent ? e.nativeEvent.shiftKey : false)
          }}
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer relative z-10"
        />
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5 max-w-[200px] md:max-w-xs">
          <div className="flex items-center gap-2">
            {record.status === 'failed' && <AlertTriangle className="w-3 h-3 text-status-error" />}
            {record.status === 'processing' && <div className="w-2 h-2 bg-accent animate-pulse rounded-full" />}
            {record.status === 'completed' && <div className="w-2 h-2 border border-accent bg-accent/20 rounded-full" />}
            <span className={cn(
              "font-mono uppercase truncate",
              record.status === 'failed' ? "text-status-error" : "text-foreground group-hover:text-accent transition-colors"
            )}>
              {record.imageName}
            </span>
          </div>
          {record.alias && (
            <span className="font-mono text-[10px] text-muted-foreground truncate pl-4">
              "{record.alias}"
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3 font-mono">
        {record.ringCount !== null ? (
          <span className="text-accent">{record.ringCount}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>

      <td className="px-4 py-3 hidden md:table-cell font-mono">
        {record.f1Score !== null ? (
          <span className={cn(
            record.f1Score > 0.85 ? "text-status-success" :
              record.f1Score > 0.65 ? "text-status-warning" : "text-status-error"
          )}>
            {record.f1Score.toFixed(2)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>

      <td className="px-4 py-3 hidden lg:table-cell font-mono text-muted-foreground">
        {record.averageRingWidth !== null ? `${record.averageRingWidth}px` : "—"}
      </td>

      <td className="px-4 py-3 font-mono text-muted-foreground">
        {record.processingTime ? `${record.processingTime}s` : "—"}
      </td>

      <td className="px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground whitespace-nowrap">
        {new Date(record.analyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </td>

      <td className="px-4 py-3 hidden xl:table-cell">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {record.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-1.5 py-px border border-border/50 bg-surface/50 font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground truncate max-w-[80px]">
              {tag}
            </span>
          ))}
          {record.tags.length > 2 && (
            <span className="px-1 py-px font-mono text-[9px] text-muted-foreground">+{record.tags.length - 2}</span>
          )}
        </div>
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            className="flex items-center justify-center w-6 h-6 border border-border bg-surface text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `/results/${record.id}`
            }}
          >
            <ChevronRight className="w-3 h-3" />
          </button>
          <button
            className="flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
