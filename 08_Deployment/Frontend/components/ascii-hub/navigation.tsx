"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthModal } from "@/components/layout/auth-modal"
import { ProfileAvatar } from "@/components/layout/profile-avatar"
import { useAuth } from "@/lib/contexts/auth-context"
import { CornerAccents } from "@/components/ui/brutal/corner-accents"
import { Menu, PlusSquare, Sun, Moon, Activity } from "lucide-react"
import { apiClient } from "@/lib/api-client"

/* ═══════════════════════════════════════════════════════════════════
   NAVIGATION — Simplified Brutalist Industrial Navbar
   ═══════════════════════════════════════════════════════════════════ */

export function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { isLoggedIn } = useAuth()
  const pathname = usePathname()
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    apiClient.checkHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  const routeLabel = pathname === "/" ? "/HOME" : pathname.toUpperCase()

  const isLight = theme === "light"

  const toggleLightDark = () => {
    if (isLight) {
      // Switch back to previous dark theme (stored or default forest)
      const prevDark = typeof window !== "undefined"
        ? localStorage.getItem("treetrace_prev_dark_theme") || "forest"
        : "forest"
      setTheme(prevDark)
    } else {
      // Save current dark theme before switching to light
      if (typeof window !== "undefined" && theme) {
        localStorage.setItem("treetrace_prev_dark_theme", theme)
      }
      setTheme("light")
    }
  }

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="fixed top-0 inset-x-0 z-50 bg-[var(--bg-base)]/90 backdrop-blur-sm border-b-2 border-[var(--border-default)]">
        <div className="relative flex items-center justify-between px-4 lg:px-6 py-3">
          <CornerAccents />

          {/* Left: Menu Toggle & Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] p-1"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="flex items-center gap-3 sm:gap-4 group cursor-pointer transition-none">
              <pre className="font-mono text-[4px] sm:text-[5px] leading-[1.15] font-bold text-[var(--accent-primary)] group-hover:text-[var(--text-primary)] transition-colors">
                {` ████████╗████████╗
 ╚══██╔══╝╚══██╔══╝
    ██║      ██║
    ██║      ██║
    ██║      ██║
    ╚═╝      ╚═╝`}
              </pre>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden md:inline font-mono text-[10px] text-[var(--text-secondary)] tracking-[0.15em]">
              CURRENT: <span className="text-[var(--accent-primary)]">{routeLabel}</span>
            </span>

            {/* Light/Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={toggleLightDark}
                className="flex items-center justify-center w-8 h-8 border-2 border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
                title={isLight ? "Dark mode" : "Light mode"}
              >
                {isLight ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            )}

            {/* Backend status indicator */}
            <span className="hidden md:flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${backendStatus === 'online'
                  ? 'bg-green-500 shadow-[0_0_6px_#22c55e]'
                  : backendStatus === 'offline'
                    ? 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                    : 'bg-amber-500 animate-pulse'
                  }`}
              />
              <span className={backendStatus === 'online' ? 'text-green-500' : backendStatus === 'offline' ? 'text-red-500' : 'text-amber-500'}>
                {backendStatus === 'online' ? 'API' : backendStatus === 'offline' ? 'OFFLINE' : '...'}
              </span>
            </span>

            <Link
              href="/system"
              className="hidden sm:flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)] uppercase tracking-[0.15em] border-2 border-[var(--border-default)] px-3 py-1.5 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-none"
            >
              <Activity size={14} /> SYSTEM STATUS
            </Link>

            <span className="font-mono text-[10px] text-[var(--border-default)] hidden sm:inline">│</span>

            {isLoggedIn ? (
              <ProfileAvatar />
            ) : (
              <button
                onClick={() => setAuthOpen(!authOpen)}
                className="font-mono text-xs text-[var(--accent-primary)] uppercase tracking-[0.15em] border-2 border-[var(--accent-primary)] px-4 py-1.5 hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)] transition-none"
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

