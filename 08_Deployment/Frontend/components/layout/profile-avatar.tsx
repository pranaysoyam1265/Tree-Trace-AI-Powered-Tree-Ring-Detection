"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { BrutalAvatar } from "@/components/ui/brutal/avatar"

/* ═══════════════════════════════════════════════════════════════════
   PROFILE AVATAR — Brutalist square avatar with dropdown
   ═══════════════════════════════════════════════════════════════════ */

export function ProfileAvatar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  if (!user) return null

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  const menuItems = [
    { label: "PROFILE", href: "/profile" },
    { label: `ANALYSES (${user.stats.totalAnalyses})`, href: "/profile" },
    { label: "SETTINGS", href: "/settings" },
  ]

  return (
    <div ref={containerRef} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="transition-none"
        aria-label="Profile menu"
        aria-expanded={open}
      >
        <BrutalAvatar name={user.name} src={user.avatar} size={36} />
      </button>

      {/* Dropdown — instant, no animation */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-[80] w-[260px] border-2 border-[#333333] bg-[#141414] shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
          {/* User info header */}
          <div className="flex items-center gap-3 border-b-2 border-[#333333] px-4 py-3">
            <BrutalAvatar name={user.name} src={user.avatar} size={40} />
            <div className="min-w-0">
              <p className="truncate font-mono text-sm font-bold text-white uppercase">{user.name}</p>
              <p className="truncate font-mono text-[10px] text-[#555555]">{user.email}</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs text-[#a3a3a3] uppercase tracking-[0.15em] hover:bg-[#1f1f1f] hover:text-white transition-none"
              >
                <span className="text-[#555555]">▸</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign out */}
          <div className="border-t-2 border-[#333333] py-1">
            <button
              onClick={() => { logout(); setOpen(false) }}
              className="flex w-full items-center gap-3 px-4 py-2.5 font-mono text-xs text-[#a3a3a3] uppercase tracking-[0.15em] hover:bg-[#ef444420] hover:text-[#ef4444] transition-none"
            >
              <span className="text-[#555555]">✕</span>
              SIGN OUT
            </button>
          </div>

          {/* Plan badge */}
          <div className="border-t-2 border-[#333333] px-4 py-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#555555]">
                PLAN: <span className="text-[#a3a3a3] uppercase">{user.plan}</span>
              </span>
              <button className="font-mono text-[10px] text-[#ea580c] hover:text-[#f97316] transition-none uppercase">
                UPGRADE ▸
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
