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
   SCENE 2: Core Sample — "Scan Line"
   Horizontal cylinder with dithered shading, vertical scan line
   ═══════════════════════════════════════════════════════════════════ */

interface CoreSampleDitheredProps {
  size?: "sm" | "md" | "lg"
  animation?: "scanLine" | "breathing" | "none"
  progress?: number
  showTerminal?: boolean
  terminalTitle?: string
  className?: string
}

const SIZE_MAP = { sm: 200, md: 360, lg: 480 }

export function CoreSampleDithered({
  size = "md",
  animation = "scanLine",
  progress,
  showTerminal = true,
  terminalTitle = "SAMPLE_001",
  className,
}: CoreSampleDitheredProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  const w = SIZE_MAP[size]
  const h = Math.round(w * 0.55)

  const initDither = useCallback(async () => {
    try {
      const img = await loadSvgImage("/illustrations/core-sample.svg")
      const off = document.createElement("canvas")
      off.width = w
      off.height = h
      const offCtx = off.getContext("2d")!
      offCtx.fillStyle = "#09090B"
      offCtx.fillRect(0, 0, w, h)
      offCtx.drawImage(img, 0, 0, w, h)
      applyBayerDither(offCtx, w, h)
      offscreenRef.current = off
      setLoaded(true)
    } catch { /* noop */ }
  }, [w, h])

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
      ctx.clearRect(0, 0, w, h)

      // Breathing
      if (animation === "breathing") {
        const scale = breathe(t, 0.4, 0.99, 1.01)
        const ox = ((1 - scale) * w) / 2
        const oy = ((1 - scale) * h) / 2
        ctx.save()
        ctx.translate(ox, oy)
        ctx.scale(scale, scale)
        ctx.drawImage(offscreen, 0, 0)
        ctx.restore()
      } else {
        ctx.drawImage(offscreen, 0, 0)
      }

      // Vertical scan line (left to right)
      if (animation === "scanLine") {
        const scanPos = progress !== undefined
          ? progress / 100
          : (t % 5) / 5
        drawScanBeam(ctx, w, h, scanPos, false, PALETTE.emerald, 2)

        // Illumination trail
        const trailWidth = scanPos * w
        ctx.globalAlpha = 0.08
        ctx.fillStyle = `rgba(16,185,129,1)`
        ctx.fillRect(0, 0, trailWidth, h)
        ctx.globalAlpha = 1
      }

      // Measurement markers along bottom
      ctx.fillStyle = "rgba(16,185,129,0.3)"
      ctx.font = "8px monospace"
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * w
        ctx.fillRect(x, h - 8, 1, 4)
        if (i % 2 === 0) {
          ctx.fillText(`${i * 10}`, x + 2, h - 2)
        }
      }

      // Progress label
      if (progress !== undefined) {
        ctx.fillStyle = "rgba(16,185,129,0.8)"
        ctx.font = "bold 10px monospace"
        ctx.fillText(`${progress}%`, w - 35, 14)
      }

      drawScanlines(ctx, w, h, 0.04)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, w, h, animation, progress])

  const canvas = (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      className={cn("w-full h-auto dither-shimmer", !loaded && "opacity-0")}
      style={{ imageRendering: "pixelated", maxWidth: w }}
    />
  )

  if (!showTerminal) return <div className={className}>{canvas}</div>

  return (
    <TerminalFrame title={terminalTitle} className={className}>
      <div className="p-2">{canvas}</div>
    </TerminalFrame>
  )
}
