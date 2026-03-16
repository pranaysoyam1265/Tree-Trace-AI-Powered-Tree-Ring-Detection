"use client"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST NUMBER DISPLAY — Large data number with label
   ═══════════════════════════════════════════════════════════════════ */

interface NumberDisplayProps {
  value: string | number
  label: string
  suffix?: string
  className?: string
}

export function NumberDisplay({ value, label, suffix = "", className = "" }: NumberDisplayProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="font-mono text-4xl font-bold text-white tabular-nums">
        {value}{suffix}
      </span>
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3] mt-1">
        {label}
      </span>
    </div>
  )
}
