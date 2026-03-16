import { DendroLabPipeline } from "@/components/dendrolab/dendrolab-pipeline"
import { Navigation } from "@/components/ascii-hub/navigation"

export default function DendroLabPage() {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 sm:px-8 py-6 max-w-[1600px] mt-20">
        {/* Page Header */}
        <div className="mb-8 border-b-2 border-[#333333] pb-6">
          <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">DENDROLAB</h1>
          <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
            Decode your tree&apos;s climate history — from ring measurements to environmental insights.
          </p>
        </div>

        {/* Pipeline Orchestrator */}
        <DendroLabPipeline />
      </main>
    </>
  )
}
