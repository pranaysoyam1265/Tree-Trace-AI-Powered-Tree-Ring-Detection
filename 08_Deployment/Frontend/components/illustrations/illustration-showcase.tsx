"use client"

import { useState } from "react"
import {
  TreeRingDithered,
  CoreSampleDithered,
  TreeStumpDithered,
  FullTreeDithered,
  ForestSceneDithered,
  RingDetailDithered,
  TreeTrunkDithered,
  type IllustrationName,
} from "@/components/illustrations"

/* ═══════════════════════════════════════════════════════════════════
   ILLUSTRATION SHOWCASE — Demo grid of all dithered components
   ═══════════════════════════════════════════════════════════════════ */

interface IllustrationShowcaseProps {
  filter?: IllustrationName[]
  layout?: "grid" | "list"
}

const ALL_ILLUSTRATIONS: {
  name: IllustrationName
  label: string
  terminal: string
  component: React.ReactNode
}[] = [
    {
      name: "tree-ring",
      label: "Tree Ring Cross-Section",
      terminal: "ANALYZING...",
      component: <TreeRingDithered size="sm" animation="ringPulse" showTerminal={false} />,
    },
    {
      name: "core-sample",
      label: "Core Sample",
      terminal: "SAMPLE_001",
      component: <CoreSampleDithered size="sm" animation="scanLine" showTerminal={false} />,
    },
    {
      name: "stump",
      label: "Tree Stump",
      terminal: "ERROR_404",
      component: <TreeStumpDithered size="sm" animation="weathered" showTerminal={false} />,
    },
    {
      name: "tree",
      label: "Full Tree",
      terminal: "SPECIMEN_LOG",
      component: <FullTreeDithered size="sm" animation="sway" showTerminal={false} />,
    },
    {
      name: "forest",
      label: "Forest Scene",
      terminal: "SECTOR_07",
      component: <ForestSceneDithered size="sm" animation="fogDrift" showTerminal={false} />,
    },
    {
      name: "ring-detail",
      label: "Ring Detail",
      terminal: "40X MAGNIFICATION",
      component: <RingDetailDithered size="sm" animation="focus" showTerminal={false} />,
    },
    {
      name: "trunk",
      label: "Tree Trunk",
      terminal: "SPECIES_OAK",
      component: <TreeTrunkDithered size="sm" animation="bark" showTerminal={false} />,
    },
  ]

export function IllustrationShowcase({
  filter,
  layout = "grid",
}: IllustrationShowcaseProps) {
  const [selected, setSelected] = useState<IllustrationName | null>(null)

  const items = filter
    ? ALL_ILLUSTRATIONS.filter((i) => filter.includes(i.name))
    : ALL_ILLUSTRATIONS

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Dithered Illustration Library
      </h2>
      <p className="text-muted-foreground font-mono text-sm">
        {items.length} live dithered animations • Bayer 4×4 ordered dithering
      </p>

      <div
        className={
          layout === "grid"
            ? "grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
            : "flex flex-col gap-6"
        }
      >
        {items.map((item) => (
          <div
            key={item.name}
            className={`rounded-xl border p-4 bg-[#09090B] transition-all duration-200 cursor-pointer ${selected === item.name
                ? "border-accent crt-glow"
                : "border-white/[0.06] hover:border-white/[0.12]"
              }`}
            onClick={() => setSelected(item.name)}
          >
            <div className="flex items-center justify-center mb-3">
              {item.component}
            </div>
            <p className="text-center font-mono text-xs text-muted-foreground">
              {item.label}
            </p>
            <p className="text-center font-mono text-[9px] text-emerald-500/40 mt-0.5">
              [{item.terminal}]
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
