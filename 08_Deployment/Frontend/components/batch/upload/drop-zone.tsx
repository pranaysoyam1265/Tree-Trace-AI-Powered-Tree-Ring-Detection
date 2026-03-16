"use client"

import { useCallback, useState, useRef } from "react"
import { UploadCloud, Plus } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

const ACCEPTED = ["image/png", "image/jpeg", "image/tiff"]
const MAX_SIZE = 50 * 1024 * 1024

export function DropZone({ compact }: { compact?: boolean }) {
  const { addFiles, addSamples } = useBatch()
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE)
    if (files.length > 0) addFiles(files)
  }, [addFiles])

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).filter(f => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE)
    if (files.length > 0) addFiles(files)
    e.target.value = ""
  }

  // ── Compact "Add More" bar ──
  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-[#333333] bg-[#0d0d0d]">
        <button onClick={() => inputRef.current?.click()} className="flex h-8 items-center gap-2 border-2 border-[#333333] bg-[#141414] px-4 font-mono text-xs text-[#a3a3a3] uppercase tracking-[0.1em] hover:text-[#ea580c] hover:border-[#ea580c] transition-none">
          <Plus className="h-3 w-3" /> ADD MORE
        </button>
        <input ref={inputRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.tiff" multiple onChange={handleSelect} />
        <span className="font-mono text-[10px] text-[#555555]">or drag files here</span>
      </div>
    )
  }

  // ── Full drop zone ──
  return (
    <div
      className={`relative flex flex-col items-center justify-center border-2 border-dashed p-16 text-center cursor-pointer ${dragOver ? "border-[#ea580c] bg-[#ea580c]/5" : "border-[#333333] bg-[#0d0d0d] hover:border-[#555555]"
        }`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      {/* Upload icon — brutalist square markers */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center border-2 border-[#ea580c]/30 bg-[#ea580c]/5">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-[#ea580c]/40 bg-[#ea580c]/10">
            <UploadCloud className="h-7 w-7 text-[#ea580c]" />
          </div>
        </div>
        <div className="absolute inset-0 border border-[#ea580c]/10 scale-[1.5]" />
        <div className="absolute inset-0 border border-[#ea580c]/5 scale-[2]" />
      </div>

      <h3 className="font-mono text-sm font-bold tracking-[0.15em] text-white uppercase mb-2">
        DROP CROSS-SECTION IMAGES
      </h3>
      <p className="max-w-sm font-mono text-[11px] leading-relaxed text-[#555555] mb-8 uppercase tracking-[0.05em]">
        Upload multiple tree ring images for simultaneous batch analysis. PNG, JPG, TIFF accepted.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
          className="flex h-10 items-center gap-2 bg-[#ea580c] px-8 font-mono text-sm font-bold uppercase tracking-[0.15em] text-white border-2 border-[#ea580c] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:bg-transparent hover:text-[#ea580c] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-none"
        >
          [BROWSE FILES]
        </button>
        <button
          onClick={e => { e.stopPropagation(); addSamples() }}
          className="flex h-10 items-center gap-2 border-2 border-[#333333] bg-transparent px-8 font-mono text-sm uppercase tracking-[0.15em] text-[#a3a3a3] hover:border-[#ea580c] hover:text-[#ea580c] transition-none"
        >
          [LOAD 10 SAMPLES]
        </button>
      </div>

      <p className="mt-8 font-mono text-[10px] text-[#555555] uppercase tracking-[0.1em]">
        Max 50 MB per image • Accepts PNG, JPG, JPEG, TIFF
      </p>

      <input ref={inputRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.tiff" multiple onChange={handleSelect} />
    </div>
  )
}
