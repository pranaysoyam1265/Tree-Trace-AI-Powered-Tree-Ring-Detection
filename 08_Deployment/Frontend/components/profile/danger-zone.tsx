"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   DANGER ZONE — Minimal destructive action section
   ═══════════════════════════════════════════════════════════════════ */

export function DangerZone() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  return (
    <div className="rounded-lg border border-destructive/50 bg-[var(--bg-surface)]/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-6 relative overflow-hidden">
      {/* Background hint */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 blur-3xl pointer-events-none" />

      <span className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[2px] text-destructive/80">
        <AlertTriangle size={12} />
        {"// DANGER_ZONE"}
      </span>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="font-mono text-sm text-muted-foreground max-w-lg leading-relaxed">
          Permanently delete your account and remove all associated data, including analyses, exports, and profile information. This action cannot be undone.
        </p>

        <button
          onClick={() => setConfirmOpen(true)}
          className="shrink-0 rounded border border-status-error/30 px-6 py-2.5 font-mono text-sm text-destructive hover:bg-destructive/10 hover:border-status-error/50 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-void)]/80 backdrop-blur-sm" onClick={() => setConfirmOpen(false)}>
          <div className="w-[440px] max-w-[90vw] rounded-lg border border-status-error/30 bg-background dot-grid-bg p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-status-error)]/50 via-[var(--color-status-error)] to-[var(--color-status-error)]/50" />

            <span className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[2px] text-destructive">
              <AlertTriangle size={14} />
              CONFIRM_DELETION
            </span>

            <p className="mb-5 font-mono text-sm text-text-accent leading-relaxed">
              This action is irreversible. All your specimens, processing history, and downloaded reports will be wiped from TreeTrace servers immediately.
            </p>

            <div className="mb-6">
              <label className="mb-2 block font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Type "DELETE MY ACCOUNT" to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full rounded border border-[var(--color-status-error)]/30 bg-card px-4 py-2.5 font-mono text-sm text-destructive placeholder:text-muted-foreground/60 focus:border-status-error focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                disabled={confirmText !== "DELETE MY ACCOUNT"}
                className="flex-[2] rounded bg-status-error py-2.5 font-mono text-sm font-bold text-text-inverse transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 shadow-[0_0_15px_var(--color-status-error)] disabled:shadow-none"
              >
                Delete Everything
              </button>
              <button
                onClick={() => { setConfirmOpen(false); setConfirmText("") }}
                className="flex-1 rounded border border-border/50 py-2.5 font-mono text-sm text-muted-foreground hover:bg-bg-modifier-hover hover:text-text-accent transition-colors"
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
