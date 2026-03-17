"use client"

/* ═══════════════════════════════════════════════════════════════════
   RING BOUNDARY MAP  — Canvas-based ring polygon visualization
   Shows detected ring boundaries as colored polygon outlines.
   Now uses REAL polygon data from the API (result.rings[].points).
   ═══════════════════════════════════════════════════════════════════ */

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react"
import { Download } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"
import { getRingColor, getSpectrumGradient } from "@/lib/ring-map/colors"
import {
  computeFitTransform,
  transformPolygon,
  distanceToPolygon,
  type Point,
  type ScaleTransform,
} from "@/lib/ring-map/geometry"

/* ── Props ── */
interface Props {
  result: AnalysisResult
  selectedRing: number | null
  onSelectRing: (id: number | null) => void
}

/* ══════════════════════════════════════════════════════════════════ */
export function RingBoundaryMap({ result, selectedRing, onSelectRing }: Props) {
  /* ── Refs ── */
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* ── State ── */
  const [canvasW, setCanvasW] = useState(600)
  const [canvasH, setCanvasH] = useState(600)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [showLabels, setShowLabels] = useState(false)
  const [hoveredRing, setHoveredRing] = useState<number | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  /* ── Real polygon data from API ── */
  const imageWidth = result.image_dimensions.width || 2364
  const imageHeight = result.image_dimensions.height || 2364
  const pithPoint: Point = { x: result.pith.cx, y: result.pith.cy }

  // Convert API ring polygon points [[x,y],...] to Point[]
  const ringPolygons: Point[][] = useMemo(
    () =>
      result.rings.map((ring) =>
        (ring.points || []).map((pt: number[]) => ({ x: pt[0], y: pt[1] }))
      ),
    [result.rings]
  )

  /* ── Responsive resize observer ── */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width)
        setCanvasW(w)
        setCanvasH(w) // keep square
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* ── Compute base transform ── */
  const baseTransform = useMemo(
    () => computeFitTransform(imageWidth, imageHeight, canvasW, canvasH, 24),
    [imageWidth, imageHeight, canvasW, canvasH]
  )

  const fullTransform: ScaleTransform = useMemo(
    () => ({ ...baseTransform, zoom, panX, panY }),
    [baseTransform, zoom, panX, panY]
  )

  /* ── Pre-compute transformed polygon points ── */
  const transformedRings = useMemo(
    () =>
      ringPolygons.map((pts) =>
        transformPolygon(pts, fullTransform, canvasW, canvasH)
      ),
    [ringPolygons, fullTransform, canvasW, canvasH]
  )

  /* ── Canvas drawing ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasW * dpr
    canvas.height = canvasH * dpr
    canvas.style.width = `${canvasW}px`
    canvas.style.height = `${canvasH}px`
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Background
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvasW, canvasH)

    const totalRings = transformedRings.length
    if (totalRings === 0) return

    // Draw rings
    for (let i = 0; i < totalRings; i++) {
      const pts = transformedRings[i]
      if (!pts || pts.length < 3) continue
      const ringId = i + 1
      const isSelected = selectedRing === ringId
      const isHovered = hoveredRing === ringId
      const dimmed = selectedRing !== null && !isSelected && !isHovered

      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let j = 1; j < pts.length; j++) {
        ctx.lineTo(pts[j].x, pts[j].y)
      }
      ctx.closePath()

      if (isSelected || isHovered) {
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = isSelected ? 2.5 : 2
        ctx.shadowColor = getRingColor(i, totalRings, 0.7)
        ctx.shadowBlur = 8
      } else {
        ctx.strokeStyle = getRingColor(i, totalRings, dimmed ? 0.35 : 1)
        ctx.lineWidth = 1.8
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
      }

      ctx.stroke()
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
    }

    // Draw pith marker
    const pithCanvas = {
      x: canvasW / 2 + (baseTransform.offsetX + pithPoint.x * baseTransform.scale - canvasW / 2) * zoom + panX,
      y: canvasH / 2 + (baseTransform.offsetY + pithPoint.y * baseTransform.scale - canvasH / 2) * zoom + panY,
    }
    ctx.beginPath()
    ctx.arc(pithCanvas.x, pithCanvas.y, 4, 0, Math.PI * 2)
    ctx.strokeStyle = getRingColor(0, totalRings)
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(pithCanvas.x, pithCanvas.y, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = getRingColor(0, totalRings)
    ctx.fill()

    // Draw labels
    if (showLabels) {
      ctx.font = "10px 'JetBrains Mono', monospace"
      ctx.textAlign = "center"
      for (let i = 0; i < totalRings; i++) {
        if (totalRings > 15 && i % 2 !== 0) continue
        const pts = transformedRings[i]
        if (!pts || pts.length < 3) continue
        let topIdx = 0
        for (let j = 1; j < pts.length; j++) {
          if (pts[j].y < pts[topIdx].y) topIdx = j
        }
        const lx = pts[topIdx].x
        const ly = pts[topIdx].y - 6

        const text = String(i + 1)
        const tm = ctx.measureText(text)
        const pw = tm.width + 6
        const ph = 12
        ctx.fillStyle = "rgba(0,0,0,0.8)"
        ctx.fillRect(lx - pw / 2, ly - ph + 2, pw, ph)

        ctx.fillStyle = "#ffffff"
        ctx.fillText(text, lx, ly)
      }
    }
  }, [
    canvasW, canvasH, transformedRings,
    selectedRing, hoveredRing, showLabels,
    zoom, panX, panY, baseTransform, pithPoint,
  ])

  /* ── Mouse interaction ── */
  const getMousePos = useCallback(
    (e: React.MouseEvent): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && panStart.current) {
        const dx = e.clientX - panStart.current.x
        const dy = e.clientY - panStart.current.y
        setPanX(panStart.current.px + dx)
        setPanY(panStart.current.py + dy)
        return
      }

      const mouse = getMousePos(e)
      let found: number | null = null
      let minDist = Infinity
      for (let i = transformedRings.length - 1; i >= 0; i--) {
        if (!transformedRings[i] || transformedRings[i].length < 3) continue
        const d = distanceToPolygon(mouse, transformedRings[i])
        if (d < 6 && d < minDist) {
          minDist = d
          found = i + 1
        }
      }
      setHoveredRing(found)
    },
    [isPanning, getMousePos, transformedRings]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsPanning(true)
        panStart.current = { x: e.clientX, y: e.clientY, px: panX, py: panY }
      }
    },
    [zoom, panX, panY]
  )

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
      panStart.current = null
      return
    }
  }, [isPanning])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) return
      const mouse = getMousePos(e)
      let found: number | null = null
      let minDist = Infinity
      for (let i = transformedRings.length - 1; i >= 0; i--) {
        if (!transformedRings[i] || transformedRings[i].length < 3) continue
        const d = distanceToPolygon(mouse, transformedRings[i])
        if (d < 6 && d < minDist) {
          minDist = d
          found = i + 1
        }
      }
      onSelectRing(found === selectedRing ? null : found ?? null)
    },
    [isPanning, getMousePos, transformedRings, onSelectRing, selectedRing]
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      setZoom((z) => {
        const delta = e.deltaY > 0 ? -0.15 : 0.15
        return Math.max(0.5, Math.min(4, z + delta))
      })
    },
    []
  )

  /* ── Export PNG ── */
  const exportPng = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `ring-boundary-map-${result.id}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }, [result.id])

  /* ── Zoom helpers ── */
  const zoomIn = () => setZoom((z) => Math.min(4, z + 0.25))
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25))
  const fitView = () => { setZoom(1); setPanX(0); setPanY(0) }

  const ringWidthForHovered = hoveredRing && result.rings[hoveredRing - 1]
    ? result.rings[hoveredRing - 1].width_px
    : null

  return (
    <div className="border-2 border-[#333333] bg-[#141414] relative">
      {/* Corner accents */}
      <div className="absolute top-[-1px] left-[-1px] w-2 h-2 bg-[#ea580c] z-10" />
      <div className="absolute top-[-1px] right-[-1px] w-2 h-2 bg-[#ea580c] z-10" />
      <div className="absolute bottom-[-1px] left-[-1px] w-2 h-2 bg-[#ea580c] z-10" />
      <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 bg-[#ea580c] z-10" />

      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
        <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
          [RING BOUNDARY MAP]
        </span>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
          {result.ring_count} RINGS
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b-2 border-[#333333] bg-[#141414]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`font-mono text-[10px] uppercase tracking-[0.1em] px-2 py-1 border-2 ${showLabels
              ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]"
              : "border-[#333333] text-[#a3a3a3] hover:text-white hover:border-[#555555]"
              }`}
          >
            [LABELS: {showLabels ? "ON_" : "OFF"}]
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="font-mono text-[10px] px-2 py-1 border-2 border-[#333333] text-[#a3a3a3] hover:text-white hover:border-[#555555]"
          >
            [─]
          </button>
          <span className="font-mono text-[10px] text-[#a3a3a3] w-10 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="font-mono text-[10px] px-2 py-1 border-2 border-[#333333] text-[#a3a3a3] hover:text-white hover:border-[#555555]"
          >
            [+]
          </button>
          <button
            onClick={fitView}
            className="font-mono text-[10px] px-2 py-1 border-2 border-[#333333] text-[#a3a3a3] hover:text-white hover:border-[#555555]"
          >
            [FIT]
          </button>

          <div className="w-px h-4 bg-[#333333] mx-1" />

          <button
            onClick={exportPng}
            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] px-2 py-1 border-2 border-[#333333] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c]"
          >
            <Download className="w-3 h-3" />
            [▸ EXPORT PNG]
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ aspectRatio: "1 / 1" }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            cursor: isPanning ? "grabbing" : zoom > 1 ? "grab" : hoveredRing ? "pointer" : "crosshair",
          }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setHoveredRing(null); setIsPanning(false); panStart.current = null }}
          onClick={handleClick}
          onWheel={handleWheel}
        />

        {/* Hover tooltip (top-left) */}
        {hoveredRing && (
          <div className="absolute top-3 left-3 border-2 border-[#ea580c] bg-[#0a0a0a]/95 px-3 py-2 pointer-events-none z-20">
            <span className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-[0.15em]">
              RING {hoveredRing}
            </span>
            {ringWidthForHovered !== null && (
              <span className="font-mono text-xs text-white ml-2">
                — WIDTH: {ringWidthForHovered.toFixed(1)}PX
              </span>
            )}
          </div>
        )}

        {/* Selected ring indicator (top-right) */}
        {selectedRing && !hoveredRing && (
          <div className="absolute top-3 right-3 border-2 border-[#ea580c] bg-[#0a0a0a]/95 px-3 py-2 pointer-events-none z-20">
            <span className="font-mono text-[10px] text-[#ea580c] uppercase tracking-[0.15em]">
              SELECTED: RING {selectedRing}
            </span>
          </div>
        )}
      </div>

      {/* Color legend strip */}
      <div className="flex items-center gap-3 px-4 py-2 border-t-2 border-[#333333]">
        <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.2em] shrink-0">
          INNER
        </span>
        <div
          className="flex-1 h-2 border border-[#333333]"
          style={{ background: getSpectrumGradient() }}
        />
        <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.2em] shrink-0">
          OUTER
        </span>
      </div>
    </div>
  )
}
