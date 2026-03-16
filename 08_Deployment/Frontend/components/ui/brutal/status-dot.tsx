"use client"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST STATUS DOT — Square colored indicator
   ═══════════════════════════════════════════════════════════════════ */

interface StatusDotProps {
  status: "success" | "error" | "warning" | "processing" | "idle"
  size?: number
  className?: string
}

const STATUS_COLORS = {
  success: "bg-[#22c55e]",
  error: "bg-[#ef4444]",
  warning: "bg-[#eab308]",
  processing: "bg-[#ea580c]",
  idle: "bg-[#555555]",
}

export function StatusDot({ status, size = 8, className = "" }: StatusDotProps) {
  return (
    <span
      className={`inline-block ${STATUS_COLORS[status]} ${status === "processing" ? "animate-blink" : ""} ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
