"use client"

/* ═══════════════════════════════════════════════════════════════════
   LOADING CURSOR — Blinking █ block for processing states
   ═══════════════════════════════════════════════════════════════════ */

export function LoadingCursor({ text = "PROCESSING" }: { text?: string }) {
  return (
    <span className="font-mono text-sm text-[#ea580c] uppercase tracking-[0.15em]">
      {text} <span className="animate-blink">█</span>
    </span>
  )
}
