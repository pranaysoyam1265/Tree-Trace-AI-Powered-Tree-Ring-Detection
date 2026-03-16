"use client"

import { useBatch } from "@/lib/contexts/batch-context"
import { DropZone } from "../upload/drop-zone"
import { ImageFilmstrip } from "../upload/image-filmstrip"
import { ConfigPanel } from "../upload/config-panel"
import { ConfigBar } from "../upload/config-bar"

export function UploadPhase() {
  const { state } = useBatch()
  const hasImages = state.images.length > 0

  if (!hasImages) {
    return (
      <section className="flex flex-1 flex-col pt-4 pb-16 px-4 sm:px-8 w-full">
        {/* Phase Heading */}
        <div className="mb-8 border-b-2 border-[#333333] pb-6">
          <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">UPLOAD SPECIMENS</h1>
          <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
            Step 1: Select or drag cross-section images to begin batch initialization.
          </p>
        </div>

        <DropZone />

        {/* System Specs / Instructions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-2 border-[#333333] bg-[#141414] p-5">
            <h3 className="font-mono text-[10px] font-bold text-[#ea580c] uppercase tracking-[0.2em] mb-3">
              // FORMAT REQUIRES
            </h3>
            <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed mb-4">
              System accepts standard high-res imaging formats. Max batch size applies per memory constraints.
            </p>
            <ul className="flex flex-col gap-2 font-mono text-[10px] text-[#555555]">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ea580c]" /> PNG, JPG, JPEG, TIFF</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ea580c]" /> Up to 50MB per file</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ea580c]" /> Max 100 images per batch</li>
            </ul>
          </div>

          <div className="border-2 border-[#333333] bg-[#0d0d0d] p-5">
            <h3 className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">
              // QUALITY OPTICS
            </h3>
            <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
              CS-TRD core algorithm performs best on clean, high-contrast cross-sections. Sanded surfaces and macroscopic hardware scanning yield the highest confidence ratings.
            </p>
          </div>

          <div className="border-2 border-[#333333] bg-[#0d0d0d] p-5">
            <h3 className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">
              // DATA PRIVACY
            </h3>
            <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
              All image processing is restricted to secure compute nodes. Results and visual data are permanently purged matching non-persistence protocols post-session.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-1 flex-col pt-4 pb-16 px-4 sm:px-8 w-full">
      {/* Phase Heading */}
      <div className="mb-6 flex items-end justify-between border-b-2 border-[#333333] pb-4">
        <div>
          <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-1">CONFIGURE BATCH</h1>
          <p className="font-mono text-xs text-[#a3a3a3] uppercase tracking-[0.1em]">
            Step 2: Adjust preprocessing bounds or lock configuration
          </p>
        </div>
      </div>

      {/* Compact upload bar at top */}
      <DropZone compact />

      {/* Stacked panel layout */}
      <div className="mt-4 flex flex-col gap-8 flex-1">
        {/* Top panel: configuration */}
        <div className="w-full">
          <ConfigPanel />
        </div>

        {/* Bottom panel: filmstrip gallery */}
        <div className="w-full">
          <ImageFilmstrip />
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <ConfigBar />
    </section>
  )
}
