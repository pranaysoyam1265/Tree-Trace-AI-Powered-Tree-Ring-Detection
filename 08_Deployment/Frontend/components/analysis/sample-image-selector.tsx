"use client"

import { useAnalysis } from "@/lib/contexts/analysis-context"

const SAMPLE_IMAGES = [
  { name: 'F02a', file: '/samples/F02a.png', cx: 1197, cy: 1293, gtRings: 23 },
  { name: 'F02b', file: '/samples/F02b.png', cx: 1204, cy: 1264, gtRings: 22 },
  { name: 'F02c', file: '/samples/F02c.png', cx: 1204, cy: 1264, gtRings: 22 },
  { name: 'F03a', file: '/samples/F03a.png', cx: 1200, cy: 1250, gtRings: 24 },
  { name: 'F07a', file: '/samples/F07a.png', cx: 1180, cy: 1290, gtRings: 24 },
]

export function SampleImageSelector() {
  const { setFile, setPith, goNext } = useAnalysis()

  const handleSelectSample = async (sample: typeof SAMPLE_IMAGES[0]) => {
    try {
      // Fetch the sample image
      const response = await fetch(sample.file)
      if (!response.ok) {
        alert(`Sample image ${sample.name} not found. Place sample images in /public/samples/ to use this feature.`)
        return
      }
      const blob = await response.blob()
      const file = new File([blob], `${sample.name}.png`, { type: 'image/png' })

      // Set the file and pith
      setFile(file)
      setTimeout(() => {
        setPith(sample.cx, sample.cy)
        goNext()
      }, 100)
    } catch {
      alert(`Could not load sample image ${sample.name}. Ensure /public/samples/${sample.name}.png exists.`)
    }
  }

  return (
    <div className="mt-6">
      {/* Separator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 border-t-2 border-[#333333]" />
        <span className="font-mono text-[10px] text-[#555555] uppercase tracking-[0.25em] shrink-0">
          OR SELECT A SAMPLE
        </span>
        <div className="flex-1 border-t-2 border-[#333333]" />
      </div>

      {/* Sample Cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-brutal">
        {SAMPLE_IMAGES.map((sample) => (
          <button
            key={sample.name}
            onClick={() => handleSelectSample(sample)}
            className="shrink-0 flex flex-col items-center border-2 border-[#333333] bg-[#141414] p-3 w-[110px] hover:border-[#ea580c] transition-none group cursor-pointer"
          >
            {/* Thumbnail placeholder */}
            <div className="w-[72px] h-[72px] border border-[#333333] bg-[#0a0a0a] flex items-center justify-center mb-2 group-hover:border-[#ea580c]">
              <span className="font-mono text-[10px] text-[#555555] group-hover:text-[#ea580c]">
                ◉
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {sample.name}
            </span>
            <span className="font-mono text-[10px] text-[#555555] mt-0.5">
              {sample.gtRings} GT
            </span>
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="font-mono text-[10px] text-[#555555] mt-3 leading-relaxed">
        &ldquo;Sample images from UruDendro dataset with pre-set pith coordinates. Click to load.&rdquo;
      </p>
    </div>
  )
}
