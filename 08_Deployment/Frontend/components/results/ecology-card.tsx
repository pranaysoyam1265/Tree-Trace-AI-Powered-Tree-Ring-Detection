"use client"

import type { AnalysisResult } from "@/lib/types"
import { Leaf } from "lucide-react"

interface Props {
  result: AnalysisResult
}

export function EcologyCard({ result }: Props) {
  const { carbon } = result

  const rows = [
    { label: "BIOMASS", value: `${carbon.estimated_biomass_kg.toFixed(1)} kg`, sub: "Above-ground estimate" },
    { label: "CARBON STORED", value: `${carbon.carbon_stored_kg.toFixed(1)} kg`, sub: "Carbon sequestered" },
    { label: "CO₂ EQUIV.", value: `${carbon.co2_equivalent_kg.toFixed(1)} kg`, sub: "Lifetime offset" },
    { label: "CAR KM OFFSET", value: `${carbon.car_km_offset.toFixed(0)} km`, sub: "Driving equivalent" },
  ]

  return (
    <div className="border border-border bg-background flex flex-col relative">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent z-20 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center border-b border-border bg-surface px-4 py-2">
        <div className="flex items-center gap-2">
          <Leaf className="h-3 w-3 text-accent" />
          <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
            [ECOLOGICAL_ESTIMATES]
          </span>
        </div>
      </div>

      {/* Rows */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">{label}</span>
            <span className="font-mono text-sm font-bold text-foreground tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="border-t border-border bg-surface/50 px-4 py-3">
        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
          &ldquo;Estimates based on ring count and cumulative radial growth. Actual values depend on species and site conditions.&rdquo;
        </p>
      </div>
    </div>
  )
}
