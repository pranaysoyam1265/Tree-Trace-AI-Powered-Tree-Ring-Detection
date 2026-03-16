"use client"

import { useBatch } from "@/lib/contexts/batch-context"
import { formatBytes } from "@/lib/mock-batch"
import { Check, AlertTriangle } from "lucide-react"

export function ImageFilmstrip() {
  const { state, selectImage } = useBatch()

  const readyCount = state.images.filter(i => i.pith).length
  const total = state.images.length

  if (state.images.length === 0) return null

  return (
    <div className="flex flex-col gap-4 mt-2 h-[600px] overflow-y-auto pr-2 scrollbar-brutalist">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#333333] pb-2">
        <span className="font-mono text-xs font-bold text-white uppercase tracking-[0.1em]">
          DATASET INVENTORY
        </span>
        <span className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] border-2 ${readyCount === total
            ? "bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]"
            : "bg-[#333333]/50 text-[#a3a3a3] border-[#333333]"
          }`}>
          {readyCount}/{total} READY
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
        {state.images.map((img) => {
          const isSelected = state.selectedImageId === img.id
          const hasPith = !!img.pith

          return (
            <button
              key={img.id}
              onClick={() => selectImage(img.id)}
              className={`group relative flex flex-col items-start text-left border-2 overflow-hidden transition-none ${isSelected
                  ? "border-[#ea580c] bg-[#ea580c]/5 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.2)]"
                  : "border-[#333333] bg-[#0d0d0d] hover:border-[#555555]"
                }`}
            >
              {/* Image Thumbnail */}
              <div className="w-full aspect-square border-b-2 border-[#333333] relative bg-[#1a1a1a]">
                <img
                  src={img.thumbnailUrl}
                  alt={img.alias}
                  className={`h-full w-full object-cover transition-none ${isSelected ? "opacity-100 grayscale-0" : "opacity-60 grayscale group-hover:opacity-80 drop-shadow-none"}`}
                />

                {/* Status Indicator */}
                <div className="absolute top-2 right-2 flex items-center justify-center p-1 bg-[#0a0a0a] border-2 border-[#333333]">
                  {hasPith ? (
                    <Check className="h-3 w-3 text-[#ea580c]" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-[#555555]" />
                  )}
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-3 w-full">
                <div className="font-mono text-xs font-bold text-white truncate w-full mb-1">
                  {img.alias}
                </div>
                <div className="font-mono text-[9px] text-[#555555] flex justify-between uppercase tracking-[0.05em]">
                  <span>{formatBytes(img.fileSize)}</span>
                  <span>{img.dimensions.width}x{img.dimensions.height}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
