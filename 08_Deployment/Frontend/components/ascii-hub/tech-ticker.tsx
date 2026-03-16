"use client"

import { motion } from "framer-motion"

const TECH_ITEMS = [
  "CS-TRD Algorithm",
  "Ring Detection",
  "Age Estimation",
  "Width Measurement",
  "UruDendro Benchmark",
  "91% Precision",
  "0.81 F1 Score",
  "Dendrochronology",
  "Computer Vision",
  "Batch Processing",
  "CSV Export",
  "Next.js 16",
  "React 19",
  "Canvas 2D",
  "Python Backend",
  "LabelMe Format",
]

export function TechTicker() {
  return (
    <div className="overflow-hidden glass-subtle border-y border-white/[0.06] py-3" aria-label="Technology stack ticker">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 30,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[...TECH_ITEMS, ...TECH_ITEMS].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-mono text-xs text-muted-foreground/60"
          >
            {item}
            <span className="ml-8 text-border-subtle">{"///"}</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
