/* ═══════════════════════════════════════════════════════════════════
   EXPORT UTILITIES
   CSV, JSON, and PNG export for ring analysis results.
   ═══════════════════════════════════════════════════════════════════ */

import type { AnalysisResult, RingData } from "./mock-results"

export function exportCSV(result: AnalysisResult): void {
  const header = "Ring #,Inner Radius (px),Outer Radius (px),Width (px),Width (mm)\n"
  const rows = result.rings
    .map((r) => `${r.id},${r.innerRadius},${r.outerRadius},${r.widthPx},${r.widthMm}`)
    .join("\n")
  const csv = header + rows
  downloadBlob(csv, `treetrace-${result.id}.csv`, "text/csv")
}

export function exportJSON(result: AnalysisResult): void {
  const json = JSON.stringify(result, null, 2)
  downloadBlob(json, `treetrace-${result.id}.json`, "application/json")
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
