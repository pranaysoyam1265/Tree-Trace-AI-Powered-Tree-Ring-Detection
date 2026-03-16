"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { Search, LayoutGrid, List, Filter, ChevronDown, ChevronUp } from "lucide-react"
import type { RecentAnalysis } from "@/lib/mock-profile"

/* ═══════════════════════════════════════════════════════════════════
   ANALYSIS HISTORY — Grid and List views with filtering
   ═══════════════════════════════════════════════════════════════════ */

const CONFIDENCE_DOT: Record<string, string> = {
  high: "bg-accent",
  medium: "bg-status-warning",
  low: "bg-status-error",
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function AnalysisHistory() {
  const { user } = useAuth()
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")

  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  // Collect all unique tags for filter dropdown (mocked out visually for now)
  const allAnalyses = user.recentAnalyses
  const filtered = allAnalyses.filter(a =>
    a.imageName.toLowerCase().includes(search.toLowerCase()) ||
    (a.tags && a.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  )

  return (
    <div className="rounded-none border-2 border-border bg-background dot-grid-bg p-6">

      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group pb-4 border-b-2 border-border/50 hover:border-accent transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-[2px] text-accent font-bold group-hover:text-accent transition-colors">
            {"// RECENT_ANALYSES"}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/60 tracking-[1px] bg-surface px-2 py-0.5 border border-border">
            [{allAnalyses.length} RECORDS]
          </span>
        </div>
        <div className="text-muted-foreground group-hover:text-accent transition-colors border border-border p-1 bg-surface">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="pt-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-[1px]">
              QUICK_ACCESS_ARCHIVE
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="SEARCH_SPECIMENS..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-40 sm:w-48 rounded-none bg-surface border-2 border-border py-1.5 pl-7 pr-3 font-mono text-xs uppercase tracking-[1px] text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              {/* Filter standard button */}
              <button className="flex items-center justify-center h-[34px] w-[34px] border-2 border-border bg-surface text-muted-foreground hover:text-accent hover:border-accent transition-colors">
                <Filter size={14} />
              </button>

              {/* Toggle View */}
              <div className="flex items-center border-2 border-border bg-surface p-[2px]">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 transition-colors ${view === "grid" ? "bg-accent text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 transition-colors ${view === "list" ? "bg-accent text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {emptyState(filtered.length === 0)}

          {/* Grid View */}
          {view === "grid" && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map(a => (
                <AnalysisCard key={a.id} a={a} />
              ))}
            </div>
          )}

          {/* List View */}
          {view === "list" && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 font-mono text-xs text-muted-foreground uppercase tracking-wider font-semibold">Specimen</th>
                    <th className="pb-2 font-mono text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rings</th>
                    <th className="pb-2 font-mono text-xs text-muted-foreground uppercase tracking-wider font-semibold leading-tight">Confidence</th>
                    <th className="pb-2 font-mono text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tags</th>
                    <th className="pb-2 font-mono text-xs text-muted-foreground uppercase tracking-wider font-semibold text-right">Analyzed</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-bg-modifier-hover transition-colors group cursor-pointer" onClick={() => window.location.href = `/results/${a.id}`}>
                      <td className="py-2.5">
                        <div className="flex items-center gap-3">
                          <img src={a.thumbnailUrl} alt="" className="w-8 h-8 rounded object-cover opacity-80 group-hover:opacity-100" />
                          <span className="font-mono text-sm text-text-accent group-hover:text-accent transition-colors">{a.imageName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-sm text-muted-foreground">{a.ringCount}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${CONFIDENCE_DOT[a.confidence]}`} />
                          <span className="font-mono text-xs text-muted-foreground/60 capitalize">{a.confidence}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="flex gap-1 flex-wrap">
                          {a.tags?.map(t => (
                            <span key={t} className="px-1.5 py-px rounded border border-border/50 bg-card font-mono text-[10px] text-muted-foreground">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs text-muted-foreground">
                        {timeAgo(a.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-8 text-center border-t-2 border-border/50 pt-4">
              <a href="/history" className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground hover:text-accent hover:border-accent border-b-2 border-transparent pb-1 transition-colors">
                [ACCESS FULL HISTORY ARCHIVE]
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AnalysisCard({ a }: { a: RecentAnalysis }) {
  return (
    <a
      href={`/results/${a.id}`}
      className="group flex flex-col rounded-md border border-border bg-[var(--bg-void)]/20 p-2.5 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_4px_12px_var(--color-accent)]"
    >
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded bg-card">
        <img
          src={a.thumbnailUrl}
          alt={a.imageName}
          className="h-full w-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-100 group-hover:scale-105"
        />
        <div className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded bg-background dot-grid-bg border border-border/50 backdrop-blur-sm">
          <span className="font-mono text-[11px] text-text-accent">{a.ringCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${CONFIDENCE_DOT[a.confidence]}`} />
        <span className="font-mono text-sm font-semibold text-text-accent truncate">{a.imageName}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-2 min-h-[16px]">
        {a.tags?.slice(0, 2).map(t => (
          <span key={t} className="px-1 py-px rounded bg-card text-[10px] font-mono text-muted-foreground truncate max-w-[50px]">{t}</span>
        ))}
        {a.tags && a.tags.length > 2 && <span className="px-1 py-px text-[10px] font-mono text-muted-foreground/60">+{a.tags.length - 2}</span>}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-2">
        <span className="font-mono text-xs text-muted-foreground/60 capitalize">{a.confidence}</span>
        <span className="font-mono text-xs text-muted-foreground/60">{timeAgo(a.createdAt)}</span>
      </div>
    </a>
  )
}

function emptyState(isEmpty: boolean) {
  if (!isEmpty) return null
  return (
    <div className="py-12 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-md bg-[var(--bg-void)]/30">
      <div className="w-16 h-16 rounded-full border border-border/50 bg-background dot-grid-bg flex items-center justify-center mb-4 text-3xl">
        🌲
      </div>
      <p className="font-mono text-sm text-muted-foreground mb-2">No analyses found matching your criteria.</p>
      <button className="font-mono text-xs text-accent hover:text-accent border-b border-accent/30 pb-0.5 transition-colors">
        Clear filters
      </button>
    </div>
  )
}
