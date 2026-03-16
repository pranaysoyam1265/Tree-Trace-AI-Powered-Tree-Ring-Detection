"use client"

import { TreeRingDithered, CoreSampleDithered } from "@/components/illustrations"

type Size = "sm" | "md" | "lg"

/* ═══════════════════════════════════════════════════════════════════
   RING LOADER — pulsing dithered tree ring spinner
   ═══════════════════════════════════════════════════════════════════ */

export function RingLoader({
  size = "md",
  text,
}: {
  size?: Size
  text?: string
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <TreeRingDithered size={size} animation="breathing" showTerminal={false} />
      {text && (
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CORE PROGRESS — dithered core sample with scan progress
   ═══════════════════════════════════════════════════════════════════ */

export function CoreProgress({ progress }: { progress: number }) {
  return (
    <CoreSampleDithered
      size="md"
      animation="scanLine"
      progress={progress}
      showTerminal
      terminalTitle={`SCANNING... ${progress}%`}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE LOADER — full-screen dithered loading state
   ═══════════════════════════════════════════════════════════════════ */

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-6">
      <TreeRingDithered
        size="lg"
        animation="ringPulse"
        showTerminal
        terminalTitle="LOADING_TREETRACE..."
      />
    </div>
  )
}
