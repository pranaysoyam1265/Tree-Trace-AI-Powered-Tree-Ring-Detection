"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Target, X, Edit3, Check, MapPin } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"
import { formatBytes } from "@/lib/mock-batch"

export function ConfigPanel() {
  const { state, selectImage, setImageAlias, setPith, removeImage, setImageTags } = useBatch()
  const [editingAlias, setEditingAlias] = useState(false)
  const [aliasInput, setAliasInput] = useState("")
  const [tagInput, setTagInput] = useState("")

  const img = state.images.find(i => i.id === state.selectedImageId)
  if (!img) {
    return (
      <div className="flex flex-col h-full min-h-[600px] border-2 border-dashed border-[#333333] bg-[#0a0a0a] p-8 items-center justify-center">
        <div className="w-16 h-16 border-2 border-[#333333] flex items-center justify-center mb-6">
          <div className="w-8 h-8 border-2 border-[#555555]" />
        </div>
        <h3 className="font-mono text-sm text-[#a3a3a3] font-bold uppercase tracking-[0.2em] mb-2">AWAITING SELECTION</h3>
        <p className="font-mono text-[10px] text-[#555555] text-center max-w-[250px] uppercase tracking-[0.1em]">
          Select an image from the inventory grid to configure its parameters
        </p>
      </div>
    )
  }

  const idx = state.images.findIndex(i => i.id === img.id)
  const hasPrev = idx > 0
  const hasNext = idx < state.images.length - 1

  const handlePithClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width
    const yPct = (e.clientY - rect.top) / rect.height
    const cx = Math.round(xPct * img.dimensions.width)
    const cy = Math.round(yPct * img.dimensions.height)
    setPith(img.id, cx, cy, "manual")
  }

  const saveAlias = () => {
    if (aliasInput.trim()) setImageAlias(img.id, aliasInput.trim())
    setEditingAlias(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !img.tags.includes(tagInput.trim())) {
      setImageTags(img.id, [...img.tags, tagInput.trim()])
    }
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setImageTags(img.id, img.tags.filter(t => t !== tag))
  }

  return (
    <div className="flex flex-col border-2 border-[#333333] bg-[#0d0d0d] h-full min-h-[600px]">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b-2 border-[#333333] bg-[#141414] px-4 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button disabled={!hasPrev} onClick={() => selectImage(state.images[idx - 1].id)}
              className="flex h-6 w-6 items-center justify-center border-2 border-[#333333] bg-[#0a0a0a] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] disabled:opacity-30 transition-none">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button disabled={!hasNext} onClick={() => selectImage(state.images[idx + 1].id)}
              className="flex h-6 w-6 items-center justify-center border-2 border-[#333333] bg-[#0a0a0a] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] disabled:opacity-30 transition-none">
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <span className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-[0.2em] font-bold">
            Specimen {idx + 1} / {state.images.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] border-2 ${img.pith ? "bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]" : "bg-red-500/10 text-red-500 border-red-500/50"
            }`}>
            {img.pith ? "PITH ESTABLISHED" : "REQUIRES TARGETING"}
          </span>
          <button onClick={() => removeImage(img.id)} className="text-[#555555] hover:text-red-500 transition-none">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 p-4 gap-6">
        {/* Left Column: Image Area */}
        <div className="flex flex-col flex-1 shrink-0 w-full lg:w-1/2">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-[#ea580c] font-bold uppercase tracking-[0.1em] flex items-center gap-1">
              <Target className="h-3 w-3" /> TARGET ACQUISITION
            </span>
          </div>

          <div
            className="relative w-full aspect-square border-2 border-[#333333] bg-[#000000] cursor-crosshair overflow-hidden group"
            onClick={handlePithClick}
          >
            <img src={img.thumbnailUrl} alt={img.alias} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-none" />

            {/* Crosshair Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-none">
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#ea580c]" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#ea580c]" />
            </div>

            {/* Pith marker */}
            {img.pith && (
              <div
                className="absolute"
                style={{
                  left: `${(img.pith.cx / img.dimensions.width) * 100}%`,
                  top: `${(img.pith.cy / img.dimensions.height) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative flex items-center justify-center pointer-events-none">
                  <div className="absolute h-10 w-10 border border-[#ea580c]/40" />
                  <div className="absolute h-6 w-6 border-2 border-[#ea580c]" />
                  <div className="h-1.5 w-1.5 bg-[#ea580c]" />
                </div>
              </div>
            )}

            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 border border-[#333333] font-mono text-[8px] text-[#a3a3a3] uppercase tracking-[0.1em]">
              X: {img.pith ? img.pith.cx : '---'} // Y: {img.pith ? img.pith.cy : '---'}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Features */}
        <div className="flex flex-col flex-1 gap-6 w-full lg:w-1/2 auto-rows-min">

          {/* Metadata Block */}
          <div className="border border-[#333333] bg-[#141414] p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.1em]">Specimen Designation</span>
              {editingAlias ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus value={aliasInput} onChange={e => setAliasInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveAlias()}
                    className="flex-1 bg-transparent border-b-2 border-[#ea580c] font-mono text-xs font-bold text-white outline-none px-1 py-0.5"
                  />
                  <button onClick={saveAlias} className="text-[#ea580c] p-1 border border-[#ea580c]"><Check className="h-3 w-3" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="font-mono text-sm font-bold text-white uppercase tracking-wider truncate">{img.alias}</span>
                  <button onClick={() => { setEditingAlias(true); setAliasInput(img.alias) }} className="opacity-0 group-hover:opacity-100 text-[#ea580c] hover:text-white transition-none">
                    <Edit3 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 border-l-2 border-[#333333] pl-2">
                <span className="font-mono text-[8px] text-[#555555] uppercase tracking-[0.1em]">Resolution</span>
                <span className="font-mono text-[10px] text-[#a3a3a3]">{img.dimensions.width}x{img.dimensions.height}</span>
              </div>
              <div className="flex flex-col gap-1 border-l-2 border-[#333333] pl-2">
                <span className="font-mono text-[8px] text-[#555555] uppercase tracking-[0.1em]">Footprint</span>
                <span className="font-mono text-[10px] text-[#a3a3a3]">{formatBytes(img.fileSize)}</span>
              </div>
            </div>
          </div>

          {/* Dummy Technical Analysis Block */}
          <div className="border border-[#333333] bg-[#141414] p-4 flex flex-col gap-3">
            <span className="font-mono text-[9px] text-[#ea580c] uppercase font-bold tracking-[0.1em] border-b border-[#333333] pb-2">PRE-SCAN METRICS</span>

            <div className="flex items-end gap-1 h-12 w-full pt-2">
              {[...Array(24)].map((_, i) => {
                const h = Math.random() * 80 + 20;
                return (
                  <div key={i} className="flex-1 bg-[#333333]" style={{ height: `${h}%` }} />
                )
              })}
            </div>

            <div className="flex justify-between font-mono text-[8px] text-[#555555] pt-1">
              <span>0.0 Hz</span>
              <span>LUMA HISTOGRAM</span>
              <span>255.0 Hz</span>
            </div>
          </div>

          {/* Tags Block */}
          <div className="border border-[#333333] bg-[#141414] p-4 flex flex-col gap-3">
            <span className="font-mono text-[9px] text-[#a3a3a3] uppercase tracking-[0.1em]">Classification Tags</span>

            <div className="flex flex-wrap gap-2">
              {img.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-[#0a0a0a] px-2 py-1 font-mono text-[9px] text-white border border-[#333333] uppercase">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-[#555555] hover:text-red-500 ml-1"><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
            </div>

            <input
              value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTag()}
              placeholder="APPEND TAG [ENTER]"
              className="w-full bg-[#0a0a0a] border border-[#333333] font-mono text-[9px] text-white outline-none placeholder:text-[#555555] focus:border-[#ea580c] px-2 py-1.5 uppercase"
            />
          </div>

        </div>
      </div>
    </div>
  )
}
