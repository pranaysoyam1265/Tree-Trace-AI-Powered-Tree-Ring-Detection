"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/lib/contexts/analysis-context"
import { apiClient } from "@/lib/api-client"
import { cacheResult } from "@/lib/result-storage"
import { XCircle } from "lucide-react"
import { RingDetectionVisualizer } from "@/components/RingDetectionVisualizer"


/* ═══════════════════════════════════════════════════════════════════
   STEP 3: PROCESSING — Real API call to FastAPI backend
   Calls POST /api/analyze, shows elapsed time, supports abort.
   ═══════════════════════════════════════════════════════════════════ */

export function ProcessingStep() {
  const { state, updateProcess, setResult, setStep } = useAnalysis()
  const router = useRouter()
  const cancelledRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const [showCancel, setShowCancel] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [logLines, setLogLines] = useState<{ text: string; type: "info" | "ok" | "dim" | "err" }[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const start = Date.now()
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logLines])

  useEffect(() => {
    cancelledRef.current = false
    let cancelled = false

    const addLog = (text: string, type: "info" | "ok" | "dim" | "err" = "info") => {
      setLogLines((prev) => [...prev, { text, type }])
    }

    const run = async () => {
      updateProcess("running", "Preparing upload...", 0)
      addLog("[INIT] CS-TRD Ring Detection Engine v1.0", "dim")
      addLog("[INIT] Uploading image to analysis server...", "dim")
      addLog("")

      if (!state.file || !state.pith) {
        addLog("[ERROR] Missing image or pith coordinates.", "err")
        updateProcess("error", "Missing image or pith coordinates.")
        return
      }

      try {
        const abortController = new AbortController()
        abortRef.current = abortController

        const formData = new FormData()
        formData.append("image", state.file)
        formData.append("image_name", state.file.name)
        formData.append("cx", String(Math.round(state.pith.x)))
        formData.append("cy", String(Math.round(state.pith.y)))
        formData.append("sampling_year", String(new Date().getFullYear()))

        addLog(`[UPLOAD] Image: ${state.file.name} (${(state.file.size / 1024 / 1024).toFixed(1)} MB)`)
        addLog(`[UPLOAD] Pith: cx=${Math.round(state.pith.x)}, cy=${Math.round(state.pith.y)}`)
        addLog("")
        updateProcess("running", "Detecting rings... (this takes 10-30 seconds)")

        addLog("[  >>  ] Ring detection in progress...")
        addLog("[  >>  ] CS-TRD is analyzing your specimen.")

        const result = await apiClient.analyze(formData, abortController.signal)

        if (cancelled || cancelledRef.current) return

        cacheResult(result)

        addLog("")
        addLog(`[  OK  ] Analysis complete — ${result.ring_count} ring boundaries detected.`, "ok")
        addLog(`[  OK  ] Health score: ${result.health.score}/100 (${result.health.label})`, "ok")
        addLog(`[  OK  ] Processing time: ${result.processing_time_seconds}s`, "ok")

        setResult(result.id)

        if (timerRef.current) clearInterval(timerRef.current)
        setTimeout(() => {
          if (!cancelledRef.current) {
            router.push(`/results/${result.id}`)
          }
        }, 800)

      } catch (error: unknown) {
        if (cancelled || cancelledRef.current) return

        const message = error instanceof Error ? error.message : "Analysis failed"

        if (error instanceof DOMException && error.name === "AbortError") {
          addLog("")
          addLog("[ABORT] Analysis cancelled by user.", "err")
          updateProcess("idle", "", 0)
          return
        }

        addLog("")
        addLog(`[FAIL] ${message}`, "err")
        updateProcess("error", message)
      }
    }

    run()
    return () => { cancelled = true; cancelledRef.current = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = useCallback(() => {
    cancelledRef.current = true
    abortRef.current?.abort()
    updateProcess("idle", "", 0)
    if (timerRef.current) clearInterval(timerRef.current)
    setStep(2)
  }, [updateProcess, setStep])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 pt-6 lg:px-8"
    >
      {/* Phase Header */}
      <div className="mb-8 border-b-2 border-[#333333] pb-6">
        <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">PROCESSING ANALYSIS</h1>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          Executing radial ring detection via CS-TRD pipeline.
        </p>
      </div>

      {/* Main terminal card — full brutalist */}
      <div className="border-2 border-[#333333] bg-[#0a0a0a] relative overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-[-1px] left-[-1px] w-2 h-2 bg-[#ea580c] z-10" />
        <div className="absolute top-[-1px] right-[-1px] w-2 h-2 bg-[#ea580c] z-10" />
        <div className="absolute bottom-[-1px] left-[-1px] w-2 h-2 bg-[#ea580c] z-10" />
        <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 bg-[#ea580c] z-10" />

        {/* Title bar */}
        <div className="flex items-center justify-between border-b-2 border-[#333333] bg-[#0d0d0d] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <motion.div
                className="h-2 w-2 bg-[#ea580c]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="h-2 w-2 bg-[#333333]" />
              <div className="h-2 w-2 bg-[#333333]" />
            </div>
            <span className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-[0.15em]">
              treetrace ~ ring-detector
            </span>
          </div>
          <div className="flex items-center gap-4">
            <motion.span
              className="font-mono text-[9px] text-[#ea580c] uppercase tracking-[0.2em]"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ● ANALYZING
            </motion.span>
            <span className="font-mono text-xs text-[#555555] tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2">
          {/* Left: Ring Detection Visualizer */}
          <div className="border-b-2 border-[#333333] lg:border-b-0 lg:border-r-2 lg:border-[#333333] flex flex-col">
            {/* Viz sub-header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#222222] bg-[#0d0d0d]">
              <span className="font-mono text-[9px] text-[#ea580c] uppercase tracking-[0.2em] font-bold">
                // RING DETECTION VISUALIZER
              </span>
              <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.15em] tabular-nums">
                LIVE
              </span>
            </div>

            {/* Ring Detection Visualizer */}
            <div className="relative bg-[#080808] p-4 flex-1 flex items-center justify-center" style={{ minHeight: 340 }}>
              <RingDetectionVisualizer width={320} height={320} />
            </div>

            {/* Status bar below canvas */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#222222] bg-[#0d0d0d]">
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold text-[#ea580c] tabular-nums tracking-tight">
                    {formatTime(elapsed)}
                  </span>
                  <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.15em]">
                    ELAPSED
                  </span>
                </div>
                <motion.p
                  key={state.processMessage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.1em] truncate"
                >
                  {state.processMessage || "DETECTING RING BOUNDARIES..."}
                </motion.p>
              </div>

              {/* Cancel */}
              <AnimatePresence mode="wait">
                {!showCancel ? (
                  <motion.button
                    key="cancel-btn"
                    onClick={() => setShowCancel(true)}
                    className="flex items-center gap-1.5 font-mono text-[10px] text-[#555555] hover:text-[#ef4444] uppercase tracking-[0.1em] px-3 py-1.5 border border-[#333333] hover:border-[#ef4444]/30 transition-colors"
                  >
                    <XCircle className="h-3 w-3" /> ABORT
                  </motion.button>
                ) : (
                  <motion.div
                    key="cancel-confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 font-mono text-[10px] border border-[#ef4444]/30 bg-[#ef4444]/[0.04] px-3 py-1.5"
                  >
                    <span className="text-[#a3a3a3] uppercase tracking-[0.1em]">Abort?</span>
                    <button onClick={handleCancel} className="text-[#ef4444] font-bold uppercase hover:underline">Yes</button>
                    <button onClick={() => setShowCancel(false)} className="text-[#666666] uppercase hover:text-white">No</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Processing Log */}
          <div className="flex flex-col">
            {/* Log sub-header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#222222] bg-[#0d0d0d]">
              <div className="h-1.5 w-1.5 bg-[#ea580c]" />
              <span className="font-mono text-[9px] text-[#ea580c] uppercase tracking-[0.2em] font-bold">
                // PROCESSING OUTPUT
              </span>
            </div>

            {/* Log content */}
            <div className="bg-[#080808] p-4 overflow-y-auto font-mono text-xs" style={{ height: "420px" }}>
              {logLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className={`leading-relaxed ${line.type === "ok"
                    ? "text-[#22c55e] font-semibold mt-0.5"
                    : line.type === "dim"
                      ? "text-[#444444]"
                      : line.type === "err"
                        ? "text-[#ef4444] font-semibold"
                        : "text-[#888888]"
                    }`}
                >
                  {line.text || "\u00A0"}
                </motion.div>
              ))}
              {state.processStatus === "running" && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-[#ea580c]"
                >
                  █
                </motion.span>
              )}
              <div ref={logEndRef} />
            </div>

            {/* Log footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[#222222] bg-[#0d0d0d]">
              <span className="font-mono text-[9px] text-[#444444] uppercase tracking-[0.15em]">
                {logLines.length} LINES
              </span>
              <span className="font-mono text-[9px] text-[#444444] uppercase tracking-[0.15em]">
                CS-TRD TYPICALLY TAKES 10-30S
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
