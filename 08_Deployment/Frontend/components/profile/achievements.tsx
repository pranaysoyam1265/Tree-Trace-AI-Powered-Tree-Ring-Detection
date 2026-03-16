"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { ACHIEVEMENTS } from "@/lib/mock-profile"

/* ═══════════════════════════════════════════════════════════════════
   ACHIEVEMENTS GRID — Visually distinct locked/unlocked + categories
   ═══════════════════════════════════════════════════════════════════ */

const CATEGORIES = ["All", "Analysis", "Batch", "Export"]

export function AchievementsGrid() {
  const { user } = useAuth()
  const [filter, setFilter] = useState("All")

  if (!user) return null

  const unlockedIds = new Set(user.achievements.map(a => a.id))
  const unlockedMap = Object.fromEntries(user.achievements.map(a => [a.id, a.unlockedAt]))

  const total = ACHIEVEMENTS.length
  const unlocked = unlockedIds.size
  const percentage = Math.round((unlocked / total) * 100)

  // Dummy filtering since mock data doesn't have inherent strict categories
  // In reality you'd map categories directly inside AchievementDef
  const visibleAchievements = ACHIEVEMENTS.filter(a => {
    if (filter === "All") return true
    if (filter === "Batch") return a.id.includes("batch") || a.title.includes("Batch")
    if (filter === "Export") return a.id.includes("export") || a.title.includes("Export")
    return a.id.includes("ring") || a.title.includes("Ring") || a.id.includes("speed") || a.id.includes("precision")
  })

  return (
    <div className="border-2 border-[#333333] bg-[#141414] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-[2px] text-accent block mb-1">
            {"// MERIT_LOG"}
          </span>
          <span className="font-mono text-xs text-muted-foreground/60">
            [{unlocked}/{total} UNLOCKED — {percentage}%]
          </span>
        </div>

        {/* Categories */}
        <div className="flex gap-1 overflow-x-auto pb-1 -px-1 scrollbar-none">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded font-mono text-xs uppercase transition-colors whitespace-nowrap ${filter === c
                ? "bg-accent/10 text-accent border border-accent/20"
                : "text-muted-foreground border border-transparent hover:text-text-accent"
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 h-1 w-full bg-[#1a1a1a] overflow-hidden">
        <div
          className="h-full bg-[#ea580c]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleAchievements.map(ach => {
          const isUnlocked = unlockedIds.has(ach.id)
          const unlockDate = unlockedMap[ach.id]

          return (
            <div
              key={ach.id}
              className={`relative flex flex-col justify-between border-2 p-4 ${isUnlocked
                ? "border-[#ea580c]/30 bg-[#ea580c]/5"
                : "border-[#333333] bg-[#0d0d0d] opacity-60"
                }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className={`text-3xl ${isUnlocked ? "" : "grayscale opacity-50 drop-shadow-none"}`}>
                  {ach.icon}
                </div>

                {/* Status Badge */}
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${isUnlocked
                  ? "text-accent border-accent/30 bg-accent/10"
                  : "text-muted-foreground/60 border-border/50 bg-card"
                  }`}>
                  {isUnlocked ? "[UNLOCKED]" : "[LOCKED__]"}
                </span>
              </div>

              <div>
                <h3 className={`font-mono text-base font-bold mb-1 ${isUnlocked ? "text-text-accent" : "text-muted-foreground"}`}>
                  {ach.title}
                </h3>
                <p className={`font-mono text-xs leading-relaxed line-clamp-2 ${isUnlocked ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                  {isUnlocked ? ach.description : ach.criteria}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                {isUnlocked ? (
                  <>
                    <span className="font-mono text-xs text-accent">Earned</span>
                    <span className="font-mono text-xs text-muted-foreground">{new Date(unlockDate).toLocaleDateString()}</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-xs text-muted-foreground/60">Progress</span>
                    {/* Mock progress bar for locked */}
                    <div className="w-16 h-1 bg-[#1a1a1a] overflow-hidden">
                      <div className="h-full bg-[#333333] w-[30%]" />
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
