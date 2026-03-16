"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, Check, X, ExternalLink, Activity } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"
import type { BatchImage } from "@/lib/mock-batch"

type SortField = "alias" | "rings" | "time" | "precision"
type SortOrder = "asc" | "desc"

export function ResultsTable() {
  const { state } = useBatch()
  const [sortField, setSortField] = useState<SortField>("alias")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const allWithResults = state.images.filter(i => i.status === "completed" || i.status === "failed")

  const sorted = useMemo(() => {
    return [...allWithResults].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "alias": cmp = a.alias.localeCompare(b.alias); break
        case "rings": cmp = (a.result?.ringCount || 0) - (b.result?.ringCount || 0); break
        case "time": cmp = (a.processingTime || 0) - (b.processingTime || 0); break
        case "precision": cmp = (a.result?.metrics.precision || 0) - (b.result?.metrics.precision || 0); break
      }
      return sortOrder === "asc" ? cmp : -cmp
    })
  }, [allWithResults, sortField, sortOrder])

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(o => o === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortOrder("asc") }
  }

  if (sorted.length === 0) return null

  return (
    <div className="border-2 border-[#333333] bg-[#0a0a0a]">
      <div className="px-5 py-4 border-b-2 border-[#333333] bg-[#141414]">
        <span className="font-mono text-xs font-bold text-white uppercase tracking-[0.1em]">
          EVALUATION LEDGER
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-brutalist">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1a1a1a] border-b-2 border-[#333333]">
            <tr>
              {[
                { key: "alias" as const, label: "Designation" },
                { key: "rings" as const, label: "Rings" },
                { key: "precision" as const, label: "Confidence" },
                { key: "time" as const, label: "Execution" },
              ].map(col => (
                <th key={col.key} className="p-3 border-r-2 border-[#333333] last:border-r-0">
                  <button onClick={() => toggleSort(col.key)} className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-[0.15em] text-[#a3a3a3] hover:text-[#ea580c] transition-none w-full">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3 ml-auto" />
                  </button>
                </th>
              ))}
              <th className="p-3 font-mono text-[10px] uppercase font-bold tracking-[0.15em] text-[#a3a3a3] text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {sorted.map((img, idx) => (
              <ResultRow key={img.id} image={img} index={idx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ResultRow({ image, index }: { image: BatchImage; index: number }) {
  const isOk = image.status === "completed"

  return (
    <tr className="border-b border-[#333333] hover:bg-[#141414] transition-none">
      <td className="p-3 border-r-2 border-[#333333]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex-shrink-0 border-2 border-[#333333] bg-[#000]">
            <img src={image.thumbnailUrl} alt={image.alias} className="w-full h-full object-cover grayscale opacity-80" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isOk ? <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" /> : <X className="h-3.5 w-3.5 text-red-500 font-bold" />}
              <span className="text-xs font-bold text-white uppercase">{image.alias}</span>
            </div>
            {image.tags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {image.tags.slice(0, 2).map(t => (
                  <span key={t} className="text-[8px] text-[#555555] uppercase tracking-wider">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="p-3 border-r-2 border-[#333333]">
        {isOk && image.result ? (
          <span className="text-sm font-bold text-emerald-500 flex items-center gap-2">
            <Activity className="h-4 w-4" /> {image.result.ringCount}
          </span>
        ) : (
          <span className="text-xs text-[#555555]">---</span>
        )}
      </td>
      <td className="p-3 border-r-2 border-[#333333]">
        {isOk && image.result?.metrics ? (
          <span className="text-xs text-[#a3a3a3]">{(image.result.metrics.precision * 100).toFixed(1)}%</span>
        ) : (
          <span className="text-xs text-[#555555]">---</span>
        )}
      </td>
      <td className="p-3 border-r-2 border-[#333333]">
        <span className="text-xs text-[#a3a3a3] tabular-nums">{image.processingTime ? `${image.processingTime}s` : "---"}</span>
      </td>
      <td className="p-3 text-right">
        {isOk && image.result ? (
          <a
            href={`/results/${image.result.id}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#ea580c] hover:text-white transition-none"
          >
            [ OPEN ] <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </td>
    </tr>
  )
}
