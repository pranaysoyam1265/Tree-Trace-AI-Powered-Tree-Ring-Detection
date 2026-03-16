"use client"

import React from "react"
import { Theme } from "@/lib/default-settings"
import { Check, Lock } from "lucide-react"

interface ThemeCardProps {
  id: Theme
  title: string
  bgClass: string
  accentClass: string
  textClass: string
  selected: boolean
  onClick: (id: Theme) => void
  disabled?: boolean
}

export function ThemeCard({ id, title, bgClass, accentClass, textClass, selected, onClick, disabled }: ThemeCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(id)}
      className={`relative flex flex-col items-center gap-3 p-3 rounded-none-none border transition-all duration-300 w-full hover:scale-[1.02] ${disabled
          ? "opacity-50 cursor-not-allowed border-border bg-transparent grayscale"
          : selected
            ? "border-accent bg-accent/[0.02] shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-[1.02]"
            : "border-border hover:border-border hover:bg-white/[0.02]"
        }`}
    >
      {/* Visual Preview */}
      <div className={`w-full aspect-video rounded-none-none overflow-hidden flex flex-col p-2 border border-border ${bgClass}`}>
        {/* Mock Header */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-none-none bg-red-500/80" />
            <div className="w-1.5 h-1.5 rounded-none-none bg-amber-500/80" />
            <div className="w-1.5 h-1.5 rounded-none-none bg-accent/80" />
          </div>
          <div className={`h-1.5 w-12 rounded-none-none opacity-50 ${textClass}`} />
        </div>

        {/* Mock Content */}
        <div className="flex gap-2 flex-1">
          <div className="w-1/4 h-full border-r border-border flex flex-col gap-1.5 pr-2 pt-1">
            <div className={`h-1 w-full rounded-none-none opacity-30 ${textClass}`} />
            <div className={`h-1 w-2/3 rounded-none-none opacity-30 ${textClass}`} />
            <div className={`h-1 w-full rounded-none-none opacity-30 ${textClass}`} />
          </div>
          <div className="w-3/4 flex flex-col gap-2 pt-1">
            <div className={`w-full flex-1 rounded-none-none border border-border opacity-80 flex items-center justify-center ${accentClass}`}>
              <div className={`w-6 h-6 rounded-none-none border border-border`} />
            </div>
            <div className={`h-1.5 w-1/3 rounded-none-none opacity-50 ${textClass}`} />
          </div>
        </div>
      </div>

      {/* Label and Check/Lock */}
      <div className="flex items-center justify-between w-full px-1">
        <span className={`font-mono text-xs ${selected ? "text-accent font-bold" : "text-foreground"}`}>
          [THEME::{title.toUpperCase()}]
        </span>
        {selected && <Check size={14} className="text-accent" />}
        {disabled && <Lock size={12} className="text-muted-foreground" />}
      </div>
    </button>
  )
}
