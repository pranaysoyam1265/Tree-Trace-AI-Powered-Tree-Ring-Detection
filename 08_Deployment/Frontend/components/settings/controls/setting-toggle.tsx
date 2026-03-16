"use client"

import React from "react"
import { Check } from "lucide-react"

interface SettingToggleProps {
  label?: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function SettingToggle({ label, description, checked, onChange, disabled }: SettingToggleProps) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${disabled ? "opacity-50" : ""}`}>
      {(label || description) && (
        <div className="flex flex-col flex-1">
          {label && <span className="font-mono text-sm text-foreground">{label}</span>}
          {description && <span className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">{description}</span>}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-none-none border border-border bg-black transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <span className={`flex items-center justify-between w-full px-1 font-mono text-[9px] uppercase tracking-wider ${checked ? "text-accent" : "text-muted-foreground"}`}>
          <span className={checked ? "opacity-100" : "opacity-0"}>ON</span>
          <span className={checked ? "opacity-0" : "opacity-100"}>OFF</span>
        </span>
        <span
          className={`absolute h-[14px] w-[14px] top-[2px] rounded-none-none transform transition-transform ${checked ? "translate-x-[22px] bg-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "translate-x-[2px] bg-zinc-600"
            }`}
        />
      </button>
    </div>
  )
}
