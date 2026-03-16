"use client"

import React from "react"
import { Check } from "lucide-react"

interface ThemePreviewProps {
  id: string
  name: string
  description: string
  isActive: boolean
  onClick: () => void
  colors: {
    bgBase: string
    bgSurface: string
    accent: string
    text: string
  }
}

export function ThemePreview({ id, name, description, isActive, onClick, colors }: ThemePreviewProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded border transition-all duration-200 overflow-hidden group ${isActive
          ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50"
          : "border-white/[0.08] hover:border-white/[0.15] bg-[#0A0A0A]"
        }`}
    >
      {/* Mock App Window Preview */}
      <div
        className="h-24 w-full p-3 flex flex-col gap-2 relative border-b border-black/20"
        style={{ backgroundColor: colors.bgBase }}
      >
        {/* Mock Titlebar */}
        <div className="flex gap-1.5 mb-1">
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
        </div>

        {/* Mock Content Structure */}
        <div className="flex gap-2 h-full">
          {/* Mock Sidebar */}
          <div
            className="w-1/4 h-full rounded border border-white/5 opacity-80"
            style={{ backgroundColor: colors.bgSurface }}
          >
            <div className="w-3/4 h-1 mt-1.5 mx-auto rounded-sm opacity-50" style={{ backgroundColor: colors.accent }} />
            <div className="w-1/2 h-1 mt-1 mx-auto rounded-sm opacity-20 bg-white" />
            <div className="w-1/2 h-1 mt-1 mx-auto rounded-sm opacity-20 bg-white" />
          </div>

          {/* Mock Main Content */}
          <div className="flex-1 flex flex-col gap-1.5 h-full">
            {/* Header / Nav */}
            <div className="w-full h-3 rounded flex items-center px-1 border border-white/5" style={{ backgroundColor: colors.bgSurface }}>
              <div className="w-1/3 h-1 rounded-sm opacity-80" style={{ backgroundColor: colors.text }} />
            </div>

            {/* Canvas / Image Area */}
            <div className="flex-1 rounded border border-white/5 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: colors.bgSurface }}>
              {/* Diagonal accent line to represent processing/scan */}
              <div className="absolute inset-0 opacity-20 rotate-12 scale-150" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${colors.accent} 0, ${colors.accent} 1px, transparent 1px, transparent 10px)` }} />
              {/* Mock Ring Circle */}
              <div className="w-6 h-6 rounded-full border opacity-60 z-10" style={{ borderColor: colors.accent }} />
            </div>
          </div>
        </div>
      </div>

      {/* Theme Info Label */}
      <div className={`p-3 relative bg-black/40 backdrop-blur-sm`}>
        <h4 className="font-mono text-xs mb-1" style={{ color: isActive ? '#10B981' : '#E4E4E7' }}>
          {name}
        </h4>
        <p className="font-mono text-[9px] text-zinc-500 line-clamp-2">
          {description}
        </p>

        {isActive && (
          <div className="absolute top-3 right-3 text-emerald-500">
            <Check size={14} />
          </div>
        )}
      </div>
    </button>
  )
}
