"use client"

import { Search, ChevronDown, Check, X } from "lucide-react"
import { HistoryFilters } from "@/lib/history-filters"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SearchFilterBarProps {
  filters: HistoryFilters
  onChange: (filters: HistoryFilters) => void
}

export function SearchFilterBar({ filters, onChange }: SearchFilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.searchQuery)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Status dropdown state
  const [statusOpen, setStatusOpen] = useState(false)

  // Date dropdown state
  const [dateOpen, setDateOpen] = useState(false)

  // Handle text search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchValue(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ ...filters, searchQuery: val })
    }, 300)
  }

  const clearSearch = () => {
    setSearchValue("")
    onChange({ ...filters, searchQuery: "" })
  }

  const toggleStatus = (status: any) => {
    const active = filters.statusFilter.includes(status)
    const newStatus = active
      ? filters.statusFilter.filter(s => s !== status)
      : [...filters.statusFilter, status]

    onChange({ ...filters, statusFilter: newStatus })
  }

  return (
    <div className="flex flex-col gap-3 w-full mb-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-grow h-10 border border-border bg-surface focus-within:border-accent transition-colors flex items-center">
          <div className="h-full px-3 flex items-center border-r border-border bg-background">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="h-full w-full bg-transparent px-3 font-mono text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
            placeholder="search_specimens: F02a, Pine, Batch..."
            value={searchValue}
            onChange={handleSearchChange}
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="h-full px-3 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="h-full flex items-center px-4 bg-accent/10 border-l border-border hover:bg-accent/20 cursor-pointer transition-colors"
            onClick={() => onChange({ ...filters, searchQuery: searchValue })}>
            <span className="font-mono text-xs uppercase text-accent font-bold tracking-[1px]">[⏎ SEARCH]</span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className={cn(
                "h-10 px-4 flex items-center gap-2 border border-border bg-surface font-mono text-xs uppercase tracking-[1px] hover:border-accent/50 transition-colors",
                filters.statusFilter.length > 0 && "border-accent text-accent",
                statusOpen && "border-accent"
              )}
            >
              [STATUS <ChevronDown className="h-3 w-3 inline" />]
            </button>

            {statusOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
                <div className="absolute top-12 left-0 w-48 border border-border bg-background shadow-2xl z-50 flex flex-col p-1 dot-grid-bg">
                  {['completed', 'processing', 'failed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className="flex items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-[1px] hover:bg-surface w-full"
                    >
                      <div className="w-4 h-4 border border-border flex items-center justify-center bg-background">
                        {filters.statusFilter.includes(status as any) && <Check className="h-3 w-3 text-accent" />}
                      </div>
                      <span className={status === 'failed' ? 'text-status-error' : status === 'completed' ? 'text-text-primary' : 'text-muted-foreground'}>
                        {status}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button className="h-10 px-4 flex items-center gap-2 border border-border bg-surface text-muted-foreground font-mono text-xs uppercase tracking-[1px] hover:border-border/80 transition-colors cursor-not-allowed opacity-50">
            [DATE <ChevronDown className="h-3 w-3 inline" />]
          </button>
          <button className="h-10 px-4 flex items-center gap-2 border border-border bg-surface text-muted-foreground font-mono text-xs uppercase tracking-[1px] hover:border-border/80 transition-colors cursor-not-allowed opacity-50">
            [TAGS <ChevronDown className="h-3 w-3 inline" />]
          </button>
        </div>
      </div>
    </div>
  )
}
