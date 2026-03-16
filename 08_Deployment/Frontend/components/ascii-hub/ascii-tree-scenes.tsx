"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

/* ═══════════════════════════════════════════════════════════════════
   BAYER DITHERING MATRIX (4×4)
   ═══════════════════════════════════════════════════════════════════ */
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/* ═══════════════════════════════════════════════════════════════════
   SCENE DEFINITIONS
   ═══════════════════════════════════════════════════════════════════ */
interface Scene {
  label: string
  status: string
  glowColor: string
  accentRgb: [number, number, number]
  draw: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number
  ) => void
}

/* ── Draw helpers ─────────────────────────────────────────────────── */

function ditherFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  brightness: number,
  r: number,
  g: number,
  b: number,
  timeOffset: number,
  pixelSize = 3
) {
  for (let py = 0; py < h; py += pixelSize) {
    for (let px = 0; px < w; px += pixelSize) {
      const bx = ((px / pixelSize + Math.floor(timeOffset)) | 0) % 4
      const by = ((py / pixelSize + Math.floor(timeOffset * 0.7)) | 0) % 4
      const threshold = (BAYER4[by][bx] / 16)
      if (brightness > threshold) {
        const alpha = Math.min(1, brightness * 0.9 + 0.1)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fillRect(x + px, y + py, pixelSize, pixelSize)
      }
    }
  }
}

function ditherCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  thickness: number,
  brightness: number,
  r: number,
  g: number,
  b: number,
  t: number,
  pixelSize = 3
) {
  const outerR = radius + thickness / 2
  const innerR = radius - thickness / 2
  const startX = Math.floor(cx - outerR)
  const startY = Math.floor(cy - outerR)
  const size = Math.ceil(outerR * 2)

  for (let py = 0; py < size; py += pixelSize) {
    for (let px = 0; px < size; px += pixelSize) {
      const dx = startX + px - cx
      const dy = startY + py - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist >= innerR && dist <= outerR) {
        const bx = ((px / pixelSize + Math.floor(t * 2)) | 0) % 4
        const by = ((py / pixelSize + Math.floor(t * 1.3)) | 0) % 4
        const threshold = BAYER4[by][bx] / 16
        if (brightness > threshold) {
          const alpha = Math.min(1, brightness * 0.85 + 0.15)
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.fillRect(startX + px, startY + py, pixelSize, pixelSize)
        }
      }
    }
  }
}

