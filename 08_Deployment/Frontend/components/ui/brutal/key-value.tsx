"use client"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST KEY-VALUE — "LABEL ────── VALUE" display
   ═══════════════════════════════════════════════════════════════════ */

interface KeyValueProps {
  label: string
  value: string | number
  className?: string
  valueColor?: string
}

export function KeyValue({ label, value, className = "", valueColor = "text-white" }: KeyValueProps) {
  return (
    <div className={`flex items-baseline justify-between gap-2 font-mono text-sm ${className}`}>
      <span className="text-[#a3a3a3] uppercase tracking-[0.15em] whitespace-nowrap text-[10px]">{label}</span>
      <span className="flex-1 border-b border-dotted border-[#333333] mx-1 mb-1" />
      <span className={`${valueColor} font-bold tabular-nums whitespace-nowrap`}>{value}</span>
    </div>
  )
}
