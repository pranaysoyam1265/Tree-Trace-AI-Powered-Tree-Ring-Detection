"use client"

import { X } from "lucide-react"
import { HistoryFilters } from "@/lib/history-filters"

interface ActiveFiltersProps {
  filters: HistoryFilters
  onChange: (filters: HistoryFilters) => void
}

export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const activeCount =
    (filters.searchQuery ? 1 : 0) +
    filters.statusFilter.length +
    filters.confidenceFilter.length +
    filters.tagFilter.length +
    filters.typeFilter.length +
    (filters.ringCountRange.min !== null || filters.ringCountRange.max !== null ? 1 : 0)

  if (activeCount === 0) return null

  const clearAll = () => {
    onChange({
      searchQuery: "",
      statusFilter: [],
      dateRange: { from: null, to: null, preset: "all" },
      ringCountRange: { min: null, max: null },
      confidenceFilter: [],
      tagFilter: [],
      typeFilter: []
    })
  }

  const removeStatus = (status: any) => {
    onChange({
      ...filters,
      statusFilter: filters.statusFilter.filter(s => s !== status)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 border border-border bg-surface/50">
      <span className="font-mono text-xs uppercase tracking-[1px] text-muted-foreground mr-2">
        ACTIVE:
      </span>

      {filters.statusFilter.map(status => (
        <span key={status} className="flex items-center gap-2 px-2 py-1 bg-accent/10 border border-accent/30 text-accent font-mono text-xs uppercase tracking-[1px]">
          Status: {status}
          <button onClick={() => removeStatus(status)} className="hover:text-white"><X className="h-3 w-3" /></button>
        </span>
      ))}

      {/* Other filter pills would render here similarly... */}

      <div className="flex-1" />

      <span className="text-muted-foreground hidden sm:inline mr-2">──</span>
      <button
        onClick={clearAll}
        className="font-mono text-xs uppercase tracking-[1px] text-status-error hover:underline hover:text-red-400"
      >
        [CLEAR ALL FILTERS]
      </button>
    </div>
  )
}
