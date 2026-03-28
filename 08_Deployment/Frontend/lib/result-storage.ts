/* ═══════════════════════════════════════════════════════════════════
   RESULT STORAGE
   localStorage caching layer for analysis results.
   Results page loads instantly from cache after analysis completes;
   falls back to API if cache miss (direct URL nav / page refresh).
   ═══════════════════════════════════════════════════════════════════ */

import type { AnalysisResult, AnalysisResultSummary } from "./types"

const HISTORY_INDEX_KEY = "treetrace_history_index"
const RESULT_PREFIX = "treetrace_result_"

/** Save a full analysis result after API returns it */
export function cacheResult(result: AnalysisResult): void {
  try {
    // Strip large base64 fields before caching — they can be 15-20MB
    // and localStorage has a 5MB limit. The overlay can be re-fetched from the API.
    const { overlay_image_base64, ...cacheable } = result as AnalysisResult & { overlay_image_base64?: string }
    localStorage.setItem(`${RESULT_PREFIX}${result.id}`, JSON.stringify(cacheable))
  } catch {
    console.warn("localStorage quota exceeded, result not cached")
  }

  const index = getHistoryIndex()
  const summary: AnalysisResultSummary = {
    id: result.id,
    image_name: result.image_name,
    ring_count: result.ring_count,
    estimated_age: result.estimated_age,
    health_score: result.health.score,
    health_label: result.health.label,
    f1_score: result.metrics?.f1_score ?? null,
    processing_time_seconds: result.processing_time_seconds,
    analyzed_at: result.analyzed_at,
  }

  const filtered = index.filter((item) => item.id !== result.id)
  filtered.unshift(summary)
  localStorage.setItem(HISTORY_INDEX_KEY, JSON.stringify(filtered))
}

/** Load a cached full result by ID (null if not cached) */
export function getCachedResult(id: string): AnalysisResult | null {
  try {
    const cached = localStorage.getItem(`${RESULT_PREFIX}${id}`)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

/** Get the history index (summary list for /history page) */
export function getHistoryIndex(): AnalysisResultSummary[] {
  try {
    const stored = localStorage.getItem(HISTORY_INDEX_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/** Delete a result from localStorage and the history index */
export function deleteFromCache(id: string): void {
  localStorage.removeItem(`${RESULT_PREFIX}${id}`)
  const index = getHistoryIndex().filter((item) => item.id !== id)
  localStorage.setItem(HISTORY_INDEX_KEY, JSON.stringify(index))
}

/** Clear all cached results (used by settings "Clear All Data" button) */
export function clearAllCachedResults(): void {
  const index = getHistoryIndex()
  index.forEach((item) => {
    localStorage.removeItem(`${RESULT_PREFIX}${item.id}`)
  })
  localStorage.removeItem(HISTORY_INDEX_KEY)
}
