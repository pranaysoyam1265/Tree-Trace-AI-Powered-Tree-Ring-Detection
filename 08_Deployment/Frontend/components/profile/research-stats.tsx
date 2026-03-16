"use client"

import { useAuth } from "@/lib/contexts/auth-context"

/* ═══════════════════════════════════════════════════════════════════
   RESEARCH STATS — Dashboard metrics + Heatmap + Species Breakdown
   ═══════════════════════════════════════════════════════════════════ */

function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number | string; suffix?: string; prefix?: string }) {
  return (
    <span className="font-mono text-3xl font-bold text-text-accent tabular-nums tracking-tight">
      {prefix}{value}{suffix}
    </span>
  )
}

function StatBox({ label, value, suffix = "", prefix = "", subtext = "" }: { label: string; value: string | number; suffix?: string; prefix?: string; subtext?: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-[var(--bg-void)]/20 p-3.5 flex flex-col justify-between">
      <p className="mb-2 font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">{label}</p>
      <div>
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        {subtext && <p className="mt-1 font-mono text-[11px] text-accent/70">{subtext}</p>}
      </div>
    </div>
  )
}

export function ResearchStats() {
  const { user } = useAuth()
  if (!user) return null

  const stats = user.stats
  const maxWeekly = Math.max(...stats.weeklyActivity, 1)

  // Determine heatmap grid cells (12 weeks x 7 days mock data based on weekly count)
  // we'll just distribute the weekly counts across 7 days deterministically for the visual
  const heatmapCells = []
  for (let w = 0; w < 12; w++) {
    const wCount = stats.weeklyActivity[w]
    for (let d = 0; d < 7; d++) {
      // Mock distribution
      const isMockActive = (wCount > 0) && ((w * 7 + d) % (Math.max(1, 8 - wCount)) === 0)
      const intensity = isMockActive ? Math.min(1, wCount / 3) : 0
      heatmapCells.push({ w, d, intensity })
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background dot-grid-bg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono text-xs uppercase tracking-[2px] text-accent">
          {"// FIELD METRICS"}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/60">
          [LAST 6 MONTHS]
        </span>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatBox
          label="Specimens Analyzed"
          value={stats.totalAnalyses}
        />
        <StatBox
          label="Rings Discovered"
          value={stats.totalRingsDetected.toLocaleString()}
        />
        <StatBox
          label="Oldest Specimen"
          value={stats.oldestSpecimen.rings}
          suffix=" yrs"
          subtext={`Specimen: ${stats.oldestSpecimen.name}`}
        />
        <StatBox
          label="Hours Using TreeTrace"
          value={stats.hoursWithTreeTrace}
          suffix="h"
          subtext={`~${stats.estimatedTimeSaved} saved vs manual`}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="flex items-center justify-between bg-card/50 border border-border/50 rounded-md px-4 py-3 mb-6">
        <div className="text-center flex-1 border-r border-border/50">
          <p className="font-mono text-[10px] text-muted-foreground/60 uppercase mb-1">Avg Precision</p>
          <p className="font-mono text-base text-accent">{(stats.averagePrecision * 100).toFixed(1)}%</p>
        </div>
        <div className="text-center flex-1 border-r border-border/50">
          <p className="font-mono text-[10px] text-muted-foreground/60 uppercase mb-1">Total Batches</p>
          <p className="font-mono text-base text-text-accent">{stats.totalBatches}</p>
        </div>
        <div className="text-center flex-1">
          <p className="font-mono text-[10px] text-muted-foreground/60 uppercase mb-1">Exports Done</p>
          <p className="font-mono text-base text-text-accent">{stats.totalExports}</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Heatmap */}
        <div className="md:col-span-2">
          <p className="mb-3 font-mono text-[11px] text-muted-foreground/60 uppercase tracking-widest">// ACTIVITY_MAP</p>

          <div className="flex gap-1">
            {/* Days label */}
            <div className="flex flex-col justify-between py-1 text-[9px] font-mono text-muted-foreground/60 h-[88px] pr-2">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            {/* Grid */}
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-flow-col grid-rows-7 gap-[3px] h-[88px]">
                {heatmapCells.map((cell, i) => (
                  <div
                    key={i}
                    className="w-full h-full rounded-[2px] transition-all hover:ring-1 hover:ring-[var(--color-accent)]"
                    style={{
                      backgroundColor: cell.intensity > 0.7 ? "var(--color-accent)" :
                        cell.intensity > 0.4 ? "color-mix(in srgb, var(--color-accent) 70%, transparent)" :
                          cell.intensity > 0 ? "color-mix(in srgb, var(--color-accent) 30%, transparent)" : "var(--color-bg-surface)"
                    }}
                    title={`Week ${cell.w + 1}, Day ${cell.d + 1}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 font-mono text-[10px] text-muted-foreground/60 uppercase">
                <span>3m ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Species Breakdown */}
        <div>
          <p className="mb-3 font-mono text-[11px] text-muted-foreground/60 uppercase tracking-widest">// SPECIES_BDOWN</p>
          {stats.speciesBreakdown && stats.speciesBreakdown.length > 0 ? (
            <div className="space-y-2.5">
              {stats.speciesBreakdown.map((s, i) => (
                <div key={s.tag}>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-muted-foreground">{s.tag}</span>
                    <span className="text-muted-foreground/60">{s.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-card rounded-full overflow-hidden">
                    <div
                      className={`h-full ${i === 0 ? "bg-accent" : i === 1 ? "bg-[var(--color-accent-dark)]" : "bg-text-tertiary"}`}
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-border/50 rounded-md p-3">
              <p className="text-center font-mono text-[10px] text-muted-foreground/60 leading-relaxed">
                Tag your specimens to see species breakdown
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
