"use client"

import { AnalysisRecord } from "@/lib/mock-history"
import { TableRow } from "./table-row"

interface TableViewProps {
  records: AnalysisRecord[]
  selectedIds: Set<string>
  onToggleSelection: (id: string, shiftKey: boolean) => void
  onPreviewOpen: (id: string) => void
  onSortToggle: (field: string) => void
  sortBy: string
  sortDir: 'asc' | 'desc'
  isAllSelected: boolean
  onSelectAll: (selected: boolean) => void
}

export function TableView({
  records, selectedIds, onToggleSelection, onPreviewOpen,
  onSortToggle, sortBy, sortDir, isAllSelected, onSelectAll
}: TableViewProps) {

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

  const SortIndicator = ({ field }: { field: string }) => {
    if (sortBy !== field) return null
    return <span className="ml-1 text-accent">{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  return (
    <div className="w-full overflow-x-auto border border-border bg-background pb-20">
      <table className="w-full text-left font-mono">
        <thead className="bg-surface sticky top-0 z-20 border-b border-border text-[10px] uppercase tracking-[2px] text-muted-foreground">
          <tr>
            <th className="px-3 py-3 w-10 text-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 cursor-pointer hover:text-accent" onClick={() => onSortToggle('name')}>
              SPECIMEN <SortIndicator field="name" />
            </th>
            <th className="px-4 py-3 cursor-pointer hover:text-accent" onClick={() => onSortToggle('rings')}>
              RINGS <SortIndicator field="rings" />
            </th>
            <th className="px-4 py-3 hidden md:table-cell cursor-pointer hover:text-accent" onClick={() => onSortToggle('f1')}>
              F1 SCORE <SortIndicator field="f1" />
            </th>
            <th className="px-4 py-3 hidden lg:table-cell">
              AVG WIDTH
            </th>
            <th className="px-4 py-3 cursor-pointer hover:text-accent" onClick={() => onSortToggle('time')}>
              TIME <SortIndicator field="time" />
            </th>
            <th className="px-4 py-3 cursor-pointer hover:text-accent" onClick={() => onSortToggle('date')}>
              DATE <SortIndicator field="date" />
            </th>
            <th className="px-4 py-3 hidden xl:table-cell">TAGS</th>
            <th className="px-4 py-3 text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {records.map(record => (
            <TableRow
              key={record.id}
              record={record}
              isSelected={selectedIds.has(record.id)}
              onToggleSelection={(shiftKey) => onToggleSelection(record.id, shiftKey)}
              onPreviewOpen={() => onPreviewOpen(record.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
