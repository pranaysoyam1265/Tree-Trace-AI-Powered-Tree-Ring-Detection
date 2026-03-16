"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TreeRingDithered,
  CoreSampleDithered,
  RingDetailDithered,
  TreeTrunkDithered,
} from "./index"

/* ═══════════════════════════════════════════════════════════════════
   DITHERED TREE SCENES
   Cycles through 4 scientific dithered animations for the hero section
   ═══════════════════════════════════════════════════════════════════ */

export function DitheredTreeScenes() {
  const [currentScene, setCurrentScene] = useState(0)

  useEffect(() => {
    // Cycle every 6 seconds
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-full flex justify-center"
        >
          {currentScene === 0 && (
            <TreeRingDithered
              size="xl"
              animation="ringPulse"
              showTerminal
              terminalTitle="ANALYZING..."
              className="shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-shadow duration-500"
            />
          )}

          {currentScene === 1 && (
            <CoreSampleDithered
              size="lg"
              animation="scanLine"
              showTerminal
              terminalTitle="SAMPLE_001"
              className="shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-shadow duration-500"
            />
          )}

          {currentScene === 2 && (
            <RingDetailDithered
              size="lg"
              animation="focus"
              showTerminal
              terminalTitle="40X MAGNIFICATION"
              className="shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-shadow duration-500"
            />
          )}

          {currentScene === 3 && (
            <TreeTrunkDithered
              size="lg"
              animation="bark"
              showTerminal
              terminalTitle="SPECIES_OAK"
              className="shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-shadow duration-500"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
