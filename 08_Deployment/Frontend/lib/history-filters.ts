import { AnalysisRecord } from "./mock-history"

export interface HistoryFilters {
  searchQuery: string
  statusFilter: AnalysisRecord['status'][]
  dateRange: { from: string | null; to: string | null; preset: string }
  ringCountRange: { min: number | null; max: number | null }
  confidenceFilter: ('high' | 'medium' | 'low')[]
  tagFilter: string[]
  typeFilter: ('single' | 'batch-member' | 'batch-group')[]
}

export function filterHistoryData(records: AnalysisRecord[], filters: HistoryFilters): AnalysisRecord[] {
  return records.filter(record => {
    // Search Query (name, alias, tags, notes, batchName)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      const searchStr = [
        record.imageName,
        record.alias || '',
        record.notes || '',
        record.batchName || '',
        ...(record.tags || [])
      ].join(' ').toLowerCase()

      if (!searchStr.includes(q)) return false
    }

    // Status Filter
    if (filters.statusFilter.length > 0) {
      if (!filters.statusFilter.includes(record.status)) return false
    }

    // Confidence Filter
    if (filters.confidenceFilter.length > 0) {
      // If record has no confidence (e.g. failed), we exclude it if a confidence filter is active
      if (!record.confidence || !filters.confidenceFilter.includes(record.confidence)) return false
    }

    // Tag Filter
    if (filters.tagFilter.length > 0) {
      // Must have at least one of the selected tags
      const hasTag = filters.tagFilter.some(t => record.tags.includes(t))
      if (!hasTag) return false
    }

    // Type filter
    if (filters.typeFilter.length > 0) {
      // 'batch-group' is a conceptual type we'll handle at the view level or by grouping batch members
      // For filtering standard records:
      if (!filters.typeFilter.includes(record.type) && !filters.typeFilter.includes('batch-group')) return false
    }

    // Ring Count Range
    if (filters.ringCountRange.min !== null && record.ringCount !== null && record.ringCount < filters.ringCountRange.min) {
      return false
    }
    if (filters.ringCountRange.max !== null && record.ringCount !== null && record.ringCount > filters.ringCountRange.max) {
      return false
    }

    // Date Range
    if (filters.dateRange.from) {
      if (new Date(record.analyzedAt) < new Date(filters.dateRange.from)) return false
    }
    if (filters.dateRange.to) {
      if (new Date(record.analyzedAt) > new Date(filters.dateRange.to)) return false
    }

    return true
  })
}
