"use client"

import { useState, useMemo, useEffect } from "react"
import { MOCK_HISTORY, AnalysisRecord } from "@/lib/mock-history"
import { filterHistoryData, HistoryFilters } from "@/lib/history-filters"
import { sortHistoryIndex, SortField, SortDirection } from "@/lib/history-sort"
import { useHistoryUrlState } from "@/lib/url-state"

import { Navigation } from "@/components/ascii-hub/navigation"
import { HistoryHeader } from "@/components/history/history-header"
import { StatsSummary } from "@/components/history/stats-summary"
import { SearchFilterBar } from "@/components/history/search-filter-bar"
import { ActiveFilters } from "@/components/history/active-filters"
import { ViewToolbar, ViewMode } from "@/components/history/view-toolbar"

import { GridView } from "@/components/history/views/grid-view"
import { TableView } from "@/components/history/views/table-view"
import { TimelineView } from "@/components/history/views/timeline-view"

import { QuickPreview } from "@/components/history/quick-preview"
import { ComparisonModal } from "@/components/history/comparison-modal"

import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"

import { Suspense } from "react"

const DEFAULT_FILTERS: HistoryFilters = {
  searchQuery: "",
  statusFilter: [],
  dateRange: { from: null, to: null, preset: "all" },
  ringCountRange: { min: null, max: null },
  confidenceFilter: [],
  tagFilter: [],
  typeFilter: []
}

function HistoryContent() {
  const { searchParams, setUrlState } = useHistoryUrlState()

  // Initialize state from URL or defaults
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get("view") as ViewMode) || 'grid')
  const [sortBy, setSortBy] = useState<SortField>((searchParams.get("sort") as SortField) || 'date')
  const [sortDir, setSortDir] = useState<SortDirection>((searchParams.get("dir") as SortDirection) || 'desc')

  const [filters, setFilters] = useState<HistoryFilters>(() => {
    const q = searchParams.get("q") || ""
    const status = searchParams.get("status")?.split(",") || []
    return { ...DEFAULT_FILTERS, searchQuery: q, statusFilter: status as any }
  })

  // Selection & Interactivity State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [comparisonOpen, setComparisonOpen] = useState(false)

  // Derived Data
  const filteredData = useMemo(() => filterHistoryData(MOCK_HISTORY, filters), [filters])
  const sortedData = useMemo(() => sortHistoryIndex(filteredData, sortBy, sortDir), [filteredData, sortBy, sortDir])
  const isAllSelected = sortedData.length > 0 && selectedIds.size === sortedData.length

  // Handlers
  const handleViewChange = (v: ViewMode) => {
    setViewMode(v)
    setUrlState({ viewMode: v })
  }

  const handleSortChange = (f: SortField, d: SortDirection) => {
    setSortBy(f)
    setSortDir(d)
    setUrlState({ sortBy: f, sortDir: d })
  }

  const handleFilterChange = (newFilters: HistoryFilters) => {
    setFilters(newFilters)
    setUrlState({ filters: newFilters })
    // Clear selections when filters change heavily? Optional. Let's keep them if they're still in view.
  }

  const toggleSelection = (id: string, shiftKey: boolean = false) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const selectAll = (select: boolean) => {
    if (select) setSelectedIds(new Set(sortedData.map(r => r.id)))
    else setSelectedIds(new Set())
  }

  const handleBulkAction = () => {
    // Dummy check for Comparison
    if (selectedIds.size >= 2 && selectedIds.size <= 5) {
      setComparisonOpen(true)
    } else {
      alert("Select between 2 and 5 specimens to compare.")
    }
  }

  // Keyboard Navigation
  useKeyboardShortcuts([
    { key: "g", onKeyDown: () => handleViewChange('grid') },
    { key: "t", onKeyDown: () => handleViewChange('table') },
    { key: "l", onKeyDown: () => handleViewChange('timeline') },
    { key: "Escape", onKeyDown: () => { setPreviewId(null); setComparisonOpen(false); setSelectedIds(new Set()) } },
    { key: "c", onKeyDown: () => handleBulkAction() }
  ])

  // Get active preview record
  const previewRecord = previewId ? MOCK_HISTORY.find(r => r.id === previewId) || null : null
  const comparisonRecords = MOCK_HISTORY.filter(r => selectedIds.has(r.id))

  return (
    <div className="min-h-screen bg-background dot-grid-bg text-foreground flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 xl:px-12 pt-28 pb-32">

        {/* Top Header */}
        <HistoryHeader
          filteredCount={sortedData.length}
          totalCount={MOCK_HISTORY.length}
          lastUpdated="JUST NOW"
        />

        {/* Global Stats */}
        <StatsSummary
          records={filteredData}
          totalRecords={MOCK_HISTORY.length}
        />

        {/* Search & Filters */}
        <div className="sticky top-16 z-30 bg-[var(--bg-void)] pt-2 pb-1">
          <SearchFilterBar
            filters={filters}
            onChange={handleFilterChange}
          />
          <ActiveFilters
            filters={filters}
            onChange={handleFilterChange}
          />

          {/* View Toolbar */}
          <ViewToolbar
            viewMode={viewMode}
            onViewChange={handleViewChange}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            totalItems={sortedData.length}
            selectedCount={selectedIds.size}
            onSelectAll={selectAll}
            isAllSelected={isAllSelected}
          />

          {/* Dummy bulk action trigger if user clicked "Bulk Actions" */}
          {selectedIds.size > 0 && (
            <div className="w-full flex justify-end mb-4">
              <button
                onClick={handleBulkAction}
                className="border border-accent bg-accent/10 px-4 py-2 text-accent font-mono text-xs font-bold tracking-[1px] hover:bg-accent hover:text-white transition-colors"
              >
                [COMPARE SELECTED PATTERNS]
              </button>
            </div>
          )}
        </div>

        {/* Render Active View */}
        <div className="mt-6">
          {viewMode === 'grid' && (
            <GridView
              records={sortedData}
              selectedIds={selectedIds}
              onToggleSelection={(id) => toggleSelection(id)}
              onPreviewOpen={setPreviewId}
            />
          )}

          {viewMode === 'table' && (
            <TableView
              records={sortedData}
              selectedIds={selectedIds}
              isAllSelected={isAllSelected}
              onSelectAll={selectAll}
              onToggleSelection={(id, shiftKey) => toggleSelection(id, shiftKey)}
              onPreviewOpen={setPreviewId}
              onSortToggle={(field) => {
                if (sortBy === field) handleSortChange(field as SortField, sortDir === 'asc' ? 'desc' : 'asc')
                else handleSortChange(field as SortField, 'desc')
              }}
              sortBy={sortBy}
              sortDir={sortDir}
            />
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              records={sortedData}
              selectedIds={selectedIds}
              onToggleSelection={(id) => toggleSelection(id)}
              onPreviewOpen={setPreviewId}
            />
          )}
        </div>

        {/* Overlays */}
        <QuickPreview
          record={previewRecord}
          isOpen={!!previewId}
          onClose={() => setPreviewId(null)}
        />

        <ComparisonModal
          records={comparisonRecords}
          isOpen={comparisonOpen}
          onClose={() => setComparisonOpen(false)}
        />

      </main>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background dot-grid-bg text-foreground flex flex-col items-center justify-center font-mono">
        <span className="text-accent animate-pulse uppercase tracking-[2px]">[ LOADING_HISTORY_MODULE ]</span>
      </div>
    }>
      <HistoryContent />
    </Suspense>
  )
}
