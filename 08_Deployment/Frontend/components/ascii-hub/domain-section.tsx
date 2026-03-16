"use client"

import type { TechSection } from "@/lib/sections-data"
import { SectionKernel } from "./sections/section-kernel"

interface DomainSectionProps {
  section: TechSection
  index: number
}

export function DomainSection({ section }: DomainSectionProps) {
  return (
    <section id={section.id} className="relative border-b border-white/[0.04]">
      <SectionKernel section={section} />
    </section>
  )
}
