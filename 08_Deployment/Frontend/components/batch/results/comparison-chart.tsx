"use client"

import { useBatch } from "@/lib/contexts/batch-context"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"

export function ComparisonChart() {
  const { state } = useBatch()
  const completed = state.images.filter(i => i.status === "completed" && i.result)

  if (completed.length === 0) return null

  const data = completed.map(img => ({
    name: img.alias,
    rings: img.result!.ringCount,
    time: img.processingTime || 0,
  }))

  const maxRings = Math.max(...data.map(d => d.rings))

  return (
    <div className="border-2 border-[#333333] bg-[#0d0d0d] p-5">
      <div className="flex items-end justify-between mb-6 border-b-2 border-[#333333] pb-2">
        <span className="font-mono text-sm font-bold text-white uppercase tracking-[0.1em]">
          RING COUNT DISTRIBUTION
        </span>
        <span className="font-mono text-[10px] uppercase font-bold text-[#a3a3a3]">
          [ {completed.length} SAMPLES ]
        </span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fontFamily: "monospace", fill: "#a3a3a3" }}
              axisLine={{ stroke: "#333333", strokeWidth: 2 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "monospace", fill: "#a3a3a3" }}
              axisLine={{ stroke: "#333333", strokeWidth: 2 }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "2px solid #ea580c",
                borderRadius: 0,
                fontFamily: "monospace",
                fontSize: 11,
                color: "#ea580c",
              }}
              itemStyle={{ color: "#ffffff", fontWeight: "bold" }}
              labelStyle={{ color: "#ea580c", fontFamily: "monospace", fontSize: 10, marginBottom: 4 }}
              cursor={{ fill: 'rgba(234, 88, 12, 0.1)' }}
            />
            <Bar dataKey="rings" radius={[0, 0, 0, 0]} animationDuration={1200}>
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={`color-mix(in srgb, #ea580c ${(0.3 + (entry.rings / maxRings) * 0.7) * 100}%, transparent)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
