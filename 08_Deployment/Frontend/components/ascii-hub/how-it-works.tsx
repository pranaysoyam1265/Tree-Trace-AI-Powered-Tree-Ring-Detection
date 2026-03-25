"use client"

import { Upload, Crosshair, BarChart3, ScanLine } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "UPLOAD SPECIMEN",
      desc: "Upload a high-resolution top-down image of your tree cross-section slice. Works best with clean, sanded surfaces.",
      icon: Upload
    },
    {
      num: "02",
      title: "MARK THE PITH",
      desc: "Identify the biological center (pith). The CS-TRD algorithm uses this origin to project radial gradients outwards.",
      icon: Crosshair
    },
    {
      num: "03",
      title: "LET AI DECODE",
      desc: "Our automated pipeline detects ring boundaries, validates continuously, and extracts exact chronological ring widths.",
      icon: ScanLine
    },
    {
      num: "04",
      title: "ANALYZE RESULTS",
      desc: "Review ring count, estimated age, climatic growth trends, and health scores, generated in interactive visualization panels.",
      icon: BarChart3
    }
  ]

  return (
    <section className="relative bg-[#050505] border-y border-[#222] py-24 overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ea580c 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#333333] bg-[#0a0a0a] px-3 py-1 font-mono text-[10px] text-[#ea580c] uppercase tracking-[0.2em] mb-4">
              <span className="inline-block w-1.5 h-1.5 bg-[#ea580c]" />
              PIPELINE ARCHITECTURE
            </div>
            <h2 className="font-pixel text-3xl md:text-5xl tracking-wider text-white uppercase">
              HOW IT WORKS
            </h2>
          </div>
          <p className="font-mono text-sm text-[#888] tracking-[0.05em] uppercase max-w-md">
            From raw specimen to extracted chronological data in four automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.num}
                className="relative group border border-[#222] bg-[#0a0a0a] p-6 hover:border-[#ea580c]/50 transition-colors"
              >
                {/* Number Watermark */}
                <div className="absolute top-4 right-4 font-pixel text-6xl text-[#1a1a1a] group-hover:text-[#222] transition-colors pointer-events-none select-none">
                  {step.num}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 flex items-center justify-center border border-[#333] mb-6 bg-[#111] group-hover:bg-[#ea580c]/10 group-hover:border-[#ea580c]/30 transition-colors">
                    <Icon className="w-5 h-5 text-[#ea580c]" />
                  </div>

                  <h3 className="font-mono text-sm font-bold text-white tracking-[0.1em] uppercase mb-3">
                    {step.title}
                  </h3>

                  <p className="font-mono text-[11px] leading-relaxed text-[#888]">
                    {step.desc}
                  </p>

                  {/* Subtle connector logic visible on large screens */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-[50%] -right-[15px] w-[6px] h-[1px] bg-[#ea580c]" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
