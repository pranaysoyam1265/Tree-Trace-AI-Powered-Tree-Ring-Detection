"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Square, Clock, CheckCircle2, XCircle, Loader2, Activity } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

export function ProgressHeader() {
  const { state, cancelBatch } = useBatch()
  const [elapsed, setElapsed] = useState(0)

  const total = state.images.length
  const completed = state.images.filter(i => i.status === "completed" || i.status === "failed" || i.status === "cancelled").length
  const successful = state.images.filter(i => i.status === "completed").length
  const failed = state.images.filter(i => i.status === "failed").length
  const currentImg = state.images.find(i => i.status === "processing")
  const pct = total > 0 ? (completed / total) * 100 : 0
  const isFinished = state.status === "completed" || state.status === "cancelled"

  useEffect(() => {
    if (typeof window === "undefined" || isFinished) return
    const t = setInterval(() => setElapsed(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [isFinished])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <div className="w-full">
      {/* Full width progress bar */}
      <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isFinished
              ? "var(--color-status-success)"
              : "linear-gradient(90deg, var(--color-status-warning), var(--color-status-success))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Elapsed time */}
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="font-mono text-sm tabular-nums text-text-accent">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>

          {/* Completed */}
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
            <span className="font-mono text-xs text-text-accent">{successful}</span>
            <span className="font-mono text-[10px] text-muted-foreground/60">done</span>
          </div>

          {/* Failed */}
          {failed > 0 && (
            <div className="flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-destructive" />
              <span className="font-mono text-xs text-text-accent">{failed}</span>
              <span className="font-mono text-[10px] text-muted-foreground/60">failed</span>
            </div>
          )}

          {/* Progress fraction */}
          <span className="font-mono text-xs text-muted-foreground/60">{completed}/{total}</span>

          {/* Currently processing label */}
          {currentImg && (
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-status-success animate-pulse" />
              <span className="font-mono text-[10px] text-status-success/70">{currentImg.alias}</span>
            </div>
          )}
        </div>

        {/* Cancel */}
        {!isFinished && (
          <button
            onClick={cancelBatch}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-status-error/30 bg-destructive/10 px-4 font-mono text-xs text-destructive hover:bg-status-error/20 transition-colors"
          >
            <Square className="h-3 w-3" />
            Stop
          </button>
        )}
      </div>
    </div>
  )
}
