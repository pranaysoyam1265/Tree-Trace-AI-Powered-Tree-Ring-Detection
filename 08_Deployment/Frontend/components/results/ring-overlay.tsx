"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { Eye, EyeOff, Hash, Crosshair, ZoomIn, ZoomOut, Maximize, Maximize2, Target } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
  result: AnalysisResult
  selectedRing: number | null
  onSelectRing: (ringId: number | null) => void
}

function ringColor(index: number, total: number, alpha = 0.6): string {
  const hue = 20 + (index / total) * 30 // Tight orange scale
  return `hsla(${hue}, 90%, 55%, ${alpha})`
}

export function RingOverlay({ result, selectedRing, onSelectRing }: Props) {
  const [showRings, setShowRings] = useState(true)
  const [showLabels, setShowLabels] = useState(false)
  const [showPith, setShowPith] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [hoverRing, setHoverRing] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const maxRadius = useMemo(() => {
    const last = result.rings[result.rings.length - 1]
    return last ? last.outer_radius_px : 200
  }, [result.rings])

  const canvasSize = 480
  const scale = (canvasSize / 2 - 20) / maxRadius

  const resetZoom = () => setZoom(1)

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { })
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { })
    }
  }, [])

  const handleRingHover = useCallback((e: React.MouseEvent, ringId: number) => {
    const rect = (e.currentTarget as SVGElement).closest('.ring-canvas')?.getBoundingClientRect()
    if (!rect) return
    setHoverRing(ringId)
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  return (
    <div
      ref={containerRef}
      className="border border-border bg-background flex flex-col relative"
    >
      {/* Target Corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent z-20 pointer-events-none" />

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 relative z-20">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="h-2 w-2 bg-accent" />
            <div className="h-2 w-2 bg-muted/30" />
            <div className="h-2 w-2 bg-muted/30" />
          </div>
          <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
            [RING BOUNDARY MAP]
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle controls */}
          {[
            { icon: showRings ? Eye : EyeOff, label: "RINGS", active: showRings, toggle: () => setShowRings(!showRings) },
            { icon: Hash, label: "LABELS", active: showLabels, toggle: () => setShowLabels(!showLabels) },
            { icon: Crosshair, label: "PITH", active: showPith, toggle: () => setShowPith(!showPith) },
          ].map(({ icon: Icon, label, active, toggle }) => (
            <button
              key={label}
              onClick={toggle}
              className={cn(
                "flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-[1px] transition-colors border",
                active
                  ? "text-accent bg-accent/10 border-accent/50"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
              title={`Toggle ${label}`}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}

          <div className="w-px h-4 bg-border mx-2" />

          {/* Zoom controls */}
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-1.5 hover:bg-surface text-muted-foreground transition-colors" title="Zoom Out">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[10px] text-muted-foreground w-12 text-center tabular-nums hidden sm:inline-block">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="p-1.5 hover:bg-surface text-muted-foreground transition-colors" title="Zoom In">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button onClick={resetZoom} className="p-1.5 hover:bg-surface text-muted-foreground transition-colors" title="Fit to View">
            <Maximize className="h-3.5 w-3.5" />
          </button>
          <button onClick={toggleFullscreen} className="p-1.5 hover:bg-surface text-muted-foreground transition-colors hidden sm:block" title="Fullscreen">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="ring-canvas relative bg-background overflow-hidden flex items-center justify-center dot-grid-bg"
        style={{ height: isFullscreen ? "100%" : 520, minHeight: 520 }}
      >
        {/* Radar Line */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center top-0 left-0">
          <div className="w-full h-px bg-accent/5" />
          <div className="h-full w-px bg-accent/5 absolute left-1/2 top-0" />
        </div>

        {result.rings.length > 0 && (
          <div style={{ transform: `scale(${zoom})`, transition: "transform 0.1s ease-out" }}>
            <svg
              width={canvasSize}
              height={canvasSize}
              viewBox={`0 0 ${canvasSize} ${canvasSize}`}
              className="select-none"
            >
              {showRings &&
                result.rings.map((ring, i) => {
                  const isSelected = selectedRing === ring.ring_number
                  const isHovered = hoverRing === ring.ring_number
                  const r = ring.outer_radius_px * scale
                  return (
                    <circle
                      key={ring.ring_number}
                      cx={canvasSize / 2}
                      cy={canvasSize / 2}
                      r={r}
                      fill="none"
                      stroke={ringColor(i, result.rings.length, isSelected || isHovered ? 1 : 0.6)}
                      strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                      className="cursor-pointer transition-all duration-75"
                      onClick={() => onSelectRing(isSelected ? null : ring.ring_number)}
                      onMouseMove={(e) => handleRingHover(e, ring.ring_number)}
                      onMouseLeave={() => setHoverRing(null)}
                      style={{ filter: isSelected ? 'drop-shadow(0 0 4px rgba(234,88,12,0.8))' : 'none' }}
                    />
                  )
                })}

              {showLabels &&
                showRings &&
                result.rings
                  .filter((_, i) => i % 2 === 0)
                  .map((ring) => {
                    const r = ring.outer_radius_px * scale
                    return (
                      <text
                        key={`label-${ring.ring_number}`}
                        x={canvasSize / 2 + r * 0.7}
                        y={canvasSize / 2 - r * 0.7}
                        fill="rgba(255,255,255,0.4)"
                        fontSize={9}
                        fontFamily="monospace"
                      >
                        {ring.ring_number}
                      </text>
                    )
                  })}

              <line
                x1={canvasSize / 2}
                y1={canvasSize / 2}
                x2={canvasSize / 2 + maxRadius * scale}
                y2={canvasSize / 2}
                stroke="var(--accent)"
                strokeOpacity={0.4}
                strokeWidth={1}
                strokeDasharray="4 4"
              />

              {showPith && (
                <>
                  <circle cx={canvasSize / 2} cy={canvasSize / 2} r={3} fill="var(--accent)" />
                  <circle
                    cx={canvasSize / 2} cy={canvasSize / 2} r={8}
                    fill="none" stroke="var(--accent)" strokeWidth={1} opacity={0.6} strokeDasharray="2 2"
                  />
                </>
              )}
            </svg>
          </div>
        )}

        {/* Dynamic Hover Tooltip */}
        {hoverRing && result.rings.length > 0 && (
          <div
            className="absolute border border-accent bg-background/95 p-2 flex flex-col pointer-events-none z-20 shadow-[0_0_15px_rgba(234,88,12,0.15)] backdrop-blur-sm"
            style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 10 }}
          >
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-1 mb-1">
              RING {hoverRing}
            </span>
            <span className="font-mono text-xs font-bold text-accent tabular-nums">
              {result.rings[hoverRing - 1]?.width_px.toFixed(1)}PX
            </span>
          </div>
        )}

        {/* Fixed Selected Ring Panel */}
        {selectedRing && !hoverRing && result.rings.length > 0 && (
          <div className="absolute top-4 left-4 border border-accent bg-background/90 p-3 flex flex-col z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border pb-1 mb-1 flex items-center justify-between">
              <span>RING #{selectedRing}</span>
              <div className="w-1.5 h-1.5 bg-accent animate-pulse" />
            </span>
            <span className="font-mono text-sm font-bold text-accent tabular-nums">
              {result.rings[selectedRing - 1]?.width_px.toFixed(1)} PX
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
              IN: {result.rings[selectedRing - 1]?.inner_radius_px.toFixed(1)}px / OUT: {result.rings[selectedRing - 1]?.outer_radius_px.toFixed(1)}px
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 border border-border bg-surface/80 px-3 py-2 flex flex-col gap-2 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-2 w-16" style={{ background: "linear-gradient(to right, hsl(20,90%,55%), hsl(50,90%,55%))" }} />
            <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[1px]">IN → OUT</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-accent shadow-[0_0_8px_var(--color-accent)]" />
            <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[1px]">PITH</span>
          </div>
        </div>

        {/* Empty State */}
        {result.rings.length === 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="border border-status-error/50 bg-background p-8 flex flex-col items-center gap-4 text-center max-w-sm shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <div className="flex h-12 w-12 items-center justify-center bg-status-error/10 border border-status-error/30 text-status-error">
                <Target className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-mono text-sm font-bold text-status-error uppercase tracking-[2px]">
                  // DETECTION_FAILED
                </h3>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  CRITICAL: ALGORITHM UNABLE TO IDENTIFY VALID RING BOUNDARIES OR PITH ORIGIN.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
