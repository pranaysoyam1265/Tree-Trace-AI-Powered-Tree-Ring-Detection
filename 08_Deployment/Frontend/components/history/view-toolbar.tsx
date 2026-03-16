"use client"

import { cn } from "@/lib/utils"
import { Grid, List, Clock, ChevronDown } from "lucide-react"
import { SortDirection, SortField } from "@/lib/history-sort"

export type ViewMode = 'grid' | 'table' | 'timeline'

interface ViewToolbarProps {
  viewMode: ViewMode
  onViewChange: (v: ViewMode) => void
  sortBy: SortField
  sortDir: SortDirection
  onSortChange: (f: SortField, d: SortDirection) => void

  totalItems: number
  selectedCount: number
  onSelectAll: (selected: boolean) => void
  isAllSelected: boolean
}

export function ViewToolbar({
  viewMode, onViewChange,
  sortBy, sortDir, onSortChange,
  totalItems, selectedCount,
  onSelectAll, isAllSelected
}: ViewToolbarProps) {

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-3 border border-border bg-background mb-4 sticky top-0 z-30 shadow-md">
      {/* Left side: Selection & Views */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center justify-center w-4 h-4 border border-border bg-surface group-hover:border-accent">
            <input
              type="checkbox"
              className="absolute opacity-0 w-full h-full cursor-pointer"
              checked={isAllSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
            {isAllSelected && <div className="w-2 h-2 bg-accent" />}
          </div>
          <span className="font-mono text-xs uppercase tracking-[1px] text-muted-foreground group-hover:text-foreground">
            SELECT ALL
          </span>
        </label>

        <div className="hidden sm:block w-px h-6 bg-border" />

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground mr-1">VIEW:</span>

          <button
            onClick={() => onViewChange('grid')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-[1px] border transition-colors",
              viewMode === 'grid'
                ? "border-accent bg-accent/10 text-accent"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Grid className="h-3.5 w-3.5" /> GRID
          </button>

          <button
            onClick={() => onViewChange('table')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-[1px] border transition-colors",
              viewMode === 'table'
                ? "border-accent bg-accent/10 text-accent"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" /> TABLE
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-[1px] border transition-colors",
              viewMode === 'timeline'
                ? "border-accent bg-accent/10 text-accent"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5" /> TIMELINE
          </button>
        </div>
      </div>

      {/* Right side: Sort, Stats & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 xl:gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">SORT:</span>
          <select
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 font-mono text-xs uppercase tracking-[1px] border border-border bg-surface text-foreground focus:outline-none focus:border-accent appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%20fill%3D%22none%22%20stroke%3D%22%23888888%22%20stroke-width%3D%222%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[position:right_8px_center] bg-no-repeat"
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split('-') as [SortField, SortDirection]
              onSortChange(f, d)
            }}
          >
            <option value="date-desc">DATE (NEWEST)</option>
            <option value="date-asc">DATE (OLDEST)</option>
            <option value="rings-desc">RINGS (HIGH-LOW)</option>
            <option value="rings-asc">RINGS (LOW-HIGH)</option>
            <option value="f1-desc">F1 SCORE (HIGH-LOW)</option>
            <option value="time-asc">PROCESSING TIME</option>
            <option value="name-asc">NAME (A-Z)</option>
          </select>
        </div>

        <div className="hidden sm:block w-px h-6 bg-border" />

        <div className="font-mono text-xs uppercase tracking-[1px]">
          {selectedCount > 0 ? (
            <span className="text-accent font-bold">{selectedCount} SELECTED</span>
          ) : (
            <span className="text-muted-foreground">SHOWING: {totalItems}</span>
          )}
        </div>

        <div className="hidden sm:block w-px h-6 bg-border" />

        <button
          disabled={selectedCount === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[1px] transition-colors",
            selectedCount > 0
              ? "bg-accent text-white border border-accent hover:bg-transparent hover:text-accent"
              : "bg-surface text-muted-foreground/50 border border-border cursor-not-allowed"
          )}
        >
          [BULK ACTIONS <ChevronDown className="h-3 w-3 inline" />]
        </button>
      </div>
    </div>
  )
}
