"use client"

import { AnalysisRecord } from "@/lib/mock-history"
import { GridCard } from "./grid-card"

interface GridViewProps {
  records: AnalysisRecord[]
  selectedIds: Set<string>
  onToggleSelection: (id: string) => void
  onPreviewOpen: (id: string) => void
}

export function GridView({ records, selectedIds, onToggleSelection, onPreviewOpen }: GridViewProps) {
  if (records.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-24 border border-dashed border-border/50 bg-background/50">
        <span className="font-mono text-sm uppercase tracking-[2px] text-muted-foreground mb-2">
          {"// NO MATCHING RECORDS"}
        </span>
        <p className="font-mono text-xs text-muted-foreground/50 max-w-sm text-center">
          No analyses perfectly match the current multi-dimensional filter criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
      {records.map(record => (
        <GridCard
          key={record.id}
          record={record}
          isSelected={selectedIds.has(record.id)}
          onToggleSelection={() => onToggleSelection(record.id)}
          onPreviewOpen={() => onPreviewOpen(record.id)}
        />
      ))}
    </div>
  )
}
