"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAnalysisHistory } from "@/lib/hooks/use-analysis-history"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/lib/contexts/analysis-context"
import TreeTraceDemoPlayer from "@/components/TreeTraceDemoPlayer"
import { CornerAccents } from "@/components/ui/brutal/corner-accents"

const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-~^"

function useAsciiFrame(rows: number, cols: number, enabled: boolean) {
  const [frame, setFrame] = useState("")
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const generateFrame = useCallback(() => {
    let result = ""
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const distFromCenter = Math.abs(c - cols / 2) / (cols / 2)
        const vertDist = Math.abs(r - rows / 2) / (rows / 2)
        const dist = Math.sqrt(distFromCenter ** 2 + vertDist ** 2)
        if (Math.random() > dist * 0.7) {
          result += ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
        } else {
          result += " "
        }
      }
      if (r < rows - 1) result += "\n"
    }
    return result
  }, [rows, cols])

  useEffect(() => {
    if (!enabled) {
      setFrame(generateFrame())
      return
    }

    const animate = (time: number) => {
      if (time - lastTimeRef.current > 120) {
        lastTimeRef.current = time
        setFrame(generateFrame())
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, generateFrame])

  return frame
}

export function HeroSection() {
  const [motionEnabled, setMotionEnabled] = useState(true)
  const { recent, isLoaded } = useAnalysisHistory()
  const router = useRouter()
  const { reset } = useAnalysis()

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setMotionEnabled(!mq.matches)
    const handler = (e: MediaQueryListEvent) => setMotionEnabled(!e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const asciiFrame = useAsciiFrame(30, 80, motionEnabled)

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Main Content — two-column layout */}
      <div className="relative z-20 flex min-h-screen items-start pt-[16vh] lg:pt-[20vh]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
            {/* Left: Text content */}
            <div className="flex flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-4">
                {/* System status badge */}
                <div className="inline-flex items-center gap-2 border border-[#333333] bg-[#141414] px-3 py-1 font-mono text-[10px] text-[#a3a3a3] uppercase tracking-[0.25em]">
                  <span className="inline-block w-2 h-2 bg-[#ea580c] animate-blink" />
                  <span>DENDROCHRONOLOGY ANALYSIS TERMINAL</span>
                </div>

                {/* Headline with ASCII animation behind it */}
                <div className="relative mt-1">
                  <div
                    className="pointer-events-none absolute -inset-4 flex items-center justify-center overflow-hidden opacity-[0.04]"
                    aria-hidden="true"
                  >
                    <pre className="font-mono text-[10px] leading-[14px] text-white lg:text-xs lg:leading-[16px] whitespace-pre">
                      {asciiFrame}
                    </pre>
                  </div>
                  <h1 className="relative font-pixel text-5xl leading-tight tracking-wider text-white uppercase md:text-6xl xl:text-7xl mb-1">
                    TREETRACE
                  </h1>
                  <p className="mt-1 font-mono text-sm tracking-[0.25em] text-[#a3a3a3] uppercase">
                    DENDROCHRONOLOGY ANALYSIS TERMINAL
                  </p>
                  <p className="mt-3 font-mono text-lg tracking-[0.1em] text-[#ea580c] uppercase font-bold">
                    DECODE. MEASURE. ANALYZE.
                    <span className="animate-blink ml-1 border-b-2 border-[#ea580c] inline-block w-3" />
                  </p>
                </div>

                {/* Richer description */}
                <p className="max-w-xl font-mono text-sm leading-relaxed text-[#a3a3a3] mt-1">
                  AI-powered tree ring detection for researchers, foresters, and
                  scientists. Upload a cross-section image, mark the pith, and
                  receive precise ring counts and width measurements in seconds.
                </p>
                <p className="max-w-xl font-mono text-[11px] leading-relaxed text-[#555555]">
                  TreeTrace uses the CS-TRD algorithm to automatically detect annual growth
                  boundaries across conifer and hardwood specimens. Supports PNG, JPEG, and
                  TIFF formats up to 10MB with single-image and batch processing modes.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 w-full mt-2">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {/* Primary CTA */}
                  <button
                    onClick={() => {
                      reset()
                      router.push("/analyze")
                    }}
                    className="flex items-center justify-center gap-2 bg-[#ea580c] text-white min-w-[220px] px-8 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.2em] border-2 border-[#ea580c] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:bg-transparent hover:text-[#ea580c] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-none w-full sm:w-auto"
                  >
                    [▸ INITIATE ANALYSIS]
                  </button>
                  {/* Secondary CTA */}
                  <a
                    href="/docs"
                    className="flex items-center justify-center gap-2 bg-transparent text-[#a3a3a3] min-w-[220px] px-8 py-2.5 font-mono text-sm uppercase tracking-[0.15em] border border-[#333333] hover:border-[#ea580c] hover:text-[#ea580c] transition-colors w-full sm:w-auto"
                  >
                    [EXPLORE FEATURES]
                  </a>
                </div>

                {/* Session Recovery */}
                {isLoaded && recent && (
                  <div className="mt-1">
                    <a
                      href={`/results/${recent.id}`}
                      className="flex items-center gap-2 font-mono text-[10px] text-[#555555] hover:text-[#ea580c] transition-colors uppercase tracking-[0.15em]"
                    >
                      <span className="text-[#ea580c]">▸</span>
                      RESUME: <span className="text-white truncate max-w-[150px]">{recent.imageName}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Cinematic Storyboard Container — Terminal Casing */}
            <div className="relative hidden lg:flex flex-col justify-start w-full mt-2 xl:pl-8">
              {/* Subtle static glow underlay */}
              <div className="absolute inset-0 bg-[#ea580c]/[0.03] blur-[80px] rounded-full pointer-events-none" />

              {/* Terminal-style casing */}
              <div className="relative w-full border-2 border-[#333333] bg-[#141414] shadow-[0_0_60px_-20px_rgba(234,88,12,0.12)]">
                <CornerAccents />

                {/* Terminal title bar */}
                <div className="h-7 border-b border-[#333333] bg-[#0d0d0d] flex items-center px-3 justify-between select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#ea580c]" />
                    <div className="w-2 h-2 bg-[#333333]" />
                    <div className="w-2 h-2 bg-[#333333]" />
                  </div>
                  <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.2em]">
                    ── LIVE_PREVIEW ──
                  </span>
                  <div className="w-12" />
                </div>

                {/* Inner Screen Bezel */}
                <div className="relative bg-[#0a0a0a] border-t border-[#1f1f1f] w-full" style={{ height: '400px', overflow: 'hidden' }}>
                  <div className="w-full h-full relative">
                    <TreeTraceDemoPlayer />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#555555]">
          SCROLL TO EXPLORE
        </span>
        <div className="h-4 w-[2px] bg-[#ea580c]" />
      </div>
    </section>
  )
}
