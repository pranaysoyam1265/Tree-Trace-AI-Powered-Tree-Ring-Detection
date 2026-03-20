"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import type { ActivityEntry } from "@/lib/mock-profile"

/* ═══════════════════════════════════════════════════════════════════
   ACTIVITY TIMELINE — Filterable, icon-based chronological log
   ═══════════════════════════════════════════════════════════════════ */

const TYPE_STYLES: Record<ActivityEntry["type"], { tag: string; icon: string }> = {
  analyze: { tag: "text-accent bg-accent/10 border-accent/20", icon: "🔬" },
  export: { tag: "text-status-info bg-status-info/10 border-status-info/20", icon: "📦" },
  batch: { tag: "text-status-warning bg-status-warning/10 border-status-warning/20", icon: "📊" },
  system: { tag: "text-muted-foreground bg-card border-border", icon: "⚙️" },
  // Optional additions depending on extended mock types:
  // profile: { tag: "text-blue-400 bg-blue-500/10 border-blue-500/20",          icon: "👤" },
  // achieve: { tag: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",    icon: "🏆" },
}

const FILTERS: (ActivityEntry["type"] | "all")[] = ["all", "analyze", "export", "batch", "system"]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
}

export function ActivityTimeline() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<ActivityEntry["type"] | "all">("all")
  const [showAll, setShowAll] = useState(false)

  if (!user) return null

  const filtered = filter === "all" ? user.activityLog : user.activityLog.filter(e => e.type === filter)
  const entries = showAll ? filtered : filtered.slice(0, 8)

  // Group by date
  const groups: { date: string; entries: typeof entries }[] = []
  entries.forEach(entry => {
    const dateKey = formatDate(entry.timestamp)
    const existing = groups.find(g => g.date === dateKey)
    if (existing) existing.entries.push(entry)
    else groups.push({ date: dateKey, entries: [entry] })
  })

  return (
    <div className="rounded-lg border border-border/50 bg-[var(--bg-surface)]/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <span className="font-mono text-xs uppercase tracking-[2px] text-accent block">
          {"// ACTIVITY_LOG"}
        </span>

        {/* Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 -px-1 scrollbar-none">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded font-mono text-xs uppercase transition-colors whitespace-nowrap ${filter === f
                ? "bg-accent/10 text-accent border border-accent/20"
                : "text-muted-foreground/60 hover:text-muted-foreground border border-transparent"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto space-y-0 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
        {groups.map((group, gIdx) => (
          <div key={group.date} className={gIdx > 0 ? "mt-4" : ""}>
            {/* Date separator */}
            <div className="flex items-center gap-3 py-2 sticky top-0 bg-[var(--bg-void)]/90 backdrop-blur z-10">
              <span className="font-mono text-xs text-accent/70 whitespace-nowrap">── {group.date}</span>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>

            {/* Entries */}
            <div className="pl-2 border-l border-border/50 ml-[5px] space-y-3 py-2">
              {group.entries.map(entry => {
                const style = TYPE_STYLES[entry.type]
                return (
                  <div key={entry.id} className="relative flex items-start gap-3 group">
                    {/* Timeline dot/icon */}
                    <div className="absolute -left-[23px] top-0 bg-background dot-grid-bg py-0.5">
                      <span className="text-sm grayscale-[0.5] group-hover:grayscale-0 transition-all">{style.icon}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`shrink-0 rounded px-1.5 py-[1px] border font-mono text-[10px] font-bold uppercase tracking-wider ${style.tag}`}>
                          [{entry.type}]
                        </span>
                        <span className="font-mono text-xs text-muted-foreground/60 whitespace-nowrap">
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>

                      {entry.linkTo ? (
                        <a href={entry.linkTo} className="font-mono text-sm text-text-accent hover:text-accent transition-colors inline-block mt-0.5 leading-relaxed">
                          {entry.message}
                        </a>
                      ) : (
                        <p className="font-mono text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {entry.message}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <p className="py-8 text-center font-mono text-xs text-muted-foreground/60">No activity found for this filter.</p>
        )}
      </div>

      {/* Load more */}
      {filtered.length > 8 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 w-full rounded border border-border/50 bg-card text-muted-foreground hover:text-accent hover:border-accent/20 transition-colors py-2.5 font-mono text-xs"
        >
          Load More ({filtered.length - 8} remaining)
        </button>
      )}
    </div>
  )
}
