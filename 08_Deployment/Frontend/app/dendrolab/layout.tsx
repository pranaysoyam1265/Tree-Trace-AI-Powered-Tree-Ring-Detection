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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono selection:bg-[#ea580c] selection:text-white pb-32">
      {children}
    </div>
  )
}
