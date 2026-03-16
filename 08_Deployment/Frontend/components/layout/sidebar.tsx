"use client"

import { useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { CornerAccents } from "@/components/ui/brutal/corner-accents"

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR — Brutalist instant-snap navigation panel
   ═══════════════════════════════════════════════════════════════════ */

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  { href: "/", label: "HOME", num: "01" },
  { href: "/analyze", label: "ANALYZE", num: "02" },
  { href: "/batch", label: "BATCH", num: "03" },
  { href: "/dendrolab", label: "DENDROLAB", num: "04" },
  { href: "/history", label: "HISTORY", num: "05" },
]

const SYSTEM_ITEMS = [
  { href: "/docs", label: "DOCUMENTATION", num: "06" },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const pathname = usePathname()

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!open || !panelRef.current || e.key !== "Tab") return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }, [open])

  useEffect(() => {
    document.addEventListener("keydown", handleTabKey)
    return () => document.removeEventListener("keydown", handleTabKey)
  }, [handleTabKey])

  if (!open) return null

  const recent = user?.recentAnalyses.slice(0, 3) ?? []

  return (
    <>
      {/* Overlay — instant, no animation */}
      <div
        className="fixed inset-0 z-[60] bg-[#0a0a0a]/90"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — instant snap, no slide animation */}
      <aside
        ref={panelRef}
        className="fixed left-0 top-0 z-[70] flex h-full w-[320px] max-w-[85vw] flex-col bg-[#141414] border-r-[3px] border-r-[#ea580c]"
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="relative h-full flex flex-col">
          <CornerAccents />

          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#333333] px-5 py-4">
            <span className="font-mono text-sm font-bold text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 border border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] font-mono text-[10px] font-bold">TT</span>
              TREETRACE
            </span>
            <button
              onClick={onClose}
              className="font-mono text-xs text-[#a3a3a3] uppercase tracking-[0.15em] border-2 border-[#333333] px-2 py-1 hover:border-[#ea580c] hover:text-[#ea580c] transition-none"
            >
              [✕ CLOSE]
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Navigation */}
            <div className="mb-6">
              <span className="mb-3 block px-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#555555]">
                // NAVIGATION
              </span>
              <div className="flex flex-col gap-0">
                {NAV_ITEMS.map(item => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setTimeout(onClose, 50)}
                      className={`flex items-center gap-2 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.15em] transition-none ${isActive
                        ? "text-[#ea580c] border-l-[3px] border-l-[#ea580c] bg-[#1a1000]"
                        : "text-[#a3a3a3] border-l-[3px] border-l-transparent hover:text-white hover:bg-[#1a1a1a]"
                        }`}
                    >
                      <span className="text-[#555555]">[{item.num}]</span>
                      <span className="flex-1">{item.label}</span>
                      {isActive && <span className="text-[#ea580c]">▸</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Double-line divider */}
            <div className="mx-3 mb-4 font-mono text-[10px] text-[#333333]">
              ═══════════════════════════════
            </div>

            {/* System */}
            <div className="mb-6">
              <span className="mb-3 block px-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#555555]">
                // SYSTEM
              </span>
              <div className="flex flex-col gap-0">
                {SYSTEM_ITEMS.map(item => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setTimeout(onClose, 50)}
                      className={`flex items-center gap-2 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.15em] transition-none ${isActive
                        ? "text-[#ea580c] border-l-[3px] border-l-[#ea580c] bg-[#1a1000]"
                        : "text-[#a3a3a3] border-l-[3px] border-l-transparent hover:text-white hover:bg-[#1a1a1a]"
                        }`}
                    >
                      <span className="text-[#555555]">[{item.num}]</span>
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Recent Analyses */}
            {recent.length > 0 && (
              <>
                <div className="mx-3 mb-4 font-mono text-[10px] text-[#333333]">
                  ═══════════════════════════════
                </div>
                <div>
                  <span className="mb-3 block px-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#555555]">
                    // RECENT ANALYSES
                  </span>
                  <div className="flex flex-col gap-1">
                    {recent.map(a => (
                      <a
                        key={a.id}
                        href={`/results/${a.id}`}
                        onClick={() => setTimeout(onClose, 50)}
                        className="flex items-center gap-2 px-3 py-2 font-mono text-xs text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-none"
                      >
                        <span className={`w-2 h-2 ${a.confidence === "high" ? "bg-[#22c55e]" :
                          a.confidence === "medium" ? "bg-[#eab308]" : "bg-[#ef4444]"
                          }`} />
                        <span className="flex-1 truncate uppercase">{a.imageName}</span>
                        <span className="text-[10px] text-[#555555] tabular-nums">{a.ringCount} RINGS</span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-[#333333] px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#555555]">v2.1.0 | BUILD 2024.01</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-[#555555] hover:text-[#ea580c] transition-none uppercase"
              >
                GITHUB
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
