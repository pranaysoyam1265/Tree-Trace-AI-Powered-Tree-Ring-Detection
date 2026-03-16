"use client"

import { Navigation } from "@/components/ascii-hub/navigation"
import { IdentityCard } from "@/components/profile/identity-card"
import { ResearchStats } from "@/components/profile/research-stats"
import { AnalysisHistory } from "@/components/profile/analysis-history"
import { AchievementsGrid } from "@/components/profile/achievements"
import { ActivityTimeline } from "@/components/profile/activity-timeline"
import { ConnectedAccounts } from "@/components/profile/connected-accounts"
import { DangerZone } from "@/components/profile/danger-zone"
import { useAuth } from "@/lib/contexts/auth-context"
import Link from "next/link"

/* ═══════════════════════════════════════════════════════════════════
   PROFILE PAGE — Brutalist researcher dossier
   ═══════════════════════════════════════════════════════════════════ */

export default function ProfilePage() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="font-mono text-sm text-[#a3a3a3] mb-4 uppercase tracking-[0.15em]">
            SIGN IN TO VIEW YOUR RESEARCHER DOSSIER
          </p>
          <Link
            href="/"
            className="font-mono text-sm text-[#ea580c] uppercase tracking-[0.15em] border-2 border-[#ea580c] px-4 py-2 hover:bg-[#ea580c] hover:text-white transition-none"
          >
            [← BACK TO HOME]
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] dot-grid-bg text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8 border-b-2 border-[#333333] pb-4">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center border-2 border-[#333333] bg-[#141414] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] transition-none font-mono text-xs"
          >
            ←
          </Link>
          <div className="flex-1">
            <h1 className="font-mono text-sm text-[#a3a3a3] tracking-[0.15em] uppercase">
              // DOSSIER_ARCHIVE
              <span className="text-[#555555] mx-2">/</span>
              <span className="text-[#ea580c]">RESEARCHER_PROFILE</span>
            </h1>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
          <div className="h-full">
            <IdentityCard />
          </div>
          <div className="h-full">
            <ResearchStats />
          </div>

          <div className="lg:col-span-2">
            <AnalysisHistory />
          </div>

          <div className="lg:col-span-2">
            <AchievementsGrid />
          </div>

          <div className="h-[400px]">
            <ConnectedAccounts />
          </div>
          <div className="h-[400px]">
            <ActivityTimeline />
          </div>

          <div className="lg:col-span-2 mt-4">
            <DangerZone />
          </div>
        </div>
      </main>
    </div>
  )
}
