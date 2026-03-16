"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════════════════════
   TERMINAL FRAME — Matches existing TreeTrace landing page terminals
   Uses border-2 border-border bg-card style: dark glass bg, border-white/[0.08], no glow
   ═══════════════════════════════════════════════════════════════════ */

interface TerminalFrameProps {
  children: React.ReactNode
  title?: string
  showScanlines?: boolean
  className?: string
}

export function TerminalFrame({
  children,
  title = "treetrace",
  showScanlines = false,
  className,
}: TerminalFrameProps) {
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col border-2 border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Terminal header — matches MiniTerminal / PseudoTerminal */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
          {title} ~ terminal
          <span
            className={cn(
              "ml-1 inline-block w-[6px] h-[10px] bg-muted-foreground/50 align-middle",
              cursorVisible ? "opacity-100" : "opacity-0"
            )}
          />
        </span>
      </div>

      {/* Content area */}
      <div className="relative bg-background/30">
        {children}

        {/* Optional scanline overlay */}
        {showScanlines && (
          <div
            className="pointer-events-none absolute inset-0 z-20 scanlines"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
