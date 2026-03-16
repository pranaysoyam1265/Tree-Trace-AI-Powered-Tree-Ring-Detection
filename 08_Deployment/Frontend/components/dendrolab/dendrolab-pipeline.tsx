"use client"

import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { PipelineHeader } from "./pipeline-header"
import { SpecimenPanel } from "./specimen-panel"
import { ExportDrawer } from "./export-drawer"
import { PurposeHeader } from "./purpose-header"

// New 4-step stage imports
import { StageAddSpecimens } from "./stages/stage-add-specimens"
import { StageComparePatterns } from "./stages/stage-compare-patterns"
import { StageClimate } from "./stages/stage-climate"
import { StageDiscover } from "./stages/stage-discover"

export function DendroLabPipeline() {
  const { state } = useDendroLab()

  return (
    <div className="flex flex-col gap-6">
      {/* Purpose Header (collapses after Step 1) */}
      <PurposeHeader />

      {/* Top Header */}
      <PipelineHeader />

      {/* Main Workspace Layout */}
      <div className="flex gap-6 min-h-[700px]">
        {/* Left Sidebar (Loaded Data context) */}
        <div className="w-64 hidden xl:block shrink-0 border border-[#333333] bg-[#111111]">
          <SpecimenPanel />
        </div>

        {/* Center Canvas (Active Step) */}
        <div className="flex-1 border border-[#333333] bg-[#111111] overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-brutal">
            {state.currentStage === 1 && <StageAddSpecimens />}
            {state.currentStage === 2 && <StageComparePatterns />}
            {state.currentStage === 3 && <StageClimate />}
            {state.currentStage === 4 && <StageDiscover />}
          </div>
        </div>
      </div>

      {/* Slide-out Export Drawer overlay */}
      <ExportDrawer />
    </div>
  )
}
