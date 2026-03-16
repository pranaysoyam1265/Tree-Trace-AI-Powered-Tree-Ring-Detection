import Link from "next/link"

interface HistoryHeaderProps {
  filteredCount: number
  totalCount: number
  lastUpdated: string
}

export function HistoryHeader({ filteredCount, totalCount, lastUpdated }: HistoryHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full mb-8 border-b-2 border-[#333333] pb-6">
      <div className="flex flex-col">
        <h1 className="font-pixel text-4xl text-white uppercase tracking-wider mb-2">HISTORY</h1>
        <p className="font-mono text-sm text-[#a3a3a3] uppercase tracking-[0.1em]">
          {filteredCount === totalCount
            ? `Viewing all ${totalCount} records // Last updated: ${lastUpdated}`
            : `Showing ${filteredCount} of ${totalCount} records // Last updated: ${lastUpdated}`}
        </p>
      </div>

      <Link
        href="/analyze"
        className="shrink-0 flex items-center justify-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-xs font-bold text-accent uppercase tracking-[2px] hover:bg-accent hover:text-white transition-colors"
      >
        [+ NEW ANALYSIS]
      </Link>
    </div>
  )
}
