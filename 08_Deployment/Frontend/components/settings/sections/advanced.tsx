"use client"

import React from "react"
import { useSettings } from "@/lib/settings-store"
import { SettingToggle } from "../controls/setting-toggle"
import { SettingInput } from "../controls/setting-input"
import { Code, Cpu, FlaskConical, Terminal } from "lucide-react"

export function AdvancedSettings({ searchQuery }: { searchQuery: string }) {
  const { settings, updateSection } = useSettings()
  const adv = settings.advanced

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (keywords: string[]) => !searchQuery || keywords.some(matches)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* HARDWARE OFFERS */}
      {hasResult(["hardware", "performance", "gpu", "acceleration", "memory", "timeout", "cache"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4 flex items-center gap-2">
            <Cpu size={12} />
            {"// [HARDWARE_ALLOCATION]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingToggle
              label="Hardware GPU Acceleration"
              description="Offload tensor math to WebGL or WebGPU when available."
              checked={adv.gpuAcceleration}
              onChange={(v) => updateSection("advanced", { gpuAcceleration: v })}
            />
            <hr className="border-border my-2" />
            <div className="flex flex-col sm:flex-row gap-4">
              <SettingInput
                label="Max Memory Limit (MB)"
                type="number"
                value={adv.maxMemory}
                onChange={(v) => updateSection("advanced", { maxMemory: Number(v) })}
              />
              <SettingInput
                label="Image Cache Size (Items)"
                type="number"
                value={adv.imageCacheSize}
                onChange={(v) => updateSection("advanced", { imageCacheSize: Number(v) })}
              />
            </div>
            <hr className="border-border my-2" />
            <SettingInput
              label="Processing Timeout (Seconds)"
              description="Halt analysis if the engine hangs beyond this limit."
              type="number"
              value={adv.processingTimeout}
              onChange={(v) => updateSection("advanced", { processingTimeout: Number(v) })}
            />
          </div>
        </section>
      )}

      {/* EXPERIMENTAL LABS */}
      {hasResult(["experimental", "labs", "beta", "flag", "auto-pith", "cross-dating", "3d", "ai", "species"]) && (
        <section className="p-4 rounded-none border border-status-warning/20 bg-status-warning/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-status-warning/10 blur-3xl rounded-none-none" />
          <h2 className="font-mono text-[10px] text-amber-500 uppercase tracking-[2px] mb-4 flex items-center gap-2">
            <FlaskConical size={12} />
            {"// [EXPERIMENTAL_FEATURES]"}
          </h2>
          <p className="font-mono text-[10px] text-foreground mb-6">Beta features may be unstable and could cause data loss or crash the renderer.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 relative z-10">
            <SettingToggle
              label="Enable Auto-Pith ML Model"
              checked={adv.flagAutoPith}
              onChange={(v) => updateSection("advanced", { flagAutoPith: v })}
            />
            <SettingToggle
              label="Cross-Dating Engine (WIP)"
              checked={adv.flagCrossDating}
              onChange={(v) => updateSection("advanced", { flagCrossDating: v })}
            />
            <SettingToggle
              label="3D Core Reconstructor"
              checked={adv.flag3DView}
              onChange={(v) => updateSection("advanced", { flag3DView: v })}
            />
            <SettingToggle
              label="AI Species Identification"
              checked={adv.flagAISpecies}
              onChange={(v) => updateSection("advanced", { flagAISpecies: v })}
            />
          </div>
        </section>
      )}

      {/* DEVELOPER TOOLS */}
      {hasResult(["developer", "dev", "tools", "logging", "api", "endpoint", "mock", "overlay", "debug"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-sky-500 uppercase tracking-[2px] mb-4 flex items-center gap-2">
            <Code size={12} />
            {"// [DEVELOPER_CONSOLE]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingToggle
              label="Enable Developer Tools"
              description="Unlock the internal inspector panel."
              checked={adv.devTools}
              onChange={(v) => updateSection("advanced", { devTools: v })}
            />
            <SettingToggle
              label="Performance Overlay"
              description="Render an active FPS/Memory chart in the top-right corner."
              checked={adv.perfOverlay}
              onChange={(v) => updateSection("advanced", { perfOverlay: v })}
            />
            <SettingToggle
              label="Verbose Logging"
              description="Log diagnostic execution chains to the browser console."
              checked={adv.verboseLogging}
              onChange={(v) => updateSection("advanced", { verboseLogging: v })}
            />

            <hr className="border-border my-2" />

            <div className="flex flex-col gap-2">
              <SettingInput
                label="Custom API RPC Endpoint"
                description="Override the default cloud inference node."
                placeholder="https://api.treetrace.com/v2/rpc"
                value={adv.apiEndpoint}
                onChange={(v) => updateSection("advanced", { apiEndpoint: v })}
              />
              <SettingToggle
                label="Force Mock Offline Mode"
                description="Bypass all API calls and strictly use local stub data."
                checked={adv.mockMode}
                onChange={(v) => updateSection("advanced", { mockMode: v })}
              />
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
