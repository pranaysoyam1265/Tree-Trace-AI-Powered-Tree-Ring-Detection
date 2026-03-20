"use client"

import React from "react"
import { useSettings } from "@/lib/settings-store"
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
import { SettingColorPicker } from "../controls/setting-color-picker"
import { SettingDropdown } from "../controls/setting-dropdown"
import { SettingSlider } from "../controls/setting-slider"
import { SettingToggle } from "../controls/setting-toggle"
import { SettingRadio } from "../controls/setting-radio"
import { Theme } from "@/lib/default-settings"

export function AppearanceSettings({ searchQuery }: { searchQuery: string }) {
  const { settings, updateSection } = useSettings()
  const app = settings.appearance

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (keywords: string[]) => !searchQuery || keywords.some(matches)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* THEME */}
      {hasResult(["theme", "dark", "light", "midnight", "terminal", "color", "accent"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [THEME_CONFIG]"}
          </h2>

          <div className="mb-8">
            <ThemeSwitcher />
          </div>

          <SettingColorPicker
            label="Accent Color"
            description="Primary highlight color used for active elements and focus states."
            value={app.accentColor}
            options={[
              { label: "Soft Green", value: "#4ADE80" },
              { label: "Teal", value: "#00FFAA" },
              { label: "Cyan", value: "#22D3EE" },
              { label: "Purple", value: "#A78BFA" },
              { label: "Amber", value: "#F59E0B" },
              { label: "Electric Orange", value: "#EA580C" },
            ]}
            onChange={(v) => updateSection("appearance", { accentColor: v })}
          />
        </section>
      )}

      {/* TYPOGRAPHY OVERLAYS */}
      {hasResult(["font", "size", "typography", "hud", "intensity", "overlay"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [DISPLAY::TYPOGRAPHY]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="UI Font"
              description="Font family used for body text and navigation."
              value={app.uiFont}
              options={[
                { label: "System Default", value: "system" },
                { label: "Inter", value: "inter" },
                { label: "IBM Plex Sans", value: "ibm" },
              ]}
              onChange={(v) => updateSection("appearance", { uiFont: v })}
            />
            <hr className="border-border my-2" />
            <SettingDropdown
              label="Monospace Font"
              description="Font family used for terminals, code, and data."
              value={app.monoFont}
              options={[
                { label: "JetBrains Mono", value: "jetbrains" },
                { label: "Fira Code", value: "fira" },
                { label: "IBM Plex Mono", value: "ibm_mono" },
                { label: "Source Code Pro", value: "source" },
              ]}
              onChange={(v) => updateSection("appearance", { monoFont: v })}
            />
            <hr className="border-border my-2" />
            <SettingRadio
              label="Font Size"
              value={app.fontSize}
              options={[
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
              ]}
              onChange={(v) => updateSection("appearance", { fontSize: v as "small" | "medium" | "large" })}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
              {"// [DISPLAY::HUD]"}
            </h2>
            <SettingSlider
              label="HUD Overlay Intensity"
              description="Prominence of decorative terminal brackets, scan lines, and crosshairs across the app."
              value={app.hudIntensity}
              min={0}
              max={100}
              step={10}
              onChange={(v) => updateSection("appearance", { hudIntensity: v })}
              formatValue={(v) => `${v}%`}
            />

            {/* Simple HUD preview */}
            <div className="mt-4 p-4 border border-border relative overflow-hidden flex items-center justify-center rounded-none bg-background">
              <div
                className="absolute inset-0 bg-[url('/scanline.png')] bg-repeat opacity-10"
                style={{ opacity: app.hudIntensity / 100 * 0.2 }}
              />
              <div
                className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-accent transition-opacity"
                style={{ opacity: app.hudIntensity / 100 }}
              />
              <div
                className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-accent transition-opacity"
                style={{ opacity: app.hudIntensity / 100 }}
              />
              <span className="font-mono text-xs text-muted-foreground relative z-10">[HUD_PREVIEW_AREA]</span>
            </div>
          </div>
        </section>
      )}

      {/* ANIMATION & DENSITY */}
      {hasResult(["animation", "motion", "speed", "transition", "density", "compact"]) && (
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
                {"// [MOTION]"}
              </h2>
              <div className="flex flex-col gap-2">
                <SettingToggle
                  label="Enable Animations"
                  checked={app.enableAnimations}
                  onChange={(v) => updateSection("appearance", { enableAnimations: v })}
                />

                <div className="pl-4 ml-2 border-l border-border flex flex-col gap-2 my-2">
                  <SettingSlider
                    label="Animation Speed"
                    value={app.animationSpeed}
                    min={10}
                    max={100}
                    step={10}
                    disabled={!app.enableAnimations}
                    onChange={(v) => updateSection("appearance", { animationSpeed: v })}
                    formatValue={(v) => `${v}ms`}
                  />
                  <SettingToggle
                    label="Page Transitions"
                    checked={app.pageTransitions}
                    disabled={!app.enableAnimations}
                    onChange={(v) => updateSection("appearance", { pageTransitions: v })}
                  />
                  <SettingToggle
                    label="Counter Animations"
                    checked={app.counterAnimations}
                    disabled={!app.enableAnimations}
                    onChange={(v) => updateSection("appearance", { counterAnimations: v })}
                  />
                  <SettingToggle
                    label="HUD Typing FX"
                    checked={app.hudTyping}
                    disabled={!app.enableAnimations}
                    onChange={(v) => updateSection("appearance", { hudTyping: v })}
                  />
                </div>

                <SettingToggle
                  label="Reduce Motion"
                  description="Prioritize system accessibility preferences."
                  checked={app.reduceMotion}
                  onChange={(v) => updateSection("appearance", { reduceMotion: v })}
                />
              </div>
            </div>

            <div>
              <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
                {"// [DENSITY]"}
              </h2>
              <SettingRadio
                label="Interface Density"
                description="Adjusts padding and margins across all components."
                layout="vertical"
                value={app.interfaceDensity}
                options={[
                  { label: "Comfortable (Default)", value: "comfortable" },
                  { label: "Compact (More data, less space)", value: "compact" },
                  { label: "Spacious (Touch-friendly)", value: "spacious" },
                ]}
                onChange={(v) => updateSection("appearance", { interfaceDensity: v as "comfortable" | "compact" | "spacious" })}
              />
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
