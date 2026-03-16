"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { TerminalFrame } from "@/components/illustrations/terminal-frame"

/* ═══════════════════════════════════════════════════════════════════
   TREETRACE STORYBOARD — BRUTALIST DITHERED EDITION (REFINED)
   7-scene cinematic loop.  Every dimension now scales with the
   canvas size so it stays sharp at any resolution / DPR.
   ═══════════════════════════════════════════════════════════════════ */

// ── Palette ──
const BG = "#09090B"
const DARK = "#022C22"
const MID = "#065F46"
const BRIGHT = "#10B981"
const ACCENT = "#F59E0B"
const WHITE = "#E4E4E7"
const RED = "#EF4444"

const TOTAL_DURATION = 28

const SCENES = [
  [0, 4.5],   // 1 — Forest Awakening
  [3.5, 8.5],   // 2 — Bark Texture Macro
  [7.5, 12.5],  // 3 — Trunk to Core
  [11.5, 16.5],  // 4 — Core Sample
  [15.5, 20.5],  // 5 — Ring Detection Disc
  [19.5, 24.5],  // 6 — Microscopic Ring Detail
  [23.5, 28.0],  // 7 — Results Pulse
] as const

const SCENE_LABELS = [
  "SPECIMEN_ORIGIN",
  "SURFACE_ACQUISITION",
  "PENETRATION_PROFILE",
  "CORE_EXTRACTION",
  "RING_DETECTION_ALG",
  "CELLULAR_ANALYSIS",
  "DATA_SYNTHESIS",
]

const IMAGE_PATHS = [
  "/illustrations/Forest Awakening.png",
  "/illustrations/Bark Texture Macro.png",
  "/illustrations/Trunk to Core.png",
  "/illustrations/Core Sample.png",
  "/illustrations/Ring Detection Disc.png",
  "/illustrations/Microscopic Ring Detail.png",
  "/illustrations/Results Pulse.png",
]

// The mono font stack — tries sharp system fonts first
const FONT = `"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", "Consolas", monospace`

// ── Per-scene image gravity ──
// Controls how each image is framed within the 4:3 canvas.
// fx/fy = 0..1 focal point, fit = "cover"|"contain"
const IMAGE_FRAMING: { fx: number; fy: number; fit: "cover" | "contain" }[] = [
  { fx: 0.5, fy: 0.4, fit: "cover" },   // Forest — show canopy
  { fx: 0.5, fy: 0.5, fit: "cover" },   // Bark — dead center
  { fx: 0.5, fy: 0.5, fit: "cover" },   // Trunk to Core
  { fx: 0.5, fy: 0.5, fit: "contain" }, // Core Sample — may be panoramic, contain it
  { fx: 0.5, fy: 0.5, fit: "contain" }, // Ring Disc — show full circle
  { fx: 0.5, fy: 0.5, fit: "cover" },   // Microscopic — fill
  { fx: 0.5, fy: 0.5, fit: "cover" },   // Results Pulse
]

// ── Bayer 4×4 ──
const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
function bayerThreshold(x: number, y: number): number {
  return BAYER4[((Math.floor(y) % 4) + 4) % 4][((Math.floor(x) % 4) + 4) % 4] / 16
}

function sceneAlpha(time: number, idx: number): number {
  const [start, end] = SCENES[idx]
  const fade = 0.8
  if (time < start || time > end) return 0
  return Math.min(Math.min(1, (time - start) / fade), Math.min(1, (end - time) / fade))
}

