"use client"

import { forwardRef } from "react"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST BUTTON — Hard shadows, mechanical press, instant states
   Variants: primary, secondary, ghost, danger
   ═══════════════════════════════════════════════════════════════════ */

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

const VARIANTS = {
  primary: [
    "bg-[#ea580c] text-white border-2 border-[#ea580c]",
    "shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]",
    "hover:bg-transparent hover:text-[#ea580c]",
    "active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
    "disabled:bg-[#333333] disabled:border-[#333333] disabled:text-[#555555] disabled:shadow-none disabled:cursor-not-allowed",
  ].join(" "),
  secondary: [
    "bg-transparent text-white border-2 border-[#333333]",
    "hover:border-[#ea580c] hover:text-[#ea580c]",
    "active:bg-[#ea580c] active:text-white active:border-[#ea580c]",
    "disabled:border-[#222222] disabled:text-[#555555] disabled:cursor-not-allowed",
  ].join(" "),
  ghost: [
    "bg-transparent text-[#a3a3a3] border-2 border-transparent",
    "hover:text-[#ea580c] hover:border-[#333333]",
    "active:bg-[#1a1a1a]",
    "disabled:text-[#333333] disabled:cursor-not-allowed",
  ].join(" "),
  danger: [
    "bg-transparent text-[#ef4444] border-2 border-[#ef4444]",
    "shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)]",
    "hover:bg-[#ef4444] hover:text-white",
    "active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
    "disabled:border-[#333333] disabled:text-[#555555] disabled:shadow-none disabled:cursor-not-allowed",
  ].join(" "),
}

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
}

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ variant = "secondary", size = "md", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`font-mono font-bold uppercase tracking-[0.2em]  ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)
BrutalButton.displayName = "BrutalButton"
