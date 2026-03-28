"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import type { TechSection } from "@/lib/sections-data"

const shadow = "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px"

/*
  SECTION 01: KERNEL & SYSTEMS
  Style: Full-width terminal takeover. The entire section looks like one big terminal window.
  The background is inverted (white on black), with a persistent "menu bar" at top.
*/

function BootSequence() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [lines, setLines] = useState<string[]>([])
  const bootLines = [
    "[  0.000000] Linux version 6.1.0-monochrome (gcc 13.2.0)",
    "[  0.000012] Command line: BOOT_IMAGE=/vmlinuz root=/dev/sda1",
    "[  0.000034] x86/cpu: AMD Ryzen 9 7950X detected",
    "[  0.000089] Memory: 16384000K/16777216K available",
    "[  0.001204] ACPI: Core revision 20221020",
    "[  0.002100] PCI: Using configuration type 1",
    "[  0.003400] Scheduler: CFS initialized (16 CPUs)",
    "[  0.004200] NET: Registered PF_INET protocol family",
    "[  0.005100] VFS: Mounted root filesystem (ext4)",
    "[  OK  ] System ready.",
  ]

  useEffect(() => {
    if (!isInView) return
    let i = 0
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        const currentLine = bootLines[i]
        i++
        setLines((prev) => [...prev, currentLine])
      } else {
        clearInterval(interval)
      }
    }, 150)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView])

  return (
    <div ref={ref} className="bg-background p-6 font-mono text-xs leading-relaxed text-text-accent">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={
            typeof line === "string" && line.startsWith("[  OK")
              ? "mt-2 font-bold text-text-accent"
              : "text-muted-foreground"
          }
        >
          {line}
        </motion.div>
      ))}
      {lines.length < bootLines.length && (
        <span className="animate-blink inline-block text-text-accent">{"_"}</span>
      )}
    </div>
  )
}

export function SectionKernel({ section }: { section: TechSection }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
      {/* Section label with ghost number */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-6 flex items-end gap-6"
      >
        <span className="font-pixel-line text-7xl font-bold leading-none text-text-accent/[0.08] md:text-9xl">
          {section.number}
        </span>
        <div className="flex-1 pb-2">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border-default" />
          </div>
        </div>
      </motion.div>

      {/* Giant terminal window */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(234,88,12,0.3)] rounded-lg"
        style={{ boxShadow: shadow }}
      >
        {/* Terminal title bar */}
        <div className="flex items-center justify-between border-b border-border/50 glass-subtle px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full border border-status-error bg-status-error" />
              <div className="h-2.5 w-2.5 rounded-full border border-status-warning bg-status-warning" />
              <div className="h-2.5 w-2.5 rounded-full border border-status-success bg-status-success" />
            </div>
            <span className="font-mono text-xs text-text-accent">
              treetrace@ring-detector:~
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">CS-TRD v1.0</span>
        </div>

        {/* Terminal body with two columns */}
        <div className="grid lg:grid-cols-5 bg-card backdrop-blur-sm">
          {/* Left: Boot sequence (3 cols) */}
          <div className="border-b border-border/50 lg:col-span-3 lg:border-b-0 lg:border-r lg:border-border/50">
            <div className="border-b border-border/50 px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Boot Sequence
              </span>
            </div>
            <BootSequence />
          </div>

          {/* Right: System info panel (2 cols) */}
          <div className="flex flex-col lg:col-span-2">
            <div className="border-b border-border/50 px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                System Overview
              </span>
            </div>

            {/* Title area */}
            <div className="border-b border-border/50 p-6">
              <h2 className="font-pixel-line text-3xl font-bold text-text-accent md:text-4xl">
                {section.title}
              </h2>
              <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {section.description}
              </p>
            </div>

            {/* Specs as system parameters */}
            <div className="flex-1 p-4">
              <div className="flex flex-col gap-3">
                {section.specs.map((spec, i) => (
                  <motion.div
                    key={spec.label}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-2 font-mono text-xs"
                  >
                    <span className="text-muted-foreground/60">{">"}</span>
                    <span className="text-muted-foreground">{spec.label}:</span>
                    <span className="font-bold text-text-accent">{spec.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom ASCII schematic */}
        <div className="border-t border-border/50 bg-card/50">
          <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Architecture Schematic
            </span>
          </div>
          <pre className="overflow-x-auto p-6 font-mono text-xs leading-[1.1] tracking-tight">
            {section.ascii.split('\n').map((line, i) => (
              <div key={i}>
                {line.split('').map((char, j) => {
                  if ('█▓▒░┌┐└┘├┤┬┴┼─│║═╔╗╚╝╠╣╦╩╬╨▶▼▲◀─││'.includes(char)) {
                    return <span key={j} className="text-[#666666]">{char}</span>
                  }
                  return <span key={j} className="text-white">{char}</span>
                })}
              </div>
            ))}
          </pre>
        </div>
      </motion.div>
    </div>
  )
}
