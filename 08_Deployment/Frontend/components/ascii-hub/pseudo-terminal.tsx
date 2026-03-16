"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { motion } from "framer-motion"

const COMMANDS: Record<string, string[]> = {
  help: [
    "Available commands:",
    "  help       - Show this message",
    "  sections   - List all analysis modules",
    "  detect     - Run ring detection demo",
    "  about      - About TreeTrace",
    "  stack      - Show tech stack",
    "  clear      - Clear terminal",
    "  stats      - Show benchmark stats",
    "  rings      - Show ring art",
  ],
  sections: [
    "01  Ring Detection",
    "02  Age Estimation",
    "03  Width Measurement",
    "04  Image Processing",
    "05  Visualization",
    "06  Evaluation",
    "07  Batch Processing",
    "08  Data Export",
  ],
  detect: [
    "Loading image: sample_cross_section.png",
    "Dimensions: 2364x2364 px",
    "Detecting pith... (1182, 1182)",
    "Running CS-TRD algorithm...",
    "Rings detected: 23",
    "Precision: 91% | F1: 0.81",
    "Status: COMPLETE [OK]",
  ],
  about: [
    "TreeTrace v1.0.0",
    "",
    "AI-powered tree ring detection and",
    "dendrochronology analysis platform.",
    "Upload cross-section images, detect ring",
    "boundaries, count rings, and measure",
    "widths for climate and growth research.",
    "",
    "Algorithm: CS-TRD | Dataset: UruDendro",
  ],
  stack: [
    "Frontend:  Next.js 16 + React 19",
    "Styling:   Tailwind CSS 4",
    "Animation: Framer Motion",
    "Charts:    Recharts",
    "Backend:   Python (CS-TRD)",
    "Eval:      UruDendro Toolkit",
  ],
  stats: [
    "",
    "  ┌─────────────────────────────┐",
    "  │   TreeTrace Benchmarks      │",
    "  ├──────────┬──────────────────┤",
    "  │ Metric   │ Value            │",
    "  ├──────────┼──────────────────┤",
    "  │ Precision│ 91%              │",
    "  │ Recall   │ 73%              │",
    "  │ F1 Score │ 0.81             │",
    "  │ RMSE     │ 3.47 px          │",
    "  │ Dataset  │ UruDendro (5 img)│",
    "  └──────────┴──────────────────┘",
    "",
  ],
  rings: [
    "",
    "  ████████████████████████████",
    "  ███ ┌──────────────┐  ████",
    "  ██  │ ┌──────────┐ │   ███",
    "  ██  │ │ ┌──────┐ │ │   ███",
    "  ██  │ │ │ PITH │ │ │   ███",
    "  ██  │ │ └──────┘ │ │   ███",
    "  ██  │ └──────────┘ │   ███",
    "  ███ └──────────────┘  ████",
    "  ████████████████████████████",
    "",
    "  Rings detected: 4  Age: ~4 years",
    "",
  ],
}

interface TerminalLine {
  type: "input" | "output" | "highlight"
  content: string
}

export function PseudoTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: 'Welcome to TreeTrace Terminal v1.0.0' },
    { type: "output", content: 'Type "help" for available commands.' },
    { type: "output", content: "" },
  ])
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    const baseLines: TerminalLine[] = [
      ...lines,
      { type: "input", content: `$ ${cmd}` },
    ]

    if (trimmed === "clear") {
      setLines([])
      setInput("")
      return
    }

    if (trimmed === "rings") {
      setLines([...baseLines, { type: "output", content: "" }])
      setInput("")
      const ringLines = COMMANDS["rings"]
      ringLines.forEach((line, i) => {
        setTimeout(() => {
          setLines((prev) => [...prev, { type: "highlight", content: line }])
        }, i * 80)
      })
      return
    }

    const newLines: TerminalLine[] = [...baseLines]
    const response = COMMANDS[trimmed]
    if (response) {
      response.forEach((line) => {
        newLines.push({ type: "output", content: line })
      })
    } else if (trimmed === "") {
      // do nothing
    } else {
      newLines.push({ type: "output", content: `command not found: ${trimmed}` })
      newLines.push({ type: "output", content: 'Type "help" for available commands.' })
    }

    newLines.push({ type: "output", content: "" })
    setLines(newLines)
    setInput("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      processCommand(input)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24"
    >
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-muted-foreground/60">{">"}</span>
          <div className="h-[1px] w-12 bg-border-subtle" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">
            Interactive
          </span>
        </div>
        <h2 className="font-pixel-line text-3xl font-bold tracking-tight text-text-accent md:text-5xl">
          TreeTrace Terminal
        </h2>
        <p className="max-w-prose font-mono text-sm leading-relaxed text-muted-foreground">
          Explore the system. Type commands to interact with TreeTrace.
        </p>
      </div>

      <div
        className="border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(234,88,12,0.3)] rounded-lg overflow-hidden"
        onClick={() => inputRef.current?.focus()}
        role="application"
        aria-label="Interactive pseudo-terminal"
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-accent" />
          <div className="h-2.5 w-2.5 rounded-full bg-text-disabled" />
          <div className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="ml-2 font-mono text-xs text-muted-foreground/60">
            treetrace ~ interactive
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="h-80 overflow-y-auto bg-[var(--bg-void)]/80 p-4"
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={`font-mono text-xs leading-relaxed ${line.type === "input"
                ? "text-text-accent"
                : line.type === "highlight"
                  ? "text-accent brightness-125"
                  : "text-text-terminal"
                }`}
            >
              {line.content || "\u00A0"}
            </div>
          ))}

          {/* Input line */}
          <div className="relative flex items-center font-mono text-xs text-text-accent">
            <span className="mr-1 text-text-terminal-dim">{"$"}</span>
            <span>{input}</span>
            <span className="animate-blink">{"█"}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 h-full w-full cursor-default border-none bg-transparent opacity-0 outline-none"
              aria-label="Terminal input"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </motion.section>
  )
}