function ditherDisc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  brightness: number,
  r: number,
  g: number,
  b: number,
  t: number,
  pixelSize = 2
) {
  const startX = Math.floor(cx - radius)
  const startY = Math.floor(cy - radius)
  const size = Math.ceil(radius * 2)

  for (let py = 0; py < size; py += pixelSize) {
    for (let px = 0; px < size; px += pixelSize) {
      const dx = startX + px - cx
      const dy = startY + py - cy
      if (dx * dx + dy * dy <= radius * radius) {
        const bx = ((px / pixelSize + Math.floor(t * 3)) | 0) % 4
        const by = ((py / pixelSize + Math.floor(t * 2)) | 0) % 4
        const threshold = BAYER4[by][bx] / 16
        if (brightness > threshold) {
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, brightness)})`
          ctx.fillRect(startX + px, startY + py, pixelSize, pixelSize)
        }
      }
    }
  }
}

/* ── Scene 1: Full Tree ───────────────────────────────────────────── */
function drawTree(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const cx = w / 2
  const groundY = h * 0.85

  // Ground
  ditherFill(ctx, 0, groundY, w, h - groundY, 0.3, 16, 185, 129, t, 3)

  // Trunk
  const trunkW = w * 0.06
  const trunkH = h * 0.25
  ditherFill(ctx, cx - trunkW / 2, groundY - trunkH, trunkW, trunkH, 0.55, 139, 92, 46, t, 3)

  // Canopy layers (triangle tree shape)
  const layers = 5
  for (let i = 0; i < layers; i++) {
    const layerY = groundY - trunkH - (layers - i - 1) * (h * 0.09)
    const layerW = w * 0.12 + i * (w * 0.08)
    const layerH = h * 0.14
    const pulse = Math.sin(t * 1.5 + i * 0.5) * 0.05
    const bright = 0.5 + i * 0.05 + pulse

    // Tree canopy as triangle approximation
    for (let row = 0; row < layerH; row += 3) {
      const ratio = row / layerH
      const rowW = layerW * ratio
      ditherFill(
        ctx,
        cx - rowW / 2, layerY - layerH + row,
        rowW, 3,
        bright,
        16, 185, 129, t + i, 3
      )
    }
  }

  // Subtle particles
  for (let i = 0; i < 12; i++) {
    const px = cx + Math.sin(t * 0.4 + i * 1.8) * w * 0.35
    const py = h * 0.2 + Math.cos(t * 0.3 + i * 2.1) * h * 0.25
    const s = 2 + Math.sin(t + i) * 1
    ctx.fillStyle = `rgba(16,185,129,${0.2 + Math.sin(t * 0.8 + i) * 0.15})`
    ctx.fillRect(px, py, s, s)
  }
}

/* ── Scene 2: Trunk Zoom ──────────────────────────────────────────── */
function drawTrunk(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Bark texture — vertical stripes w/ dithering
  const stripeCount = 18
  for (let i = 0; i < stripeCount; i++) {
    const x = (i / stripeCount) * w
    const sw = w / stripeCount
    const wobble = Math.sin(t * 0.3 + i * 0.8) * 2
    const bright = 0.25 + Math.sin(i * 0.7 + t * 0.2) * 0.15
    ditherFill(ctx, x + wobble, 0, sw, h, bright, 139, 92, 46, t + i * 0.3, 3)
  }

  // Bark detail lines
  for (let i = 0; i < 8; i++) {
    const y = (i / 8) * h + Math.sin(t * 0.5 + i) * 4
    ditherFill(ctx, 0, y, w, 2, 0.4, 80, 50, 20, t + i, 2)
  }

  // Cut indicator — glowing horizontal line
  const cutY = h * 0.5 + Math.sin(t * 0.8) * 3
  const cutBright = 0.7 + Math.sin(t * 2) * 0.3
  ditherFill(ctx, w * 0.05, cutY - 2, w * 0.9, 4, cutBright, 245, 158, 11, t * 2, 2)

  // Cut zone glow
  for (let i = 1; i <= 3; i++) {
    ditherFill(ctx, w * 0.05, cutY - 2 - i * 4, w * 0.9, 2, cutBright * 0.3 / i, 245, 158, 11, t * 2, 3)
    ditherFill(ctx, w * 0.05, cutY + 2 + i * 4, w * 0.9, 2, cutBright * 0.3 / i, 245, 158, 11, t * 2, 3)
  }

  // Zoom crosshair
  const cornerSize = 20
  ctx.strokeStyle = `rgba(245,158,11,${0.5 + Math.sin(t * 1.5) * 0.2})`
  ctx.lineWidth = 1.5
  // Top-left
  ctx.beginPath(); ctx.moveTo(10, 10 + cornerSize); ctx.lineTo(10, 10); ctx.lineTo(10 + cornerSize, 10); ctx.stroke()
  // Top-right
  ctx.beginPath(); ctx.moveTo(w - 10 - cornerSize, 10); ctx.lineTo(w - 10, 10); ctx.lineTo(w - 10, 10 + cornerSize); ctx.stroke()
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(10, h - 10 - cornerSize); ctx.lineTo(10, h - 10); ctx.lineTo(10 + cornerSize, h - 10); ctx.stroke()
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(w - 10 - cornerSize, h - 10); ctx.lineTo(w - 10, h - 10); ctx.lineTo(w - 10, h - 10 - cornerSize); ctx.stroke()
}

/* ── Scene 3: Cross-Section Rings ─────────────────────────────────── */
function drawRings(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const cx = w / 2
  const cy = h / 2
  const maxR = Math.min(w, h) * 0.42

  // Rings from outside in
  const ringCount = 10
  const colors: [number, number, number][] = [
    [99, 102, 241], // indigo
    [129, 140, 248],
    [99, 102, 241],
    [129, 140, 248],
    [99, 102, 241],
    [129, 140, 248],
    [99, 102, 241],
    [167, 139, 250],
    [129, 140, 248],
    [99, 102, 241],
  ]

  for (let i = 0; i < ringCount; i++) {
    const radius = maxR - (i * maxR) / ringCount
    const thick = (maxR / ringCount) * 0.5
    const pulse = Math.sin(t * 0.8 + i * 0.6) * 0.08
    const bright = 0.35 + (i / ringCount) * 0.25 + pulse
    const [cr, cg, cb] = colors[i % colors.length]
    ditherCircle(ctx, cx, cy, radius, thick, bright, cr, cg, cb, t, 3)
  }

  // Pith center
  const pithPulse = 0.7 + Math.sin(t * 1.5) * 0.3
  ditherDisc(ctx, cx, cy, 8, pithPulse, 99, 102, 241, t, 2)

  // Scanner line
  const angle = t * 0.4
  const scanX = cx + Math.cos(angle) * maxR
  const scanY = cy + Math.sin(angle) * maxR
  ctx.strokeStyle = `rgba(99,102,241,${0.4 + Math.sin(t * 2) * 0.2})`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(scanX, scanY)
  ctx.stroke()
}

/* ── Scene 4: AI Analysis ─────────────────────────────────────────── */
function drawAnalysis(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const cx = w / 2
  const cy = h / 2
  const maxR = Math.min(w, h) * 0.38

  // Draw rings with alternating emerald highlight
  const ringCount = 9
  for (let i = 0; i < ringCount; i++) {
    const radius = maxR - (i * maxR) / ringCount
    const thick = (maxR / ringCount) * 0.5
    const isHighlighted = i === Math.floor((t * 1.5) % ringCount)
    const bright = isHighlighted ? 0.85 : 0.3 + (i / ringCount) * 0.2
    const r = isHighlighted ? 16 : 99
    const g = isHighlighted ? 185 : 102
    const b = isHighlighted ? 129 : 241
    ditherCircle(ctx, cx, cy, radius, thick, bright, r, g, b, t, 3)
  }

  // Pith
  ditherDisc(ctx, cx, cy, 7, 0.9, 16, 185, 129, t, 2)

  // Data labels
  ctx.font = "bold 12px 'Inter', system-ui, sans-serif"
  ctx.textBaseline = "alphabetic"
  const labels = [
    { text: "Ring 3: 2.1mm", angle: -0.5, dist: 0.75 },
    { text: "Ring 5: 0.9mm", angle: 0.8, dist: 0.6 },
    { text: "Ring 7: 1.4mm", dist: 0.45, angle: 2.2 },
    { text: "Ring 9: 1.8mm", dist: 0.85, angle: -1.8 },
  ]

  for (const label of labels) {
    const lx = Math.round(cx + Math.cos(label.angle) * maxR * label.dist)
    const ly = Math.round(cy + Math.sin(label.angle) * maxR * label.dist)
    const alpha = 0.5 + Math.sin(t * 1.2 + label.angle) * 0.3

    // Label bg
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.7})`
    const metrics = ctx.measureText(label.text)
    ctx.fillRect(lx - 4, ly - 12, Math.round(metrics.width) + 8, 16)

    // Label border
    ctx.strokeStyle = `rgba(16,185,129,${alpha * 0.6})`
    ctx.lineWidth = 1.5
    ctx.strokeRect(lx - 4, ly - 12, Math.round(metrics.width) + 8, 16)

    // Label text
    ctx.fillStyle = `rgba(16,185,129,${alpha})`
    ctx.fillText(label.text, lx, ly)
  }

  // Stats in bottom-right corner
  const statsAlpha = 0.6 + Math.sin(t) * 0.4
  ctx.fillStyle = `rgba(16,185,129,${statsAlpha})`
  ctx.font = "bold 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  const stats = ["✓ rings: 142", "✓ age: ~142 yrs", "✓ precision: 91%"]
  stats.forEach((s, i) => {
    ctx.fillText(s, Math.round(w - 120), Math.round(h - 45 + i * 15))
  })
}

