"use client"

import { useEffect, useState } from "react"
import { useAnalysis } from "@/lib/contexts/analysis-context"
import { apiClient } from "@/lib/api-client"
import type { SampleImage } from "@/lib/types"
import { ChevronDown, ChevronUp } from "lucide-react"

export function SampleImageSelector() {
  const { setFile, setPith, goNext } = useAnalysis()
  const [samples, setSamples] = useState<SampleImage[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const initialCount = 6
  const hasMore = samples.length > initialCount
  const visibleSamples = isOpen ? samples : samples.slice(0, initialCount)

  // Fetch real sample list from API on mount
  useEffect(() => {
    apiClient
      .getSamples()
      .then((data) => setSamples(data.samples))
      .catch(() => setSamples([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectSample = async (sample: SampleImage) => {
    try {
      // Fetch the full resolution image from the API
      const response = await fetch(apiClient.getSampleFullImageUrl(sample.name))
      if (!response.ok) {
        alert(`Sample image ${sample.name} could not be loaded from the backend.`)
        return
      }
      const blob = await response.blob()
      const file = new File([blob], sample.filename, { type: "image/png" })

      // Set file and pre-fill pith coordinates from CSV
      setFile(file)
      setTimeout(() => {
        setPith(sample.cx, sample.cy)
        goNext()
      }, 100)
    } catch {
      alert(`Could not load sample image ${sample.name}. Ensure the backend is running.`)
    }
  }

  return (
    <div className="mt-6">
      {/* Separator / Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 border-t-2 border-[#333333]" />
        <span className="font-mono text-[10px] text-[#555555] uppercase tracking-[0.25em] shrink-0">
          OR SELECT A SAMPLE
        </span>
        <div className="flex-1 border-t-2 border-[#333333]" />
      </div>

      <div className="animate-in fade-in duration-200">
        {/* Sample Cards */}
        {loading ? (
          <div className="flex flex-wrap gap-3 pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="shrink-0 flex flex-col items-center border-2 border-[#333333] bg-[#141414] p-3 w-[110px] animate-pulse">
                <div className="w-[72px] h-[72px] border border-[#333333] bg-[#0a0a0a] mb-2" />
                <div className="h-3 w-12 bg-[#333333]" />
              </div>
            ))}
          </div>
        ) : samples.length === 0 ? (
          <p className="font-mono text-[10px] text-[#555555] leading-relaxed">
            No sample images available. Ensure the backend is running.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3 pb-2">
            {visibleSamples.map((sample) => (
              <button
                key={sample.name}
                onClick={() => handleSelectSample(sample)}
                className="shrink-0 flex flex-col items-center border-2 border-[#333333] bg-[#141414] p-3 w-[110px] hover:border-[#ea580c] transition-none group cursor-pointer"
              >
                {/* Real thumbnail from API */}
                <div className="w-[72px] h-[72px] border border-[#333333] bg-[#0a0a0a] flex items-center justify-center mb-2 group-hover:border-[#ea580c] overflow-hidden">
                  <img
                    src={apiClient.getSampleThumbnailUrl(sample.name)}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  {sample.name}
                </span>
                {sample.gt_ring_count && (
                  <span className="font-mono text-[10px] text-[#555555] mt-0.5">
                    {sample.gt_ring_count} GT
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Show More Button */}
        {!loading && hasMore && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-center gap-2 mt-2 py-2.5 border border-[#333333] hover:border-[#ea580c] bg-[#141414] text-[#a3a3a3] hover:text-[#ea580c] font-mono text-[10px] uppercase tracking-[0.2em] transition-colors group outline-none"
          >
            {isOpen ? "SHOW LESS" : "SHOW MORE"}
            {isOpen ? (
              <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        )}

        {/* Description */}
        <p className="font-mono text-[10px] text-[#555555] mt-4 leading-relaxed">
          &ldquo;Sample images from UruDendro dataset with pre-set pith coordinates. Click to load.&rdquo;
        </p>
      </div>
    </div>
  )
}
