"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  loadSvgImage,
  applyBayerDither,
  drawScanlines,
  breathe,
} from "./animation-utils"
import { TerminalFrame } from "./terminal-frame"

/* ═══════════════════════════════════════════════════════════════════
   SCENE 4: Full Tree — "Gentle Sway"
   Canopy dither mass with wind sway, leaf shimmer, stable trunk
   ═══════════════════════════════════════════════════════════════════ */

interface FullTreeDitheredProps {
  size?: "sm" | "md" | "lg"
  animation?: "sway" | "breathing" | "none"
  showTerminal?: boolean
  terminalTitle?: string
  className?: string
}

const SIZE_MAP = { sm: 200, md: 320, lg: 440 }

export function FullTreeDithered({
  size = "md",
  animation = "sway",
  showTerminal = false,
  terminalTitle = "SPECIMEN_LOG",
  className,
}: FullTreeDitheredProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  const dim = SIZE_MAP[size]
  const h = Math.round(dim * 1.3)

  const initDither = useCallback(async () => {
    try {
      const img = await loadSvgImage("/illustrations/full-tree.svg")
      const off = document.createElement("canvas")
      off.width = dim
      off.height = h
      const offCtx = off.getContext("2d")!
      offCtx.fillStyle = "#09090B"
      offCtx.fillRect(0, 0, dim, h)
      offCtx.drawImage(img, 0, 0, dim, h)
      applyBayerDither(offCtx, dim, h)
      offscreenRef.current = off
      setLoaded(true)
    } catch { /* noop */ }
  }, [dim, h])

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
      ctx.clearRect(0, 0, dim, h)

      if (animation === "sway") {
        // Gentle sway — skew the top (canopy) while keeping base stable
        const swayAngle = Math.sin(t * 0.4) * 0.008
        ctx.save()
        ctx.transform(1, 0, swayAngle, 1, 0, 0)
        ctx.drawImage(offscreen, 0, 0)
        ctx.restore()

        // Leaf shimmer — flicker pixels in the canopy region (top 50%)
        const shimmerData = ctx.getImageData(0, 0, dim, Math.round(h * 0.5))
        const sd = shimmerData.data
        for (let i = 0; i < sd.length; i += 4) {
          if (sd[i + 1] > 50 && Math.random() < 0.003) {
            const flicker = Math.random() > 0.5 ? 30 : -20
            sd[i] = Math.max(0, Math.min(255, sd[i] + flicker))
            sd[i + 1] = Math.max(0, Math.min(255, sd[i + 1] + flicker))
            sd[i + 2] = Math.max(0, Math.min(255, sd[i + 2] + flicker))
          }
        }
        ctx.putImageData(shimmerData, 0, 0)

        // Shadow follows canopy
        const shadowShift = Math.sin(t * 0.4) * 3
        ctx.fillStyle = "rgba(16,185,129,0.02)"
        ctx.beginPath()
        ctx.ellipse(dim / 2 + shadowShift, h - 15, dim * 0.35, 6, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (animation === "breathing") {
        const scale = breathe(t, 0.3, 0.99, 1.01)
        const ox = ((1 - scale) * dim) / 2
        const oy = ((1 - scale) * h) / 2
        ctx.save()
        ctx.translate(ox, oy)
        ctx.scale(scale, scale)
        ctx.drawImage(offscreen, 0, 0)
        ctx.restore()
      } else {
        ctx.drawImage(offscreen, 0, 0)
      }

      drawScanlines(ctx, dim, h, 0.03)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, dim, h, animation])

  const canvas = (
    <canvas
      ref={canvasRef}
      width={dim}
      height={h}
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
