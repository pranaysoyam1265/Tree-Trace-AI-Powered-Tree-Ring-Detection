"use client"

import React from "react"
import { useSettings } from "@/lib/settings-store"
import { SettingRadio } from "../controls/setting-radio"
import { DownloadCloud, Trash2, Database, AlertOctagon } from "lucide-react"

export function DataManagementSettings({ searchQuery }: { searchQuery: string }) {
  const { settings, updateSection } = useSettings()
  const data = settings.data

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (keywords: string[]) => !searchQuery || keywords.some(matches)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* STORAGE OVERVIEW */}
      {hasResult(["storage", "space", "usage", "cache"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [LOCAL_STORAGE]"}
          </h2>

          <div className="rounded-lg border border-border bg-black p-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 text-foreground">
                <Database className="text-accent" size={24} />
                <div>
                  <h3 className="font-mono text-sm">IndexedDB Workspace</h3>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">Local sandbox for current session arrays and cached thumbnails.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xl text-accent">14.2<span className="text-xs text-muted-foreground ml-1">MB</span></span>
                <p className="font-mono text-[9px] text-muted-foreground uppercase mt-1">/ 250 MB Quota</p>
              </div>
            </div>

            <div className="w-full h-2 bg-background rounded-none overflow-hidden flex mt-4">
              <div className="bg-accent w-[5%] h-full" title="Core Config" />
              <div className="bg-accent w-[15%] h-full" title="Analysis Data" />
              <div className="bg-accent-secondary w-[8%] h-full" title="Image Cache" />
            </div>
            <div className="flex gap-4 mt-3 font-mono text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-none bg-accent" /> Config</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-none bg-accent" /> Vectors</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-none bg-accent-secondary" /> Cache</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-none font-mono text-xs text-foreground hover:bg-white/5 transition-colors">
              <Trash2 size={14} className="text-muted-foreground" />
              Clear Image Cache
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-none font-mono text-xs text-foreground hover:bg-white/5 transition-colors">
              <Trash2 size={14} className="text-muted-foreground" />
              Clear Vector Data
            </button>
          </div>
        </section>
      )}

      {/* SYNC & IMPORT */}
      {hasResult(["import", "merge", "conflict", "sync", "strategy"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [DATA_OPERATIONS]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingRadio
              label="Import/Merge Conflict Strategy"
              description="How should the system resolve duplicate analyses when importing external ZIP/JSON workspaces."
              layout="vertical"
              value={data.mergeStrategy}
              options={[
                { label: "Keep Both (Create copy with '_2' suffix)", value: "keep" },
                { label: "Overwrite Local (Trust imported source)", value: "overwrite" },
                { label: "Ignore Import (Preserve local copy)", value: "ignore" },
              ]}
              onChange={(v) => updateSection("data", { mergeStrategy: v })}
            />
          </div>
        </section>
      )}

      {/* PORTABILITY */}
      {hasResult(["portability", "export", "backup", "everything", "danger", "factory", "reset"]) && (
        <section className="pt-4 border-t border-border">
          <h2 className="font-mono text-[10px] text-red-500 uppercase tracking-[2px] mb-4 flex items-center gap-2">
            <AlertOctagon size={12} />
            {"// [CRITICAL_OPERATIONS]"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-none border border-border bg-background flex flex-col items-start h-full">
              <h3 className="font-mono text-sm text-foreground mb-1">Backup Workspace</h3>
              <p className="font-mono text-[10px] text-muted-foreground mb-4 flex-1">
                Packages all config, local history, active queue, and settings into a transportable `treetrace_backup.zip`.
              </p>
              <button className="flex items-center justify-center gap-2 px-4 py-2 text-accent bg-accent/10 hover:bg-accent/20 w-full rounded-none border border-accent/20 font-mono text-xs uppercase transition-colors">
                <DownloadCloud size={14} /> Extract Backup
              </button>
            </div>

            <div className="p-4 rounded-none border border-red-500/20 bg-red-500/5 flex flex-col items-start h-full">
              <h3 className="font-mono text-sm text-red-400 mb-1">Factory Reset</h3>
              <p className="font-mono text-[10px] text-red-400/70 mb-4 flex-1">
                Wipes all configuration, local storage DBs, and workspace temp files. Application returns to first-launch state.
              </p>
              <button className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-500 w-full rounded-none border border-red-500 font-mono text-xs uppercase shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-colors">
                <Trash2 size={14} /> Purge Everything
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