function getActiveScene(time: number): number {
  let best = 0, bestA = 0
  for (let i = 0; i < SCENES.length; i++) {
    const a = sceneAlpha(time, i)
    if (a > bestA) { bestA = a; best = i }
  }
  return best
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED DRAW UTILITIES
   ═══════════════════════════════════════════════════════════════════ */

// Scale-aware unit:  u(w, 0.02) = 2% of canvas width
function u(base: number, pct: number) { return base * pct }

// Adaptive font:  setFont(ctx, w, 0.018)  →  ~18px on a 1000px-wide canvas
function setFont(ctx: CanvasRenderingContext2D, w: number, pct: number, weight: "bold" | "normal" = "bold") {
  const px = Math.max(8, Math.round(w * pct))
  ctx.font = `${weight} ${px}px ${FONT}`
}

// Draw image with per-scene focal point + fit mode
function drawImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, framing: typeof IMAGE_FRAMING[0]) {
  const iw = img.naturalWidth, ih = img.naturalHeight
  if (iw === 0 || ih === 0) return

  if (framing.fit === "contain") {
    // Fit entire image, letterbox with BG
    const scale = Math.min(w / iw, h / ih)
    const dw = iw * scale, dh = ih * scale
    const dx = (w - dw) / 2, dy = (h - dh) / 2
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh)
  } else {
    // Cover with focal-point-aware cropping
    const scale = Math.max(w / iw, h / ih)
    const sw = w / scale, sh = h / scale
    const sx = (iw - sw) * framing.fx
    const sy = (ih - sh) * framing.fy
    ctx.drawImage(img, Math.max(0, sx), Math.max(0, sy), sw, sh, 0, 0, w, h)
  }
}

// Typed text with dark shadow backing for readability
function typedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, progress: number, color: string, w: number, sizePct: number) {
  const chars = Math.floor(text.length * Math.min(1, progress))
  if (chars === 0) return
  setFont(ctx, w, sizePct)

  const sub = text.substring(0, chars)

  // Shadow backing
  ctx.fillStyle = "rgba(9,9,11,0.7)"
  const met = ctx.measureText(sub)
  const px = Math.max(8, Math.round(w * sizePct))
  ctx.fillRect(x - 2, y - px, met.width + 6, px + 4)

  // Text
  ctx.fillStyle = color
  ctx.fillText(sub, x, y)

  // Blinking cursor
  if (progress < 1 && Math.floor(performance.now() / 400) % 2 === 0) {
    ctx.fillRect(x + met.width + 3, y - px + 2, px * 0.5, px)
  }
}

function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "rgba(0,0,0,0.10)"
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1)
}

// Targeting reticle brackets — size relative to canvas
function drawReticle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, lineW: number) {
  const arm = size * 0.3
  ctx.strokeStyle = color
  ctx.lineWidth = lineW
  const C = [
    [cx - size, cy - size, arm, 0, 0, arm],
    [cx + size - arm, cy - size, arm, 0, 0, arm],
    [cx - size, cy + size, arm, 0, 0, -arm],
    [cx + size - arm, cy + size, arm, 0, 0, -arm],
  ]
  C.forEach(([x, y, dx1, dy1, dx2, dy2]) => {
    ctx.beginPath()
    ctx.moveTo(x + dx1, y + dy1)
    ctx.lineTo(x, y)
    ctx.lineTo(x + dx2, y + dy2)
    ctx.stroke()
  })
  // Crosshair thin lines
  ctx.globalAlpha = 0.2
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy + size); ctx.stroke()
  ctx.globalAlpha = 1
}

function drawGlitch(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  if (intensity <= 0) return
  const count = Math.floor(intensity * 8)
  for (let i = 0; i < count; i++) {
    const y = Math.random() * h
    const bh = 1 + Math.random() * 3
    const offset = (Math.random() - 0.5) * intensity * u(w, 0.04)
    ctx.save()
    ctx.globalCompositeOperation = "difference"
    ctx.fillStyle = BRIGHT
    ctx.fillRect(offset, y, w, bh)
    ctx.restore()
  }
}


/* ═══════════════════════════════════════════════════════════════════
   SCENE OVERLAYS — all text / geometry now scales with w, h
   ═══════════════════════════════════════════════════════════════════ */

