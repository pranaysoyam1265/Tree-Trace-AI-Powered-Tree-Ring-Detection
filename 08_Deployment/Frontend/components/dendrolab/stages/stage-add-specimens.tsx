"use client"

import { useState } from "react"
import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { Search, Plus, AlertCircle, ChevronDown, ChevronRight } from "lucide-react"
import { MOCK_HISTORY_ANALYSES, MOCK_SPECIMENS } from "@/lib/mock-dendrolab"
import { GuideTooltip } from "../guide-tooltip"
import { StepCompletionBanner } from "../step-completion-banner"

/* ═══════════════════════════════════════════════════════════════════
   STEP 1: ADD YOUR SPECIMENS
   Merges old Load + Date stages into a single guided flow.
   ═══════════════════════════════════════════════════════════════════ */

export function StageAddSpecimens() {
  const { state, dispatch } = useDendroLab()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [samplingYear, setSamplingYear] = useState(2023)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const guideMode = state.guideMode

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }

  const handleLoadSelected = () => {
    // Use demo data for now
    dispatch({ type: "SET_SPECIMENS", payload: MOCK_SPECIMENS })
    dispatch({ type: "MARK_STAGE_COMPLETED", payload: 1 })
    setShowCompletion(true)
  }

  const handleLoadDemo = () => {
    dispatch({ type: "SET_SPECIMENS", payload: MOCK_SPECIMENS })
    dispatch({ type: "MARK_STAGE_COMPLETED", payload: 1 })
    setShowCompletion(true)
  }

  const specimensLoaded = state.specimens.length > 0

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-[#333333] pb-6">
        <h2 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">
          ADD YOUR SPECIMENS
        </h2>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          {guideMode
            ? "Select the tree samples you want to analyze together."
            : "Load ring width series from completed analyses or import .RWL/.CSV files."}
        </p>
      </div>

      {/* Completion Banner */}
      {showCompletion && specimensLoaded && (
        <StepCompletionBanner
          title="✓ SAMPLES LOADED"
          description={`You have ${state.specimens.length} samples covering ${state.specimens.filter(s => s.yearSpan).map(s => s.yearSpan!.start).reduce((a, b) => Math.min(a, b), 9999)}-${state.specimens.filter(s => s.yearSpan).map(s => s.yearSpan!.end).reduce((a, b) => Math.max(a, b), 0)}. ${state.specimens.map(s => s.name.replace('.png', '')).join(', ')} are ready for comparison.`}
          nextLabel="COMPARE GROWTH PATTERNS"
          onNext={() => dispatch({ type: "SET_STAGE", payload: 2 })}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* ── Section A: Choose Your Tree Samples ── */}
        <div className="lg:col-span-2 flex flex-col gap-4 border border-[#333333] bg-[#0a0a0a] p-1">
          <div className="px-4 pt-4 pb-2 border-b border-[#222222]">
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // CHOOSE YOUR TREE SAMPLES
            </span>
            {guideMode && (
              <p className="font-mono text-xs text-[#a3a3a3] mt-2 leading-relaxed">
                Select the tree samples you want to analyze together.
                Choose samples from the same location for best results.
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 px-3 pb-2 border-b border-[#222222]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
              <input
                type="text"
                placeholder="Search samples..."
                className="w-full bg-[#111111] border border-[#333333] pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ea580c] font-mono"
              />
            </div>
            <button className="whitespace-nowrap bg-[#222222] hover:bg-[#333333] px-4 py-2 text-sm font-bold border border-[#333333] flex items-center gap-2 font-mono uppercase tracking-[0.1em]">
              <Plus className="w-4 h-4" />
              Upload .RWL
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-1">
            <table className="w-full text-sm text-left font-mono">
              <thead className="text-xs uppercase text-[#666666] bg-[#111111] sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-bold w-10">Select</th>
                  <th className="px-4 py-3 font-bold">Sample Name</th>
                  <th className="px-4 py-3 font-bold">Rings</th>
                  <th className="px-4 py-3 font-bold pl-12">Detection Quality</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY_ANALYSES.map(item => {
                  const isFailed = item.f1Score === null
                  const isLowQuality = item.f1Score !== null && item.f1Score < 0.6
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-[#222222] ${isFailed ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#111111] cursor-pointer'}`}
                      onClick={() => !isFailed && toggleSelect(item.id)}
                    >
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          disabled={isFailed}
                          onChange={() => !isFailed && toggleSelect(item.id)}
                          className="w-4 h-4 accent-[#ea580c] bg-transparent border-[#555555]"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {item.name.replace('.png', '')}
                        {isLowQuality && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 font-bold uppercase">
                            ⚠ LOW QUALITY
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#a3a3a3]">{item.ringCount}</td>
                      <td className="px-4 py-3">
                        {item.f1Score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-[#222222] overflow-hidden">
                              <div
                                className={`h-full ${item.f1Score > 0.8 ? 'bg-green-500' : item.f1Score > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${item.f1Score * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#a3a3a3]">{(item.f1Score * 100).toFixed(0)}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-red-500 flex items-center gap-1" title="Analysis failed — cannot use in DendroLab">
                            <AlertCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Sidebar: Session + Demo ── */}
        <div className="flex flex-col gap-4">
          <div className="border border-[#333333] bg-[#0a0a0a] p-6 flex flex-col gap-4">
            <h3 className="font-bold uppercase tracking-wider text-sm border-b border-[#333333] pb-2 font-mono">
              Session Summary
            </h3>
            <div className="flex justify-between items-center text-sm font-mono">
              <span className="text-[#a3a3a3]">Selected items</span>
              <span className="font-bold text-xl">{selectedIds.size}</span>
            </div>
            {guideMode && (
              <div className="text-xs text-[#a3a3a3] p-3 bg-[#111111] border border-[#222222] font-mono">
                Select multiple samples from the same site to compare their growth and build a combined record.
              </div>
            )}
            <button
              onClick={handleLoadSelected}
              disabled={selectedIds.size === 0}
              className="mt-4 w-full bg-[#ea580c] text-black font-bold uppercase tracking-wider py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ea580c]/90 font-mono text-sm"
            >
              Load Selected Samples
            </button>
          </div>

          <div className="border border-[#ea580c]/30 text-[#ea580c] bg-[#ea580c]/5 p-6 flex flex-col gap-3">
            <h3 className="font-bold uppercase tracking-wider text-sm font-mono">Demo Data</h3>
            <p className="text-xs opacity-80 font-mono">
              Load the pre-configured dataset (F02a, F02b, F03a, S01a) to explore DendroLab features.
            </p>
            <button
              onClick={handleLoadDemo}
              className="mt-2 w-full border border-[#ea580c] text-[#ea580c] hover:bg-[#ea580c] hover:text-black font-bold uppercase py-2 text-sm font-mono"
            >
              [▸ LOAD DEMO DATASET]
            </button>
          </div>
        </div>
      </div>

      {/* ── Section B: When were these samples taken? ── */}
      {specimensLoaded && (
        <div className="border border-[#333333] bg-[#0a0a0a] p-6 flex flex-col gap-5">
          <div>
            <span className="font-mono text-xs uppercase text-[#ea580c] font-bold tracking-[1px]">
              // WHEN WERE THESE SAMPLES TAKEN?
            </span>
            {guideMode && (
              <p className="font-mono text-xs text-[#a3a3a3] mt-2 leading-relaxed">
                Tell us when each tree was cut or cored. We&apos;ll use this to
                figure out which ring grew in which year.
              </p>
            )}
          </div>

          {/* Quick action */}
          <div className="flex items-center gap-3 border border-[#333333] bg-[#111111] p-3">
            <span className="font-mono text-xs text-[#a3a3a3]">
              All samples taken the same year?
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={samplingYear}
                onChange={e => setSamplingYear(Number(e.target.value))}
                className="w-20 bg-[#000000] border border-[#333333] px-2 py-1.5 text-sm text-white focus:border-[#ea580c] focus:outline-none font-mono"
              />
              <button className="border border-[#ea580c] text-[#ea580c] hover:bg-[#ea580c] hover:text-black px-3 py-1.5 font-mono text-xs font-bold uppercase">
                [SET ALL TO {samplingYear}]
              </button>
            </div>
          </div>

          {/* Per-specimen dating */}
          <div className="flex flex-col gap-3">
            {state.specimens.map(specimen => {
              const startYear = specimen.yearSpan ? specimen.yearSpan.start : samplingYear - specimen.ringCount + 1
              const endYear = specimen.yearSpan ? specimen.yearSpan.end : samplingYear
              const span = endYear - startYear + 1
              return (
                <div key={specimen.id} className="border border-[#333333] bg-[#111111] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-white">{specimen.name.replace('.png', '')}</span>
                      <span className="font-mono text-xs text-[#a3a3a3]">{specimen.ringCount} rings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#666666] uppercase">Year taken:</span>
                      <input
                        type="number"
                        defaultValue={endYear}
                        className="w-20 bg-[#000000] border border-[#333333] px-2 py-1.5 text-sm text-white focus:border-[#ea580c] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {guideMode && (
                    <p className="font-mono text-[11px] text-[#777777] leading-relaxed">
                      Ring 1 = {endYear}, Ring {specimen.ringCount} = {startYear}.
                      Your sample covers {startYear} to {endYear} ({span} years).
                    </p>
                  )}

                  {/* Year range bar */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#666666] w-10">{startYear}</span>
                    <div className="flex-1 h-2 bg-[#222222] overflow-hidden border border-[#333333]">
                      <div className="h-full bg-[#ea580c]" style={{ width: '100%' }} />
                    </div>
                    <span className="font-mono text-[10px] text-[#666666] w-10 text-right">{endYear}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Advanced options */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 font-mono text-xs text-[#666666] hover:text-[#a3a3a3] uppercase tracking-[0.1em]"
          >
            {showAdvanced ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            [ADVANCED OPTIONS]
          </button>

          {showAdvanced && (
            <div className="border border-[#222222] bg-[#0a0a0a] p-4 flex flex-col gap-3">
              <p className="font-mono text-xs text-[#a3a3a3]">
                Additional dating methods for specialized use:
              </p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 font-mono text-xs text-[#aaaaaa] cursor-pointer">
                  <input type="radio" name="dating-method" defaultChecked className="accent-[#ea580c]" />
                  Known Sampling Year (default)
                </label>
                <label className="flex items-center gap-3 font-mono text-xs text-[#a3a3a3] cursor-pointer">
                  <input type="radio" name="dating-method" className="accent-[#ea580c]" />
                  Cross-dated against master chronology
                  <GuideTooltip term="Cross-dating" explanation="Finding which calendar years match a tree's rings when the sample date is unknown." />
                </label>
                <label className="flex items-center gap-3 font-mono text-xs text-[#a3a3a3] cursor-pointer">
                  <input type="radio" name="dating-method" className="accent-[#ea580c]" />
                  Use relative ring numbers (no calendar dates)
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
