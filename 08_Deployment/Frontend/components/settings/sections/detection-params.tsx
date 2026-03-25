"use client"

import React, { useState, useCallback } from "react"
import { useAnalysis, type DetectionParams } from "@/lib/contexts/analysis-context"

const DEFAULTS: DetectionParams = {
  sigma: undefined,
  th_low: undefined,
  th_high: undefined,
  nr: undefined,
  alpha: undefined,
  min_chain_length: undefined,
  preset: "auto",
}

const PRESETS: Record<string, { label: string; desc: string; params: Partial<DetectionParams> }> = {
  auto: {
    label: "AUTO",
    desc: "Adaptive thresholds computed from image histogram.",
    params: { sigma: undefined, th_low: undefined, th_high: undefined, nr: undefined, alpha: undefined, min_chain_length: undefined },
  },
  softwood: {
    label: "SOFTWOOD",
    desc: "Pine, Spruce, Fir — wide, clear rings with high contrast.",
    params: { sigma: 3.0, th_low: 3, th_high: 15, alpha: 30, nr: 360, min_chain_length: 2 },
  },
  hardwood: {
    label: "HARDWOOD",
    desc: "Oak, Birch, Maple — narrow, dense rings with lower contrast.",
    params: { sigma: 4.0, th_low: 2, th_high: 10, alpha: 20, nr: 360, min_chain_length: 1 },
  },
}

