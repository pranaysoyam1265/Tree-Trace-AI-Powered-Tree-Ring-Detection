"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Settings, DEFAULT_SETTINGS } from "./default-settings"

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings> | ((prev: Settings) => Settings)) => void
  updateSection: <K extends keyof Settings>(section: K, updates: Partial<Settings[K]>) => void
  resetSettings: () => void
  isLoaded: boolean
  unsavedChanges: number
  saveSettings: () => void
  discardChanges: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(0)

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem("treetrace_settings")
      if (stored) {
        const parsed = JSON.parse(stored)
        // Deep merge with defaults to ensure new fields are populated
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          general: { ...DEFAULT_SETTINGS.general, ...(parsed.general || {}) },
          appearance: { ...DEFAULT_SETTINGS.appearance, ...(parsed.appearance || {}) },
          analysis: { ...DEFAULT_SETTINGS.analysis, ...(parsed.analysis || {}) },
          export: { ...DEFAULT_SETTINGS.export, ...(parsed.export || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...(parsed.privacy || {}) },
          data: { ...DEFAULT_SETTINGS.data, ...(parsed.data || {}) },
          advanced: { ...DEFAULT_SETTINGS.advanced, ...(parsed.advanced || {}) },
          keyboard: { ...DEFAULT_SETTINGS.keyboard, ...(parsed.keyboard || {}) },
        })
      } else {
        setSettings(DEFAULT_SETTINGS)
      }
    } catch (e) {
      console.error("Failed to parse settings", e)
    } finally {
      setIsLoaded(true)
      setUnsavedChanges(0)
    }
  }

  // Load from local storage on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const discardChanges = () => {
    loadSettings()
  }

  const saveSettings = () => {
    try {
      localStorage.setItem("treetrace_settings", JSON.stringify(settings))
      setUnsavedChanges(0)
    } catch (e) {
      console.error("Failed to save settings", e)
    }
  }

  const updateSettings = (updates: Partial<Settings> | ((prev: Settings) => Settings)) => {
    setSettings((prev) => {
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates }
      return next
    })
    setUnsavedChanges((prev) => prev + 1)
  }

  const updateSection = <K extends keyof Settings>(section: K, updates: Partial<Settings[K]>) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }))
    setUnsavedChanges((prev) => prev + 1)
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    setUnsavedChanges((prev) => prev + 1)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateSection,
        resetSettings,
        isLoaded,
        unsavedChanges,
        saveSettings,
        discardChanges
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
