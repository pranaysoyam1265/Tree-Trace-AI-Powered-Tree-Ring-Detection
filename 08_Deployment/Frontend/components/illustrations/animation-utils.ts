/* ═══════════════════════════════════════════════════════════════════
   TreeTrace — Dithered Animation Utilities
   Bayer ordered dithering, palette mapping, and shared presets
   ═══════════════════════════════════════════════════════════════════ */

/* ── Bayer 4×4 Threshold Matrix ─────────────────────────────────── */
const BAYER_4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]
const BAYER_NORM = 16 // normalizer for 4×4

/* ── Color Palette ──────────────────────────────────────────────── */
export const PALETTE = {
  bg: [9, 9, 11] as [number, number, number],        // #09090B
  darkEmerald: [2, 44, 34] as [number, number, number], // #022C22
  midEmerald: [6, 95, 70] as [number, number, number],  // #065F46
  emerald: [16, 185, 129] as [number, number, number],   // #10B981
  amber: [245, 158, 11] as [number, number, number],     // #F59E0B
}

type RGB = [number, number, number]

/* ── Find closest palette color ─────────────────────────────────── */
function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  )
}

function closestPaletteColor(
  r: number,
  g: number,
  b: number,
  palette: RGB[]
): RGB {
  let minDist = Infinity
  let closest = palette[0]
  for (const color of palette) {
    const dist = colorDistance([r, g, b], color)
    if (dist < minDist) {
      minDist = dist
      closest = color
    }
  }
  return closest
}

/* ── Bayer Ordered Dithering ────────────────────────────────────── */
export function applyBayerDither(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: RGB[] = [PALETTE.bg, PALETTE.darkEmerald, PALETTE.midEmerald, PALETTE.emerald]
) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const threshold = (BAYER_4x4[y % 4][x % 4] / BAYER_NORM - 0.5) * 64

      const r = Math.max(0, Math.min(255, data[i] + threshold))
      const g = Math.max(0, Math.min(255, data[i + 1] + threshold))
      const b = Math.max(0, Math.min(255, data[i + 2] + threshold))

      const [cr, cg, cb] = closestPaletteColor(r, g, b, palette)
      data[i] = cr
      data[i + 1] = cg
      data[i + 2] = cb
      // Keep alpha
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/* ── Load SVG into a canvas-compatible Image ────────────────────── */
export function loadSvgImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/* ── Draw scanline overlay ──────────────────────────────────────── */
export function drawScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity = 0.06
) {
  for (let y = 0; y < height; y += 4) {
    ctx.fillStyle = `rgba(0,0,0,${opacity})`
    ctx.fillRect(0, y, width, 2)
  }
}

/* ── Draw a moving scan beam ────────────────────────────────────── */
export function drawScanBeam(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  position: number, // 0→1
  horizontal = true,
  color: RGB = PALETTE.emerald,
  beamWidth = 3
) {
  const [r, g, b] = color
  if (horizontal) {
    const y = position * height
    const gradient = ctx.createLinearGradient(0, y - 20, 0, y + 20)
    gradient.addColorStop(0, `rgba(${r},${g},${b},0)`)
    gradient.addColorStop(0.5, `rgba(${r},${g},${b},0.4)`)
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, y - 20, width, 40)
    ctx.fillStyle = `rgba(${r},${g},${b},0.8)`
    ctx.fillRect(0, y - beamWidth / 2, width, beamWidth)
  } else {
    const x = position * width
    const gradient = ctx.createLinearGradient(x - 20, 0, x + 20, 0)
    gradient.addColorStop(0, `rgba(${r},${g},${b},0)`)
    gradient.addColorStop(0.5, `rgba(${r},${g},${b},0.4)`)
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = gradient
    ctx.fillRect(x - 20, 0, 40, height)
    ctx.fillStyle = `rgba(${r},${g},${b},0.8)`
    ctx.fillRect(x - beamWidth / 2, 0, beamWidth, height)
  }
}

/* ── Breathing value (oscillates smoothly) ──────────────────────── */
export function breathe(time: number, speed = 1, min = 0.95, max = 1.05): number {
  return min + (max - min) * (0.5 + 0.5 * Math.sin(time * speed))
}

/* ── Shared animation presets (for Framer Motion) ───────────────── */
export const breathingAnimation = {
  scale: [1, 1.02, 1],
  opacity: [0.85, 1, 0.85],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
}

export const flickerAnimation = {
  opacity: [1, 0.97, 1, 0.99, 1],
  transition: {
    duration: 0.15,
    repeat: Infinity,
    repeatDelay: 3,
    ease: "easeInOut" as const,
  },
}
