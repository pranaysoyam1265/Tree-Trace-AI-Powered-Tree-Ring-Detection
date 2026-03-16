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
   SCENE 7: Tree Trunk — "Bark Texture"
   Heavy bark dithering, vertical shimmer, beetle pixel, lichen
   ═══════════════════════════════════════════════════════════════════ */

interface TreeTrunkDitheredProps {
  size?: "sm" | "md" | "lg"
  animation?: "bark" | "breathing" | "none"
  showTerminal?: boolean
  terminalTitle?: string
  className?: string
}

const SIZE_MAP = { sm: 180, md: 300, lg: 420 }

export function TreeTrunkDithered({
  size = "md",
  animation = "bark",
  showTerminal = true,
  terminalTitle = "SPECIES_OAK",
  className,
}: TreeTrunkDitheredProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  const w = SIZE_MAP[size]
  const h = Math.round(w * 1.4)

  const initDither = useCallback(async () => {
    try {
      const img = await loadSvgImage("/illustrations/tree-trunk.svg")
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

    // Beetle path (pixel cluster that wanders)
    let beetleX = w * 0.3
    let beetleY = h * 0.4
    let beetleVx = 0.2
    let beetleVy = 0.1

    const render = (time: number) => {
      const t = (time - startTime) / 1000
      ctx.clearRect(0, 0, w, h)

      if (animation === "bark") {
        ctx.drawImage(offscreen, 0, 0)

        // Vertical shimmer — subtle bright column that drifts
        const shimmerX = w * (0.3 + 0.4 * Math.sin(t * 0.2))
        const shimmerW = w * 0.06
        const shimmerAlpha = breathe(t, 0.3, 0.01, 0.04)
        const grad = ctx.createLinearGradient(shimmerX, 0, shimmerX + shimmerW, 0)
        grad.addColorStop(0, `rgba(16,185,129,0)`)
        grad.addColorStop(0.5, `rgba(16,185,129,${shimmerAlpha})`)
        grad.addColorStop(1, `rgba(16,185,129,0)`)
        ctx.fillStyle = grad
        ctx.fillRect(shimmerX, 0, shimmerW, h)

        // Beetle movement (pixel cluster)
        beetleX += beetleVx + Math.sin(t * 2) * 0.3
        beetleY += beetleVy + Math.cos(t * 1.5) * 0.2
        if (beetleX > w * 0.8 || beetleX < w * 0.2) beetleVx *= -1
        if (beetleY > h * 0.7 || beetleY < h * 0.3) beetleVy *= -1

        const beetleAlpha = breathe(t, 0.5, 0.3, 0.7)
        ctx.fillStyle = `rgba(6,95,70,${beetleAlpha})`
        ctx.fillRect(Math.round(beetleX), Math.round(beetleY), 3, 2)
        ctx.fillRect(Math.round(beetleX) + 1, Math.round(beetleY) - 1, 1, 1)

        // Lichen spots pulsing
        const lichenSpots = [
          { x: w * 0.2, y: h * 0.3, r: 4 },
          { x: w * 0.65, y: h * 0.55, r: 3 },
          { x: w * 0.4, y: h * 0.7, r: 5 },
        ]
        for (const spot of lichenSpots) {
          const alpha = breathe(t + spot.x, 0.15, 0.05, 0.15)
          ctx.beginPath()
          ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(16,185,129,${alpha})`
          ctx.fill()
        }

        // Shadow breathing
        const shadowAlpha = breathe(t, 0.2, 0.01, 0.03)
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`
        ctx.fillRect(w * 0.7, 0, w * 0.3, h)
      } else if (animation === "breathing") {
        const scale = breathe(t, 0.3, 0.99, 1.01)
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

      // Species info and health bar
      ctx.fillStyle = "rgba(16,185,129,0.3)"
      ctx.font = "8px monospace"
      ctx.fillText("BARK: 12mm", 8, h - 20)
      // Health bar
      ctx.fillStyle = "rgba(16,185,129,0.15)"
      ctx.fillRect(8, h - 14, 60, 5)
      ctx.fillStyle = "rgba(16,185,129,0.5)"
      ctx.fillRect(8, h - 14, 48, 5) // 80% health
      ctx.fillStyle = "rgba(16,185,129,0.3)"
      ctx.font = "7px monospace"
      ctx.fillText("HEALTH", 72, h - 10)

      drawScanlines(ctx, w, h, 0.05)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, w, h, animation])

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
