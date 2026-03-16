"use client"

import React from "react"

interface SettingInputProps {
  label?: string
  description?: string
  value: string | number
  type?: "text" | "number" | "password" | "email"
  placeholder?: string
  onChange: (val: string) => void
  disabled?: boolean
  maxLength?: number
  min?: number
  max?: number
}

export function SettingInput({
  label,
  description,
  value,
  type = "text",
  placeholder,
  onChange,
  disabled,
  maxLength,
  min,
  max
}: SettingInputProps) {
  return (
    <div className={`flex flex-col gap-2 py-2 ${disabled ? "opacity-50" : ""}`}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="font-mono text-sm text-foreground">{label}</span>}
          {description && <span className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">{description}</span>}
        </div>
      )}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        max={max}
        className="w-full sm:w-64 rounded-none border border-border bg-background px-3 py-1.5 font-mono text-[11px] text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed"
      />
    </div>
  )
}
