"use client"

import React from "react"

interface SettingColorPickerProps {
  label?: string
  description?: string
  value: string
  options: { label: string, value: string }[]
  onChange: (val: string) => void
}

export function SettingColorPicker({ label, description, value, options, onChange }: SettingColorPickerProps) {
  return (
    <div className="flex flex-col gap-3 py-2">
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="font-mono text-sm text-foreground flex items-center justify-between">
            {label}
            <span className="text-[10px] tracking-widest px-1.5 py-0.5 rounded-none border border-border bg-white/5">{value}</span>
          </span>}
          {description && <span className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">{description}</span>}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              title={opt.label}
              className={`w-8 h-8 rounded-none shrink-0 transition-all ${isSelected
                  ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110 z-10"
                  : "hover:scale-105 border border-border"
                }`}
              style={{ backgroundColor: opt.value }}
              aria-label={`Select ${opt.label} color`}
            />
          )
        })}
      </div>
    </div>
  )
}
