"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/lib/contexts/analysis-context"
import { apiClient } from "@/lib/api-client"
import { cacheResult } from "@/lib/result-storage"
import { XCircle } from "lucide-react"

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

        // Build FormData
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

        // Real API call — takes 10-30 seconds
        const result = await apiClient.analyze(formData, abortController.signal)

        if (cancelled || cancelledRef.current) return

        // Cache result for instant load on results page
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

      {/* Glass-card terminal */}
      <div className="glass-card glow-primary rounded-lg overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-border-default bg-[var(--bg-void)]/30 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <motion.div
                className="h-2.5 w-2.5 rounded-full border border-border-accent bg-accent"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="h-2.5 w-2.5 rounded-full border border-border-default bg-text-disabled" />
              <div className="h-2.5 w-2.5 rounded-full border border-border-default bg-text-disabled" />
            </div>
            <span className="font-mono text-xs text-text-primary">
              treetrace ~ ring-detector
            </span>
          </div>
          <span className="font-mono text-xs text-text-secondary/50 tabular-nums">
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 bg-bg-surface/50">
          {/* Left: Ring loader + Elapsed (2 cols) */}
          <div className="border-b border-border-default lg:col-span-2 lg:border-b-0 lg:border-r lg:border-border-default flex flex-col items-center justify-center p-10 gap-8">
            {/* Concentric ring animation */}
            <div className="relative flex items-center justify-center h-44 w-44">
              <motion.div
                className="absolute inset-0 rounded-full border border-dashed border-accent/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-accent/5 blur-xl"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              {[54, 42, 30, 18].map((r, i) => (
                <motion.div
                  key={r}
                  className="absolute rounded-full border border-accent"
                  style={{ width: r * 2, height: r * 2, opacity: 0.15 + i * 0.1 }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.02, 1] }}
                  transition={{
                    rotate: { duration: 8 + i * 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
              ))}
              <motion.div
                className="absolute h-[2px] bg-gradient-to-r from-accent via-accent/80 to-transparent origin-left"
                style={{ width: 60, filter: "blur(0.5px)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute w-[120px] h-[120px] bg-[conic-gradient(from_0deg,transparent_0deg,var(--color-accent)_90deg,transparent_90deg)] rounded-full origin-center animate-spin-slow pointer-events-none opacity-10" style={{ animationDuration: '3s' }} />
              <div className="relative h-4 w-4 rounded-full bg-accent shadow-[0_0_20px_var(--color-accent)] z-10" />
            </div>

            {/* Elapsed readout */}
            <div className="w-full max-w-[200px] flex flex-col gap-3 items-center">
              <span className="font-mono text-3xl font-bold text-accent tabular-nums">
                {formatTime(elapsed)}
              </span>
              <motion.p
                key={state.processMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-[10px] text-text-tertiary/50 text-center h-4 truncate w-full"
              >
                {state.processMessage || "DETECTING RINGS..."}
              </motion.p>
              <p className="font-mono text-[9px] text-text-tertiary/30 text-center leading-relaxed">
                CS-TRD typically takes 10-30 seconds.
              </p>
            </div>

            {/* Cancel */}
            <AnimatePresence mode="wait">
              {!showCancel ? (
                <motion.button
                  key="cancel-btn"
                  onClick={() => setShowCancel(true)}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-text-tertiary/50 hover:text-status-error transition-colors"
                >
                  <XCircle className="h-3 w-3" /> Cancel Analysis
                </motion.button>
              ) : (
                <motion.div
                  key="cancel-confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4 font-mono text-[10px] rounded-lg border border-status-error/20 bg-status-error/[0.04] px-4 py-2"
                >
                  <span className="text-text-primary">Abort analysis?</span>
                  <button onClick={handleCancel} className="text-status-error font-bold hover:underline">Yes</button>
                  <button onClick={() => setShowCancel(false)} className="text-text-secondary hover:text-text-primary">No</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Boot sequence log (3 cols) */}
          <div className="flex flex-col lg:col-span-3">
            <div className="border-b border-border-subtle px-4 py-2 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent/40" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary/60">
                Processing Output
              </span>
            </div>
            <div className="bg-[var(--bg-void)]/10 p-4 overflow-y-auto font-mono text-xs" style={{ height: "380px" }}>
              {logLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className={`leading-relaxed ${line.type === "ok"
                    ? "text-accent font-semibold mt-0.5"
                    : line.type === "dim"
                      ? "text-text-tertiary/40"
                      : line.type === "err"
                        ? "text-status-error font-semibold"
                        : "text-text-secondary/80"
                    }`}
                >
                  {line.text || "\u00A0"}
                </motion.div>
              ))}
              {state.processStatus === "running" && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-text-primary"
                >
                  _
                </motion.span>
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
