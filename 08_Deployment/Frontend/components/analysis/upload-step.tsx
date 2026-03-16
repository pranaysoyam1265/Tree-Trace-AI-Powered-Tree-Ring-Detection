"use client"

import { useCallback, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAnalysis } from "@/lib/contexts/analysis-context"
import { UploadCloud, X, FileImage, AlertCircle, ImageIcon, ChevronDown } from "lucide-react"
import { SampleImageSelector } from "@/components/analysis/sample-image-selector"

/* ═══════════════════════════════════════════════════════════════════
   STEP 1: UPLOAD IMAGE — Hero Section Style (Premium)
   Ghost number, two-column layout, enhanced drop zone
   ═══════════════════════════════════════════════════════════════════ */

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/tiff"]
const MAX_SIZE = 10 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}

export function UploadStep() {
  const { state, setFile, clearFile, goNext, setError } = useAnalysis()
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSet = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Invalid file type. Please upload PNG, JPG, or TIFF.")
        return
      }
      if (file.size > MAX_SIZE) {
        setError("File exceeds the 10 MB size limit.")
        return
      }
      setFile(file)
    },
    [setFile, setError]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) validateAndSet(file)
    },
    [validateAndSet]
  )

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) validateAndSet(file)
    },
    [validateAndSet]
  )

  const loadSample = useCallback(async () => {
    try {
      const res = await fetch("/illustrations/tree-ring-cross-section.svg")
      const blob = await res.blob()
      const file = new File([blob], "sample-tree-ring.svg", { type: blob.type })
      setFile(file)
    } catch {
      setError("Failed to load sample image. Please check your connection and try again.")
    }
  }, [setFile, setError])

  const loadErrorSample = useCallback(() => {
    setError("Analysis failed: The provided image does not contain a discernible cross section or lacks sufficient contrast. Please upload a clearer image.")
  }, [setError])

  const hasFile = !!state.file && !!state.previewUrl

  return (
    <div className="w-full px-4 pt-6 lg:px-8 pb-16">
      {/* Phase Header — top left */}
      <div className="mb-8 border-b-2 border-[#333333] pb-6">
        <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">UPLOAD SPECIMENS</h1>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          Select or drag a cross-section image to begin an individual analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_1.2fr]">
        {/* Left Column — Text + Controls */}
        <div className="flex flex-col items-start gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-start gap-4 w-full"
          >
            {/* Instructions Panel */}
            <div className="border-2 border-[#333333] w-full bg-[#141414] p-5">
              <h3 className="font-mono text-[10px] font-bold text-[#ea580c] uppercase tracking-[0.2em] mb-3">
                  // INITIALIZATION
              </h3>
              <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
                Upload a high-quality tree cross-section image to begin automated ring boundary detection and counting.
              </p>
            </div>
          </motion.div>

          {/* Upload Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full max-w-md flex flex-col gap-4"
          >
            {/* Drop Zone — enhanced with inner shadow and stronger interaction */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 ${dragOver
                ? "border-border-accent bg-accent/[0.06] shadow-[inset_0_2px_20px_var(--color-accent),0_0_40px_var(--color-accent)]"
                : "border-border-default/60 hover:border-border-accent/30 hover:bg-bg-surface/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.tiff,.tif"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 ${dragOver
                  ? "bg-accent/20 text-accent scale-110"
                  : "bg-accent/10 text-accent group-hover:scale-105 group-hover:bg-accent/15"
                  }`}>
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Drag & drop your image
                  </p>
                  <p className="mt-1.5 text-xs text-text-secondary">
                    or <span className="text-accent/80 font-medium">click to browse</span> your files
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {["PNG", "JPG", "TIFF"].map((fmt) => (
                    <span key={fmt} className="rounded-full border border-border-default/50 px-2.5 py-0.5 font-mono text-[10px] text-text-tertiary/70">
                      {fmt}
                    </span>
                  ))}
                  <span className="text-[10px] text-text-tertiary/40">•</span>
                  <span className="font-mono text-[10px] text-text-tertiary/50">Max 10 MB</span>
                </div>
              </div>
            </div>

            {/* Quick Start & Error Demo */}
            <div className="flex flex-col gap-2">
              <button
                onClick={loadSample}
                className="flex items-center justify-center gap-2 rounded-lg border border-border-default/50 px-4 py-2.5 font-mono text-xs text-text-secondary transition-all hover:border-border-accent/30 hover:text-accent hover:bg-accent/[0.03]"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Load a sample image instead
              </button>
              <div className="flex items-center gap-2">
                <div className="h-px bg-border-subtle flex-1" />
                <span className="font-mono text-[10px] text-text-tertiary/30">TEST</span>
                <div className="h-px bg-border-subtle flex-1" />
              </div>
              <button
                onClick={loadErrorSample}
                className="flex items-center justify-center gap-2 rounded-lg border border-status-error/10 px-4 py-2 font-mono text-[10px] text-status-error/50 transition-all hover:border-status-error/30 hover:text-status-error hover:bg-status-error/[0.03]"
              >
                <AlertCircle className="h-3 w-3" />
                Simulate Upload Error
              </button>
            </div>

            {/* Error State / Recovery Path */}
            <AnimatePresence>
              {state.error && (
                <motion.div
                  initial={{ opacity: 0, y: 5, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  className="flex flex-col gap-3 rounded-lg border border-status-error/20 bg-status-error/[0.06] p-4 mt-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-status-error shrink-0 mt-0.5" />
                    <span className="font-mono text-xs text-status-error leading-relaxed font-medium">
                      {state.error}
                    </span>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => setError("")}
                      className="font-mono text-xs bg-status-error text-text-inverse px-4 py-1.5 rounded disabled:opacity-50 hover:bg-status-error/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Column — Preview / Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="relative flex items-start justify-center lg:pt-4"
        >
          <AnimatePresence mode="wait">
            {hasFile ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col gap-4"
              >
                {/* Image Preview in glass-card */}
                <div className="glass-card glow-primary rounded-lg overflow-hidden">
                  {/* Title bar */}
                  <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                        <div className="h-2.5 w-2.5 rounded-full bg-text-disabled" />
                        <div className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                      </div>
                      <span className="font-mono text-xs text-text-tertiary truncate max-w-[200px]">
                        {state.metadata?.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); clearFile() }}
                      className="text-text-tertiary hover:text-status-error transition-colors p-1 rounded hover:bg-status-error/10"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Image */}
                  <div className="bg-black/20 p-3">
                    <img
                      src={state.previewUrl!}
                      alt="Uploaded cross-section"
                      className="w-full max-h-[360px] object-contain rounded"
                    />
                  </div>
                </div>

                {/* Metadata specs */}
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileImage className="h-4 w-4 text-accent" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
                      Image Metadata
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      { label: "Filename", value: state.metadata?.name },
                      { label: "Size", value: formatBytes(state.metadata?.size ?? 0) },
                      { label: "Format", value: state.metadata?.type.split("/")[1]?.toUpperCase() },
                      ...(state.metadata?.dimensions
                        ? [{ label: "Dimensions", value: `${state.metadata.dimensions.w} × ${state.metadata.dimensions.h} px` }]
                        : []),
                    ].map((spec) => (
                      <div key={spec.label} className="flex items-baseline gap-2 font-mono text-xs">
                        <span className="text-accent/40">{">"}</span>
                        <span className="text-text-secondary shrink-0">{spec.label}:</span>
                        <span className="font-semibold text-text-primary truncate">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continue CTA */}
                <button
                  onClick={goNext}
                  className="group flex items-center justify-center gap-2 rounded-lg border border-border-accent bg-accent px-8 py-3.5 font-mono text-sm font-semibold text-text-inverse transition-all duration-200 hover:bg-transparent hover:text-accent w-full shadow-[0_0_20px_var(--color-accent)] hover:shadow-none"
                >
                  Continue to Pith Selection
                  <span className="transition-transform duration-200 group-hover:translate-x-1">{"->"}</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col gap-4"
              >
                <div className="w-full rounded-xl glass-card p-16 flex flex-col items-center justify-center gap-6 min-h-[420px] relative overflow-hidden">
                  {/* Faint ring ASCII art */}
                  <pre className="font-mono text-[10px] leading-[14px] text-accent/[0.05] select-none z-10">
                    {`   ████████████████████████████
   ███ ┌──────────────┐  ████
   ██  │ ┌──────────┐ │   ███
   ██  │ │ ┌──────┐ │ │   ███
   ██  │ │ │ PITH │ │ │   ███
   ██  │ │ └──────┘ │ │   ███
   ██  │ └──────────┘ │   ███
   ███ └──────────────┘  ████
   ████████████████████████████`}
                  </pre>
                  <div className="text-center z-10 mt-4">
                    <p className="font-mono text-sm font-medium text-text-primary/40">
                      Awaiting Image Data
                    </p>
                    <p className="font-mono text-[10px] text-text-tertiary/30 mt-1.5">
                      Upload a cross-section to begin analysis
                    </p>
                  </div>

                  {/* Dynamic waiting mode background */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                    {/* Scanning line */}
                    <motion.div
                      className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Decorative skeleton frame corners */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/[0.05]" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/[0.05]" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/[0.05]" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/[0.05]" />
                  </div>
                </div>

                {/* Skeleton metadata card */}
                <div className="glass-card rounded-lg p-4 opacity-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-4 bg-white/[0.05] rounded" />
                    <div className="h-2 w-24 bg-white/[0.05] rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-2 w-12 bg-white/[0.05] rounded" />
                        <div className="h-2 w-20 bg-white/[0.02] rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Sample Image Selector — shown when no file is uploaded */}
      {!hasFile && <SampleImageSelector />}

      {/* Scroll indicator — shown when image is uploaded */}
      <AnimatePresence>
        {hasFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-2 mt-20"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary/50">
              Scroll to Continue
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown className="h-4 w-4 text-accent/40" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
