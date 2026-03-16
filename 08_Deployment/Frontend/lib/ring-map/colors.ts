/* ═══════════════════════════════════════════════════════════════════
   RING SPECTRUM COLORS
   Generate vivid spectral colors for ring boundary visualization.
   Cycles: gold → orange → red → purple → blue → cyan → green
   ═══════════════════════════════════════════════════════════════════ */

const SPECTRUM: [number, number, number][] = [
  // [H, S%, L%]
  [45, 95, 60],   // gold
  [30, 95, 55],   // orange
  [15, 90, 50],   // red-orange
  [0, 85, 50],    // red
  [340, 80, 50],  // rose
  [310, 75, 50],  // magenta
  [280, 70, 55],  // purple
  [250, 75, 60],  // blue-purple
  [220, 80, 60],  // blue
  [195, 85, 55],  // cyan-blue
  [175, 85, 50],  // cyan
  [150, 80, 45],  // teal
  [120, 70, 45],  // green
  [85, 75, 50],   // lime
  [60, 90, 55],   // yellow-green
]

/**
 * Get the spectral color for a ring by index.
 * @param index ring index (0-based)
 * @param total total number of rings
 * @param alpha opacity 0-1
 */
export function getRingColor(index: number, total: number, alpha = 1): string {
  const t = total <= 1 ? 0 : index / (total - 1)
  const pos = t * (SPECTRUM.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.min(lo + 1, SPECTRUM.length - 1)
  const frac = pos - lo

  const h = SPECTRUM[lo][0] + (SPECTRUM[hi][0] - SPECTRUM[lo][0]) * frac
  const s = SPECTRUM[lo][1] + (SPECTRUM[hi][1] - SPECTRUM[lo][1]) * frac
  const l = SPECTRUM[lo][2] + (SPECTRUM[hi][2] - SPECTRUM[lo][2]) * frac

  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${alpha})`
}

/**
 * Get a CSS gradient string representing the full ring spectrum.
 */
export function getSpectrumGradient(): string {
  const stops = SPECTRUM.map((c, i) => {
    const pct = Math.round((i / (SPECTRUM.length - 1)) * 100)
    return `hsl(${c[0]}, ${c[1]}%, ${c[2]}%) ${pct}%`
  })
  return `linear-gradient(to right, ${stops.join(", ")})`
}
