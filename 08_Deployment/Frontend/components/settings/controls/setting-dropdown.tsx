"use client"

import React from "react"

interface Option {
  label: string
  value: string
  disabled?: boolean
}

interface SettingDropdownProps {
  label?: string
  description?: string
  value: string
  options: Option[]
  onChange: (val: string) => void
  disabled?: boolean
}

export function SettingDropdown({ label, description, value, options, onChange, disabled }: SettingDropdownProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 ${disabled ? "opacity-50" : ""}`}>
      {(label || description) && (
        <div className="flex flex-col flex-1">
          {label && <span className="font-mono text-sm text-foreground">{label}</span>}
          {description && <span className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">{description}</span>}
        </div>
      )}

      <div className="shrink-0 sm:w-48 relative">
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-none border border-border bg-[#0a0a0a] px-3 py-1.5 pr-8 font-mono text-[11px] text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed"
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-[#141414] text-white"
            >
              {opt.label} {opt.disabled ? "(Coming Soon)" : ""}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
          <svg className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
