"use client"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST PROGRESS BAR — Sharp-edged, no rounded ends
   ═══════════════════════════════════════════════════════════════════ */

interface BrutalProgressProps {
  value: number // 0-100
  label?: string
  className?: string
}

export function BrutalProgress({ value, label, className = "" }: BrutalProgressProps) {
  return (
    <div className={className}>
      <div className="w-full h-3 border-2 border-[#333333] bg-[#0a0a0a]">
        <div
          className="h-full bg-[#ea580c]"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {label && (
        <span className="font-mono text-[10px] tracking-[0.15em] text-[#a3a3a3] uppercase mt-1 block">
          {label}
        </span>
      )}
    </div>
  )
}
