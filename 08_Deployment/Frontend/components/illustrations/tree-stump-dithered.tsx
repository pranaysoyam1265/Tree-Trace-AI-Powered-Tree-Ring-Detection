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
   SCENE 3: Tree Stump — "Weathered Breathing"
   Heavy bark dithering, barely perceptible breathing, CRT flicker
   ═══════════════════════════════════════════════════════════════════ */

interface TreeStumpDitheredProps {
  size?: "sm" | "md" | "lg"
  animation?: "weathered" | "none"
  showTerminal?: boolean
  terminalTitle?: string
  className?: string
}

const SIZE_MAP = { sm: 180, md: 300, lg: 420 }

export function TreeStumpDithered({
  size = "md",
  animation = "weathered",
  showTerminal = true,
  terminalTitle = "ERROR_404",
  className,
}: TreeStumpDitheredProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  const dim = SIZE_MAP[size]

  const initDither = useCallback(async () => {
    try {
      const img = await loadSvgImage("/illustrations/tree-stump.svg")
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

      if (animation === "weathered") {
        // Barely perceptible breathing
        const scale = breathe(t, 0.2, 0.998, 1.003)
        const offset = ((1 - scale) * dim) / 2
        ctx.save()
        ctx.translate(offset, offset)
        ctx.scale(scale, scale)
        ctx.drawImage(offscreen, 0, 0)
        ctx.restore()

        // Shadow pulse (bottom area)
        const shadowAlpha = breathe(t, 0.3, 0.02, 0.06)
        ctx.fillStyle = `rgba(16,185,129,${shadowAlpha})`
        ctx.fillRect(0, dim * 0.8, dim, dim * 0.2)

        // Occasional CRT flicker
        const flickerChance = Math.sin(t * 7) + Math.sin(t * 13)
        if (flickerChance > 1.8) {
          ctx.globalAlpha = 0.03
          ctx.fillStyle = "#09090B"
          ctx.fillRect(0, 0, dim, dim)
          ctx.globalAlpha = 1
        }
      } else {
        ctx.drawImage(offscreen, 0, 0)
      }

      // Glitchy text
      if (animation === "weathered") {
        const textAlpha = breathe(t, 0.8, 0.2, 0.5)
        ctx.fillStyle = `rgba(239,68,68,${textAlpha})`
        ctx.font = "bold 10px monospace"
        const glitchX = Math.sin(t * 3) > 0.95 ? Math.random() * 4 - 2 : 0
        ctx.fillText("▸ RING_DATA_MISSING", 10 + glitchX, dim - 12)
      }

      drawScanlines(ctx, dim, dim, 0.06)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, dim, animation])

  const canvas = (
    <canvas
      ref={canvasRef}
      width={dim}
      height={dim}
      className={cn("w-full h-auto", !loaded && "opacity-0")}
      style={{ imageRendering: "pixelated", maxWidth: dim }}
    />
  )

  if (!showTerminal) return <div className={className}>{canvas}</div>

  return (
    <TerminalFrame
      title={terminalTitle}
      className={className}
    >
      <div className="p-2">{canvas}</div>
    </TerminalFrame>
  )
}
