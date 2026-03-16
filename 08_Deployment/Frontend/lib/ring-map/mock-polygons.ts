/* ═══════════════════════════════════════════════════════════════════
   MOCK RING POLYGON DATA GENERATOR
   Creates realistic organic ring boundary polygons for testing.
   Uses overlapping sine waves to simulate real wood grain.
   ═══════════════════════════════════════════════════════════════════ */

import type { Point } from "./geometry"

/** A single ring's polygon data */
export interface RingPolygon {
  label: string         // "1", "2", ... (1 = innermost)
  points: Point[]       // closed polygon in image coordinates
  shapeType: "polygon"
}

/** All ring polygon data for a specimen */
export interface RingPolygonData {
  rings: RingPolygon[]
  imageWidth: number
  imageHeight: number
  pith: Point
}

/** Seeded pseudo-random for determinism */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash) || 1
}

/**
 * Generate mock ring polygon data.
 * Creates organic, irregular polygons that look like real tree ring boundaries.
 */
export function generateMockPolygons(
  id: string,
  ringCount: number,
  imageWidth = 2364,
  imageHeight = 2364,
  pith?: Point
): RingPolygonData {
  const rand = seededRandom(hashCode(id + "_polygons"))
  const cx = pith?.x ?? imageWidth / 2
  const cy = pith?.y ?? imageHeight / 2
  const maxExtent = Math.min(imageWidth, imageHeight) / 2 - 30  // leave margin

  const rings: RingPolygon[] = []
  const numPoints = 140     // points per ring polygon

  // Generate radii with natural spacing
  const radii: number[] = []
  let r = maxExtent * 0.04 + rand() * maxExtent * 0.02  // innermost ring
  for (let i = 0; i < ringCount; i++) {
    radii.push(r)
    // Variable spacing — inner rings spaced wider, outer rings narrower,
    // with random variation to simulate natural growth rate
    const baseSpacing = maxExtent / (ringCount + 2)
    const growthFactor = 1.2 - (i / ringCount) * 0.6    // decreases with age
    const randomVariation = 0.6 + rand() * 0.8
    r += baseSpacing * growthFactor * randomVariation
    r = Math.min(r, maxExtent * 0.98)
  }

  // Generate irregular ring shapes using overlapping sine waves
  // Pre-generate some shared wobble frequencies so adjacent rings
  // look like they belong to the same wood grain
  const sharedFreqs = Array.from({ length: 6 }, () => 2 + Math.floor(rand() * 6))
  const sharedPhases = Array.from({ length: 6 }, () => rand() * Math.PI * 2)
  const sharedAmps = Array.from({ length: 6 }, () => 0.3 + rand() * 0.7)

  for (let ringIdx = 0; ringIdx < ringCount; ringIdx++) {
    const baseRadius = radii[ringIdx]
    // Inner rings are more regular, outer rings more irregular
    const irregularity = 0.015 + (ringIdx / ringCount) * 0.045

    const points: Point[] = []
    for (let j = 0; j < numPoints; j++) {
      const angle = (j / numPoints) * Math.PI * 2

      // Sum multiple sine waves for organic shape
      let wobble = 0
      for (let k = 0; k < sharedFreqs.length; k++) {
        const freq = sharedFreqs[k]
        const phase = sharedPhases[k] + ringIdx * 0.15  // slight phase shift per ring
        const amp = sharedAmps[k] * irregularity * baseRadius
        wobble += Math.sin(angle * freq + phase) * amp
      }

      // Add small per-ring random noise
      wobble += (rand() - 0.5) * baseRadius * irregularity * 0.3

      const finalR = baseRadius + wobble

      // Slight pith offset — center wobbles inward for realism
      const pithWobbleX = Math.sin(angle * 1.1) * baseRadius * 0.01
      const pithWobbleY = Math.cos(angle * 0.9) * baseRadius * 0.01

      points.push({
        x: Math.round(cx + pithWobbleX + Math.cos(angle) * finalR),
        y: Math.round(cy + pithWobbleY + Math.sin(angle) * finalR),
      })
    }

    rings.push({
      label: String(ringIdx + 1),
      points,
      shapeType: "polygon",
    })
  }

  return {
    rings,
    imageWidth,
    imageHeight,
    pith: { x: cx, y: cy },
  }
}