function overlayForest(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Horizon scanner
  const scanY = u(h, 0.3) + Math.sin(t * 0.4) * u(h, 0.2)
  ctx.strokeStyle = BRIGHT
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5
  ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke()

  // Scanner glow trail
  const grad = ctx.createLinearGradient(0, scanY - u(h, 0.03), 0, scanY + u(h, 0.03))
  grad.addColorStop(0, "rgba(16,185,129,0)")
  grad.addColorStop(0.5, "rgba(16,185,129,0.08)")
  grad.addColorStop(1, "rgba(16,185,129,0)")
  ctx.fillStyle = grad
  ctx.fillRect(0, scanY - u(h, 0.03), w, u(h, 0.06))
  ctx.globalAlpha = 1

  // Coordinate ticks
  setFont(ctx, w, 0.014, "normal")
  ctx.fillStyle = BRIGHT
  for (let i = 0; i < 5; i++) {
    const ly = u(h, 0.15) + i * u(h, 0.15)
    ctx.globalAlpha = 0.4
    ctx.fillText(`${(ly / h * 90).toFixed(1)}°N`, u(w, 0.015), ly)
    // Tick line
    ctx.fillRect(u(w, 0.06), ly - 0.5, u(w, 0.02), 1)
  }
  ctx.globalAlpha = 1

  // Terminal readout
  typedText(ctx, "// SPECIMEN_ORIGIN :: SCANNING TERRAIN", u(w, 0.04), u(h, 0.92), Math.min(1, t / 2.5), BRIGHT, w, 0.016)

  // Scene counter
  setFont(ctx, w, 0.012, "normal")
  ctx.fillStyle = MID
  ctx.globalAlpha = 0.5
  ctx.fillText("01/07", w - u(w, 0.07), u(h, 0.06))
  ctx.globalAlpha = 1

  // Dithered vignette bottom
  ctx.fillStyle = BG
  for (let y = u(h, 0.85); y < h; y += 2) {
    const intensity = (y - u(h, 0.85)) / u(h, 0.15)
    if (bayerThreshold((y / 2) % 4, 0) < intensity) ctx.fillRect(0, y, w, 2)
  }
}

function overlayBark(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const st = t - 3.5
  const lock = Math.min(1, st / 1.2)
  const s = u(w, 0.18) * (0.5 + lock * 0.5)
  const lw = Math.max(2, u(w, 0.004))

  drawReticle(ctx, w * 0.5, h * 0.5, s, lock > 0.95 ? ACCENT : BRIGHT, lw)

  if (st > 0.6) {
    const tp = Math.min(1, (st - 0.6) / 2)
    typedText(ctx, "TARGET_LOCKED", u(w, 0.5) - u(w, 0.1), u(h, 0.5) - s - u(h, 0.04), tp, ACCENT, w, 0.018)
    typedText(ctx, "SURFACE_DENSITY: HIGH", u(w, 0.5) - u(w, 0.12), u(h, 0.5) + s + u(h, 0.05), Math.max(0, tp - 0.3) / 0.7, BRIGHT, w, 0.014)
    typedText(ctx, "INIT_PENETRATION >>", u(w, 0.5) - u(w, 0.1), u(h, 0.5) + s + u(h, 0.1), Math.max(0, tp - 0.6) / 0.4, MID, w, 0.013)
  }

  // Scene counter
  setFont(ctx, w, 0.012, "normal")
  ctx.fillStyle = MID; ctx.globalAlpha = 0.5
  ctx.fillText("02/07", w - u(w, 0.07), u(h, 0.06))
  ctx.globalAlpha = 1

  if (st > 3.5) drawGlitch(ctx, w, h, (st - 3.5) * 0.8)
}

