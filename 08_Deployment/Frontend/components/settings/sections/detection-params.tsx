"use client"

import React, { useState, useCallback } from "react"
import { SettingSlider } from "../controls/setting-slider"
import { SettingInput } from "../controls/setting-input"

const DEFAULTS = {
  sensitivity: 0.75,
  minRingWidth: 3,
  edgeSigma: 1.5,
  numRays: 360,
}

export function DetectionParams({ searchQuery }: { searchQuery: string }) {
  const [sensitivity, setSensitivity] = useState(DEFAULTS.sensitivity)
  const [minRingWidth, setMinRingWidth] = useState(DEFAULTS.minRingWidth)
  const [edgeSigma, setEdgeSigma] = useState(DEFAULTS.edgeSigma)
  const [numRays, setNumRays] = useState(DEFAULTS.numRays)

  const matches = (text: string) =>
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase())

  const visible = matches("detection") || matches("sensitivity") ||
    matches("ring width") || matches("edge") || matches("sigma") || matches("rays") || matches("cs-trd")

  if (!visible) return null

  const resetDefaults = () => {
    setSensitivity(DEFAULTS.sensitivity)
    setMinRingWidth(DEFAULTS.minRingWidth)
    setEdgeSigma(DEFAULTS.edgeSigma)
    setNumRays(DEFAULTS.numRays)
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a3a3a3]">
          // DETECTION PARAMETERS
        </span>
        <div className="h-px bg-[#333333]" />
      </div>

      {/* CS-TRD Sensitivity */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
            CS-TRD SENSITIVITY
          </span>
          <span className="font-mono text-sm font-bold text-white tabular-nums">
            {sensitivity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={sensitivity}
          onChange={(e) => setSensitivity(parseFloat(e.target.value))}
          className="w-full h-2 appearance-none bg-[#333333] border border-[#333333] cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-[#ea580c]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#ea580c]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:bg-[#ea580c]
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[#ea580c]
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:rounded-none
          "
        />
        <p className="font-mono text-[10px] text-[#555555] leading-relaxed">
          Higher = more rings detected but more false positives.
          Lower = fewer rings but higher precision.
        </p>
      </div>

      {/* Min Ring Width */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
          MIN RING WIDTH (PX)
        </span>
        <input
          type="number"
          min="1"
          max="50"
          value={minRingWidth}
          onChange={(e) => setMinRingWidth(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
          className="w-32 border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-white focus:border-[#ea580c] focus:outline-none tabular-nums"
        />
        <p className="font-mono text-[10px] text-[#555555] leading-relaxed">
          Ignore detected rings thinner than this value.
        </p>
      </div>

      {/* Edge Detection Sigma */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
            EDGE DETECTION SIGMA
          </span>
          <span className="font-mono text-sm font-bold text-white tabular-nums">
            {edgeSigma.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5.0"
          step="0.1"
          value={edgeSigma}
          onChange={(e) => setEdgeSigma(parseFloat(e.target.value))}
          className="w-full h-2 appearance-none bg-[#333333] border border-[#333333] cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-[#ea580c]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#ea580c]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:bg-[#ea580c]
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[#ea580c]
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:rounded-none
          "
        />
        <p className="font-mono text-[10px] text-[#555555] leading-relaxed">
          Controls Gaussian smoothing for edge detection.
          Higher = smoother, fewer noise detections.
        </p>
      </div>

      {/* Number of Rays */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
          NR (NUMBER OF RAYS)
        </span>
        <input
          type="number"
          min="36"
          max="720"
          value={numRays}
          onChange={(e) => setNumRays(Math.max(36, Math.min(720, parseInt(e.target.value) || 36)))}
          className="w-32 border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-white focus:border-[#ea580c] focus:outline-none tabular-nums"
        />
        <p className="font-mono text-[10px] text-[#555555] leading-relaxed">
          Number of radial rays used for ring detection.
          Higher = more precise boundaries, slower processing.
        </p>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetDefaults}
        className="w-fit border-2 border-[#333333] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] transition-none"
      >
        [▸ RESET DETECTION PARAMS TO DEFAULT]
      </button>
    </div>
  )
}
