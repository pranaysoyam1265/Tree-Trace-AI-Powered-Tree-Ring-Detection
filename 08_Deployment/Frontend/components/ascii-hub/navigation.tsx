"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthModal } from "@/components/layout/auth-modal"
import { ProfileAvatar } from "@/components/layout/profile-avatar"
import { useAuth } from "@/lib/contexts/auth-context"
import { CornerAccents } from "@/components/ui/brutal/corner-accents"
import { Menu, PlusSquare } from "lucide-react"
import { Logo } from "@/components/brand/logo"

/* ═══════════════════════════════════════════════════════════════════
   NAVIGATION — Simplified Brutalist Industrial Navbar
   ═══════════════════════════════════════════════════════════════════ */

export function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { isLoggedIn } = useAuth()
  const pathname = usePathname()

  const routeLabel = pathname === "/" ? "/HOME" : pathname.toUpperCase()

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b-2 border-[#333333]">
        <div className="relative flex items-center justify-between px-4 lg:px-6 py-3">
          <CornerAccents />

          {/* Left: Menu Toggle & Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#a3a3a3] hover:text-[#ea580c] transition-colors p-1"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="flex items-center gap-3 sm:gap-4 group cursor-pointer transition-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center">
                <Logo variant="mark" size={32} className="sm:scale-[1.25]" />
              </div>
              <span className="font-pixel text-lg sm:text-xl text-white uppercase tracking-wider group-hover:text-[#ea580c] transition-colors mt-1">
                TreeTrace
              </span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden md:inline font-mono text-[10px] text-[#a3a3a3] tracking-[0.15em]">
              CURRENT: <span className="text-[#ea580c]">{routeLabel}</span>
            </span>

            <Link
              href="/analyze"
              className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#a3a3a3] uppercase tracking-[0.15em] border-2 border-[#333333] px-3 py-1.5 hover:border-[#ea580c] hover:text-[#ea580c] transition-none"
            >
              <PlusSquare size={14} /> NEW ANALYSIS
            </Link>

            <span className="font-mono text-[10px] text-[#333333] hidden sm:inline">│</span>

            {isLoggedIn ? (
              <ProfileAvatar />
            ) : (
              <button
                onClick={() => setAuthOpen(!authOpen)}
                className="font-mono text-xs text-[#ea580c] uppercase tracking-[0.15em] border-2 border-[#ea580c] px-4 py-1.5 hover:bg-[#ea580c] hover:text-white transition-none"
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
