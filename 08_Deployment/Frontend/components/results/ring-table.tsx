"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronUp, ChevronDown, FileX, Terminal } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
  result: AnalysisResult
  selectedRing: number | null
  onSelectRing: (ringId: number | null) => void
}

type SortKey = "ring_number" | "inner_radius_px" | "outer_radius_px" | "width_px"
type SortDir = "asc" | "desc"

export function RingTable({ result, selectedRing, onSelectRing }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("ring_number")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sorted = useMemo(() => {
    const copy = [...result.rings]
    copy.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      return sortDir === "asc" ? va - vb : vb - va
    })
    return copy
  }, [result.rings, sortKey, sortDir])

  useEffect(() => {
    if (selectedRing) {
      const el = rowRefs.current.get(selectedRing)
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [selectedRing])

  const columns: { key: SortKey; label: string }[] = [
    { key: "ring_number", label: "ID" },
    { key: "inner_radius_px", label: "INNER(px)" },
    { key: "outer_radius_px", label: "OUTER(px)" },
    { key: "width_px", label: "WIDTH(px)" },
  ]

  const SortIcon = sortDir === "asc" ? ChevronUp : ChevronDown

  return (
    <div className="border border-border bg-background flex flex-col relative h-[500px]">
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent z-20 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="h-3 w-3 text-accent" />
          <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
            [DATA_MATRIX]
          </span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground uppercase border border-border bg-background px-1.5 py-0.5 tracking-[1px]">
          {result.rings.length} ENTRIES
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-border bg-surface/50 shrink-0 sticky top-0 z-10 w-full pr-[env(safe-area-inset-right,16px)]">
        {columns.map(({ key, label }, i) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            className={cn(
              "font-mono text-[10px] uppercase tracking-[1px] flex items-center gap-1 transition-colors group",
              i === 0 ? "justify-start" : "justify-end",
              sortKey === key ? "text-accent font-bold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            <div className={cn(
              "flex flex-col -space-y-[6px] opacity-0 transition-opacity",
              sortKey === key ? "opacity-100" : "group-hover:opacity-50"
            )}>
              <ChevronUp className={cn("w-3 h-3", sortKey === key && sortDir === 'asc' ? "text-accent" : "text-muted-foreground")} />
              <ChevronDown className={cn("w-3 h-3", sortKey === key && sortDir === 'desc' ? "text-accent" : "text-muted-foreground")} />
            </div>
          </button>
        ))}
        {/* Width mm column header */}
        <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground text-right">
          YEAR
        </span>
      </div>

      {/* Table Body */}
      <div className="overflow-y-auto flex-1 w-full bg-background custom-scrollbar">
        {result.rings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 h-full gap-3 bg-[var(--bg-void)]/20">
            <div className="flex h-10 w-10 items-center justify-center bg-surface border border-border text-muted-foreground">
              <FileX className="h-4 w-4" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[2px] text-muted-foreground text-center">NO DATA_POINTS</p>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {sorted.map((ring) => {
              const isSelected = selectedRing === ring.ring_number
              return (
                <div
                  key={ring.ring_number}
                  ref={(el) => { if (el) rowRefs.current.set(ring.ring_number, el) }}
                  onClick={() => onSelectRing(isSelected ? null : ring.ring_number)}
                  className={cn(
                    "grid grid-cols-5 gap-2 px-4 py-2 border-b cursor-pointer transition-colors relative",
                    isSelected
                      ? "bg-accent/[0.08] border-accent/50 text-accent font-bold"
                      : "bg-background border-border hover:bg-surface hover:text-foreground text-muted-foreground"
                  )}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" />}

                  <span className={cn("font-mono text-xs tabular-nums text-left", isSelected && "text-accent")}>
                    R_{ring.ring_number.toString().padStart(3, '0')}
                  </span>
                  <span className="font-mono text-xs text-right tabular-nums">
                    {ring.inner_radius_px.toFixed(1)}
                  </span>
                  <span className="font-mono text-xs text-right tabular-nums">
                    {ring.outer_radius_px.toFixed(1)}
                  </span>
                  <span className={cn("font-mono text-xs text-right tabular-nums", isSelected && "text-accent")}>
                    {ring.width_px.toFixed(1)}
                  </span>
                  <span className="font-mono text-[10px] text-right tabular-nums text-muted-foreground flex items-center justify-end">
                    {ring.estimated_year}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
