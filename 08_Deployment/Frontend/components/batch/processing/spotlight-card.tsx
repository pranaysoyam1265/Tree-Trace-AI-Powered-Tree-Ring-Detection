"use client"

import { motion } from "framer-motion"
import { Loader2, Activity } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

const STAGE_LABELS = {
  preprocessing: "Preprocessing image...",
  detecting: "Detecting ring boundaries...",
  postprocessing: "Post-processing results...",
} as const

export function SpotlightCard() {
  const { state } = useBatch()
  const img = state.images.find(i => i.status === "processing")

  if (!img) return null

  const stageLabel = img.processingStage ? STAGE_LABELS[img.processingStage] : "Initializing..."

  return (
    <motion.div
      key={img.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative mx-auto max-w-lg w-full"
    >
      {/* Spotlight glow background */}
      <div className="absolute inset-0 -z-10 rounded-2xl opacity-40 blur-3xl"
        style={{ background: "radial-gradient(ellipse, color-mix(in srgb, var(--color-accent) 15%, transparent), transparent 70%)" }}
      />

      <div className="overflow-hidden rounded-2xl border border-accent/20 bg-card/50 backdrop-blur-md shadow-[0_0_40px_var(--color-accent)]">
        {/* Image preview */}
        <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
          <img src={img.thumbnailUrl} alt={img.alias} className="h-full w-full object-cover brightness-90" />

          {/* Pulsing overlay gradient */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at center, color-mix(in srgb, var(--color-accent) 5%, transparent), transparent 60%)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Center spinner + percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/50 px-6 py-4 backdrop-blur-md">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
              <span className="font-mono text-2xl font-bold tabular-nums text-text-inverse">
                {Math.round(img.progress)}%
              </span>
            </div>
          </div>

          {/* Image name overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
            <h3 className="font-mono text-base font-bold text-text-inverse">{img.alias}</h3>
            <p className="font-mono text-xs text-text-inverse/60">{img.fileName}</p>
          </div>
        </div>

        {/* Processing stage */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-accent/10">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-xs text-accent">{stageLabel}</span>
          </div>

          {/* Stage dots */}
          <div className="flex items-center gap-1.5">
            {(["preprocessing", "detecting", "postprocessing"] as const).map(stage => (
              <div
                key={stage}
                className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${img.processingStage === stage
                  ? "bg-accent shadow-[0_0_6px_var(--color-accent)]"
                  : stage < (img.processingStage || "preprocessing")
                    ? "bg-accent/30"
                    : "bg-border-subtle"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
