"use client"

import { ProgressHeader } from "../processing/progress-header"
import { SpotlightCard } from "../processing/spotlight-card"
import { CompletedStack } from "../processing/completed-stack"
import { QueueList } from "../processing/queue-list"
import { ActivityLog } from "../processing/activity-log"

export function ProcessingPhase() {
  return (
    <section className="flex flex-1 flex-col pt-4 pb-8 px-4 sm:px-8 w-full gap-8">
      {/* Phase Heading */}
      <div className="border-b-2 border-[#333333] pb-6">
        <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">PROCESSING BATCH</h1>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          Step 3: Algorithm execution and data synthesis in progress
        </p>
      </div>

      {/* Overall progress */}
      <ProgressHeader />

      {/* Spotlight: currently processing image */}
      <SpotlightCard />

      {/* Two-column: completed + queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletedStack />
        <QueueList />
      </div>

      {/* Floating activity log */}
      <ActivityLog />
    </section>
  )
}
