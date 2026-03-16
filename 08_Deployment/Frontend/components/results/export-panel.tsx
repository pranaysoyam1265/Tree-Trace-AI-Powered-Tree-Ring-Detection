"use client"

import { useState } from "react"
import { FileSpreadsheet, FileJson, Image, FileText, Loader2, Check, Download } from "lucide-react"
import type { AnalysisResult } from "@/lib/mock-results"
import { exportCSV, exportJSON } from "@/lib/export"
import { cn } from "@/lib/utils"

interface Props {
  result: AnalysisResult
}

type ExportFormat = "csv" | "json" | "png" | "pdf"

export function ExportPanel({ result }: Props) {
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const [done, setDone] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setLoading(format)
    await new Promise((r) => setTimeout(r, 600)) // Simulation

    switch (format) {
      case "csv":
        exportCSV(result)
        break
      case "json":
        exportJSON(result)
        break
      case "png":
        alert("PNG export will capture the ring visualization in the final build.")
        break
      case "pdf":
        alert("PDF report generation will be available in the final build.")
        break
    }

    setLoading(null)
    setDone(format)
    setTimeout(() => setDone(null), 2000)
  }

  const options: { format: ExportFormat; icon: typeof FileSpreadsheet; title: string; desc: string }[] = [
    { format: "csv", icon: FileSpreadsheet, title: "DATA.CSV", desc: "RING WIDTHS" },
    { format: "json", icon: FileJson, title: "META.JSON", desc: "DETECTION DATA" },
    { format: "png", icon: Image, title: "OVERLAY.PNG", desc: "RING VISUALIZATION" },
    { format: "pdf", icon: FileText, title: "REPORT.PDF", desc: "FULL REPORT" },
  ]

  return (
    <div className="border border-border bg-background flex flex-col relative">
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent z-20 pointer-events-none" />

      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <Download className="h-3 w-3 text-accent" />
          <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
            [EXPORT_MODULE]
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border p-px">
        {options.map(({ format, icon: Icon, title, desc }) => {
          const isLoading = loading === format
          const isDone = done === format

          return (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={isLoading}
              className={cn(
                "group flex flex-col items-center justify-center gap-2 bg-background p-4 min-h-[100px] transition-colors",
                isLoading || isDone ? "" : "hover:bg-surface disabled:opacity-50 cursor-pointer"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center border",
                isLoading ? "border-accent text-accent animate-pulse" :
                  isDone ? "border-status-success bg-status-success/10 text-status-success" :
                    "border-border bg-surface text-muted-foreground group-hover:border-accent group-hover:text-accent"
              )}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="text-center flex flex-col gap-0.5">
                <span className={cn(
                  "font-mono text-[10px] uppercase tracking-[1px] font-bold",
                  isDone ? "text-status-success" : "text-foreground group-hover:text-accent"
                )}>
                  {isDone ? "[SUCCESS]" : title}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground w-24 truncate mx-auto">
                  {desc}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