function overlayTrunkToCore(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const st = t - 7.5
  const progress = Math.min(1, st / 2.5)

  // Animated borer path — diagonal dashed line
  const startX = u(w, 0.82), startY = u(h, 0.18)
  const endX = u(w, 0.2) + progress * u(w, 0.6)
  const endY = u(h, 0.25) + progress * u(h, 0.45)

  ctx.strokeStyle = ACCENT
  ctx.lineWidth = Math.max(2, u(w, 0.003))
  ctx.setLineDash([u(w, 0.008), u(w, 0.008)])
  ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke()
  ctx.setLineDash([])

  // Pulsing dot at tip
  const pulse = Math.sin(st * 8) * 0.3 + 0.7
  ctx.fillStyle = ACCENT
  ctx.globalAlpha = pulse
  ctx.beginPath(); ctx.arc(endX, endY, u(w, 0.01), 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1

  // Negative flash at extraction
  if (st > 2 && st < 2.4) {
    ctx.save()
    ctx.globalCompositeOperation = "difference"
    ctx.fillStyle = "#FFFFFF"
    ctx.globalAlpha = (1 - Math.abs(st - 2.2) / 0.2) * 0.6
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }

  // Readouts
  const depth = Math.floor(progress * 180)
  typedText(ctx, `BORER_DEPTH: ${depth}mm`, u(w, 0.04), u(h, 0.90), Math.min(1, st / 1.5), BRIGHT, w, 0.016)
  typedText(ctx, "EXTRACTION_VECTOR: 47.2°", u(w, 0.04), u(h, 0.95), Math.max(0, st - 1) / 1.5, MID, w, 0.013)

  setFont(ctx, w, 0.012, "normal"); ctx.fillStyle = MID; ctx.globalAlpha = 0.5
  ctx.fillText("03/07", w - u(w, 0.07), u(h, 0.06)); ctx.globalAlpha = 1
}

function overlayCoreSample(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const st = t - 11.5
  const scanProg = Math.min(1, st / 3)
  const scanX = u(w, 0.05) + scanProg * u(w, 0.9)

  // Vertical scanline with glow
  ctx.strokeStyle = ACCENT
  ctx.lineWidth = Math.max(2, u(w, 0.003))
  ctx.globalAlpha = 0.9
  ctx.beginPath(); ctx.moveTo(scanX, u(h, 0.08)); ctx.lineTo(scanX, u(h, 0.92)); ctx.stroke()

  // Scanline glow
  const glowGrad = ctx.createLinearGradient(scanX - u(w, 0.02), 0, scanX + u(w, 0.02), 0)
  glowGrad.addColorStop(0, "rgba(245,158,11,0)")
  glowGrad.addColorStop(0.5, "rgba(245,158,11,0.06)")
  glowGrad.addColorStop(1, "rgba(245,158,11,0)")
  ctx.fillStyle = glowGrad
  ctx.fillRect(scanX - u(w, 0.02), u(h, 0.08), u(w, 0.04), u(h, 0.84))
  ctx.globalAlpha = 1

  // Waveform data bars behind the scan
  const barBase = u(h, 0.78), barMaxH = u(h, 0.14)
  const barCount = Math.floor(scanProg * 40)
  const barW = u(w, 0.9) / 42
  for (let i = 0; i < barCount; i++) {
    const bx = u(w, 0.05) + (i / 40) * u(w, 0.9)
    const bh = (Math.sin(i * 0.8) * 0.5 + 0.5) * barMaxH + barMaxH * 0.2
    ctx.fillStyle = i % 5 === 0 ? ACCENT : BRIGHT
    ctx.globalAlpha = 0.45
    ctx.fillRect(bx, barBase - bh, barW, bh)
  }
  ctx.globalAlpha = 1

  if (scanProg < 1) {
    typedText(ctx, "SCAN_ACTIVE...", scanX + u(w, 0.015), u(h, 0.1), 1, ACCENT, w, 0.014)
  } else {
    typedText(ctx, "EXTRACTION_COMPLETE // 40 RING BOUNDARIES", u(w, 0.04), u(h, 0.05), Math.min(1, (st - 3) / 1), BRIGHT, w, 0.016)
  }

  setFont(ctx, w, 0.012, "normal"); ctx.fillStyle = MID; ctx.globalAlpha = 0.5
  ctx.fillText("04/07", w - u(w, 0.07), u(h, 0.06)); ctx.globalAlpha = 1
}

function overlayRingDisc(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const st = t - 15.5
  const cx = w * 0.5, cy = h * 0.5

  // Detection rings snapping in
  const ringCount = Math.min(8, Math.floor(st * 3))
  for (let i = 0; i < ringCount; i++) {
    const r = (i + 1) * u(w, 0.045)
    const isActive = i === ringCount - 1
    ctx.strokeStyle = isActive ? ACCENT : BRIGHT
    ctx.lineWidth = isActive ? Math.max(2, u(w, 0.003)) : 1
    ctx.globalAlpha = isActive ? 0.8 : 0.25
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Stepped radial sweep
  if (st > 1) {
    const angle = Math.floor(st * 4) * (Math.PI / 12)
    const lineR = u(w, 0.38)
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 1
    ctx.setLineDash([u(w, 0.004), u(w, 0.006)])
    ctx.beginPath(); ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle) * lineR, cy + Math.sin(angle) * lineR); ctx.stroke()
    ctx.setLineDash([])

    // Angle readout at the tip
    const deg = Math.round((angle * 180 / Math.PI) % 360)
    setFont(ctx, w, 0.012, "normal")
    ctx.fillStyle = ACCENT
    ctx.globalAlpha = 0.7
    ctx.fillText(`${deg}°`, cx + Math.cos(angle) * (lineR + u(w, 0.02)), cy + Math.sin(angle) * (lineR + u(w, 0.02)))
    ctx.globalAlpha = 1
  }

  // Pith marker
  ctx.fillStyle = ACCENT
  ctx.beginPath(); ctx.arc(cx, cy, u(w, 0.006), 0, Math.PI * 2); ctx.fill()

  typedText(ctx, `RINGS_DETECTED: ${ringCount}`, u(w, 0.04), u(h, 0.92), Math.min(1, st / 1.5), BRIGHT, w, 0.016)

  setFont(ctx, w, 0.012, "normal"); ctx.fillStyle = MID; ctx.globalAlpha = 0.5
  ctx.fillText("05/07", w - u(w, 0.07), u(h, 0.06)); ctx.globalAlpha = 1

  if (st > 4) drawGlitch(ctx, w, h, (st - 4) * 1.2)
}

