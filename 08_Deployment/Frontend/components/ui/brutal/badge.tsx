"use client"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST BADGE — Bordered rectangular tag
   ═══════════════════════════════════════════════════════════════════ */

interface BrutalBadgeProps {
  children: React.ReactNode
  variant?: "default" | "accent" | "success" | "error" | "warning"
  className?: string
}

const BADGE_VARIANTS = {
  default: "border-[#333333] bg-[#1a1a1a] text-[#a3a3a3]",
  accent: "border-[#ea580c] bg-[#ea580c20] text-[#ea580c]",
  success: "border-[#22c55e] bg-[#22c55e20] text-[#22c55e]",
  error: "border-[#ef4444] bg-[#ef444420] text-[#ef4444]",
  warning: "border-[#eab308] bg-[#eab30820] text-[#eab308]",
}

export function BrutalBadge({ children, variant = "default", className = "" }: BrutalBadgeProps) {
  return (
    <span className={`font-mono text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5 ${BADGE_VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}
