"use client"

import { Trophy, TrendingDown, Zap, Timer } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

interface HighlightItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  image: string
  color: string
}

export function HighlightsPanel() {
  const { state } = useBatch()
  const s = state.summary
  if (!s) return null

  const highlights: HighlightItem[] = [
    {
      icon: Trophy,
      label: "Most Rings",
      value: `${s.ringCountRange.max} rings`,
      image: s.ringCountRange.maxImage,
      color: "text-emerald-500",
    },
    {
      icon: TrendingDown,
      label: "Fewest Rings",
      value: `${s.ringCountRange.min} rings`,
      image: s.ringCountRange.minImage,
      color: "text-[#ea580c]",
    },
    {
      icon: Zap,
      label: "Fastest",
      value: `${s.fastestImage.time}s`,
      image: s.fastestImage.name,
      color: "text-yellow-500",
    },
    {
      icon: Timer,
      label: "Slowest",
      value: `${s.slowestImage.time}s`,
      image: s.slowestImage.name,
      color: "text-white",
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#a3a3a3] mb-1">HIGHLIGHTS</span>
      <div className="grid grid-cols-2 gap-3 h-full">
        {highlights.map((h, i) => {
          const Icon = h.icon
          return (
            <div
              key={h.label}
              className="flex items-center gap-4 border-2 border-[#333333] bg-[#0a0a0a] px-4 py-4 hover:border-[#555555] transition-none"
            >
              <div className={`flex items-center justify-center ${h.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex flex-col gap-1">
                <p className={`font-mono text-sm font-bold ${h.color}`}>{h.value}</p>
                <div className="flex flex-col">
                  <p className="font-mono text-[10px] text-white font-bold">{h.label}</p>
                  <p className="font-mono text-[9px] text-[#555555] uppercase truncate">{h.image}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
