"use client"

import { motion } from "framer-motion"
import { Play, Target, AlertCircle } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

export function ConfigBar() {
  const { state, setAllPithsCenter, startBatch } = useBatch()

  const total = state.images.length
  const readyCount = state.images.filter(i => i.pith).length
  const allReady = total > 0 && readyCount === total
  const progress = total > 0 ? (readyCount / total) * 100 : 0

  if (total === 0) return null

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 inset-x-0 z-40"
    >
      <div className="mx-auto max-w-[1400px] px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-background/90 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.3)]">
          {/* Progress fill behind content */}
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: allReady
                ? "linear-gradient(90deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.02) 100%)"
                : `linear-gradient(90deg, rgba(245,158,11,0.04) 0%, transparent ${progress}%)`,
            }}
          />

          <div className="relative flex items-center justify-between gap-4 px-6 py-4">
            {/* Left: Status */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-semibold text-text-accent">
                  {allReady ? "All images configured" : `${readyCount}/${total} images ready`}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {allReady ? "Ready to start batch analysis" : "Set pith coordinates for remaining images"}
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="hidden sm:block w-32 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${allReady ? "bg-accent" : "bg-status-warning"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {!allReady && (
                <button
                  onClick={setAllPithsCenter}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border/50 bg-transparent px-4 font-mono text-xs text-muted-foreground hover:text-text-accent hover:bg-bg-modifier-hover transition-colors"
                >
                  <Target className="h-3.5 w-3.5" />
                  Auto-Center All
                </button>
              )}

              <button
                onClick={startBatch}
                disabled={!allReady}
                className={`flex h-10 items-center gap-2 rounded-lg px-8 font-mono text-sm font-bold transition-all ${allReady
                  ? "bg-accent text-text-inverse shadow-[0_0_20px_var(--color-accent)] hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_30px_var(--color-accent)] active:scale-95"
                  : "bg-card/30 text-muted-foreground/60/30 cursor-not-allowed"
                  }`}
              >
                <Play className={`h-4 w-4 ${allReady ? "text-text-inverse" : ""}`} />
                Start Batch Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
