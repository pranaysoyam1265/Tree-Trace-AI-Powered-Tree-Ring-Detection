"use client"

import React from "react"
import { useSettings } from "@/lib/settings-store"
import { SettingDropdown } from "../controls/setting-dropdown"
import { SettingRadio } from "../controls/setting-radio"
import { SettingSlider } from "../controls/setting-slider"
import { SettingToggle } from "../controls/setting-toggle"

export function NotificationsSettings({ searchQuery }: { searchQuery: string }) {
  const { settings, updateSection } = useSettings()
  const notif = settings.notifications

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (keywords: string[]) => !searchQuery || keywords.some(matches)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* HUD ALERTS */}
      {hasResult(["alert", "hud", "toast", "browser", "push", "analysis", "batch", "export", "achievement", "system", "position", "dismiss"]) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px]">
              {"// [HUD_ALERTS]"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-muted-foreground uppercase">OS Push Requests:</span>
              <SettingToggle
                checked={notif.browserEnabled}
                onChange={(v) => updateSection("notifications", { browserEnabled: v })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-sm text-foreground">Trigger Events</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
              <SettingToggle
                label="Analysis Complete"
                checked={notif.notifyAnalysis}
                onChange={(v) => updateSection("notifications", { notifyAnalysis: v })}
              />
              <SettingToggle
                label="Batch Queue Finished"
                checked={notif.notifyBatch}
                onChange={(v) => updateSection("notifications", { notifyBatch: v })}
              />
              <SettingToggle
                label="Export Ready"
                checked={notif.notifyExport}
                onChange={(v) => updateSection("notifications", { notifyExport: v })}
              />
              <SettingToggle
                label="Achievement Unlocked"
                checked={notif.notifyAchievement}
                onChange={(v) => updateSection("notifications", { notifyAchievement: v })}
              />
              <SettingToggle
                label="System Exceptions / Errors"
                checked={notif.notifySystem}
                onChange={(v) => updateSection("notifications", { notifySystem: v })}
              />
            </div>

            <hr className="border-border mt-6 mb-2" />

            <SettingRadio
              label="HUD Toast Position"
              value={notif.notifyPosition}
              options={[
                { label: "Top Right", value: "top-right" },
                { label: "Bottom Right", value: "bottom-right" },
                { label: "Top Center", value: "top-center" },
                { label: "Bottom Left", value: "bottom-left" },
              ]}
              onChange={(v) => updateSection("notifications", { notifyPosition: v })}
            />

            <hr className="border-border my-2" />

            <SettingDropdown
              label="Auto-Dismiss Timeout"
              value={notif.notifyDismissTime}
              options={[
                { label: "3 Seconds", value: "3" },
                { label: "5 Seconds (Default)", value: "5" },
                { label: "10 Seconds", value: "10" },
                { label: "Require Manual Dismiss", value: "manual" },
              ]}
              onChange={(v) => updateSection("notifications", { notifyDismissTime: v })}
            />
          </div>
        </section>
      )}

      {/* AUDIO DIAGNOSTICS */}
      {hasResult(["audio", "sound", "volume", "chime", "theme", "beep"]) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px]">
              {"// [AUDIO_DIAGNOSTICS]"}
            </h2>
            <SettingToggle
              checked={notif.soundEnabled}
              onChange={(v) => updateSection("notifications", { soundEnabled: v })}
            />
          </div>

          <div className={`transition-opacity duration-300 ${notif.soundEnabled ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
            <SettingSlider
              label="Master Volume"
              value={notif.soundVolume}
              min={0}
              max={100}
              onChange={(v) => updateSection("notifications", { soundVolume: v })}
              formatValue={(v) => `VOL: ${v}%`}
            />

            <hr className="border-border my-4" />

            <p className="font-mono text-sm text-foreground">Auditory Triggers</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
              <SettingToggle
                label="Single Analysis Chime"
                checked={notif.chimeAnalysis}
                onChange={(v) => updateSection("notifications", { chimeAnalysis: v })}
              />
              <SettingToggle
                label="Batch Item Complete Beep"
                checked={notif.chimeBatch}
                onChange={(v) => updateSection("notifications", { chimeBatch: v })}
              />
              <SettingToggle
                label="Error / Exception Alert"
                checked={notif.chimeError}
                onChange={(v) => updateSection("notifications", { chimeError: v })}
              />
              <SettingToggle
                label="Achievement Fanfare"
                checked={notif.chimeFanfare}
                onChange={(v) => updateSection("notifications", { chimeFanfare: v })}
              />
            </div>

            <hr className="border-border mt-6 mb-2" />

            <SettingRadio
              label="Soundscape Theme"
              layout="vertical"
              value={notif.soundTheme}
              options={[
                { label: "Minimalist / Soft", value: "default" },
                { label: "Terminal / 8-bit Synthesizer", value: "retro" },
                { label: "Laboratory / Medical", value: "lab" },
                { label: "Mechanical / Clicky", value: "mech" },
              ]}
              onChange={(v) => updateSection("notifications", { soundTheme: v })}
            />
          </div>
        </section>
      )}

      {/* IDENTITY BADGES */}
      {hasResult(["badge", "avatar", "profile", "indicator"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [IDENTITY_FLAGS]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingToggle
              label="Avatar Notification Badge"
              description="Show a red dot indicator on your profile picture when new alerts exist."
              checked={notif.notifyAvatarBadge}
              onChange={(v) => updateSection("notifications", { notifyAvatarBadge: v })}
            />
          </div>
        </section>
      )}

    </div>
  )
}
