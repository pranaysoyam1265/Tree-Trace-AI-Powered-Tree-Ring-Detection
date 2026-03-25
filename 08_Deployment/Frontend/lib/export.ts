/* ═══════════════════════════════════════════════════════════════════
   EXPORT UTILITIES
   CSV, JSON, and PNG export for ring analysis results.
   ═══════════════════════════════════════════════════════════════════ */

import type { AnalysisResult } from "./types"

export function exportCSV(result: AnalysisResult): void {
  const mode = result.preprocessing?.mode || "adaptive"
  const header = `Image: ${result.image_name}, Mode: ${mode.toUpperCase()}\nRing #,Inner Radius (px),Outer Radius (px),Width (px),Est. Year\n`
  const rows = result.rings
    .map((r) => `${r.ring_number},${r.inner_radius_px.toFixed(1)},${r.outer_radius_px.toFixed(1)},${r.width_px.toFixed(1)},${r.estimated_year}`)
    .join("\n")
  const csv = header + rows
  downloadBlob(csv, `treetrace-${result.id}-${mode}.csv`, "text/csv")
}

export function exportJSON(result: AnalysisResult): void {
  const mode = result.preprocessing?.mode || "adaptive"
  const json = JSON.stringify(result, null, 2)
  downloadBlob(json, `treetrace-${result.id}-${mode}.json`, "application/json")
}

export function exportPNG(canvasElement: HTMLCanvasElement | null, filename: string): void {
  if (!canvasElement) return
  canvasElement.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
  })
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
