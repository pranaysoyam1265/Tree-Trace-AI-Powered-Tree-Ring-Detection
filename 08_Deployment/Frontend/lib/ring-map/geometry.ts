/* ═══════════════════════════════════════════════════════════════════
   POLYGON GEOMETRY UTILITIES
   Scaling transforms and hit-testing for ring boundary polygons.
   ═══════════════════════════════════════════════════════════════════ */

export interface Point {
  x: number
  y: number
}

export interface ScaleTransform {
  scale: number
  offsetX: number
  offsetY: number
  zoom: number
  panX: number
  panY: number
}

/**
 * Compute a uniform scale + offset transform that fits an image
 * (imageW × imageH) into a canvas (canvasW × canvasH) with padding.
 */
export function computeFitTransform(
  imageW: number,
  imageH: number,
  canvasW: number,
  canvasH: number,
  padding = 20
): Omit<ScaleTransform, "zoom" | "panX" | "panY"> {
  const usableW = canvasW - padding * 2
  const usableH = canvasH - padding * 2
  const scale = Math.min(usableW / imageW, usableH / imageH)
  const offsetX = (canvasW - imageW * scale) / 2
  const offsetY = (canvasH - imageH * scale) / 2
  return { scale, offsetX, offsetY }
}

/**
 * Transform a point from image coords to canvas coords.
 */
export function toCanvas(p: Point, t: ScaleTransform): Point {
  const cx = t.offsetX + p.x * t.scale
  const cy = t.offsetY + p.y * t.scale
  // Apply zoom + pan around canvas center
  return { x: cx, y: cy }
}

/**
 * Transform an array of polygon points from image coords to canvas coords,
 * applying zoom and pan around the canvas center.
 */
export function transformPolygon(
  points: Point[],
  t: ScaleTransform,
  canvasW: number,
  canvasH: number
): Point[] {
  const centerX = canvasW / 2
  const centerY = canvasH / 2
  return points.map((p) => {
    const cx = t.offsetX + p.x * t.scale
    const cy = t.offsetY + p.y * t.scale
    return {
      x: centerX + (cx - centerX) * t.zoom + t.panX,
      y: centerY + (cy - centerY) * t.zoom + t.panY,
    }
  })
}

/**
 * Distance from point P to line segment AB.
 */
function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const projX = a.x + t * dx
  const projY = a.y + t * dy
  return Math.hypot(p.x - projX, p.y - projY)
}

/**
 * Check if a mouse position is within `threshold` pixels of any edge
 * in the given polygon. Returns true/false.
 */
export function isNearPolygon(
  mouse: Point,
  polygon: Point[],
  threshold = 6
): boolean {
  if (polygon.length < 2) return false
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    if (distanceToSegment(mouse, a, b) <= threshold) return true
  }
  return false
}

/**
 * Get minimum distance from a point to a polygon outline.
 */
export function distanceToPolygon(mouse: Point, polygon: Point[]): number {
  if (polygon.length < 2) return Infinity
  let min = Infinity
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    const d = distanceToSegment(mouse, a, b)
    if (d < min) min = d
  }
  return min
}
