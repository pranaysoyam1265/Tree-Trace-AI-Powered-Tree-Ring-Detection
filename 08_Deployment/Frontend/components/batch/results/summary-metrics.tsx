"use client"

import { Activity, CheckCircle2, Clock, Layers } from "lucide-react"
import { useBatch } from "@/lib/contexts/batch-context"

interface MetricCardProps {
  label: string
  value: number | string
  suffix?: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  borderColor: string
  sub?: string
}

function MetricCard({ label, value, suffix, icon: Icon, accent, borderColor, sub }: MetricCardProps) {
  return (
    <div className={`relative flex flex-col justify-between border-2 bg-[#0a0a0a] p-5 h-[140px] ${borderColor}`}>
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#a3a3a3] font-bold max-w-[120px] leading-tight">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div>
        <p className={`font-mono text-4xl font-black ${accent} tracking-tighter`}>
          {value}{suffix}
        </p>
        {sub && <p className="mt-1 font-mono text-[10px] text-[#555555] font-bold">{sub}</p>}
      </div>
    </div>
  )
}

export function SummaryMetrics() {
  const { state } = useBatch()
  const s = state.summary
  if (!s) return null

  const successRate = s.totalImages > 0 ? Math.round((s.successful / s.totalImages) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Rings Detected"
        value={s.totalRingsDetected}
        icon={Activity}
        accent="text-emerald-500"
        borderColor="border-emerald-500/20 hover:border-emerald-500"
        sub={`${s.averageRingsPerImage} avg per image`}
      />
      <MetricCard
        label="Success Rate"
        value={successRate}
        suffix="%"
        icon={CheckCircle2}
        accent="text-[#ea580c]"
        borderColor="border-[#ea580c]/20 hover:border-[#ea580c]"
        sub={`${s.successful}/${s.totalImages} images`}
      />
      <MetricCard
        label="Avg Processing"
        value={s.averageProcessingTime}
        suffix="s"
        icon={Clock}
        accent="text-yellow-500"
        borderColor="border-yellow-500/20 hover:border-yellow-500"
        sub={`${s.totalProcessingTime}s total`}
      />
      <MetricCard
        label="Images Analyzed"
        value={s.totalImages}
        icon={Layers}
        accent="text-white"
        borderColor="border-[#333333] hover:border-[#a3a3a3]"
        sub={s.failed > 0 ? `${s.failed} failed` : "All succeeded"}
      />
    </div>
  )
}
