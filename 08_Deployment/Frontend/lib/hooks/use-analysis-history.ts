import { useState, useEffect, useCallback } from "react"

export interface AnalysisSession {
  id: string
  imageName: string
  timestamp: string
  ringCount: number
}

const HISTORY_KEY = "treetrace_recent_analysis"

export function useAnalysisHistory() {
  const [recent, setRecent] = useState<AnalysisSession | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        setRecent(JSON.parse(stored) as AnalysisSession)
      }
    } catch (e) {
      console.error("Failed to parse analysis history", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save a new session — memoized to prevent re-render loops
  const saveSession = useCallback((session: AnalysisSession) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(session))
      setRecent(session)
    } catch (e) {
      console.error("Failed to save analysis history", e)
    }
  }, [])

  // Clear session — memoized
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_KEY)
      setRecent(null)
    } catch (e) {
      //
    }
  }, [])

  return { recent, isLoaded, saveSession, clearSession }
}
