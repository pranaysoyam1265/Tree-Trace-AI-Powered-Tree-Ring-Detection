/* ═══════════════════════════════════════════════════════════════════
   EXPORT UTILITIES
   CSV, JSON, PNG, and PDF export for ring analysis results.
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
  // Strip the massive base64 overlay from the exported JSON to keep file size reasonable
  const { overlay_image_base64, ...exportable } = result as AnalysisResult & { overlay_image_base64?: string }
  const json = JSON.stringify(exportable, null, 2)
  downloadBlob(json, `treetrace-${result.id}-${mode}.json`, "application/json")
}

export function exportOverlayPNG(result: AnalysisResult): boolean {
  const base64 = result.overlay_image_base64
  if (!base64) return false

  // base64 data URL: "data:image/png;base64,..."
  const dataUrl = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = `treetrace-${result.id}-overlay.png`
  a.click()
  return true
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

export function exportPDF(result: AnalysisResult): void {
  const mode = (result.preprocessing?.mode || "adaptive").toUpperCase()
  const imageName = result.image_name?.replace(/\.[^/.]+$/, "") || "specimen"

  // Build a rich HTML report
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TreeTrace Report — ${result.image_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', monospace; color: #1a1a1a; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 22px; letter-spacing: 3px; text-transform: uppercase; border-bottom: 3px solid #ea580c; padding-bottom: 8px; margin-bottom: 4px; }
    .subtitle { font-size: 10px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
    h2 { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #ea580c; margin: 24px 0 8px; border-left: 3px solid #ea580c; padding-left: 8px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 16px; }
    .meta-item { display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0; border-bottom: 1px dotted #ddd; }
    .meta-label { color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .meta-value { font-weight: bold; }
    .accent { color: #ea580c; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; font-size: 10px; }
    th { background: #1a1a1a; color: #fff; padding: 6px 8px; text-align: left; text-transform: uppercase; letter-spacing: 1px; font-size: 9px; }
    td { padding: 4px 8px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) td { background: #fafafa; }
    .phase-card { border: 1px solid #ddd; padding: 8px 12px; margin: 4px 0; font-size: 11px; }
    .phase-name { font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .phase-meta { color: #888; font-size: 10px; }
    .bio { font-size: 11px; line-height: 1.6; color: #444; white-space: pre-wrap; margin: 8px 0; padding: 12px; background: #f9f9f9; border-left: 3px solid #ea580c; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 2px solid #1a1a1a; font-size: 9px; color: #aaa; text-align: center; letter-spacing: 2px; text-transform: uppercase; }
    .health-bar { display: inline-block; width: 60px; height: 6px; background: #eee; position: relative; vertical-align: middle; margin-left: 6px; }
    .health-fill { height: 100%; background: #ea580c; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>TreeTrace Analysis Report</h1>
  <div class="subtitle">CS-TRD Ring Detection Engine &mdash; ${result.analyzed_at ? new Date(result.analyzed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>

  <h2>// SPECIMEN OVERVIEW</h2>
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Image</span><span class="meta-value">${result.image_name}</span></div>
    <div class="meta-item"><span class="meta-label">Analysis ID</span><span class="meta-value">${result.id}</span></div>
    <div class="meta-item"><span class="meta-label">Rings Detected</span><span class="meta-value accent">${result.ring_count}</span></div>
    <div class="meta-item"><span class="meta-label">Estimated Age</span><span class="meta-value">${result.estimated_age} years</span></div>
    <div class="meta-item"><span class="meta-label">Birth Year (est.)</span><span class="meta-value">${result.birth_year}</span></div>
    <div class="meta-item"><span class="meta-label">Detection Mode</span><span class="meta-value">${mode}</span></div>
    <div class="meta-item"><span class="meta-label">Pith</span><span class="meta-value">cx=${result.pith.cx}, cy=${result.pith.cy}</span></div>
    <div class="meta-item"><span class="meta-label">Image Size</span><span class="meta-value">${result.image_dimensions.width}×${result.image_dimensions.height}px</span></div>
    <div class="meta-item"><span class="meta-label">Processing Time</span><span class="meta-value">${Number(result.processing_time_seconds).toFixed(1)}s</span></div>
    <div class="meta-item"><span class="meta-label">Preset</span><span class="meta-value">${result.preprocessing?.preset || 'auto'}</span></div>
  </div>

  <h2>// HEALTH ASSESSMENT</h2>
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Overall Score</span><span class="meta-value accent">${result.health.score}/100 (${result.health.label})</span></div>
    <div class="meta-item"><span class="meta-label">Growth Rate</span><span class="meta-value">${result.health.components.growth_rate}/25 <span class="health-bar"><span class="health-fill" style="width:${(result.health.components.growth_rate / 25) * 100}%"></span></span></span></div>
    <div class="meta-item"><span class="meta-label">Consistency</span><span class="meta-value">${result.health.components.consistency}/25 <span class="health-bar"><span class="health-fill" style="width:${(result.health.components.consistency / 25) * 100}%"></span></span></span></div>
    <div class="meta-item"><span class="meta-label">Stress Resistance</span><span class="meta-value">${result.health.components.stress_resistance}/25 <span class="health-bar"><span class="health-fill" style="width:${(result.health.components.stress_resistance / 25) * 100}%"></span></span></span></div>
    <div class="meta-item"><span class="meta-label">Recovery Ability</span><span class="meta-value">${result.health.components.recovery_ability}/25 <span class="health-bar"><span class="health-fill" style="width:${(result.health.components.recovery_ability / 25) * 100}%"></span></span></span></div>
  </div>
  <div style="font-size:10px; color:#666; margin-top:4px;">${result.health.detail}</div>

  <h2>// DETECTION METRICS</h2>
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Precision</span><span class="meta-value">${result.metrics.precision?.toFixed(3) ?? 'N/A'}</span></div>
    <div class="meta-item"><span class="meta-label">Recall</span><span class="meta-value">${result.metrics.recall?.toFixed(3) ?? 'N/A'}</span></div>
    <div class="meta-item"><span class="meta-label">F1 Score</span><span class="meta-value accent">${result.metrics.f1_score?.toFixed(3) ?? 'N/A'}</span></div>
    <div class="meta-item"><span class="meta-label">RMSE</span><span class="meta-value">${result.metrics.rmse ?? 'N/A'}px</span></div>
  </div>

  <h2>// STATISTICS</h2>
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Mean Width</span><span class="meta-value">${result.statistics.mean.toFixed(1)}px</span></div>
    <div class="meta-item"><span class="meta-label">Median Width</span><span class="meta-value">${result.statistics.median.toFixed(1)}px</span></div>
    <div class="meta-item"><span class="meta-label">Std Deviation</span><span class="meta-value">${result.statistics.std.toFixed(2)}px</span></div>
    <div class="meta-item"><span class="meta-label">CV</span><span class="meta-value">${result.statistics.cv_percent.toFixed(1)}%</span></div>
    <div class="meta-item"><span class="meta-label">Min Width</span><span class="meta-value">${result.statistics.min.toFixed(1)}px</span></div>
    <div class="meta-item"><span class="meta-label">Max Width</span><span class="meta-value">${result.statistics.max.toFixed(1)}px</span></div>
    <div class="meta-item"><span class="meta-label">Range</span><span class="meta-value">${result.statistics.range.toFixed(1)}px</span></div>
    <div class="meta-item"><span class="meta-label">Growth Trend</span><span class="meta-value">${result.trend.direction} (${result.trend.slope.toFixed(2)} px/yr)</span></div>
  </div>

  <h2>// GROWTH PHASES</h2>
  ${result.phases.map(p => `<div class="phase-card"><span class="phase-name">${p.name}</span> <span class="phase-meta">(${p.years}, avg: ${p.avg_width.toFixed(1)}px)</span><br/><span style="font-size:10px;color:#666;">${p.description}</span></div>`).join('')}

  ${result.anomalies.length > 0 ? `
  <h2>// ANOMALIES DETECTED (${result.anomalies.length})</h2>
  <table>
    <tr><th>Ring</th><th>Year</th><th>Width</th><th>Deviation</th><th>Type</th><th>Interpretation</th></tr>
    ${result.anomalies.map(a => `<tr><td>${a.ring}</td><td>${a.year}</td><td>${a.width.toFixed(1)}px</td><td>${a.deviation.toFixed(2)}σ</td><td>${a.type}</td><td>${a.interpretation}</td></tr>`).join('')}
  </table>` : ''}

  <h2>// RING-BY-RING DATA</h2>
  <table>
    <tr><th>#</th><th>Year</th><th>Inner R</th><th>Outer R</th><th>Width</th><th>Eccentricity</th></tr>
    ${result.rings.map(r => `<tr><td>${r.ring_number}</td><td>${r.estimated_year}</td><td>${r.inner_radius_px.toFixed(1)}px</td><td>${r.outer_radius_px.toFixed(1)}px</td><td>${r.width_px.toFixed(1)}px</td><td>${r.eccentricity.toFixed(3)}</td></tr>`).join('')}
  </table>

  <h2>// CARBON SEQUESTRATION</h2>
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Biomass</span><span class="meta-value">${result.carbon.estimated_biomass_kg.toFixed(1)} kg</span></div>
    <div class="meta-item"><span class="meta-label">Carbon Stored</span><span class="meta-value">${result.carbon.carbon_stored_kg.toFixed(1)} kg</span></div>
    <div class="meta-item"><span class="meta-label">CO₂ Equivalent</span><span class="meta-value accent">${result.carbon.co2_equivalent_kg.toFixed(1)} kg</span></div>
    <div class="meta-item"><span class="meta-label">Car km Offset</span><span class="meta-value">${result.carbon.car_km_offset.toFixed(0)} km</span></div>
  </div>

  <h2>// SPECIMEN BIOGRAPHY</h2>
  <div class="bio">${result.biography}</div>

  <div class="footer">
    TreeTrace &mdash; CS-TRD Ring Detection Engine &mdash; Report generated ${new Date().toISOString().slice(0, 10)}<br/>
    Analysis ID: ${result.id}
  </div>
</body>
</html>`

  // Open in a new window for printing as PDF
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    // Auto-trigger print dialog after a short delay for rendering
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
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
