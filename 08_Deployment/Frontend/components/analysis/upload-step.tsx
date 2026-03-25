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
    <div className="w-full px-4 pt-6 lg:px-8 pb-16 relative overflow-hidden">
      {/* === High-Tech Background === */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Faint dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#333333_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
        {/* Radial orange glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,#ea580c08_0%,transparent_70%)]" />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ea580c]/20 to-transparent" />
      </div>

      {/* Phase Header — top left */}
      <div className="mb-8 border-b-2 border-[#333333] pb-6 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-3 w-3 bg-[#ea580c] animate-pulse" />
          <span className="font-mono text-[10px] text-[#ea580c]/60 uppercase tracking-[0.3em]">PHASE_01 // SPECIMEN_INTAKE</span>
        </div>
        <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">UPLOAD SPECIMENS</h1>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          Select or drag a cross-section image to begin an individual analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 relative z-10">
        {/* Left Column — Text + Controls */}
        <div className="flex flex-col items-start gap-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-start gap-4 w-full"
          >
            {/* Instructions Panel — Terminal Readout */}
            <div className="border border-[#ea580c]/20 w-full bg-[#0d0d0d] p-0 overflow-hidden">
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#ea580c]/10 bg-[#ea580c]/[0.03]">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 bg-[#ea580c]" />
                  <div className="h-2 w-2 bg-[#ea580c]/30" />
                  <div className="h-2 w-2 bg-[#ea580c]/10" />
                </div>
                <span className="font-mono text-[9px] text-[#ea580c]/50 uppercase tracking-[0.3em]">sys://init</span>
              </div>
              {/* Terminal body */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[10px] font-bold text-[#ea580c] uppercase tracking-[0.2em]">
                    {"$"} INITIALIZATION
                  </span>
                  <motion.span
                    className="inline-block w-[6px] h-[14px] bg-[#ea580c]"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>
                <p className="font-mono text-xs text-[#a3a3a3] leading-relaxed">
                  Upload a high-quality tree cross-section image to begin automated ring boundary detection and counting.
                </p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#333333]/50">
                  <span className="font-mono text-[9px] text-[#555555] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
                    System Ready
                  </span>
                  <span className="font-mono text-[9px] text-[#555555] uppercase tracking-wider">Pipeline: Idle</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upload Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full flex flex-col gap-4"
          >
            {/* Drop Zone — animated pulsing border */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="group relative cursor-pointer min-h-[320px] flex flex-col justify-center"
            >
              {/* Animated border container */}
              <div className={`absolute inset-0 border-2 border-dashed transition-all duration-500 ${dragOver
                ? "border-[#ea580c] shadow-[inset_0_0_30px_#ea580c15,0_0_60px_#ea580c10]"
                : "border-[#333333] group-hover:border-[#ea580c]/40"
                }`}>
                {/* Corner brackets */}
                <div className="absolute -top-[1px] -left-[1px] w-5 h-5 border-t-2 border-l-2 border-[#ea580c]/60" />
                <div className="absolute -top-[1px] -right-[1px] w-5 h-5 border-t-2 border-r-2 border-[#ea580c]/60" />
                <div className="absolute -bottom-[1px] -left-[1px] w-5 h-5 border-b-2 border-l-2 border-[#ea580c]/60" />
                <div className="absolute -bottom-[1px] -right-[1px] w-5 h-5 border-b-2 border-r-2 border-[#ea580c]/60" />
              </div>

              {/* Background */}
              <div className={`absolute inset-0 transition-all duration-500 ${dragOver ? "bg-[#ea580c]/[0.04]" : "bg-[#0d0d0d] group-hover:bg-[#111111]"
                }`} />

              {/* Scanning line on drag */}
              {dragOver && (
                <motion.div
                  className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ea580c]/60 to-transparent z-10"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}

              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.tiff,.tif"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-6 relative z-10 p-16 text-center">
                <div className={`flex h-20 w-20 items-center justify-center transition-all duration-300 ${dragOver
                  ? "bg-[#ea580c]/20 text-[#ea580c] scale-110"
                  : "bg-[#ea580c]/10 text-[#ea580c] group-hover:scale-105 group-hover:bg-[#ea580c]/15"
                  }`}>
                  <UploadCloud className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white">
                    Drag & drop your image
                  </p>
                  <p className="mt-2 text-sm text-[#a3a3a3]">
                    or <span className="text-[#ea580c]/80 font-medium tracking-wide">click to browse</span> your files
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {["PNG", "JPG", "TIFF"].map((fmt) => (
                    <span key={fmt} className="border border-[#333333] px-3 py-1 font-mono text-xs text-[#777777] group-hover:border-[#ea580c]/30 group-hover:text-[#a3a3a3] transition-colors">
                      {fmt}
                    </span>
                  ))}
                  <span className="text-xs text-[#555555]">•</span>
                  <span className="font-mono text-xs text-[#555555] uppercase tracking-widest">Max 10 MB</span>
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
                {/* Image Preview — TreeTrace themed card */}
                <div className="border border-[#ea580c]/20 bg-[#0d0d0d] overflow-hidden">
                  {/* Terminal title bar */}
                  <div className="flex items-center justify-between border-b border-[#ea580c]/10 bg-[#ea580c]/[0.03] px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 bg-[#ea580c]" />
                        <div className="h-2 w-2 bg-[#ea580c]/30" />
                        <div className="h-2 w-2 bg-[#ea580c]/10" />
                      </div>
                      <span className="font-mono text-[9px] text-[#ea580c]/50 uppercase tracking-[0.3em]">specimen://preview</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] text-[#555555] uppercase tracking-wider truncate max-w-[160px]">
                        {state.metadata?.name}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); clearFile() }}
                        className="text-[#555555] hover:text-[#ef4444] transition-colors p-1 hover:bg-[#ef4444]/10"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Image with subtle ring overlay */}
                  <div className="bg-[#080808] p-4 relative">
                    <img
                      src={state.previewUrl!}
                      alt="Uploaded cross-section"
                      className="w-full max-h-[360px] object-contain relative z-10"
                    />
                    {/* Faint concentric ring decoration behind the image */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                      {[120, 90, 60, 30].map((size) => (
                        <div
                          key={size}
                          className="absolute rounded-full border border-[#ea580c]"
                          style={{ width: `${size}%`, height: `${size}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Metadata specs — enhanced terminal style */}
                <div className="border border-[#ea580c]/20 bg-[#0d0d0d] overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-[#ea580c]/10 bg-[#ea580c]/[0.03]">
                    <FileImage className="h-3 w-3 text-[#ea580c]" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#ea580c]/50">
                      specimen://metadata
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                      {[
                        { label: "Filename", value: state.metadata?.name },
                        { label: "Size", value: formatBytes(state.metadata?.size ?? 0) },
                        { label: "Format", value: state.metadata?.type.split("/")[1]?.toUpperCase() },
                        ...(state.metadata?.dimensions
                          ? [{ label: "Dimensions", value: `${state.metadata.dimensions.w} × ${state.metadata.dimensions.h} px` }]
                          : []),
                      ].map((spec) => (
                        <div key={spec.label} className="flex items-baseline gap-2 font-mono text-xs">
                          <span className="text-[#ea580c]/40">{"$"}</span>
                          <span className="text-[#555555] uppercase tracking-[0.1em] shrink-0">{spec.label}:</span>
                          <span className="font-semibold text-[#e5e5e5] truncate">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#333333]/50">
                      <span className="font-mono text-[9px] text-[#555555] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
                        Validated
                      </span>
                      <span className="font-mono text-[9px] text-[#555555] uppercase tracking-wider">Ready for Analysis</span>
                    </div>
                  </div>
                </div>

                {/* Continue CTA */}
                <button
                  onClick={goNext}
                  className="group flex items-center justify-center gap-2 border border-[#ea580c] bg-[#ea580c] px-8 py-3.5 font-mono text-sm font-semibold text-white transition-all duration-200 hover:bg-transparent hover:text-[#ea580c] w-full shadow-[0_0_20px_#ea580c30] hover:shadow-none"
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
                <div className="w-full border border-[#ea580c]/20 bg-[#0d0d0d] flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
                  {/* Terminal title bar */}
                  <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-4 py-2 border-b border-[#ea580c]/10 bg-[#ea580c]/[0.03] z-20">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 bg-[#333333]" />
                      <div className="h-2 w-2 bg-[#333333]" />
                      <div className="h-2 w-2 bg-[#333333]" />
                    </div>
                    <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.3em]">specimen://awaiting</span>
                  </div>

                  {/* Tree Ring Concentric Circle Art */}
                  <div className="relative z-10 flex flex-col items-center gap-6 py-16">
                    <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                      {/* Concentric rings */}
                      {[100, 80, 60, 40, 20].map((size, i) => (
                        <motion.div
                          key={size}
                          className="absolute rounded-full border border-[#ea580c]"
                          style={{ width: `${size}%`, height: `${size}%` }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: [0.08, 0.15, 0.08], scale: 1 }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                        />
                      ))}
                      {/* Core pith dot */}
                      <motion.div
                        className="w-3 h-3 bg-[#ea580c] rounded-full z-10"
                        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>

                    <div className="text-center">
                      <p className="font-mono text-sm font-medium text-white/40 uppercase tracking-[0.15em]">
                        Awaiting Image Data
                      </p>
                      <p className="font-mono text-[10px] text-[#555555] mt-1.5 uppercase tracking-widest">
                        Upload a cross-section to begin analysis
                      </p>
                    </div>
                  </div>

                  {/* Dynamic waiting mode background */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#33333340_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                    {/* Scanning line */}
                    <motion.div
                      className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ea580c]/30 to-transparent"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute top-[38px] left-4 w-5 h-5 border-t-2 border-l-2 border-[#ea580c]/15" />
                    <div className="absolute top-[38px] right-4 w-5 h-5 border-t-2 border-r-2 border-[#ea580c]/15" />
                    <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#ea580c]/15" />
                    <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#ea580c]/15" />
                  </div>
                </div>

                {/* Skeleton metadata card */}
                <div className="border border-[#ea580c]/10 bg-[#0d0d0d] overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-[#ea580c]/10 bg-[#ea580c]/[0.02]">
                    <div className="h-3 w-3 bg-[#333333]" />
                    <div className="h-2 w-20 bg-[#333333]/60" />
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-[#ea580c]/10" />
                          <div className="h-2 w-12 bg-[#333333]/40" />
                          <div className="h-2 w-16 bg-[#333333]/20" />
                        </div>
                      ))}
                    </div>
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
