"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Download, FileText, FileJson, FileSpreadsheet, Archive, Loader2, Check } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

type ExportFormat = "csv" | "json" | "log" | "zip"

const EXPORTS: { id: ExportFormat; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "csv", label: "Summary CSV", desc: "Ring counts, metrics, and metadata", icon: FileSpreadsheet },
  { id: "json", label: "Full JSON", desc: "Complete analysis payloads", icon: FileJson },
  { id: "log", label: "Processing Log", desc: "Timestamped activity log", icon: FileText },
  { id: "zip", label: "Complete Archive", desc: "All data + images + reports", icon: Archive },
]

export function ExportDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, logs } = useBatch()
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const [done, setDone] = useState<ExportFormat[]>([])

  const handleExport = (format: ExportFormat) => {
    setLoading(format)
    setTimeout(() => {
      setLoading(null)
      setDone(prev => [...prev, format])
      // Simulate download
      const blob = new Blob([`Mock ${format} export for batch ${state.id}`], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `treetrace-batch-${state.id}.${format === "zip" ? "zip" : format}`
      a.click()
      URL.revokeObjectURL(url)
    }, 1500)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 z-50 h-full w-[380px] max-w-[90vw] border-l border-border bg-[var(--bg-void)]/95 backdrop-blur-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="font-mono text-sm font-bold text-text-accent">Export Batch</h3>
            <p className="font-mono text-[10px] text-muted-foreground/60">{state.summary?.successful || 0} results available</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-text-accent transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Export options */}
        <div className="flex flex-col gap-3 p-6">
          {EXPORTS.map(exp => {
            const isLoading = loading === exp.id
            const isDone = done.includes(exp.id)
            const Icon = exp.icon

            return (
              <button
                key={exp.id}
                onClick={() => !isLoading && handleExport(exp.id)}
                disabled={isLoading}
                className={`flex items-center gap-4 rounded-xl border px-4 py-4 text-left transition-all ${isDone ? "border-status-success/20 bg-status-success/5" : "border-border/50 bg-card hover:border-border-strong hover:bg-bg-modifier-hover"
                  }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${isDone ? "border-status-success/20 bg-status-success/10" : "border-border/50 bg-card"
                  }`}>
                  {isLoading ? <Loader2 className="h-4 w-4 text-status-success animate-spin" /> :
                    isDone ? <Check className="h-4 w-4 text-status-success" /> :
                      <Icon className="h-4 w-4 text-muted-foreground/60" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-semibold text-text-accent">{exp.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/60">{exp.desc}</p>
                </div>
                <Download className={`h-3.5 w-3.5 flex-shrink-0 ${isDone ? "text-status-success" : "text-muted-foreground/60/50"}`} />
              </button>
            )
          })}
        </div>

        {/* Batch info */}
        <div className="mt-auto border-t border-border/50 px-6 py-4">
          <p className="font-mono text-[10px] text-muted-foreground/60">Batch: {state.name} ({state.id})</p>
        </div>
      </motion.div>
    </>
  )
}
