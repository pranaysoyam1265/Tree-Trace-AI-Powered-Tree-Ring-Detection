"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  loadSvgImage,
  applyBayerDither,
  drawScanlines,
  breathe,
  PALETTE,
} from "./animation-utils"
import { TerminalFrame } from "./terminal-frame"

/* ═══════════════════════════════════════════════════════════════════
   SCENE 5: Forest Scene — "Fog Drift"
   Layered depth through dither density, drifting fog, fireflies
   ═══════════════════════════════════════════════════════════════════ */

interface ForestSceneDitheredProps {
  size?: "sm" | "md" | "lg" | "full"
  animation?: "fogDrift" | "none"
  showTerminal?: boolean
  terminalTitle?: string
  className?: string
}

const SIZE_MAP = { sm: 300, md: 500, lg: 700, full: 900 }

export function ForestSceneDithered({
  size = "md",
  animation = "fogDrift",
  showTerminal = false,
  terminalTitle = "SECTOR_07",
  className,
}: ForestSceneDitheredProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const firefliesRef = useRef<{ x: number; y: number; phase: number; speed: number }[]>([])
  const [loaded, setLoaded] = useState(false)

  const w = SIZE_MAP[size]
  const h = Math.round(w * 0.45)

  const initDither = useCallback(async () => {
    try {
      const img = await loadSvgImage("/illustrations/forest-scene.svg")
      const off = document.createElement("canvas")
      off.width = w
      off.height = h
      const offCtx = off.getContext("2d")!
      offCtx.fillStyle = "#09090B"
      offCtx.fillRect(0, 0, w, h)
      offCtx.drawImage(img, 0, 0, w, h)
      applyBayerDither(offCtx, w, h)
      offscreenRef.current = off

      // Init fireflies
      firefliesRef.current = Array.from({ length: 8 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.7,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      }))

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
      ctx.drawImage(offscreen, 0, 0)

      if (animation === "fogDrift") {
        // Fog layers drifting horizontally
        for (let layer = 0; layer < 3; layer++) {
          const fogY = h * (0.4 + layer * 0.15)
          const fogH = h * 0.12
          const drift = Math.sin(t * 0.15 + layer * 2) * 20
          const alpha = breathe(t, 0.2 + layer * 0.1, 0.02, 0.06)

          const gradient = ctx.createLinearGradient(0, fogY, 0, fogY + fogH)
          gradient.addColorStop(0, `rgba(16,185,129,0)`)
          gradient.addColorStop(0.5, `rgba(16,185,129,${alpha})`)
          gradient.addColorStop(1, `rgba(16,185,129,0)`)
          ctx.fillStyle = gradient
          ctx.fillRect(drift, fogY, w, fogH)
        }

        // Fireflies (emerald sparks)
        for (const ff of firefliesRef.current) {
          const fx = ff.x + Math.sin(t * ff.speed + ff.phase) * 15
          const fy = ff.y + Math.cos(t * ff.speed * 0.7 + ff.phase) * 8
          const glow = breathe(t * ff.speed, 1.5, 0, 0.9)

          if (glow > 0.3) {
            ctx.beginPath()
            ctx.arc(fx, fy, 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(16,185,129,${glow})`
            ctx.fill()
            ctx.beginPath()
            ctx.arc(fx, fy, 6, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(16,185,129,${glow * 0.2})`
            ctx.fill()
          }
        }

        // Subtle tree breathing
        ctx.globalAlpha = breathe(t, 0.15, 0, 0.02)
        ctx.drawImage(offscreen, 0, 0)
        ctx.globalAlpha = 1

        // Coordinate label
        ctx.fillStyle = "rgba(16,185,129,0.25)"
        ctx.font = "8px monospace"
        ctx.fillText("LAT 45.23° N  LON 122.15° W", 8, h - 6)
      }

      drawScanlines(ctx, w, h, 0.03)
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
      className={cn("w-full h-auto", !loaded && "opacity-0")}
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