function overlayMicroscopic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const st = t - 19.5

  // Caliper dimension lines
  const measurements = [
    { y: u(h, 0.30), width: u(w, 0.14), label: "< 0.04mm >" },
    { y: u(h, 0.50), width: u(w, 0.20), label: "< 0.07mm >" },
    { y: u(h, 0.70), width: u(w, 0.09), label: "< 0.02mm >" },
  ]

  const tickH = u(h, 0.015)
  measurements.forEach((m, i) => {
    if (st < i * 0.6 + 0.5) return
    const mx = u(w, 0.38)
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = Math.max(1, u(w, 0.002))
    ctx.beginPath()
    ctx.moveTo(mx, m.y - tickH); ctx.lineTo(mx, m.y + tickH) // left tick
    ctx.moveTo(mx, m.y); ctx.lineTo(mx + m.width, m.y)         // line
    ctx.moveTo(mx + m.width, m.y - tickH); ctx.lineTo(mx + m.width, m.y + tickH) // right tick
    ctx.stroke()

    // Flashing label
    if (Math.floor((st - i * 0.6) * 5) % 2 === 0) {
      setFont(ctx, w, 0.014)
      ctx.fillStyle = ACCENT
      ctx.fillText(m.label, mx + m.width + u(w, 0.015), m.y + u(h, 0.005))
    }
  })

  // Anomaly flash
  if (st > 2.5 && Math.floor(st * 6) % 3 === 0) {
    // Dark backing for anomaly
    setFont(ctx, w, 0.02)
    const text = "[ANOMALY DETECTED]"
    const met = ctx.measureText(text)
    const ax = u(w, 0.04), ay = u(h, 0.14)
    ctx.fillStyle = "rgba(239,68,68,0.15)"
    ctx.fillRect(ax - 4, ay - u(w, 0.02) - 2, met.width + 10, u(w, 0.025))
    ctx.fillStyle = RED
    ctx.fillText(text, ax, ay)
  }

  // Hex data stream
  if (st > 1.5) {
    setFont(ctx, w, 0.011, "normal")
    ctx.fillStyle = BRIGHT
    ctx.globalAlpha = 0.25
    for (let i = 0; i < 6; i++) {
      const hex = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join(" ")
      ctx.fillText(hex, u(w, 0.02), u(h, 0.82) + i * u(h, 0.025))
    }
    ctx.globalAlpha = 1
  }

  // White-out flash at end
  if (st > 4 && st < 4.5) {
    ctx.fillStyle = BRIGHT
    ctx.globalAlpha = (1 - (st - 4) / 0.5) * 0.4
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
  }

  setFont(ctx, w, 0.012, "normal"); ctx.fillStyle = MID; ctx.globalAlpha = 0.5
  ctx.fillText("06/07", w - u(w, 0.07), u(h, 0.06)); ctx.globalAlpha = 1
}

