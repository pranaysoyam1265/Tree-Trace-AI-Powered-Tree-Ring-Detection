"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  loadSvgImage,
  applyBayerDither,
  drawScanlines,
  drawScanBeam,
  breathe,
  PALETTE,
} from "./animation-utils"
import { TerminalFrame } from "./terminal-frame"

/* ═══════════════════════════════════════════════════════════════════
   SCENE 6: Ring Detail — "Microscope Focus"
   Fine cell-structure dithering, zoom oscillation, focus sweep
   ═══════════════════════════════════════════════════════════════════ */

interface RingDetailDitheredProps {
  size?: "sm" | "md" | "lg"
  animation?: "focus" | "breathing" | "none"
  magnification?: string
  showTerminal?: boolean
  terminalTitle?: string
  className?: string
}

const SIZE_MAP = { sm: 200, md: 320, lg: 440 }

export function RingDetailDithered({
  size = "md",
  animation = "focus",
  magnification = "40X",
  showTerminal = true,
  terminalTitle = "40X MAGNIFICATION",
  className,
}: RingDetailDitheredProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  const dim = SIZE_MAP[size]

  const initDither = useCallback(async () => {
    try {
      const img = await loadSvgImage("/illustrations/ring-detail.svg")
      const off = document.createElement("canvas")
      off.width = dim
      off.height = dim
      const offCtx = off.getContext("2d")!
      offCtx.fillStyle = "#09090B"
      offCtx.fillRect(0, 0, dim, dim)
      offCtx.drawImage(img, 0, 0, dim, dim)
      applyBayerDither(offCtx, dim, dim)
      offscreenRef.current = off
      setLoaded(true)
    } catch { /* noop */ }
  }, [dim])

  useEffect(() => { initDither() }, [initDither])

  useEffect(() => {
    if (!loaded) return
    const canvas = canvasRef.current
    const offscreen = offscreenRef.current
    if (!canvas || !offscreen) return
    const ctx = canvas.getContext("2d")!
    const startTime = performance.now()

    const render = (time: number) => {
      const t = (time - startTime) / 1000
      ctx.clearRect(0, 0, dim, dim)

      if (animation === "focus") {
        // Zoom oscillation (microscope breathing)
        const zoom = breathe(t, 0.35, 1.0, 1.06)
        const ox = ((1 - zoom) * dim) / 2
        const oy = ((1 - zoom) * dim) / 2
        ctx.save()
        ctx.translate(ox, oy)
        ctx.scale(zoom, zoom)
        ctx.drawImage(offscreen, 0, 0)
        ctx.restore()

        // Focus sweep (horizontal blur region that moves)
        const focusY = dim * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.5)))
        const focusH = dim * 0.15
        ctx.globalAlpha = 0.04
        ctx.filter = "blur(1px)"
        ctx.drawImage(offscreen, 0, focusY - focusH, dim, focusH * 2, 0, focusY - focusH, dim, focusH * 2)
        ctx.filter = "none"
        ctx.globalAlpha = 1

        // Measurement line that appears/fades
        const measureAlpha = breathe(t, 0.25, 0, 0.6)
        ctx.strokeStyle = `rgba(245,158,11,${measureAlpha})`
        ctx.lineWidth = 1
        ctx.setLineDash([4, 3])
        const lineY = dim * 0.5
        ctx.beginPath()
        ctx.moveTo(dim * 0.15, lineY)
        ctx.lineTo(dim * 0.85, lineY)
        ctx.stroke()
        ctx.setLineDash([])

        // Measurement text
        if (measureAlpha > 0.3) {
          ctx.fillStyle = `rgba(245,158,11,${measureAlpha})`
          ctx.font = "bold 9px monospace"
          ctx.fillText("2.3mm", dim * 0.42, lineY - 4)
        }

        // Crosshair
        const crossAlpha = breathe(t, 0.6, 0.15, 0.3)
        ctx.strokeStyle = `rgba(16,185,129,${crossAlpha})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(dim / 2, 0)
        ctx.lineTo(dim / 2, dim)
        ctx.moveTo(0, dim / 2)
        ctx.lineTo(dim, dim / 2)
        ctx.stroke()
      } else if (animation === "breathing") {
        const scale = breathe(t, 0.4, 0.99, 1.02)
        const ox = ((1 - scale) * dim) / 2
        const oy = ((1 - scale) * dim) / 2
        ctx.save()
        ctx.translate(ox, oy)
        ctx.scale(scale, scale)
        ctx.drawImage(offscreen, 0, 0)
        ctx.restore()
      } else {
        ctx.drawImage(offscreen, 0, 0)
      }

      // Magnification label
      ctx.fillStyle = "rgba(16,185,129,0.5)"
      ctx.font = "bold 9px monospace"
      ctx.fillText(`▸ ${magnification}`, 8, 14)

      // Scale bar
      ctx.fillStyle = "rgba(16,185,129,0.3)"
      ctx.fillRect(dim - 60, dim - 14, 40, 2)
      ctx.font = "7px monospace"
      ctx.fillText("100μm", dim - 60, dim - 4)

      // Specimen label
      ctx.fillStyle = "rgba(16,185,129,0.25)"
      ctx.font = "8px monospace"
      ctx.fillText("SPECIMEN_A", dim - 80, 14)

      drawScanlines(ctx, dim, dim, 0.04)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, dim, animation, magnification])

  const canvas = (
    <canvas
      ref={canvasRef}
      width={dim}
      height={dim}
      className={cn("w-full h-auto dither-shimmer", !loaded && "opacity-0")}
      style={{ imageRendering: "pixelated", maxWidth: dim }}
    />
  )

  if (!showTerminal) return <div className={className}>{canvas}</div>

  return (
    <TerminalFrame title={terminalTitle} className={className}>
      <div className="p-2">{canvas}</div>
    </TerminalFrame>
  )
}
