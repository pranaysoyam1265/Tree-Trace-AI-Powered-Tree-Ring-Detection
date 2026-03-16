"use client"

import { CornerAccents } from "./corner-accents"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST CARD — Container with visible borders & corner accents
   ═══════════════════════════════════════════════════════════════════ */

interface BrutalCardProps {
  children: React.ReactNode
  header?: string
  className?: string
  accentColor?: string
  noPadding?: boolean
}

export function BrutalCard({ children, header, className = "", accentColor, noPadding }: BrutalCardProps) {
  return (
    <div className={`relative border-2 border-[#333333] bg-[#141414] ${noPadding ? "" : "p-6"} ${className}`}>
      <CornerAccents color={accentColor || "bg-[#ea580c]"} />
      {header && (
        <div className="border-b-2 border-[#333333] pb-2 mb-4">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3]">
            {header}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}
