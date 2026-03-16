"use client"

import { useDendroLab } from "@/lib/contexts/dendrolab-context"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, FileText, BarChart2, Table } from "lucide-react"

export function ExportDrawer() {
  const { state, dispatch } = useDendroLab()

  if (!state.exportDrawerOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dispatch({ type: "TOGGLE_EXPORT_DRAWER", payload: false })}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border-l border-[#333333] h-full flex flex-col shadow-none"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333333] flex items-center justify-between bg-[#111111]">
            <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
              <Download className="w-5 h-5 text-[#ea580c]" />
              Export Session
            </h2>
            <button
              onClick={() => dispatch({ type: "TOGGLE_EXPORT_DRAWER", payload: false })}
              className="p-2 hover:bg-[#222222] "
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <p className="text-sm text-[#a3a3a3]">
              Select the data products and reports you want to export from this DendroLab session.
            </p>

            {/* Export Options */}
            <div className="flex flex-col gap-3">
              <ExportOption
                icon={<Table className="w-4 h-4" />}
                title="Ring Width Data (CSV)"
                description="Raw ring widths and RWI indices for all loaded specimens."
                available={state.specimens.length > 0}
              />
              <ExportOption
                icon={<BarChart2 className="w-4 h-4" />}
                title="Site Chronology (TUCSON)"
                description="Master dating chronology in standard Tucson decadal format."
                available={!!state.siteChronology}
              />
              <ExportOption
                icon={<FileText className="w-4 h-4" />}
                title="Cross-Dating Report (PDF)"
                description="Correlation matrices, dating spans, and F1 scores."
                available={state.completedStages.has(2)}
              />
              <ExportOption
                icon={<BarChart2 className="w-4 h-4" />}
                title="Climate Reconstruction (CSV)"
                description="Reconstructed values, error margins, and calibration stats."
                available={state.completedStages.has(4)}
              />
            </div>

            <div className="mt-4 p-4 border border-[#ea580c]/30 bg-[#ea580c]/5 text-[#ea580c] text-sm">
              <strong>Note:</strong> Generating full PDF reports may take a few moments depending on the number of specimens.
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 border-t border-[#333333] bg-[#111111]">
            <button className="w-full bg-[#ea580c] text-black font-bold uppercase tracking-wider py-4 hover:bg-[#ea580c]/90  flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download Selected
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function ExportOption({
  icon,
  title,
  description,
  available
}: {
  icon: React.ReactNode
  title: string
  description: string
  available: boolean
}) {
  return (
    <label className={`
      relative border p-4 flex gap-4 cursor-pointer 
      ${available ? 'border-[#333333] hover:border-[#ea580c]/50 bg-[#111111]' : 'border-[#222222] bg-[#0a0a0a] opacity-50 cursor-not-allowed'}
    `}>
      <input
        type="checkbox"
        disabled={!available}
        className="mt-1 w-4 h-4 accent-[#ea580c] bg-transparent border-[#555555]"
      />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 font-bold text-sm">
          {icon}
          {title}
        </div>
        <p className="text-xs text-[#a3a3a3]">{description}</p>
      </div>
    </label>
  )
}
