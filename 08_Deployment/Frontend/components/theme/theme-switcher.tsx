"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { ThemePreview } from "./theme-preview"

const THEMES = [
  {
    id: "forest",
    name: "Forest Terminal",
    description: "The default TreeTrace aesthetic. Night forest greens with organic warmth and phosphor glow.",
    colors: {
      bgBase: "#0A0F0C",    /* --bg-base */
      bgSurface: "#162019", /* --bg-surface */
      accent: "#10B981",    /* --green-500 */
      text: "#E8F5E8",      /* --text-accent */
    }
  },
  {
    id: "midnight",
    name: "Midnight Lab",
    description: "A clinical, cool blue-shifted variant minimizing green hues.",
    colors: {
      bgBase: "#0B0E14",
      bgSurface: "#1A2030",
      accent: "#22D3EE",    /* Cyan */
      text: "#E2E8F0",
    }
  },
  {
    id: "amber",
    name: "Amber Scope",
    description: "Warm, wood-toned organic palette simulating physical scientific instruments.",
    colors: {
      bgBase: "#0F0C08",
      bgSurface: "#241E16",
      accent: "#F59E0B",    /* Amber */
      text: "#F5E6D3",
    }
  },
  {
    id: "contrast",
    name: "High Contrast",
    description: "Accessibility focused. Maximum contrast using pure blacks and neon colors.",
    colors: {
      bgBase: "#000000",
      bgSurface: "#141414",
      accent: "#00FF88",
      text: "#FFFFFF",
    }
  }
]

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {THEMES.map((t) => (
          <div key={t.id} className="h-[148px] rounded border border-white/[0.04] bg-[#0A0A0A] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {THEMES.map((t) => (
        <ThemePreview
          key={t.id}
          id={t.id}
          name={t.name}
          description={t.description}
          isActive={theme === t.id || (theme === "system" && t.id === "forest")} // Default to forest if system is undefined map
          onClick={() => setTheme(t.id)}
          colors={t.colors}
        />
      ))}
    </div>
  )
}
