"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

export function QueueList() {
  const { state } = useBatch()
  const queued = state.images.filter(i => i.status === "queued")

  if (queued.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border/50 p-6">
        <p className="font-mono text-xs text-muted-foreground/60">Queue empty</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
      <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">
        Queue ({queued.length} remaining)
      </span>
      {queued.map((img, idx) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
          className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/20 px-3 py-2.5 opacity-60"
        >
          {/* Position */}
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-card font-mono text-[10px] font-bold text-muted-foreground/60">
            {idx + 1}
          </span>

          {/* Thumbnail */}
          <img src={img.thumbnailUrl} alt={img.alias} className="h-8 w-8 rounded object-cover flex-shrink-0 grayscale opacity-60" />

          {/* Name */}
          <div className="flex-1 min-w-0">
            <span className="font-mono text-xs text-muted-foreground truncate block">{img.alias}</span>
          </div>

          <Clock className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
        </motion.div>
      ))}
    </div>
  )
}
