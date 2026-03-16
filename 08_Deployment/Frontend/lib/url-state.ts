import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { HistoryFilters } from "./history-filters"
import { SortDirection, SortField } from "./history-sort"

export function useHistoryUrlState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setUrlState = useCallback(
    (updates: {
      viewMode?: string
      sortBy?: SortField
      sortDir?: SortDirection
      filters?: Partial<HistoryFilters>
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.viewMode) {
        params.set("view", updates.viewMode)
      }

      if (updates.sortBy) {
        params.set("sort", updates.sortBy)
      }

      if (updates.sortDir) {
        params.set("dir", updates.sortDir)
      }

      if (updates.filters) {
        const f = updates.filters
        if (f.searchQuery !== undefined) {
          if (f.searchQuery) params.set("q", f.searchQuery)
          else params.delete("q")
        }
        if (f.statusFilter !== undefined) {
          if (f.statusFilter.length > 0) params.set("status", f.statusFilter.join(","))
          else params.delete("status")
        }
        if (f.confidenceFilter !== undefined) {
          if (f.confidenceFilter.length > 0) params.set("confidence", f.confidenceFilter.join(","))
          else params.delete("confidence")
        }
        if (f.tagFilter !== undefined) {
          if (f.tagFilter.length > 0) params.set("tags", f.tagFilter.join(","))
          else params.delete("tags")
        }
        // Additional filters can be mapped as needed
      }

      // Shallow routing to update URL without full page reload
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return { searchParams, setUrlState }
}
