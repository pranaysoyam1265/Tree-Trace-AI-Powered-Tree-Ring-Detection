"use client"

import React from "react"
import { useSettings } from "@/lib/settings-store"
import { SettingDropdown } from "../controls/setting-dropdown"
import { SettingRadio } from "../controls/setting-radio"
import { SettingSlider } from "../controls/setting-slider"
import { SettingToggle } from "../controls/setting-toggle"
import { SettingInput } from "../controls/setting-input"

import { DetectionParams } from "./detection-params"

export function AnalysisSettings({ searchQuery }: { searchQuery: string }) {
  const { settings, updateSection } = useSettings()
  const ana = settings.analysis

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (keywords: string[]) => !searchQuery || keywords.some(matches)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* UNITS */}
      {hasResult(["units", "measure", "pixels", "millimeters", "micrometers", "scale", "calibration"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [UNITS]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="Primary Measurement Unit"
              description="Unit used for ring widths and influence areas. Note: mm/μm require image scale calibration."
              value={ana.primaryUnit}
              options={[
                { label: "Pixels (px)", value: "px" },
                { label: "Millimeters (mm)", value: "mm" },
                { label: "Micrometers (μm)", value: "um" },
              ]}
              onChange={(v) => updateSection("analysis", { primaryUnit: v as "px" | "mm" | "um" })}
            />

            {ana.primaryUnit !== "px" && (
              <>
                <hr className="border-border my-2" />
                <SettingInput
                  label="Global Scale Factor"
                  description="Default pixels-per-unit if no image-specific calibration is found."
                  type="number"
                  value={ana.globalScaleFactor}
                  onChange={(v) => updateSection("analysis", { globalScaleFactor: Number(v) })}
                />
              </>
            )}

            <hr className="border-border my-2" />
            <SettingToggle
              label="Show Both Units"
              description="Display pixel measurements alongside physical units in data tables."
              checked={ana.showBothUnits}
              onChange={(v) => updateSection("analysis", { showBothUnits: v })}
            />
          </div>
        </section>
      )}

      {/* RING DETECTION */}
      {hasResult(["ring", "detection", "sensitivity", "threshold", "width", "count", "cap"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [DETECTION]"}
          </h2>
          <div className="flex flex-col gap-4">
            <SettingSlider
              label="Algorithm Sensitivity"
              description="Higher sensitivity detects fainter rings but may increase false positives."
              value={ana.sensitivity}
              min={1}
              max={100}
              onChange={(v) => updateSection("analysis", { sensitivity: v })}
              formatValue={(v) => `SENSITIVITY: ${(v / 100).toFixed(2)}`}
            />

            <SettingInput
              label="Minimum Ring Width Threshold"
              description="Ignore detected rings thinner than this value (pixels)."
              type="number"
              min={1}
              value={ana.minRingWidth}
              onChange={(v) => updateSection("analysis", { minRingWidth: Number(v) })}
            />

            <SettingInput
              label="Maximum Ring Count Cap"
              description="Halt detection after finding N rings (Set to 0 for unlimited)."
              type="number"
              min={0}
              value={ana.maxRingCount}
              onChange={(v) => updateSection("analysis", { maxRingCount: Number(v) })}
            />

            {/* Advanced Detection Parameters */}
            <DetectionParams searchQuery={searchQuery} />
          </div>
        </section>
      )}

      {/* PITH DETECTION */}
      {hasResult(["pith", "center", "origin", "auto-detect", "confirm"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [PITH_ORIGIN]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingRadio
              label="Default Pith Method"
              value={ana.pithMethod}
              options={[
                { label: "Manual (Click to map)", value: "manual" },
                { label: "Geometric Center", value: "center" },
                { label: "Auto-detect (Exp.)", value: "auto" },
              ]}
              onChange={(v) => updateSection("analysis", { pithMethod: v as "manual" | "center" | "auto" })}
            />

            {ana.pithMethod === "auto" && (
              <>
                <hr className="border-border my-2" />
                <SettingSlider
                  label="Auto-detect Confidence Threshold"
                  description="Fall back to manual selection if confidence is below this level."
                  value={ana.autoDetectConfidence}
                  min={1}
                  max={99}
                  onChange={(v) => updateSection("analysis", { autoDetectConfidence: v })}
                  formatValue={(v) => `${v}%`}
                />
              </>
            )}

            <hr className="border-border my-2" />
            <SettingToggle
              label="Always Confirm Pith"
              description="Pause to allow pith adjustment before starting heavy processing."
              checked={ana.confirmPith}
              onChange={(v) => updateSection("analysis", { confirmPith: v })}
            />
          </div>
        </section>
      )}

      {/* PREPROCESSING */}
      {hasResult(["preprocessing", "enhance", "contrast", "crop", "background", "u2-net", "resize"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [PREPROCESSING]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingToggle
              label="Auto-enhance Contrast"
              description="Apply CLAHE histogram equalization before detecting lines."
              checked={ana.autoEnhance}
              onChange={(v) => updateSection("analysis", { autoEnhance: v })}
            />
            <SettingToggle
              label="Auto-crop to Specimen"
              description="Trim empty padding around the wood cross-section."
              checked={ana.autoCrop}
              onChange={(v) => updateSection("analysis", { autoCrop: v })}
            />
            <SettingToggle
              label="Remove Background"
              description="Isolate specimen using U2-Net deep learning masks."
              checked={ana.removeBackground}
              onChange={(v) => updateSection("analysis", { removeBackground: v })}
            />

            <hr className="border-border my-2" />

            <SettingDropdown
              label="Default Image Resize"
              description="Scaling down large files speeds up analysis but reduces maximum precision."
              value={ana.defaultResize}
              options={[
                { label: "Do not resize / Original", value: "none" },
                { label: "Resize longest edge to 2000px", value: "2000" },
                { label: "Resize longest edge to 1500px", value: "1500" },
                { label: "Resize longest edge to 1000px", value: "1000" },
              ]}
              onChange={(v) => updateSection("analysis", { defaultResize: v })}
            />
          </div>
        </section>
      )}

      {/* BATCH PROCESSING */}
      {hasResult(["batch", "concurrent", "retry", "skip", "naming"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [BATCH_QUEUE]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="Max Concurrent Processes"
              description="Number of images to analyze simultaneously. High values consume more RAM."
              value={String(ana.maxConcurrent)}
              options={[
                { label: "1 (Sequential — Safest)", value: "1" },
                { label: "2 Processes", value: "2" },
                { label: "3 Processes", value: "3" },
                { label: "4 Processes (Fastest)", value: "4" },
              ]}
              onChange={(v) => updateSection("analysis", { maxConcurrent: Number(v) })}
            />

            <hr className="border-border my-2" />

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SettingToggle
                  label="Auto-retry Failed Scans"
                  checked={ana.autoRetry}
                  onChange={(v) => updateSection("analysis", { autoRetry: v })}
                />
              </div>
              <div className="flex-1">
                <SettingDropdown
                  disabled={!ana.autoRetry}
                  value={String(ana.retryCount)}
                  options={[
                    { label: "1 Attempt", value: "1" },
                    { label: "2 Attempts", value: "2" },
                    { label: "3 Attempts", value: "3" },
                  ]}
                  onChange={(v) => updateSection("analysis", { retryCount: Number(v) })}
                />
              </div>
            </div>

            <hr className="border-border my-2" />

            <SettingToggle
              label="Skip Images Missing Pith"
              description="Silently bypass files requiring manual pith plotting during batch runs."
              checked={ana.skipNoPith}
              onChange={(v) => updateSection("analysis", { skipNoPith: v })}
            />

            <hr className="border-border my-2" />

            <SettingRadio
              label="Default Batch Naming"
              value={ana.defaultBatchNaming}
              options={[
                { label: "Timestamp (e.g. batch_20241012)", value: "timestamp" },
                { label: "Custom Prefix", value: "prefix" },
                { label: "Parent Folder Name", value: "folder" },
              ]}
              onChange={(v) => updateSection("analysis", { defaultBatchNaming: v as any })}
            />
          </div>
        </section>
      )}

    </div>
  )
}
