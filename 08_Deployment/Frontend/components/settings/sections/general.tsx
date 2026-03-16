"use client"

import React from "react"
import { useSettings } from "@/lib/settings-store"
import { SettingDropdown } from "../controls/setting-dropdown"
import { SettingRadio } from "../controls/setting-radio"
import { SettingToggle } from "../controls/setting-toggle"

export function GeneralSettings({ searchQuery }: { searchQuery: string }) {
  const { settings, updateSection } = useSettings()
  const gen = settings.general

  // Simple hardcoded filter approach for the active section
  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (groupLabel: string, keywords: string[]) =>
    !searchQuery || matches(groupLabel) || keywords.some(matches)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* LANGUAGE & REGION */}
      {hasResult("Language & Region", ["language", "region", "timezone"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [LANGUAGE]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="Language"
              description="Application interface language."
              value={gen.language}
              options={[
                { label: "English", value: "en" },
                { label: "Español", value: "es", disabled: true },
                { label: "Deutsch", value: "de", disabled: true },
                { label: "Français", value: "fr", disabled: true },
                { label: "Português", value: "pt", disabled: true },
                { label: "日本語", value: "ja", disabled: true },
              ]}
              onChange={(v) => updateSection("general", { language: v })}
            />
            <hr className="border-border my-2" />
            <SettingDropdown
              label="Region / Locale"
              description="Preferred format for dates and numbers."
              value={gen.region}
              options={[
                { label: "MM/DD/YYYY (US)", value: "MM/DD/YYYY" },
                { label: "DD/MM/YYYY (EU)", value: "DD/MM/YYYY" },
                { label: "YYYY-MM-DD (ISO)", value: "YYYY-MM-DD" },
              ]}
              onChange={(v) => updateSection("general", { region: v })}
            />
            <hr className="border-border my-2" />
            <SettingDropdown
              label="Timezone"
              description="Time offset used in activity logs and exports."
              value={gen.timezone}
              options={[
                { label: "Auto-detect (System Default)", value: "auto" },
                { label: "UTC (Coordinated Universal Time)", value: "UTC" },
                { label: "PST (Pacific Standard Time)", value: "America/Los_Angeles" },
                { label: "EST (Eastern Standard Time)", value: "America/New_York" },
                { label: "CET (Central European Time)", value: "Europe/Berlin" },
              ]}
              onChange={(v) => updateSection("general", { timezone: v })}
            />
          </div>
        </section>
      )}

      {/* WORKSPACE DEFAULTS */}
      {hasResult("Workspace Defaults", ["workspace", "start page", "default mode", "login"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [WORKSPACE]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="Start Page"
              description="Where to direct you immediately after signing in."
              value={gen.startPage}
              options={[
                { label: "Home Dashboard", value: "home" },
                { label: "Analyze Workspace", value: "analyze" },
                { label: "Batch Processing", value: "batch" },
                { label: "Last Visited Page", value: "last", disabled: true },
              ]}
              onChange={(v) => updateSection("general", { startPage: v })}
            />
            <hr className="border-border my-2" />
            <SettingRadio
              label="Default Analysis Mode"
              description="The primary engine style activated in the workspace."
              value={gen.defaultMode}
              options={[
                { label: "Single Image (Interactive)", value: "single" },
                { label: "Batch Pipeline (Automated)", value: "batch" },
              ]}
              onChange={(v) => updateSection("general", { defaultMode: v as "single" | "batch" })}
            />
          </div>
        </section>
      )}

      {/* SESSION MANAGEMENT */}
      {hasResult("Session", ["session", "logout", "inactivity", "remember"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [SESSION]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="Auto-logout Inactivity"
              description="Automatically secure your account when away."
              value={gen.autoLogout}
              options={[
                { label: "Never expire", value: "never" },
                { label: "After 30 minutes", value: "30m" },
                { label: "After 1 hour", value: "1h" },
                { label: "After 4 hours", value: "4h" },
                { label: "After 8 hours", value: "8h" },
              ]}
              onChange={(v) => updateSection("general", { autoLogout: v })}
            />
            <hr className="border-border my-2" />
            <SettingToggle
              label="Remember Last Session"
              description="Restore unsaved edits and loaded images when returning."
              checked={gen.rememberSession}
              onChange={(v) => updateSection("general", { rememberSession: v })}
            />
          </div>
        </section>
      )}

      {!hasResult("General", ["general", "language", "region", "timezone", "workspace", "start page", "default mode", "login", "session", "logout", "inactivity", "remember"]) && searchQuery && (
        <p className="font-mono text-muted-foreground text-xs">No general settings match "{searchQuery}"</p>
      )}
    </div>
  )
}
