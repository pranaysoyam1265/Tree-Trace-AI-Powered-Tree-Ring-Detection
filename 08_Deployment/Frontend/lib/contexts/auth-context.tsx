"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { MOCK_USER, type UserProfile, type UserPreferences } from "@/lib/mock-profile"
import { getFullUserProfile } from "@/lib/actions/user"

/* ═══════════════════════════════════════════════════════════════════
   AUTH CONTEXT — Hybrid Authentication
   Uses NextAuth session when available, falls back to mock user.
   Replace mock fallback with redirect-to-login once DB is live.
   ═══════════════════════════════════════════════════════════════════ */

interface AuthState {
  isLoggedIn: boolean
  user: UserProfile | null
  isLoading: boolean
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
    isLoggedIn: true,
    user: MOCK_USER,
    isLoading: false,
  })

  // Try to fetch NextAuth session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session")
        const session = await res.json()
        if (session?.user) {
          try {
            const dbUser = await getFullUserProfile()
            if (dbUser) {
              setState({
                isLoggedIn: true,
                user: {
                  ...MOCK_USER,
                  id: dbUser.id,
                  name: dbUser.name || MOCK_USER.name,
                  email: dbUser.email,
                  avatar: dbUser.avatar || MOCK_USER.avatar,
                  role: dbUser.role || MOCK_USER.role,
                  institution: dbUser.institution || MOCK_USER.institution,
                  location: dbUser.location || MOCK_USER.location,
                  bio: dbUser.bio || MOCK_USER.bio,
                  memberSince: dbUser.memberSince,
                  stats: dbUser.stats,
                  recentAnalyses: dbUser.recentAnalyses,
                  activityLog: dbUser.activityLog,
                  achievements: dbUser.achievements,
                  connectedAccounts: dbUser.connectedAccounts,
                },
                isLoading: false,
              })
              return
            }
          } catch (e) {
            console.error(e)
          }

          // Map NextAuth session to our UserProfile shape (fallback)
          setState({
            isLoggedIn: true,
            user: {
              ...MOCK_USER,
              id: session.user.id || MOCK_USER.id,
              name: session.user.name || MOCK_USER.name,
              email: session.user.email || MOCK_USER.email,
              avatar: session.user.image || MOCK_USER.avatar,
            },
            isLoading: false,
          })
        }
      } catch {
        // Session fetch failed (no auth configured yet) — keep mock
      }
    }
    checkSession()
  }, [])

  const login = useCallback(() => {
    setState({ isLoggedIn: true, user: MOCK_USER, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
    } catch {
      // ignore
    }
    setState({ isLoggedIn: false, user: null, isLoading: false })
  }, [])

  const toggleAuth = useCallback(() => {
    setState(prev =>
      prev.isLoggedIn
        ? { isLoggedIn: false, user: null, isLoading: false }
        : { isLoggedIn: true, user: MOCK_USER, isLoading: false }
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
