"use client"

import { useMemo } from "react"
import { BookOpen, Leaf, Zap, BarChart3, TreePine, Calendar } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"

interface Props {
  result: AnalysisResult
}

/**
 * Parse the markdown biography string into structured sections.
 * The backend generates:  # Title, ## Headings, **bold**, *italic*, - bullets, plain text
 */
function parseBiography(raw: string) {
  const lines = raw.split("\n")
  const sections: {
    type: "title" | "subtitle" | "heading" | "text" | "bullet" | "empty"
    content: string
    raw: string
  }[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      sections.push({ type: "empty", content: "", raw: line })
    } else if (trimmed.startsWith("# ")) {
      sections.push({ type: "title", content: trimmed.replace(/^#\s+/, ""), raw: line })
    } else if (trimmed.startsWith("## ")) {
      sections.push({ type: "heading", content: trimmed.replace(/^##\s+/, ""), raw: line })
    } else if (trimmed.startsWith("- ")) {
      sections.push({ type: "bullet", content: trimmed.replace(/^-\s+/, ""), raw: line })
    } else if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.startsWith("**")) {
      sections.push({ type: "subtitle", content: trimmed.replace(/^\*+|\*+$/g, ""), raw: line })
    } else {
      sections.push({ type: "text", content: trimmed, raw: line })
    }
  }
  return sections
}

/** Render inline markdown: **bold** and *italic* */
function renderInline(text: string) {
  const parts: (string | JSX.Element)[] = []
  // Match **bold** first, then *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index} className="text-foreground font-bold">{match[2]}</strong>)
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={match.index} className="text-muted-foreground/80 italic">{match[3]}</em>)
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts
}

/** Map section heading emoji/text to a Lucide icon */
function getSectionIcon(content: string) {
  if (content.includes("🌒") || content.includes("Beginning")) return <Calendar className="h-3.5 w-3.5 text-accent" />
  if (content.includes("🌱") || content.includes("Juvenile")) return <Leaf className="h-3.5 w-3.5 text-emerald-500" />
  if (content.includes("🌳") || content.includes("Today") || content.includes("Mature")) return <TreePine className="h-3.5 w-3.5 text-green-500" />
  if (content.includes("🍂") || content.includes("Late")) return <Leaf className="h-3.5 w-3.5 text-amber-500" />
  if (content.includes("⚡") || content.includes("Notable")) return <Zap className="h-3.5 w-3.5 text-yellow-500" />
  if (content.includes("📊") || content.includes("Numbers")) return <BarChart3 className="h-3.5 w-3.5 text-accent" />
  return <BookOpen className="h-3.5 w-3.5 text-accent" />
}

/** Strip emoji from heading text for cleaner rendering */
function stripEmoji(text: string) {
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/gu, "").trim()
}

export function SpecimenBiography({ result }: Props) {
  if (!result.biography) return null

  const sections = useMemo(() => parseBiography(result.biography), [result.biography])

  // Group sections into chapters (split on headings)
  const chapters: { heading: string; icon: JSX.Element; items: typeof sections }[] = []
  let currentChapter: (typeof chapters)[0] | null = null

  for (const section of sections) {
    if (section.type === "title") {
      // Skip the main title, we render our own header
      continue
    }
    if (section.type === "subtitle") {
      // Render subtitle under the header
      continue
    }
    if (section.type === "heading") {
      if (currentChapter) chapters.push(currentChapter)
      currentChapter = {
        heading: stripEmoji(section.content),
        icon: getSectionIcon(section.content),
        items: []
      }
    } else if (section.type !== "empty") {
      if (!currentChapter) {
        currentChapter = { heading: "", icon: <BookOpen className="h-3.5 w-3.5 text-accent" />, items: [] }
      }
      currentChapter.items.push(section)
    }
  }
  if (currentChapter) chapters.push(currentChapter)

  // Extract subtitle line
  const subtitleSection = sections.find(s => s.type === "subtitle")

  return (
    <div className="border border-border bg-background flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
            SPECIMEN BIOGRAPHY
          </span>
        </div>
        {subtitleSection && (
          <span className="font-mono text-[10px] text-muted-foreground tracking-wide">
            {subtitleSection.content}
          </span>
        )}
      </div>

      {/* Chapters */}
      <div className="divide-y divide-border/50">
        {chapters.map((chapter, ci) => (
          <div key={ci} className="px-5 py-4">
            {/* Chapter Heading */}
            {chapter.heading && (
              <div className="flex items-center gap-2 mb-3">
                {chapter.icon}
                <h3 className="font-mono text-[11px] font-bold text-foreground uppercase tracking-[0.1em]">
                  {chapter.heading}
                </h3>
              </div>
            )}

            {/* Chapter Content */}
            <div className="pl-6 border-l-2 border-accent/20 flex flex-col gap-1.5">
              {chapter.items.map((item, ii) => {
                if (item.type === "bullet") {
                  return (
                    <div key={ii} className="flex items-start gap-2">
                      <span className="text-accent mt-[3px] text-[8px] flex-shrink-0">▸</span>
                      <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                        {renderInline(item.content)}
                      </p>
                    </div>
                  )
                }
                return (
                  <p key={ii} className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                    {renderInline(item.content)}
                  </p>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
