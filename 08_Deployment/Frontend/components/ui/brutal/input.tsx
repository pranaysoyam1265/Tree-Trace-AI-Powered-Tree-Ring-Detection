"use client"

import { forwardRef } from "react"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST INPUT — Dark bg, visible border, monospace, square
   ═══════════════════════════════════════════════════════════════════ */

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ label, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full bg-[#0a0a0a] border-2 border-[#333333] text-white font-mono text-sm px-4 py-3 outline-none focus:border-[#ea580c] placeholder:text-[#555555] placeholder:uppercase placeholder:tracking-widest  ${className}`}
        {...props}
      />
    </div>
  )
)
BrutalInput.displayName = "BrutalInput"
