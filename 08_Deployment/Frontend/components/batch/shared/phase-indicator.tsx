"use client"

import { motion } from "framer-motion"
import { Upload, Cpu, BarChart3, Check } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

const PHASES = [
  { id: "configuring", label: "Upload & Configure", icon: Upload },
  { id: "processing", label: "Processing", icon: Cpu },
  { id: "completed", label: "Results", icon: BarChart3 },
] as const

export function PhaseIndicator() {
  const { state } = useBatch()
  const currentIdx = PHASES.findIndex(p =>
    p.id === state.status || (state.status === "cancelled" && p.id === "completed")
  )

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-4">
      {PHASES.map((phase, idx) => {
        const isActive = idx === currentIdx
        const isDone = idx < currentIdx
        const Icon = phase.icon

        return (
          <div key={phase.id} className="flex items-center gap-1 sm:gap-2">
            {idx > 0 && (
              <div className={`h-px w-6 sm:w-10 transition-colors duration-500 ${isDone ? "bg-accent" : "bg-border-subtle"}`} />
            )}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${isActive ? "border-accent bg-accent/10 shadow-[0_0_12px_var(--color-accent)]" :
                isDone ? "border-accent bg-accent" :
                  "border-border/50 bg-card/50"
                }`}>
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-text-inverse" />
                ) : (
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-accent" : "text-muted-foreground/60"}`} />
                )}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-accent/30"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              <span className={`font-mono text-[10px] sm:text-xs tracking-wide hidden sm:inline ${isActive ? "text-accent font-semibold" : isDone ? "text-text-accent" : "text-muted-foreground/60"
                }`}>
                {phase.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
