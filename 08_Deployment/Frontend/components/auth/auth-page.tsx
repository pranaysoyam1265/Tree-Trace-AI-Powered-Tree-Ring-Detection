"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"

// WebGL component — must be client-only (no SSR)
const Dither = dynamic(() => import("@/components/ui/Dither"), { ssr: false })

export function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin")

  // Animated numbers for the telemetry box
  const [rings, setRings] = useState(0)
  const [precision, setPrecision] = useState(0)
  const [specimens, setSpecimens] = useState(0)

  // Animated terminal logs for the left side
  const [logs, setLogs] = useState<string[]>([])

  const bootSequence = [
    "INITIALIZING NEURAL PATHWAYS...",
    "LOADING DENDROCHRONOLOGY_MODEL_v2.pt...",
    "CALIBRATING GAUSSIAN DETECTORS [OK]",
    "ESTABLISHING SECURE API HANDSHAKE...",
    "SYSTEM STATUS: ONLINE. WAITING FOR USER AUTHORIZATION."
  ]

  useEffect(() => {
    let frame: number;
    const duration = 2000;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const easeOutQuad = progress * (2 - progress);

      setRings(Math.round(easeOutQuad * 23));
      setPrecision(Math.round(easeOutQuad * 91));
      setSpecimens(Math.round(easeOutQuad * 185));

      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    // Animate terminal logs appearing
    let timeoutIds: NodeJS.Timeout[] = [];
    bootSequence.forEach((log, index) => {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, 400 + index * 600);
      timeoutIds.push(timeout);
    });

    return () => {
      cancelAnimationFrame(frame);
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 sm:p-10 xl:p-16 selection:bg-[#ea580c] selection:text-white overflow-hidden">
      {/* ===== DITHER WEBGL BACKGROUND ===== */}
      <div className="absolute inset-0 z-0">
        <Dither
          waveColor={[0.80, 0.43, 0.13]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.20}
          colorNum={8}
          waveAmplitude={0.45}
          waveFrequency={1.50}
          waveSpeed={0.04}
          pixelSize={2}
        />
      </div>

      {/* Reduced max-width and gap to decrease the horizontal span */}
      <div className="relative z-40 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center">

        {/* ── LEFT PANEL ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-8 lg:pr-12"
        >
          {/* Header Branding */}
          <div className="flex flex-col gap-6">

            {/* ASCII LOGO */}
            <pre className="text-[#ea580c] font-mono text-[9px] sm:text-[11px] leading-[10px] sm:leading-[12px] font-bold drop-shadow-[0_0_12px_rgba(234,88,12,0.8)]">
              {` ████████╗████████╗
 ╚══██╔══╝╚══██╔══╝
    ██║      ██║
    ██║      ██║
    ██║      ██║
    ╚═╝      ╚═╝`}
            </pre>

            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[#ea580c] text-3xl sm:text-4xl animate-pulse leading-none pb-1 drop-shadow-[0_0_16px_rgba(234,88,12,0.7)]">█</span>
                <span className="font-mono text-4xl sm:text-5xl tracking-[8px] text-white font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] leading-none">
                  TREETRACE
                </span>
              </div>
              <span className="font-mono text-sm text-[#ea580c] uppercase tracking-[0.4em] font-bold block mt-3 drop-shadow-[0_0_6px_rgba(234,88,12,0.5)]">
                SYSTEM TERMINAL // V.1.0.4
              </span>
            </div>
          </div>

          {/* Telemetry / Useful Box */}
          <div className="backdrop-blur-2xl bg-black/60 border border-white/10 p-6 rounded-sm w-full shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="font-mono text-[10px] text-[#999999] uppercase tracking-[0.3em] mb-4 pb-3 border-b border-white/10 flex justify-between items-center gap-12">
              <span>SYSTEM METRICS</span>
              <span className="text-[#22c55e] animate-pulse drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]">● ONLINE</span>
            </div>
            <div className="flex gap-4 sm:gap-8 font-mono text-center justify-between">
              <div>
                <div className="text-4xl font-bold text-white tabular-nums tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{rings}</div>
                <div className="text-[10px] text-[#aaaaaa] uppercase tracking-[0.2em] mt-2">AVG RINGS</div>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div>
                <div className="text-4xl font-bold text-[#ea580c] tabular-nums tracking-wider drop-shadow-[0_0_12px_rgba(234,88,12,0.5)]">{precision}%</div>
                <div className="text-[10px] text-[#aaaaaa] uppercase tracking-[0.2em] mt-2">PRECISION</div>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div>
                <div className="text-4xl font-bold text-white tabular-nums tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{specimens}</div>
                <div className="text-[10px] text-[#aaaaaa] uppercase tracking-[0.2em] mt-2">SPECIMENS</div>
              </div>
            </div>
          </div>

          {/* Fake Boot Sequence Log Box */}
          <div className="backdrop-blur-2xl bg-black/60 border border-white/10 p-5 rounded-sm w-full min-h-[120px] shadow-[0_0_30px_rgba(0,0,0,0.5)] font-mono text-[10px] sm:text-xs leading-relaxed tracking-[0.1em]">
            <div className="flex gap-2 items-center mb-3">
              <div className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse shadow-[0_0_6px_#ea580c]" />
              <span className="text-[#aaaaaa] uppercase tracking-[0.2em]">BOOT_SEQUENCE.LOG</span>
            </div>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={i === bootSequence.length - 1 ? "text-[#ea580c] drop-shadow-[0_0_4px_rgba(234,88,12,0.4)]" : "text-[#cccccc]"}
              >
                <span className="text-[#777777] mr-2">[{String(i).padStart(2, "0")}]</span>
                {log}
              </motion.div>
            ))}
            {logs.length < bootSequence.length && (
              <div className="text-white mt-1 animate-pulse flex items-center gap-1">
                <span className="text-[#777777] mr-2">[{String(logs.length).padStart(2, "0")}]</span>
                █
              </div>
            )}
          </div>
        </motion.div>

        {/* ── RIGHT PANEL (Auth Container) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="w-full max-w-[540px] justify-self-center lg:justify-self-end flex flex-col items-center relative"
        >
          {/* Breathing Glow Behind Terminal */}
          <motion.div
            animate={{ opacity: [0.15, 0.45, 0.15], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#ea580c] rounded-full blur-[100px] z-0 pointer-events-none"
          />

          {/* The glassmorphism terminal box */}
          <div className="w-full relative z-10 backdrop-blur-3xl bg-black/60 border border-white/15 rounded-sm shadow-[0_0_50px_rgba(234,88,12,0.2)] overflow-hidden">

            {/* Terminal Title Bar */}
            <div className="bg-black/80 border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ea580c] shadow-[0_0_8px_#ea580c]" />
              </div>
              <div className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.2em]">
                AUTHENTICATION_NODE
              </div>
              <div className="w-8" /> {/* spacer for balance */}
            </div>

            <div className="p-6 sm:p-8">
              {/* Tab Toggle */}
              <div className="mb-8 grid grid-cols-2 bg-black/40 border border-white/5 p-1 rounded-sm relative shadow-inner">
                <motion.div
                  className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white/10 rounded-sm shadow-sm"
                  animate={{
                    x: tab === "signin" ? 0 : "100%"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button
                  onClick={() => setTab("signin")}
                  className={`relative z-10 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${tab === "signin" ? "text-white font-bold" : "text-[#888888] hover:text-[#cccccc]"
                    }`}
                >
                  AUTHORIZE
                </button>
                <button
                  onClick={() => setTab("signup")}
                  className={`relative z-10 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${tab === "signup" ? "text-white font-bold" : "text-[#888888] hover:text-[#cccccc]"
                    }`}
                >
                  REQUEST ACCESS
                </button>
              </div>

              {/* Forms */}
              <div className="relative min-h-[380px]">
                <AnimatePresence mode="popLayout">
                  {tab === "signin" ? (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, filter: "blur(4px)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <SignInForm />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <SignUpForm />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer info under terminal */}
          <div className="mt-6 text-[10px] font-mono tracking-[0.2em] text-[#555555]">
            CONNECTION SECURE // E2E ENCRYPTED
          </div>
        </motion.div>
      </div>
    </div>
  )
}
