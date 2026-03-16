"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { CornerAccents } from "@/components/ui/brutal/corner-accents"

/* ═══════════════════════════════════════════════════════════════════
   AUTH MODAL — Brutalist authentication terminal
   ═══════════════════════════════════════════════════════════════════ */

interface AuthModalProps {
  open: boolean
  onClose: () => void
  anchorRef?: React.RefObject<HTMLElement | null>
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const { login } = useAuth()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] bg-[#0a0a0a]/90 flex items-center justify-center">
      <div
        ref={panelRef}
        className="relative w-[380px] max-w-[90vw] border-2 border-[#333333] bg-[#141414] shadow-[8px_8px_0px_0px_rgba(234,88,12,1)]"
      >
        <CornerAccents />

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#333333] px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a3a3a3]">
            // AUTHENTICATION TERMINAL
          </span>
          <button
            onClick={onClose}
            className="font-mono text-xs text-[#a3a3a3] hover:text-[#ea580c] transition-none"
          >
            [✕]
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-[#333333]">
          {(["signin", "signup"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-[0.15em] transition-none ${tab === t
                  ? "text-[#ea580c] border-b-2 border-[#ea580c] bg-[#1a1000]"
                  : "text-[#a3a3a3] hover:text-white"
                }`}
            >
              {t === "signin" ? "[SIGN IN]" : "[SIGN UP]"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
          {tab === "signup" && (
            <div>
              <label className="mb-1 block font-mono text-[10px] text-[#a3a3a3] uppercase tracking-[0.25em]">NAME</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ENTER NAME..."
                className="w-full bg-[#0a0a0a] border-2 border-[#333333] text-white font-mono text-sm px-3 py-2.5 outline-none focus:border-[#ea580c] placeholder:text-[#555555] placeholder:uppercase placeholder:tracking-widest transition-none"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block font-mono text-[10px] text-[#a3a3a3] uppercase tracking-[0.25em]">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ENTER EMAIL..."
              className="w-full bg-[#0a0a0a] border-2 border-[#333333] text-white font-mono text-sm px-3 py-2.5 outline-none focus:border-[#ea580c] placeholder:text-[#555555] placeholder:uppercase placeholder:tracking-widest transition-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] text-[#a3a3a3] uppercase tracking-[0.25em]">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="ENTER PASSWORD..."
              className="w-full bg-[#0a0a0a] border-2 border-[#333333] text-white font-mono text-sm px-3 py-2.5 outline-none focus:border-[#ea580c] placeholder:text-[#555555] placeholder:uppercase placeholder:tracking-widest transition-none"
            />
          </div>

          <button
            type="submit"
            className="mt-1 w-full bg-[#ea580c] text-white font-mono text-sm font-bold uppercase tracking-[0.2em] py-2.5 border-2 border-[#ea580c] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:bg-transparent hover:text-[#ea580c] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-none"
          >
            {tab === "signin" ? "▸ SIGN IN" : "▸ CREATE ACCOUNT"}
          </button>

          {tab === "signin" && (
            <button
              type="button"
              className="font-mono text-[10px] text-[#555555] hover:text-[#ea580c] transition-none self-start uppercase tracking-[0.15em]"
            >
              FORGOT PASSWORD?
            </button>
          )}
        </form>

        {/* Social buttons */}
        <div className="border-t-2 border-[#333333] p-4 flex flex-col gap-2">
          <button className="w-full bg-transparent text-[#a3a3a3] font-mono text-xs uppercase tracking-[0.15em] border-2 border-[#333333] py-2 hover:border-[#ea580c] hover:text-[#ea580c] transition-none">
            [CONTINUE WITH GOOGLE]
          </button>
          <button className="w-full bg-transparent text-[#a3a3a3] font-mono text-xs uppercase tracking-[0.15em] border-2 border-[#333333] py-2 hover:border-[#ea580c] hover:text-[#ea580c] transition-none">
            [CONTINUE WITH GITHUB]
          </button>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#333333] px-4 py-2.5">
          <p className="font-mono text-[10px] text-[#555555] text-center uppercase tracking-[0.15em]">
            SIGN IN TO SAVE ANALYSES AND ACCESS THEM ANYWHERE
          </p>
        </div>
      </div>
    </div>
  )
}
