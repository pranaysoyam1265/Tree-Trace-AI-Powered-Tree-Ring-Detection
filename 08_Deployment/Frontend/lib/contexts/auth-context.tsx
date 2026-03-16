"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { MOCK_USER, type UserProfile, type UserPreferences } from "@/lib/mock-profile"

/* ═══════════════════════════════════════════════════════════════════
   AUTH CONTEXT — Mock Authentication
   Toggle between logged-in / logged-out for testing.
   Replace with NextAuth / Clerk / Supabase later.
   ═══════════════════════════════════════════════════════════════════ */

interface AuthState {
  isLoggedIn: boolean
  user: UserProfile | null
}

interface AuthContextValue extends AuthState {
  login: () => void
  logout: () => void
  toggleAuth: () => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: true, // Start logged in for testing
    user: MOCK_USER,
  })

  const login = useCallback(() => {
    setState({ isLoggedIn: true, user: MOCK_USER })
  }, [])

  const logout = useCallback(() => {
    setState({ isLoggedIn: false, user: null })
  }, [])

  const toggleAuth = useCallback(() => {
    setState(prev =>
      prev.isLoggedIn
        ? { isLoggedIn: false, user: null }
        : { isLoggedIn: true, user: MOCK_USER }
    )
  }, [])

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setState(prev => {
      if (!prev.user) return prev
      return {
        ...prev,
        user: {
          ...prev.user,
          preferences: { ...prev.user.preferences, ...prefs },
        },
      }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, toggleAuth, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
