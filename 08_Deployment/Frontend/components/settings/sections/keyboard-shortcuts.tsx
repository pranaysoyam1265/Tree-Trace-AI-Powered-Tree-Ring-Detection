"use client"

import React, { useState } from "react"
import { useSettings } from "@/lib/settings-store"
import { Keyboard as KeyboardIcon, Edit2, RotateCcw } from "lucide-react"

export function KeyboardSettings({ searchQuery }: { searchQuery: string }) {
  const { settings, resetSettings } = useSettings()
  const binds = settings.keyboard

  const [editingId, setEditingId] = useState<string | null>(null)

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (id: string, label: string) => !searchQuery || matches(label) || matches(id)

  const renderKey = (keyString: string) => {
    return keyString.split(" ").map((k, i) => (
      <React.Fragment key={i}>
        <kbd className="font-mono text-[11px] font-medium text-foreground bg-white/10 px-1.5 py-0.5 rounded-none border border-border shadow-[0_2px_0_rgba(255,255,255,0.1)] inline-flex min-w-[20px] justify-center items-center">
          {k === "Control" ? "Ctrl" : k === "Escape" ? "Esc" : k.toUpperCase()}
        </kbd>
        {i < keyString.split(" ").length - 1 && <span className="text-muted-foreground mx-1">+</span>}
      </React.Fragment>
    ))
  }

  const groups = [
    {
      title: "Navigation",
      keys: [
        { id: "nav.home", label: "Go to Dashboard" },
        { id: "nav.analyze", label: "Go to Analyze Workspace" },
        { id: "nav.batch", label: "Go to Batch Matrix" },
        { id: "nav.profile", label: "Open Operator Dossier" },
        { id: "nav.settings", label: "Open System Config" },
        { id: "nav.sidebar", label: "Toggle Sidebar" },
        { id: "nav.esc", label: "Close Modals / Cancel" },
      ]
    },
    {
      title: "Analysis Canvas",
      keys: [
        { id: "analysis.start", label: "Execute Engine Scan" },
        { id: "analysis.retry", label: "Retry Last Scan" },
        { id: "analysis.undo_pith", label: "Undo Pith Plot" },
        { id: "analysis.zoom_in", label: "Zoom Into Canvas" },
        { id: "analysis.zoom_out", label: "Zoom Out of Canvas" },
        { id: "analysis.fit", label: "Fit Image to View" },
        { id: "analysis.fullscreen", label: "Toggle Fullscreen Sandbox" },
      ]
    },
    {
      title: "Results & Viewer",
      keys: [
        { id: "results.toggle_overlay", label: "Show/Hide Ring Overlay" },
        { id: "results.toggle_labels", label: "Show/Hide Measurement Numbers" },
        { id: "results.prev_ring", label: "Select Previous Ring" },
        { id: "results.next_ring", label: "Select Next Ring" },
        { id: "results.quick_export", label: "Trigger Quick Export Pipeline" },
        { id: "results.export_panel", label: "Open Full Export Interface" },
      ]
    },
    {
      title: "Global Shell",
      keys: [
        { id: "general.command", label: "Open Command Palette" },
        { id: "general.help", label: "Display Keyboard Shortcuts" },
        { id: "general.new", label: "New Project / Upload" },
        { id: "general.save", label: "Force Sync / Save State" },
      ]
    }
  ]

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-8">

      <div className="flex items-center justify-between mb-2 pb-4 border-b border-border">
        <p className="font-mono text-xs text-foreground max-w-lg">
          Custom keybinds take precedence over OS defaults. Binds marked with <span className="text-red-400">*</span> cannot be changed.
        </p>
        <button
          className="flex items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground hover:text-red-400 transition-colors px-3 py-1.5 border border-border bg-white/[0.02] rounded-none"
        >
          <RotateCcw size={12} /> Reset to Defaults
        </button>
      </div>

      {groups.map((group) => {
        // Filter keys in this group based on search
        const visibleKeys = group.keys.filter(k => hasResult(k.id, k.label))
        if (visibleKeys.length === 0) return null

        return (
          <section key={group.title}>
            <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-3">
              {"// [" + group.title.toUpperCase() + "]"}
            </h2>

            <div className="flex flex-col rounded-none-none border border-border bg-background overflow-hidden">
              {visibleKeys.map((k, index) => (
                <div
                  key={k.id}
                  className={`flex items-center justify-between px-4 py-3 group hover:bg-white/[0.02] ${index !== visibleKeys.length - 1 ? "border-b border-border" : ""
                    }`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] text-foreground">{k.label}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{k.id}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      {binds[k.id] ? renderKey(binds[k.id]) : <span className="font-mono text-[10px] text-muted-foreground uppercase">Unbound</span>}
                    </div>

                    <button
                      onClick={() => setEditingId(k.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-none"
                      title="Rebind Key"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-none-none border border-accent/30 bg-[#09090B] p-6 shadow-2xl flex flex-col items-center">
            <KeyboardIcon className="text-accent mb-4" size={32} />
            <h3 className="font-mono text-sm text-zinc-200 mb-1">Awaiting Keystroke...</h3>
            <p className="font-mono text-[10px] text-muted-foreground mb-6 text-center">
              Press the desired key combination for<br /> <span className="text-accent">{editingId}</span>
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 font-mono text-xs text-foreground hover:text-white border border-border rounded-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
