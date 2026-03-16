"use client"

import { AnalysisRecord } from "@/lib/mock-history"
import { TimelineEntry } from "./timeline-entry"

interface TimelineViewProps {
  records: AnalysisRecord[]
  selectedIds: Set<string>
  onToggleSelection: (id: string) => void
  onPreviewOpen: (id: string) => void
}

export function TimelineView({ records, selectedIds, onToggleSelection, onPreviewOpen }: TimelineViewProps) {
  if (records.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-24 border border-dashed border-border/50 bg-background/50">
        <span className="font-mono text-sm uppercase tracking-[2px] text-muted-foreground mb-2">
          {"// NO MATCHING RECORDS"}
        </span>
      </div>
    )
  }

  // Group records by Date (local date string)
  const groupedByDate: Record<string, AnalysisRecord[]> = {}

  records.forEach(r => {
    // "Today", "Yesterday", or "Jan 15"
    const dateObj = new Date(r.analyzedAt)
    dateObj.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let dateKey = ''
    if (dateObj.getTime() === today.getTime()) {
      dateKey = 'TODAY'
    } else if (dateObj.getTime() === yesterday.getTime()) {
      dateKey = 'YESTERDAY'
    } else {
      dateKey = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    }

    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = []
    groupedByDate[dateKey].push(r)
  })

  return (
    <div className="w-full max-w-4xl mx-auto pl-4 md:pl-0 pb-24">
      <div className="relative border-l-2 border-accent/20 pl-6 space-y-12">
        {Object.entries(groupedByDate).map(([dateLabel, dateRecords]) => (
          <div key={dateLabel} className="relative">
            {/* Date Header string crossing the line */}
            <div className="absolute -left-[30px] top-6 bg-background px-2 text-accent">
              <span className="font-mono text-xs uppercase tracking-[3px] font-bold shadow-[0_0_10px_10px_var(--bg-void)] bg-background">
                {dateLabel}
              </span>
            </div>

            <div className="pt-16 space-y-6">
              {dateRecords.map(record => (
                <TimelineEntry
                  key={record.id}
                  record={record}
                  isSelected={selectedIds.has(record.id)}
                  onToggleSelection={() => onToggleSelection(record.id)}
                  onPreviewOpen={() => onPreviewOpen(record.id)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="pt-8">
          <button className="flex items-center gap-2 border border-border bg-surface px-6 py-2 font-mono text-xs uppercase tracking-[2px] hover:border-accent hover:text-accent transition-colors mx-auto -ml-[30px] md:ml-0">
            [LOAD MORE ▼]
          </button>
        </div>
      </div>
    </div>
  )
}
