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
   SCENE 1: Tree Ring Cross-Section — "Ring Pulse"
   Live dithered animation with breathing, scan beam, and shimmer
   ═══════════════════════════════════════════════════════════════════ */

interface TreeRingDitheredProps {
  size?: "sm" | "md" | "lg" | "xl"
  animation?: "ringPulse" | "breathing" | "none"
  glowIntensity?: number
  showTerminal?: boolean
  terminalTitle?: string
  className?: string
}

const SIZE_MAP = { sm: 200, md: 320, lg: 440, xl: 520 }

export function TreeRingDithered({
  size = "md",
  animation = "ringPulse",
  glowIntensity = 0.3,
  showTerminal = true,
  terminalTitle = "ANALYZING...",
  className,
}: TreeRingDitheredProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const rafRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  const dim = SIZE_MAP[size]

  // Load SVG and create the base dithered frame
  const initDither = useCallback(async () => {
    try {
      const img = await loadSvgImage("/illustrations/tree-ring-cross-section.svg")
      imgRef.current = img

      // Create offscreen canvas for the base dithered image
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
    } catch {
      // SVG failed to load — will show empty terminal
    }
  }, [dim])

  useEffect(() => {
    initDither()
  }, [initDither])

  // Animation loop
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

      if (animation === "ringPulse" || animation === "breathing") {
        // Breathing scale
        const scale = breathe(t, 0.5, 0.99, 1.02)
        const offset = ((1 - scale) * dim) / 2

        ctx.save()
        ctx.translate(offset, offset)
        ctx.scale(scale, scale)
        ctx.drawImage(offscreen, 0, 0)
        ctx.restore()

        // Dither shimmer — re-dither a section periodically
        const shimmerPhase = Math.sin(t * 1.5) * 0.5 + 0.5
        ctx.globalAlpha = shimmerPhase * 0.06
        ctx.drawImage(offscreen, 0, 0)
        ctx.globalAlpha = 1

        // Scan beam sweep (every 4 seconds)
        if (animation === "ringPulse") {
          const beamPos = (t % 4) / 4
          drawScanBeam(ctx, dim, dim, beamPos, true, PALETTE.emerald, 2)
        }

        // Subtle rotation oscillation
        if (animation === "ringPulse") {
          const angle = Math.sin(t * 0.3) * 0.008 // ~0.5 degrees
          ctx.save()
          ctx.translate(dim / 2, dim / 2)
          ctx.rotate(angle)
          ctx.globalAlpha = 0.15
          ctx.drawImage(offscreen, -dim / 2, -dim / 2)
          ctx.globalAlpha = 1
          ctx.restore()
        }
      } else {
        ctx.drawImage(offscreen, 0, 0)
      }

      // Pith glow (center dot)
      const pithPulse = breathe(t, 1.2, 0.4, 0.9)
      ctx.beginPath()
      ctx.arc(dim / 2, dim / 2, 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(16,185,129,${pithPulse})`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(dim / 2, dim / 2, 8, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(16,185,129,${pithPulse * 0.3})`
      ctx.fill()

      // Scanlines
      drawScanlines(ctx, dim, dim, 0.05)

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
      className={cn(
        "w-full h-auto dither-shimmer",
        !loaded && "opacity-0"
      )}
      style={{
        imageRendering: "pixelated",
        maxWidth: dim,
        filter: glowIntensity > 0
          ? `drop-shadow(0 0 ${glowIntensity * 60}px rgba(16,185,129,${glowIntensity}))`
          : undefined,
      }}
    />
  )

  if (!showTerminal) return <div className={className}>{canvas}</div>

  return (
    <TerminalFrame
      title={terminalTitle}
      showScanlines
      className={className}
    >
      <div className="p-2">{canvas}</div>
    </TerminalFrame>
  )
}