function overlayResults(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const st = t - 23.5

  // Stepped pulse
  const pulseScale = 1 + Math.floor(st * 2) * 0.015
  ctx.save()
  ctx.translate(w * 0.5, h * 0.5); ctx.scale(pulseScale, pulseScale); ctx.translate(-w * 0.5, -h * 0.5)
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, u(w, 0.1), w * 0.5, h * 0.5, u(w, 0.5))
  grad.addColorStop(0, "rgba(0,0,0,0)"); grad.addColorStop(1, "rgba(0,0,0,0.45)")
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
  ctx.restore()

  // Results panel
  if (st > 0.4) {
    const panelA = Math.min(1, (st - 0.4) / 0.4)
    ctx.globalAlpha = panelA

    const px = u(w, 0.06), py = u(h, 0.2), pw = u(w, 0.5), ph = u(h, 0.6)

    // Panel bg with border
    ctx.fillStyle = "rgba(9,9,11,0.82)"
    ctx.fillRect(px, py, pw, ph)
    ctx.strokeStyle = BRIGHT; ctx.lineWidth = 1
    ctx.strokeRect(px, py, pw, ph)

    // Corner accents
    const arm = u(w, 0.03)
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2
      ;[[px, py], [px + pw, py], [px, py + ph], [px + pw, py + ph]].forEach(([cx, cy]) => {
        const dx = cx === px ? 1 : -1, dy = cy === py ? 1 : -1
        ctx.beginPath(); ctx.moveTo(cx + dx * arm, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * arm); ctx.stroke()
      })

    // Heading
    const tx = px + u(w, 0.04), baseY = py + u(h, 0.1)
    typedText(ctx, "ANALYSIS REPORT", tx, baseY, Math.min(1, (st - 0.4) / 0.5), ACCENT, w, 0.022)

    // Divider line
    if (st > 0.7) {
      ctx.strokeStyle = MID; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(tx, baseY + u(h, 0.02)); ctx.lineTo(tx + u(w, 0.36), baseY + u(h, 0.02)); ctx.stroke()
    }

    // Large metrics
    const row = u(h, 0.065)
    typedText(ctx, "TOTAL RINGS:    142", tx, baseY + row * 1, Math.min(1, (st - 0.6) / 0.7), WHITE, w, 0.022)
    typedText(ctx, "ESTIMATED AGE:  142 YRS", tx, baseY + row * 2, Math.max(0, (st - 0.9) / 0.7), WHITE, w, 0.022)
    typedText(ctx, "CONFIDENCE:     98.2%", tx, baseY + row * 3, Math.max(0, (st - 1.2) / 0.7), ACCENT, w, 0.022)

    // Secondary metrics
    typedText(ctx, "PRECISION  0.913", tx, baseY + row * 4.2, Math.max(0, (st - 1.5) / 0.7), BRIGHT, w, 0.015)
    typedText(ctx, "RECALL     0.887", tx, baseY + row * 5, Math.max(0, (st - 1.7) / 0.7), BRIGHT, w, 0.015)
    typedText(ctx, "F1_SCORE   0.900", tx, baseY + row * 5.8, Math.max(0, (st - 1.9) / 0.7), BRIGHT, w, 0.015)

    ctx.globalAlpha = 1
  }

  // Verified stamp
  if (st > 2.5) {
    const blinkOn = Math.floor(st * 3) % 2 === 0
    if (blinkOn) typedText(ctx, "[✓] ANALYSIS_COMPLETE", u(w, 0.06), u(h, 0.88), 1, ACCENT, w, 0.018)
  }

  setFont(ctx, w, 0.012, "normal"); ctx.fillStyle = MID; ctx.globalAlpha = 0.5
  ctx.fillText("07/07", w - u(w, 0.07), u(h, 0.06)); ctx.globalAlpha = 1
}

