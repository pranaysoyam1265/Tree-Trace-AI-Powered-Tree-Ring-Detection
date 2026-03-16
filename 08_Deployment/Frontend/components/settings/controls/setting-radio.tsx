"use client"

import React from "react"

interface Option {
  label: string
  value: string
  disabled?: boolean
}

interface SettingRadioProps {
  label?: string
  description?: string
  value: string
  options: Option[]
  onChange: (val: string) => void
  disabled?: boolean
  layout?: "horizontal" | "vertical"
}

export function SettingRadio({ label, description, value, options, onChange, disabled, layout = "horizontal" }: SettingRadioProps) {
  return (
    <div className={`flex flex-col gap-3 py-2 ${disabled ? "opacity-50" : ""}`}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="font-mono text-sm text-foreground">{label}</span>}
          {description && <span className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">{description}</span>}
        </div>
      )}

      <div className={`flex ${layout === "horizontal" ? "flex-row flex-wrap gap-2" : "flex-col gap-2"}`}>
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-2 cursor-pointer ${opt.disabled ? "cursor-not-allowed opacity-50" : "group"}`}
            >
              <div
                className={`flex items-center justify-center w-3 h-3 rounded-none-none border transition-all ${isSelected
                    ? "border-accent bg-accent/10 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    : "border-zinc-600 bg-transparent group-hover:border-zinc-400"
                  }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-none-none bg-accent" />}
              </div>
              <input
                type="radio"
                name={label || "radio-group"}
                value={opt.value}
                checked={isSelected}
                onChange={() => !opt.disabled && onChange(opt.value)}
                disabled={opt.disabled || disabled}
                className="sr-only"
              />
              <span className={`font-mono text-[11px] ${isSelected ? "text-accent" : "text-foreground group-hover:text-foreground"}`}>
                {opt.label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