export function DetectionParamsSection({ searchQuery }: { searchQuery: string }) {
  const { state, setDetectionParams } = useAnalysis()
  const dp = state.detectionParams

  const [localSigma, setLocalSigma] = useState(dp.sigma ?? 3.0)
  const [localThLow, setLocalThLow] = useState(dp.th_low ?? 3)
  const [localThHigh, setLocalThHigh] = useState(dp.th_high ?? 15)
  const [localNr, setLocalNr] = useState(dp.nr ?? 360)
  const [localAlpha, setLocalAlpha] = useState(dp.alpha ?? 30)
  const [localMinChain, setLocalMinChain] = useState(dp.min_chain_length ?? 2)
  const [localPreset, setLocalPreset] = useState(dp.preset ?? "auto")

  const matches = (text: string) =>
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase())

  const visible = matches("detection") || matches("sensitivity") ||
    matches("ring width") || matches("edge") || matches("sigma") || matches("rays") || matches("cs-trd") || matches("preset") || matches("species")

  if (!visible) return null

  const isAuto = localPreset === "auto"

  const applyParams = useCallback(() => {
    const params: DetectionParams = {
      preset: localPreset,
    }
    // Only send specific params if not in auto mode
    if (!isAuto) {
      params.sigma = localSigma
      params.th_low = localThLow
      params.th_high = localThHigh
      params.nr = localNr
      params.alpha = localAlpha
      params.min_chain_length = localMinChain
    }
    setDetectionParams(params)
  }, [localPreset, localSigma, localThLow, localThHigh, localNr, localAlpha, localMinChain, isAuto, setDetectionParams])

  const selectPreset = useCallback((key: string) => {
    setLocalPreset(key)
    const p = PRESETS[key]?.params
    if (p) {
      if (p.sigma != null) setLocalSigma(p.sigma)
      if (p.th_low != null) setLocalThLow(p.th_low)
      if (p.th_high != null) setLocalThHigh(p.th_high)
      if (p.nr != null) setLocalNr(p.nr)
      if (p.alpha != null) setLocalAlpha(p.alpha)
      if (p.min_chain_length != null) setLocalMinChain(p.min_chain_length)
    }
    // Auto-apply on preset change
    const params: DetectionParams = { preset: key }
    if (key !== "auto" && p) {
      Object.assign(params, p)
    }
    setDetectionParams(params)
  }, [setDetectionParams])

  const resetDefaults = () => {
    selectPreset("auto")
  }

  const sliderClass = `w-full h-2 appearance-none bg-[#333333] border border-[#333333] cursor-pointer
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
    [&::-moz-range-thumb]:rounded-none`

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a3a3a3]">
          // DETECTION PARAMETERS
        </span>
        <div className="h-px bg-[#333333]" />
      </div>

      {/* Species Preset Selector */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
          SPECIES PRESET
        </span>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(PRESETS).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => selectPreset(key)}
              className={`border-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition-none ${localPreset === key
                ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]"
                : "border-[#333333] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c]"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] text-[#555555] leading-relaxed">
          {PRESETS[localPreset]?.desc || ""}
        </p>
      </div>

      {/* Manual overrides — shown when NOT auto */}
      {!isAuto && (
        <>
          {/* Edge Detection Sigma */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                EDGE DETECTION SIGMA
              </span>
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {localSigma.toFixed(1)}
              </span>
            </div>
            <input
              type="range" min="0.5" max="5.0" step="0.1"
              value={localSigma}
              onChange={(e) => setLocalSigma(parseFloat(e.target.value))}
              className={sliderClass}
            />
            <p className="font-mono text-[10px] text-[#555555] leading-relaxed">
              Gaussian smoothing. Higher = smoother, fewer noise detections.
            </p>
          </div>

          {/* Threshold Low */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                THRESHOLD LOW
              </span>
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {localThLow.toFixed(1)}
              </span>
            </div>
            <input
              type="range" min="1" max="10" step="0.5"
              value={localThLow}
              onChange={(e) => setLocalThLow(parseFloat(e.target.value))}
              className={sliderClass}
            />
          </div>

          {/* Threshold High */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                THRESHOLD HIGH
              </span>
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {localThHigh.toFixed(1)}
              </span>
            </div>
            <input
              type="range" min="5" max="30" step="1"
              value={localThHigh}
              onChange={(e) => setLocalThHigh(parseFloat(e.target.value))}
              className={sliderClass}
            />
          </div>

          {/* Number of Rays */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              NR (NUMBER OF RAYS)
            </span>
            <input
              type="number" min="36" max="720"
              value={localNr}
              onChange={(e) => setLocalNr(Math.max(36, Math.min(720, parseInt(e.target.value) || 36)))}
              className="w-32 border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-white focus:border-[#ea580c] focus:outline-none tabular-nums"
            />
          </div>

          {/* Alpha */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                ALPHA (ANGULAR TOLERANCE)
              </span>
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {localAlpha}
              </span>
            </div>
            <input
              type="range" min="10" max="60" step="5"
              value={localAlpha}
              onChange={(e) => setLocalAlpha(parseInt(e.target.value))}
              className={sliderClass}
            />
          </div>

          {/* Min Chain Length */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              MIN CHAIN LENGTH
            </span>
            <input
              type="number" min="1" max="10"
              value={localMinChain}
              onChange={(e) => setLocalMinChain(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="w-32 border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-white focus:border-[#ea580c] focus:outline-none tabular-nums"
            />
            <p className="font-mono text-[10px] text-[#555555] leading-relaxed">
              Minimum number of connected edge segments to form a ring.
            </p>
          </div>

          {/* Apply button for manual overrides */}
          <button
            onClick={applyParams}
            className="w-fit border-2 border-[#ea580c] bg-[#ea580c]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#ea580c] font-bold hover:bg-[#ea580c] hover:text-white transition-none"
          >
            [▸ APPLY PARAMETERS]
          </button>
        </>
      )}

      {/* Active params indicator */}
      <div className="border-2 border-[#333333] bg-[#0d0d0d] px-4 py-3">
        <span className="font-mono text-[10px] text-[#555555] uppercase tracking-[0.15em]">
          Active: {dp.preset?.toUpperCase() || "AUTO"} preset
          {dp.sigma != null && ` • σ=${dp.sigma}`}
          {dp.th_low != null && dp.th_high != null && ` • th=${dp.th_low}/${dp.th_high}`}
        </span>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetDefaults}
        className="w-fit border-2 border-[#333333] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] transition-none"
      >
        [▸ RESET TO AUTO]
      </button>
    </div>
  )
}