/* ═══════════════════════════════════════════════════════════════════
   SCENES ARRAY
   ═══════════════════════════════════════════════════════════════════ */
const SCENES: Scene[] = [
  {
    label: "01 — TARGET ACQUIRED",
    status: "Scanning specimen...",
    glowColor: "#10B981",
    accentRgb: [16, 185, 129],
    draw: drawTree,
  },
  {
    label: "02 — TRUNK ISOLATION",
    status: "Extracting cross-section...",
    glowColor: "#F59E0B",
    accentRgb: [245, 158, 11],
    draw: drawTrunk,
  },
  {
    label: "03 — RING DETECTION",
    status: "Initializing CS-TRD algorithm...",
    glowColor: "#6366F1",
    accentRgb: [99, 102, 241],
    draw: drawRings,
  },
  {
    label: "04 — ANALYSIS COMPLETE",
    status: "142 rings detected — Age: ~142 years",
    glowColor: "#10B981",
    accentRgb: [16, 185, 129],
    draw: drawAnalysis,
  },
]

const SCENE_DURATION = 5000

/* ═══════════════════════════════════════════════════════════════════
   TYPING HOOK
   ═══════════════════════════════════════════════════════════════════ */
function useTypingText(text: string, active: boolean, speed = 25) {
  const [displayed, setDisplayed] = useState("")
  useEffect(() => {
    if (!active) { setDisplayed(""); return }
    let i = 0
    setDisplayed("")
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, active, speed])
  return displayed
}

