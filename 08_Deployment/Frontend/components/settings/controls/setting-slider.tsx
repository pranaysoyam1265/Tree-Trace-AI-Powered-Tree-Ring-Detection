"use client"

import React from "react"

interface SettingSliderProps {
  label?: string
  description?: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (val: number) => void
  disabled?: boolean
  formatValue?: (val: number) => string
}

export function SettingSlider({
  label,
  description,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled,
  formatValue = (v) => v.toString()
}: SettingSliderProps) {

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`flex flex-col gap-2 py-2 ${disabled ? "opacity-50" : ""}`}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="font-mono text-sm text-foreground flex items-center justify-between">
            {label}
            <span className="text-[10px] text-accent tracking-widest bg-accent/10 px-1.5 py-0.5 rounded-none border border-accent/20">{formatValue(value)}</span>
          </span>}
          {description && <span className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">{description}</span>}
        </div>
      )}

      <div className="relative w-full h-1.5 mt-2 bg-background rounded-none-none overflow-hidden flex items-center group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        <div
          className="h-full bg-accent transition-all duration-75 group-hover:bg-accent group-hover:shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute h-3 w-[2px] bg-white z-0 transform -translate-x-1/2"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
