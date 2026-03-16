"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { useAnalysis } from "@/lib/contexts/analysis-context"
import { Crosshair, RotateCcw, ZoomIn, ZoomOut, Maximize, MousePointer2 } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   STEP 2: PITH SELECTION — Domain Section Style (Premium)
   Ghost number + glass-card terminal with image canvas + controls
   ═══════════════════════════════════════════════════════════════════ */

export function PithStep() {
  const { state, setPith, clearPith, goNext, goBack } = useAnalysis()
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const [imgLoaded, setImgLoaded] = useState(false)
  const [manualX, setManualX] = useState("")
  const [manualY, setManualY] = useState("")

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPanning) return
      const img = imgRef.current
      const container = containerRef.current
      if (!img || !container) return
      const rect = container.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      const cw = rect.width
      const ch = rect.height
      const imgNatW = img.naturalWidth
      const imgNatH = img.naturalHeight
      const scale = Math.min(cw / imgNatW, ch / imgNatH) * zoom
      const dispW = imgNatW * scale
      const dispH = imgNatH * scale
      const imgLeft = (cw - dispW) / 2 + pan.x
      const imgTop = (ch - dispH) / 2 + pan.y
      const imgX = (clickX - imgLeft) / scale
      const imgY = (clickY - imgTop) / scale
      if (imgX < 0 || imgY < 0 || imgX > imgNatW || imgY > imgNatH) return
      setPith(Math.round(imgX), Math.round(imgY))
    },
    [zoom, pan, isPanning, setPith]
  )

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return
      if (e.button !== 1 && !e.altKey) return
      e.preventDefault()
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
    },
    [zoom, pan]
  )

  useEffect(() => {
    if (!isPanning) return
    const onMove = (e: MouseEvent) => {
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      })
    }
    const onUp = () => setIsPanning(false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [isPanning])

  const getPithScreenPos = useCallback(() => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container || !state.pith) return null
    const rect = container.getBoundingClientRect()
    const cw = rect.width
    const ch = rect.height
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * zoom
    const dispW = img.naturalWidth * scale
    const dispH = img.naturalHeight * scale
    const imgLeft = (cw - dispW) / 2 + pan.x
    const imgTop = (ch - dispH) / 2 + pan.y
    return { left: imgLeft + state.pith.x * scale, top: imgTop + state.pith.y * scale }
  }, [state.pith, zoom, pan])

  const pithPos = imgLoaded ? getPithScreenPos() : null

  // Handle manual coordinate submission
  const applyManualCoords = useCallback(() => {
    const x = parseInt(manualX)
    const y = parseInt(manualY)
    if (!isNaN(x) && !isNaN(y) && x >= 0 && y >= 0) {
      setPith(x, y)
    }
  }, [manualX, manualY, setPith])

  // Sync manual fields when pith changes via click
  useEffect(() => {
    if (state.pith) {
      setManualX(String(state.pith.x))
      setManualY(String(state.pith.y))
    }
  }, [state.pith])

  return (
    <div className="w-full px-4 pt-6 lg:px-8">
      {/* Phase Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#333333] pb-6 gap-4">
        <div>
          <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">IMAGE CALIBRATION</h1>
          <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
            Click on image to establish origin center point for radial detection.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#ea580c] font-bold">
          <Crosshair className="h-4 w-4" />
          <span>// PITH_TARGET</span>
        </div>
      </div>

      {/* Brutalist terminal panel */}
      <div className="border-2 border-[#333333] bg-[#141414] overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b-2 border-[#333333] bg-[#0d0d0d] px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ea580c]" />
            <div className="w-2 h-2 bg-[#333333]" />
            <div className="w-2 h-2 bg-[#333333]" />
            <span className="font-mono text-[10px] text-[#a3a3a3] ml-2 uppercase tracking-[0.15em]">
              pith-selector.sh
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#555555]">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 bg-[#0a0a0a]">
          {/* Left: Image Canvas (3 cols) */}
          <div className="border-b-2 border-[#333333] lg:col-span-3 lg:border-b-0 lg:border-r-2 lg:border-[#333333]">
            <div
              ref={containerRef}
              onClick={handleClick}
              onMouseDown={onMouseDown}
              className="relative cursor-crosshair bg-black/20 select-none"
              style={{ height: "520px" }}
            >
              {state.previewUrl && (
                <img
                  ref={imgRef}
                  src={state.previewUrl}
                  alt="Cross-section"
                  draggable={false}
                  onLoad={() => setImgLoaded(true)}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-100"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  }}
                />
              )}

              {/* Pith Marker */}
              {pithPos && (
                <div
                  className="absolute pointer-events-none z-10"
                  style={{ left: pithPos.left, top: pithPos.top, transform: "translate(-50%, -50%)" }}
                >
                  {/* Outer ring */}
                  <div className="absolute -inset-6 border border-[#ea580c]/30" />
                  <div className="absolute -inset-4 border-2 border-[#ea580c]/50" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute -translate-x-1/2 w-[1.5px] h-5 bg-[#ea580c]/60 -top-4" />
                    <div className="absolute -translate-x-1/2 w-[1.5px] h-5 bg-[#ea580c]/60 top-1" />
                    <div className="absolute -translate-y-1/2 h-[1.5px] w-5 bg-[#ea580c]/60 -left-4" />
                    <div className="absolute -translate-y-1/2 h-[1.5px] w-5 bg-[#ea580c]/60 left-1" />
                  </div>
                  <div className="h-2.5 w-2.5 bg-[#ea580c]" />
                </div>
              )}

              {/* Instruction overlay when no pith */}
              {!state.pith && imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-[#333333] bg-[#141414] px-6 py-4 flex items-center gap-3">
                    <MousePointer2 className="h-5 w-5 text-[#ea580c]" />
                    <div>
                      <p className="text-sm font-mono font-bold text-white uppercase tracking-[0.1em]">Click to mark the pith</p>
                      <p className="text-[10px] font-mono text-[#555555] mt-0.5">Select the biological center of the trunk</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls panel (2 cols) */}
          <div className="flex flex-col lg:col-span-2">
            {/* Section title */}
            <div className="border-b-2 border-[#333333] p-5">
              <h2 className="font-mono text-sm uppercase tracking-[0.15em] text-white font-bold mb-2">
                SET PITH CENTER
              </h2>
              <p className="font-mono text-[10px] leading-relaxed text-[#555555]">
                Click on the image or enter coordinates manually.
                This point is used as the origin for radial ring detection.
              </p>
            </div>

            {/* Specs / Info */}
            <div className="flex-1 p-5 flex flex-col gap-5">
              {/* Manual Coordinate Input */}
              <div className="border-2 border-[#333333] bg-[#0d0d0d] p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ea580c] block mb-3 font-bold">
                  // COORDINATES
                </span>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase text-[#555555] tracking-[0.15em]">X (px)</label>
                      <input
                        type="number"
                        value={manualX}
                        onChange={e => setManualX(e.target.value)}
                        placeholder="0"
                        className="border-2 border-[#333333] bg-[#141414] px-3 py-2 font-mono text-sm text-white placeholder:text-[#333333] focus:border-[#ea580c] focus:outline-none tabular-nums"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase text-[#555555] tracking-[0.15em]">Y (px)</label>
                      <input
                        type="number"
                        value={manualY}
                        onChange={e => setManualY(e.target.value)}
                        placeholder="0"
                        className="border-2 border-[#333333] bg-[#141414] px-3 py-2 font-mono text-sm text-white placeholder:text-[#333333] focus:border-[#ea580c] focus:outline-none tabular-nums"
                      />
                    </div>
                  </div>
                  <button
                    onClick={applyManualCoords}
                    disabled={!manualX || !manualY}
                    className="w-full border-2 border-[#ea580c] bg-[#ea580c]/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#ea580c] font-bold hover:bg-[#ea580c] hover:text-white transition-none disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    [APPLY COORDINATES]
                  </button>
                  <button
                    onClick={() => {
                      const img = imgRef.current
                      if (img && img.naturalWidth > 0) {
                        const cx = Math.round(img.naturalWidth / 2)
                        const cy = Math.round(img.naturalHeight / 2)
                        setPith(cx, cy)
                      }
                    }}
                    className="w-full border-2 border-[#333333] bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#a3a3a3] font-bold hover:text-[#ea580c] hover:border-[#ea580c] transition-none"
                  >
                    [▸ USE IMAGE CENTER]
                  </button>
                </div>
                {state.pith && (
                  <div className="mt-3 flex items-center gap-2 font-mono text-[10px] border-t border-[#333333] pt-3">
                    <div className="w-2 h-2 bg-[#ea580c]" />
                    <span className="text-[#ea580c] font-bold">POINT SET — ({state.pith.x}, {state.pith.y})</span>
                  </div>
                )}
                {/* Image Metadata */}
                {imgRef.current && imgRef.current.naturalWidth > 0 && (
                  <div className="mt-3 border-t border-[#333333] pt-3 flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-[#555555]">
                      IMAGE: {imgRef.current.naturalWidth} × {imgRef.current.naturalHeight}
                    </span>
                    <span className="font-mono text-[10px] text-[#555555]">
                      CENTER: {Math.round(imgRef.current.naturalWidth / 2)}, {Math.round(imgRef.current.naturalHeight / 2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Zoom controls */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#555555] block mb-2">
                  VIEW CONTROLS
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { icon: ZoomOut, action: () => setZoom((z) => Math.max(0.5, z - 0.25)), label: "Zoom Out" },
                    { icon: ZoomIn, action: () => setZoom((z) => Math.min(4, z + 0.25)), label: "Zoom In" },
                    { icon: Maximize, action: resetView, label: "Reset" },
                  ].map(({ icon: Icon, action, label }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="flex h-8 w-8 items-center justify-center border-2 border-[#333333] bg-[#141414] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] transition-none"
                      title={label}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  <span className="ml-3 font-mono text-[10px] text-[#555555] tabular-nums">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              {/* Clear button */}
              {state.pith && (
                <button
                  onClick={clearPith}
                  className="flex items-center gap-2 border-2 border-[#333333] px-3 py-2 font-mono text-xs text-[#a3a3a3] hover:text-[#ef4444] hover:border-[#ef4444] transition-none w-fit"
                >
                  <RotateCcw className="h-3 w-3" />
                  [CLEAR SELECTION]
                </button>
              )}
            </div>

            {/* Bottom actions bar */}
            <div className="border-t-2 border-[#333333] p-4 flex items-center justify-between bg-[#0d0d0d]">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 font-mono text-xs text-[#a3a3a3] hover:text-white transition-none uppercase tracking-[0.15em]"
              >
                [← BACK]
              </button>
              <button
                onClick={goNext}
                disabled={!state.pith}
                className="flex items-center gap-2 border-2 border-[#ea580c] bg-[#ea580c] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-transparent hover:text-[#ea580c] transition-none disabled:opacity-20 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] disabled:shadow-none active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
              >
                [▸ START ANALYSIS]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
