import { DendroLabProvider } from "@/lib/contexts/dendrolab-context"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "DendroLab Workstation - TreeTrace",
  description: "Comprehensive dendrochronology analysis pipeline.",
}

export default function DendroLabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DendroLabProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-white font-mono selection:bg-[#ea580c] selection:text-white pb-32">
        {children}
      </div>
    </DendroLabProvider>
  )
}
