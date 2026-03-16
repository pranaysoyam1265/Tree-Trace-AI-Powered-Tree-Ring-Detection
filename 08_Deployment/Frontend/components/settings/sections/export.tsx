"use client"

import React from "react"
import { useSettings } from "@/lib/settings-store"
import { SettingDropdown } from "../controls/setting-dropdown"
import { SettingRadio } from "../controls/setting-radio"
import { SettingSlider } from "../controls/setting-slider"
import { SettingToggle } from "../controls/setting-toggle"
import { SettingInput } from "../controls/setting-input"

export function ExportSettings({ searchQuery }: { searchQuery: string }) {
  const { settings, updateSection } = useSettings()
  const exp = settings.export

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (keywords: string[]) => !searchQuery || keywords.some(matches)

  // Helper toggle list
  const toggleFormatList = (list: string[], val: string, key: "singleExportFormat" | "batchExportFormat" | "pdfIncludeSections") => {
    const next = list.includes(val) ? list.filter(i => i !== val) : [...list, val]
    updateSection("export", { [key]: next })
  }

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* DEFAULTS */}
      {hasResult(["default", "formats", "quick", "one-click"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [DEFAULT_PROTOCOLS]"}
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <span className="font-mono text-sm text-foreground">Single Image Default Forms</span>
              <p className="font-mono text-[10px] text-muted-foreground mt-1 mb-2">Selected by default in the Export menu.</p>
              <div className="flex gap-4">
                {["csv", "json", "png", "pdf"].map(fmt => (
                  <label key={fmt} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={exp.singleExportFormat.includes(fmt)}
                      onChange={() => toggleFormatList(exp.singleExportFormat, fmt, "singleExportFormat")}
                      className="accent-accent bg-black border-border"
                    />
                    <span className="font-mono text-[11px] text-foreground group-hover:text-foreground uppercase">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <span className="font-mono text-sm text-foreground">Batch Archive Default Forms</span>
              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  { id: "csv_ind", label: "Indiv CSVs" },
                  { id: "csv_combined", label: "Combined CSV" },
                  { id: "json", label: "JSON Archive" },
                  { id: "png", label: "PNG Render Archive" },
                  { id: "pdf", label: "Consolidated PDF" }
                ].map(fmt => (
                  <label key={fmt.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={exp.batchExportFormat.includes(fmt.id)}
                      onChange={() => toggleFormatList(exp.batchExportFormat, fmt.id, "batchExportFormat")}
                      className="accent-accent bg-black border-border"
                    />
                    <span className="font-mono text-[11px] text-foreground group-hover:text-foreground">{fmt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            <SettingDropdown
              label="One-Click Export Protocol"
              description="The direct download format triggered by Ctrl+E."
              value={exp.quickExportFormat}
              options={[
                { label: "CSV Flat File", value: "csv" },
                { label: "JSON Deep Dump", value: "json" },
                { label: "PNG Overlay Render", value: "png" },
                { label: "PDF Summary", value: "pdf" },
              ]}
              onChange={(v) => updateSection("export", { quickExportFormat: v })}
            />
          </div>
        </section>
      )}

      {/* CSV CONFIG */}
      {hasResult(["csv", "delimiter", "headers", "decimal", "metadata", "ring numbering"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [CSV_STRUCTURE]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingRadio
              label="Delimiter"
              value={exp.csvDelimiter}
              options={[
                { label: "Comma (,)", value: "comma" },
                { label: "Semicolon (;)", value: "semi" },
                { label: "Tab (TSV)", value: "tab" },
              ]}
              onChange={(v) => updateSection("export", { csvDelimiter: v })}
            />
            <hr className="border-border my-2" />
            <SettingRadio
              label="Decimal Separator"
              value={exp.csvDecimal}
              options={[
                { label: "Period (.)", value: "period" },
                { label: "Comma (,)", value: "comma" },
              ]}
              onChange={(v) => updateSection("export", { csvDecimal: v })}
            />
            <hr className="border-border my-2" />
            <SettingToggle
              label="Include Headers"
              checked={exp.csvIncludeHeaders}
              onChange={(v) => updateSection("export", { csvIncludeHeaders: v })}
            />
            <SettingToggle
              label="Inject Metadata Rows"
              description="Add specimen info, date, and constants at the top of the file."
              checked={exp.csvMetadata}
              onChange={(v) => updateSection("export", { csvMetadata: v })}
            />
            <hr className="border-border my-2" />
            <SettingRadio
              label="Ring Numbering Vector"
              description="Direction in which IDs increment."
              value={exp.csvRingNumbering}
              options={[
                { label: "1 → N (Pith pointing outward)", value: "outward" },
                { label: "N ← 1 (Bark pointing inward)", value: "inward" },
              ]}
              onChange={(v) => updateSection("export", { csvRingNumbering: v as any })}
            />
          </div>
        </section>
      )}

      {/* JSON CONFIG */}
      {hasResult(["json", "pretty", "polygon", "metrics", "labelme"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [JSON_STRUCTURE]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="JSON Schema"
              value={exp.jsonFormat}
              options={[
                { label: "TreeTrace Native Dump", value: "native" },
                { label: "LabelMe Strict Standard", value: "labelme" },
                { label: "Dual Emit (Both Schemas)", value: "dual" },
              ]}
              onChange={(v) => updateSection("export", { jsonFormat: v })}
            />
            <hr className="border-border my-2" />
            <SettingToggle
              label="Pretty Print"
              description="Format payload with indents (Warning: larger file size)."
              checked={exp.jsonPretty}
              onChange={(v) => updateSection("export", { jsonPretty: v })}
            />
            <SettingToggle
              label="Embed Raw Polygon Vectors"
              description="Include enormous point arrays for rendering shapes externally."
              checked={exp.jsonRawPolygon}
              onChange={(v) => updateSection("export", { jsonRawPolygon: v })}
            />
            <SettingToggle
              label="Include Calculated Metrics"
              description="Area, circumference, and eccentricity estimations."
              checked={exp.jsonMetrics}
              onChange={(v) => updateSection("export", { jsonMetrics: v })}
            />
          </div>
        </section>
      )}

      {/* IMAGE / RENDER CONFIG */}
      {hasResult(["image", "png", "render", "color scheme", "opacity", "resolution"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [IMAGE_RENDERER]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingDropdown
              label="Ring Trace Scheme"
              value={exp.pngColorScheme}
              options={[
                { label: "Age Gradient (Warm-to-Cool)", value: "warm_cool" },
                { label: "Monochrome Emerald", value: "mono_green" },
                { label: "Solid Trace (Red)", value: "solid_red" },
                { label: "Randomized Class Colors", value: "random" },
              ]}
              onChange={(v) => updateSection("export", { pngColorScheme: v })}
            />
            <hr className="border-border my-2" />
            <SettingSlider
              label="Trace Opacity"
              value={exp.pngOpacity}
              min={20}
              max={100}
              onChange={(v) => updateSection("export", { pngOpacity: v })}
              formatValue={(v) => `ALPHA: ${v}%`}
            />
            <hr className="border-border my-2" />
            <SettingToggle
              label="Burn Labels to Mask"
              description="Render string numbers natively onto the exported image."
              checked={exp.pngLabels}
              onChange={(v) => updateSection("export", { pngLabels: v })}
            />
            <SettingToggle
              label="Burn Specimen Legend"
              checked={exp.pngLegend}
              onChange={(v) => updateSection("export", { pngLegend: v })}
            />
            <hr className="border-border my-2" />
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex-1">
                <SettingRadio
                  label="Target Resolution"
                  layout="vertical"
                  value={exp.pngResolution}
                  options={[
                    { label: "1:1 Source", value: "original" },
                    { label: "2x High-DPI Upscale", value: "2x" },
                    { label: "Preview downsample (0.5x)", value: "0.5x" },
                  ]}
                  onChange={(v) => updateSection("export", { pngResolution: v })}
                />
              </div>
              <div className="flex-1">
                <SettingRadio
                  label="Background Plate"
                  layout="vertical"
                  value={exp.pngBackground}
                  options={[
                    { label: "Source Imagery", value: "original" },
                    { label: "Solid Black Mat", value: "black" },
                    { label: "Alpha Transparent", value: "transparent" },
                  ]}
                  onChange={(v) => updateSection("export", { pngBackground: v })}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PDF CONFIG */}
      {hasResult(["pdf", "report", "orientation", "branding", "author"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [PDF_SUMMARY]"}
          </h2>
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-mono text-sm text-foreground">Document Sections</span>
              <div className="flex flex-wrap gap-4 mt-2 mb-4">
                {[
                  { id: "summary", label: "Exec Summary" },
                  { id: "chart", label: "Width Plot" },
                  { id: "table", label: "Data Appendix" },
                  { id: "raw", label: "Raw JSON Print" },
                ].map(fmt => (
                  <label key={fmt.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={exp.pdfIncludeSections.includes(fmt.id)}
                      onChange={() => toggleFormatList(exp.pdfIncludeSections, fmt.id, "pdfIncludeSections")}
                      className="accent-accent bg-black border-border"
                    />
                    <span className="font-mono text-[11px] text-foreground group-hover:text-foreground">{fmt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <SettingDropdown
              label="Page Dimensions"
              value={exp.pdfPageSize}
              options={[
                { label: "A4 Standard (ISO)", value: "a4" },
                { label: "US Letter (ANSI A)", value: "letter" },
                { label: "A3 Oversize", value: "a3" },
              ]}
              onChange={(v) => updateSection("export", { pdfPageSize: v })}
            />
            <SettingRadio
              label="Orientation"
              value={exp.pdfOrientation}
              options={[
                { label: "Portrait", value: "portrait" },
                { label: "Landscape", value: "landscape" },
                { label: "Auto-Fit", value: "auto" },
              ]}
              onChange={(v) => updateSection("export", { pdfOrientation: v as any })}
            />

            <hr className="border-border my-2" />

            <SettingToggle
              label="Include TreeTrace Branding"
              description="Credit TreeTrace Engine in footer signatures."
              checked={exp.pdfBranding}
              onChange={(v) => updateSection("export", { pdfBranding: v })}
            />
            <SettingInput
              label="Lead Investigator (Author)"
              description="Watermark injected into the PDF metadata."
              value={exp.pdfAuthor}
              placeholder="e.g. Dr. Ada Lovelace"
              onChange={(v) => updateSection("export", { pdfAuthor: v })}
            />
          </div>
        </section>
      )}

      {/* LOCATION SETUP */}
      {hasResult(["location", "directory", "save", "subfolder"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [ROUTING]"}
          </h2>
          <div className="flex flex-col gap-2">
            <SettingInput
              label="Default Target Directory"
              description="Local disk routing (Electron/Desktop builds only). Web reverts to browser defaults."
              value={exp.defaultSaveLocation}
              placeholder="~/Downloads/TreeTrace_Data"
              onChange={(v) => updateSection("export", { defaultSaveLocation: v })}
            />
            <hr className="border-border my-2" />
            <SettingToggle
              label="Generate Isolated Subfolders"
              description="Auto-creates dedicated /results/[image-name]/ directories for complex outputs."
              checked={exp.autoCreateSubfolders}
              onChange={(v) => updateSection("export", { autoCreateSubfolders: v })}
            />
          </div>
        </section>
      )}

    </div>
  )
}
