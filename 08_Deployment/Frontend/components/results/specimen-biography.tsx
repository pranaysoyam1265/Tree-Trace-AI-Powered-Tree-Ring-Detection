"use client"

import type { AnalysisResult } from "@/lib/mock-results"

interface Props {
  result: AnalysisResult
}

export function SpecimenBiography({ result }: Props) {
  if (!result.biography) return null

  return (
    <div className="border border-border bg-background flex flex-col relative">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent z-20 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center border-b border-border bg-surface px-4 py-2">
        <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
          [SPECIMEN_BIOGRAPHY]
        </span>
      </div>

      {/* Biography Text */}
      <div className="px-6 py-5 border-l-[3px] border-l-accent mx-4 my-4">
        <p className="font-mono text-sm text-muted-foreground leading-relaxed">
          <span className="text-accent mr-1">█</span>
          &ldquo;{result.biography}&rdquo;
        </p>
      </div>
    </div>
  )
}
