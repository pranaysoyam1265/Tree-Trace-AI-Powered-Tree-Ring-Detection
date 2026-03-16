"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Download } from "lucide-react"

interface Props {
  overlayImageBase64: string | null
  imageName: string
}

export function OverlayPngCard({ overlayImageBase64, imageName }: Props) {
  const [collapsed, setCollapsed] = useState(true)

  // For demo: we show a placeholder message since no real image is available
  const hasImage = !!overlayImageBase64

  const handleDownload = () => {
    if (!overlayImageBase64) {
      alert("Overlay PNG will be available when connected to the analysis API.")
      return
    }
    const link = document.createElement("a")
    link.href = overlayImageBase64.startsWith("data:") ? overlayImageBase64 : `data:image/png;base64,${overlayImageBase64}`
    link.download = `${imageName.replace(/\.[^.]+$/, '')}_ring_overlay.png`
    link.click()
  }

  return (
    <div className="border border-border bg-background flex flex-col relative">
      {/* Toggle Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border hover:bg-surface/80 transition-none"
      >
        <span className="font-mono text-xs uppercase font-bold text-muted-foreground tracking-[1px]">
          {collapsed ? 'SHOW RENDERED PNG ▾' : 'HIDE RENDERED PNG ▴'}
        </span>
        {collapsed ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronUp className="h-3 w-3 text-muted-foreground" />}
      </button>

      {!collapsed && (
        <div className="flex flex-col">
          {/* Image Container */}
          <div className="p-4">
            {hasImage ? (
              <img
                src={overlayImageBase64!.startsWith("data:") ? overlayImageBase64! : `data:image/png;base64,${overlayImageBase64}`}
                alt="Ring overlay visualization"
                className="w-full border border-border"
              />
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-border flex items-center justify-center">
                <div className="text-center flex flex-col gap-2">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-[1px]">
                    OVERLAY PREVIEW
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground max-w-xs">
                    Rendered PNG will appear here when connected to the analysis backend.
                    The interactive canvas above shows the same visualization.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-xs font-bold text-accent uppercase tracking-[1px] hover:bg-accent hover:text-white transition-colors"
            >
              <Download className="h-3 w-3" />
              [▸ DOWNLOAD OVERLAY PNG]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
