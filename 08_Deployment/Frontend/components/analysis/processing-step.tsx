"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/lib/contexts/analysis-context"
import { useAnalysisHistory } from "@/lib/hooks/use-analysis-history"
import { XCircle } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   STEP 3: PROCESSING — Domain Section Style (Premium)
   Ghost 03, glass-card terminal, ring loader + staggered boot-log
   ═══════════════════════════════════════════════════════════════════ */

const STAGES = [
  { msg: "Loading image buffer...", duration: 800, end: 8 },
  { msg: "Applying Gaussian blur (σ=1.2)...", duration: 1000, end: 18 },
  { msg: "Computing radial gradients from pith...", duration: 1500, end: 32 },
  { msg: "Detecting ring boundaries (Canny edge)...", duration: 2500, end: 55 },
  { msg: "Measuring ring widths (px → mm)...", duration: 1500, end: 72 },
  { msg: "Computing ring-width index (RWI)...", duration: 1200, end: 85 },
  { msg: "Cross-validating detections...", duration: 800, end: 95 },
  { msg: "Finalizing results...", duration: 600, end: 100 },
]

export function ProcessingStep() {
  const { state, updateProcess, setResult, setStep } = useAnalysis()
  const router = useRouter()
  const { saveSession } = useAnalysisHistory()
  const cancelledRef = useRef(false)
  const [showCancel, setShowCancel] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [logLines, setLogLines] = useState<{ text: string; type: "info" | "ok" | "dim" }[]>([])
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

    const addLog = (text: string, type: "info" | "ok" | "dim" = "info") => {
      setLogLines((prev) => [...prev, { text, type }])
    }

    const run = async () => {
      updateProcess("running", STAGES[0].msg, 0)
      addLog("[INIT] CS-TRD Ring Detection Engine v1.0", "dim")
      addLog("[INIT] Loading configuration...", "dim")
      addLog("")

      for (const stage of STAGES) {
        if (cancelled) return
        updateProcess("running", stage.msg)
        const ts = (elapsed).toFixed(1).padStart(6)
        addLog(`[${ts}s] ${stage.msg}`)

        const steps = 8
        const stepDuration = stage.duration / steps
        const prevEnd = STAGES[STAGES.indexOf(stage) - 1]?.end ?? 0
        const increment = (stage.end - prevEnd) / steps

        for (let i = 0; i < steps; i++) {
          if (cancelled) return
          await new Promise((r) => setTimeout(r, stepDuration))
          updateProcess("running", undefined, Math.round(prevEnd + increment * (i + 1)))
        }
      }

      if (!cancelled) {
        addLog("")
        addLog("[  OK  ] Analysis complete — all ring boundaries mapped.", "ok")
        addLog("[  OK  ] 47 rings detected with 94.2% confidence.", "ok")
        const mockId = "analysis-" + Date.now().toString(36)
        setResult(mockId)

        saveSession({
          id: mockId,
          imageName: state.file?.name ?? "demo-image.jpg",
          timestamp: new Date().toISOString(),
          ringCount: 47
        })

        if (timerRef.current) clearInterval(timerRef.current)
        setTimeout(() => {
          if (!cancelledRef.current) {
            router.push(`/results/${mockId}`)
          }
        }, 500)
      }
    }

    run()
    return () => { cancelled = true; cancelledRef.current = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = useCallback(() => {
    cancelledRef.current = true
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
          Executing radial ring detection and measuring boundary distances.
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
          {/* Left: Ring loader + Progress (2 cols) */}
          <div className="border-b border-border-default lg:col-span-2 lg:border-b-0 lg:border-r lg:border-border-default flex flex-col items-center justify-center p-10 gap-8">
            {/* Concentric ring animation */}
            <div className="relative flex items-center justify-center h-44 w-44">
              {/* Outer faint dashed ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-dashed border-accent/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              {/* Pulsing glow background */}
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
              {/* Scanning beam */}
              <motion.div
                className="absolute h-[2px] bg-gradient-to-r from-accent via-accent/80 to-transparent origin-left"
                style={{ width: 60, filter: "blur(0.5px)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute w-[120px] h-[120px] bg-[conic-gradient(from_0deg,transparent_0deg,var(--color-accent)_90deg,transparent_90deg)] rounded-full origin-center animate-spin-slow pointer-events-none opacity-10" style={{ animationDuration: '3s' }} />
              <div className="relative h-4 w-4 rounded-full bg-accent shadow-[0_0_20px_var(--color-accent)] z-10" />
            </div>

            {/* Progress readout */}
            <div className="w-full max-w-[200px] flex flex-col gap-3 items-center">
              <span className="font-mono text-3xl font-bold text-accent tabular-nums">
                {state.progress}<span className="text-accent/40 text-lg">%</span>
              </span>
              <div className="h-1.5 w-full rounded-full bg-[var(--bg-void)] border border-border-default/30 overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full relative overflow-hidden"
                  animate={{ width: `${state.progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute top-0 bottom-0 w-12 bg-white/20 blur-[3px]"
                    animate={{ left: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
              <motion.p
                key={state.processMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-[10px] text-text-tertiary/50 text-center h-4 truncate w-full"
              >
                {state.processMessage}
              </motion.p>
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
