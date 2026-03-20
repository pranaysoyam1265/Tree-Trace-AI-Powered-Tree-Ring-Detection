"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Terminal, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

export function ActivityLog() {
  const { logs } = useBatch()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, isOpen])

  const copyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const COLOR_MAP = { info: "text-status-info", success: "text-status-success", error: "text-destructive", warning: "text-status-warning" }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]">
      <div className="overflow-hidden rounded-xl border border-border/30 bg-background/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 border-b border-border/50 hover:bg-bg-modifier-hover transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-xs font-semibold text-text-accent">Activity Log</span>
            <span className="rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent">{logs.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={e => { e.stopPropagation(); copyLogs() }}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/60 hover:text-text-accent transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
            </button>
            {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" /> : <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/60" />}
          </div>
        </div>

        {/* Log entries */}
        {isOpen && (
          <div ref={scrollRef} className="h-[200px] overflow-y-auto p-2 space-y-0.5" style={{ scrollbarWidth: "thin" }}>
            {logs.length === 0 ? (
              <p className="py-8 text-center font-mono text-[10px] text-muted-foreground/60">No activity yet</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-start gap-2 rounded px-2 py-1 hover:bg-bg-modifier-hover">
                  <span className="font-mono text-[10px] text-muted-foreground/60/60 tabular-nums flex-shrink-0 pt-0.5">{log.timestamp}</span>
                  <span className={`font-mono text-[11px] leading-relaxed ${COLOR_MAP[log.type]}`}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
