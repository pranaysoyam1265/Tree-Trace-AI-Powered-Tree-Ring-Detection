"use client"

import React from "react"
import { useSettings } from "@/lib/settings-store"
import { SettingDropdown } from "../controls/setting-dropdown"
import { SettingToggle } from "../controls/setting-toggle"

export function PrivacySettings({ searchQuery }: { searchQuery: string }) {
  const { settings, updateSection } = useSettings()
  const priv = settings.privacy

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (keywords: string[]) => !searchQuery || keywords.some(matches)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* TELEMETRY */}
      {hasResult(["telemetry", "data", "collection", "analytics", "tracking", "history"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [DATA_COLLECTION]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingToggle
              label="Send Anonymous Usage Telemetry"
              description="Help us improve TreeTrace by sharing non-identifiable interaction metrics (counts, crash logs, processing times). No specimen data is ever sent."
              checked={priv.telemetryEnabled}
              onChange={(v) => updateSection("privacy", { telemetryEnabled: v })}
            />
            <hr className="border-border my-2" />
            <SettingToggle
              label="Store Processing History"
              description="Keep a record of your 'Recent Analyses' and activity log. Turning this off removes the timeline from your Profile."
              checked={priv.storeHistory}
              onChange={(v) => updateSection("privacy", { storeHistory: v })}
            />
          </div>
        </section>
      )}

      {/* DISCOVERABILITY */}
      {hasResult(["discoverability", "public", "profile", "searchable", "share"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [DISCOVERABILITY]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingToggle
              label="Make Profile Public"
              description="Allow anyone with your profile link to view your Researcher Stats and timeline."
              checked={priv.publicProfile}
              onChange={(v) => updateSection("privacy", { publicProfile: v })}
            />

            <div className={`transition-opacity ${priv.publicProfile ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
              <hr className="border-border my-2" />
              <SettingToggle
                label="Searchable Profile"
                description="Allow your public profile to be indexed by global search engines and TreeTrace's internal researcher directory."
                checked={priv.searchableProfile}
                onChange={(v) => updateSection("privacy", { searchableProfile: v })}
              />
            </div>
          </div>
        </section>
      )}

      {/* RETENTION POLICIES */}
      {hasResult(["retention", "delete", "auto-delete", "purge"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [DATA_RETENTION]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="Auto-delete Cached Results"
              description="Purge local analysis vectors (CSVs, JSONs) stored in browser memory or the temporary app sandbox."
              value={priv.autoDeleteResults}
              options={[
                { label: "Never expire", value: "never" },
                { label: "After 7 days", value: "7d" },
                { label: "After 14 days", value: "14d" },
                { label: "After 30 days", value: "30d" },
              ]}
              onChange={(v) => updateSection("privacy", { autoDeleteResults: v })}
            />
            <hr className="border-border my-2" />
            <SettingDropdown
              label="Auto-delete Activity Log"
              description="Trim the git-style timeline history on your profile page."
              value={priv.autoDeleteLog}
              options={[
                { label: "Never expire (Keep forever)", value: "never" },
                { label: "Keep 30 days", value: "30" },
                { label: "Keep 90 days", value: "90" },
                { label: "Keep 1 year", value: "365" },
              ]}
              onChange={(v) => updateSection("privacy", { autoDeleteLog: v })}
            />
          </div>
        </section>
      )}

    </div>
  )
}