const OVERLAY_FNS = [overlayForest, overlayBark, overlayTrunkToCore, overlayCoreSample, overlayRingDisc, overlayMicroscopic, overlayResults]


/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export function TreeTraceStoryboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  const labelRef = useRef<HTMLSpanElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const imgs: HTMLImageElement[] = []
    let count = 0
    IMAGE_PATHS.forEach((src, i) => {
      const img = new Image()
      img.src = src
      img.onload = img.onerror = () => {
        if (cancelled) return
        if (++count === IMAGE_PATHS.length) { imagesRef.current = imgs; setLoaded(true) }
      }
      imgs[i] = img
    })
    return () => { cancelled = true }
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !loaded) { animRef.current = requestAnimationFrame(render); return }
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const now = performance.now() / 1000
    if (startRef.current === 0) startRef.current = now
    const time = (now - startRef.current) % TOTAL_DURATION

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.floor(rect.width * dpr)
    const h = Math.floor(rect.height * dpr)
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }

    // Pixel-perfect rendering — disable anti-aliasing for the brutalist feel
    ctx.imageSmoothingEnabled = false

    ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h)

    for (let i = 0; i < SCENES.length; i++) {
      const a = sceneAlpha(time, i)
      if (a <= 0) continue
      ctx.save()
      ctx.globalAlpha = a

      const img = imagesRef.current[i]
      if (img && img.complete && img.naturalWidth > 0) {
        drawImage(ctx, img, w, h, IMAGE_FRAMING[i])
        // Subtle dark scrim for overlay contrast
        ctx.fillStyle = "rgba(9,9,11,0.22)"
        ctx.fillRect(0, 0, w, h)
      }

      ctx.globalAlpha = a
      OVERLAY_FNS[i](ctx, w, h, time)
      ctx.restore()
    }

    drawScanlines(ctx, w, h)

    if (labelRef.current) labelRef.current.textContent = SCENE_LABELS[getActiveScene(time)]
    if (dotsRef.current) {
      const dots = dotsRef.current.children
      for (let i = 0; i < dots.length; i++) {
        const a = sceneAlpha(time, i)
        const d = dots[i] as HTMLElement
        d.style.width = a > 0.5 ? "16px" : "4px"
        d.style.opacity = a > 0.5 ? "0.8" : "0.3"
        d.style.backgroundColor = a > 0.5 ? BRIGHT : MID
      }
    }

    animRef.current = requestAnimationFrame(render)
  }, [loaded])

  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

  return (
    <div className="w-full relative">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ aspectRatio: "4 / 3", display: "block", imageRendering: "pixelated" }}
      />
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
        <span ref={labelRef} className="font-mono text-[10px] text-emerald-500/60 uppercase tracking-widest font-semibold">
          INITIALIZING...
        </span>
        <div ref={dotsRef} className="flex gap-1.5">
          {SCENES.map((_, i) => (
            <div key={i} className="h-1 rounded-full transition-all duration-500" style={{ width: "4px", backgroundColor: MID, opacity: 0.3 }} />
          ))}
        </div>
      </div>
    </div>
  )
}