/* ═══════════════════════════════════════════════════════════════════
   SCENE INDICATOR DOTS
   ═══════════════════════════════════════════════════════════════════ */
function SceneIndicator({ total, active, glowColor }: { total: number; active: number; glowColor: string }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === active ? 24 : 6,
            height: 6,
            backgroundColor: i === active ? glowColor : "rgba(255,255,255,0.15)",
            boxShadow: i === active ? `0 0 12px ${glowColor}` : "none",
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   DITHER CANVAS — renders the active scene
   ═══════════════════════════════════════════════════════════════════ */
function DitherCanvas({ sceneIndex }: { sceneIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  
  // Track logical sizes for drawing
  const [size, setSize] = useState({ w: 340, h: 260 })

  const drawFn = SCENES[sceneIndex].draw

  useEffect(() => {
    if (!wrapperRef.current || !canvasRef.current) return
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        let logicalWidth = entry.contentRect.width
        let logicalHeight = entry.contentRect.height
        if (logicalWidth === 0) logicalWidth = 340
        if (logicalHeight === 0) logicalHeight = 260
        
        const canvas = canvasRef.current
        if (canvas) {
           const dpr = window.devicePixelRatio || 1
           canvas.width = logicalWidth * dpr
           canvas.height = logicalHeight * dpr
        }
        setSize({ w: logicalWidth, h: logicalHeight })
      }
    })
    resizeObserver.observe(wrapperRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const startTime = performance.now()

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000
      
      const dpr = window.devicePixelRatio || 1
      const cw = size.w * dpr
      const ch = size.h * dpr

      // Ensure canvas DOM resolution matches CSS + DPR
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw
        canvas.height = ch
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.save()
      ctx.scale(dpr, dpr)
      // Pass the adaptive logical dimensions
      drawFn(ctx, size.w, size.h, elapsed)
      ctx.restore()

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [drawFn, size.w, size.h])

  return (
    <div ref={wrapperRef} className="w-full h-full relative" style={{ minHeight: "260px" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "auto" }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export function AsciiTreeScenes() {
  const [activeScene, setActiveScene] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % SCENES.length)
    }, SCENE_DURATION)
    return () => clearInterval(timer)
  }, [])

  const scene = SCENES[activeScene]
  const typedStatus = useTypingText(scene.status, true, 25)

  const ambientStyle = useMemo(
    () => ({
      background: `radial-gradient(ellipse at center, ${scene.glowColor}18 0%, transparent 70%)`,
    }),
    [scene.glowColor]
  )

  return (
    <div className="relative flex flex-col gap-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl transition-all duration-1000"
        style={ambientStyle}
        aria-hidden="true"
      />

      {/* Terminal window */}
      <div className="border-2 border-border bg-card relative overflow-hidden rounded-xl border border-white/[0.06]">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <div
            className="h-2.5 w-2.5 rounded-full transition-colors duration-500"
            style={{ backgroundColor: scene.glowColor, boxShadow: `0 0 6px ${scene.glowColor}` }}
          />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
          <span className="ml-2 font-mono text-[10px] text-muted-foreground/60">
            treetrace — analysis_pipeline
          </span>
        </div>

        {/* Scene label */}
        <div className="border-b border-white/[0.04] px-4 py-1.5">
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-widest transition-colors duration-500"
            style={{ color: scene.glowColor }}
          >
            {scene.label}
          </span>
        </div>

        {/* Dither canvas area */}
        <div className="relative px-2 py-2 flex-grow h-[300px] sm:h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-2"
            >
              <DitherCanvas sceneIndex={activeScene} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2">
          <div className="flex items-center gap-2">
            <div
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: scene.glowColor, boxShadow: `0 0 6px ${scene.glowColor}` }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">
              {typedStatus}
              <span className="animate-blink ml-0.5">▊</span>
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/40">v2.1.0</span>
        </div>
      </div>

      {/* Scene progress indicator */}
      <div className="flex items-center justify-between px-1">
        <SceneIndicator total={SCENES.length} active={activeScene} glowColor={scene.glowColor} />
        <span className="font-mono text-[10px] text-muted-foreground/40">
          {activeScene + 1}/{SCENES.length}
        </span>
      </div>
    </div>
  )
}
