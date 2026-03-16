"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Activity, RotateCcw } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"
import type { BatchImage } from "@/lib/mock-batch"

export function CompletedStack() {
  const { state, retryImage } = useBatch()
  const finished = state.images.filter(i => i.status === "completed" || i.status === "failed")

  if (finished.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border/50 p-6">
        <p className="font-mono text-xs text-muted-foreground/60">Completed images appear here</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
      <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">
        Completed ({finished.length})
      </span>
      {finished.map((img, idx) => (
        <CompletedCard key={img.id} image={img} index={idx} onRetry={() => retryImage(img.id)} />
      ))}
    </div>
  )
}

function CompletedCard({ image, index, onRetry }: { image: BatchImage; index: number; onRetry: () => void }) {
  const isOk = image.status === "completed"

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${isOk
        ? "border-status-success/20 bg-status-success/5 hover:bg-status-success/10"
        : "border-destructive bg-status-error/5 hover:bg-destructive/10"
        }`}
    >
      {/* Thumbnail */}
      <img src={image.thumbnailUrl} alt={image.alias} className="h-8 w-8 rounded object-cover flex-shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isOk ? <CheckCircle2 className="h-3 w-3 text-status-success flex-shrink-0" /> : <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />}
          <span className="font-mono text-xs font-semibold text-text-accent truncate">{image.alias}</span>
        </div>
        {isOk && image.result ? (
          <p className="font-mono text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Activity className="h-2.5 w-2.5" /> {image.result.ringCount} rings • {image.processingTime}s
          </p>
        ) : (
          <p className="font-mono text-[10px] text-destructive/80 truncate mt-0.5">{image.error}</p>
        )}
      </div>

      {/* Retry for failures */}
      {!isOk && (
        <button onClick={onRetry} className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded text-muted-foreground/60 hover:text-text-accent transition-colors">
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  )
}
