"use client"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST SECTION HEADER — "// SECTION NAME" with dash underline
   ═══════════════════════════════════════════════════════════════════ */

interface SectionHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SectionHeader({ children, className = "" }: SectionHeaderProps) {
  return (
    <div className={`border-b-2 border-[#333333] pb-2 mb-4 ${className}`}>
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3]">
        {children}
      </span>
    </div>
  )
}
