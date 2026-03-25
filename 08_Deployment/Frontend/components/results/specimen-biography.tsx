"use client"

import type { AnalysisResult } from "@/lib/types"
import { BookOpen, Sprout, Layers, AlertTriangle, HeartPulse } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface Props {
  result: AnalysisResult
}

/* ── Section wrapper with icon ── */
function Section({ icon: Icon, title, children, className }: { icon: React.ElementType; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("py-5 border-b border-border/20 last:border-0", className)}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 border border-accent/30 bg-accent/5 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-accent" />
        </div>
        <span className="font-pixel text-sm uppercase text-accent tracking-wider">{title}</span>
      </div>
      <div className="pl-[38px]">
        {children}
      </div>
    </div>
  )
}

/* ── Main Component ── */
export function SpecimenBiography({ result }: Props) {
  const { statistics: stats, trend, phases, anomalies, health, ring_count, estimated_age, birth_year } = result

  const stressEvents = anomalies.filter(a => a.type.includes('stress'))
  const favorableEvents = anomalies.filter(a => !a.type.includes('stress'))

  // Build the narrative text sections
  const overviewText = `This specimen spans **${estimated_age} annual growth rings**, with cambial establishment estimated at **~${birth_year}**. Over the observed period the mean radial increment was **${stats.mean.toFixed(2)} px/year** (σ = ${stats.std.toFixed(2)}, CV = ${stats.cv_percent.toFixed(1)}%). The long-term growth trajectory exhibits a **${trend.direction.toLowerCase()}** trend (slope ${trend.slope.toFixed(3)} px/yr), indicating ${trend.interpretation.toLowerCase()}`

  const phaseLines = phases.length > 0
    ? phases.map(p => `**${p.name}** (${p.years}): avg. width ${p.avg_width.toFixed(1)} px/yr${p.description ? ' — ' + p.description : ''}`).join('\n\n')
    : 'No distinct ontogenetic phases were identified in the ring-width series.'

  const stressText = stressEvents.length > 0
    ? `The chronology records **${stressEvents.length} acute stress episodes** (putative drought, frost damage, or pathogenic events), most notably in: **${stressEvents.slice(0, 8).map(a => a.year).join(', ')}**.`
    : 'The specimen chronology is remarkably consistent, exhibiting minimal severe stress anomalies throughout its lifespan.'

  const favorableText = favorableEvents.length > 0
    ? `Conversely, **${favorableEvents.length} years** demonstrated exceptional radial growth indicative of optimal climatic conditions or successful canopy release.`
    : ''

  const anomalyRate = ((anomalies.length / ring_count) * 100).toFixed(1)
  const anomalyText = `${stressText}${favorableText ? ' ' + favorableText : ''} Overall anomaly frequency is **${anomalyRate}%** of the total ring count.`

  const healthText = `Based on cumulative growth consistency indices and post-stress recovery analysis, the aggregate physiological status is classified as **${health.label.toUpperCase()}** (Health Index: **${health.score}/100**). Sub-component scores: Growth Rate ${health.components.growth_rate}/100, Consistency ${health.components.consistency}/100, Stress Resistance ${health.components.stress_resistance}/100, Recovery Ability ${health.components.recovery_ability}/100. ${health.detail}`

  return (
    <div className="border-[3px] border-border bg-background flex flex-col relative w-full mb-6 shadow-[6px_6px_0px_#111111] dark:shadow-[6px_6px_0px_#000000]">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-[3px] border-l-[3px] border-accent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-[3px] border-r-[3px] border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-[3px] border-l-[3px] border-accent z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[3px] border-r-[3px] border-accent z-20 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b-[3px] border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs uppercase font-bold text-accent tracking-[1px]">
            [SPECIMEN_BIOGRAPHY]
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
          SCIENTIFIC ABSTRACT
        </span>
      </div>

      {/* Content */}
      <div className="px-6 md:px-10 py-4 bg-surface/5">

        {/* Overview */}
        <Section icon={Sprout} title="Overview">
          <ReactMarkdown components={{
            p: ({ node, ...props }) => <p className="font-mono text-[12px] leading-[1.9] text-muted-foreground" {...props} />,
            strong: ({ node, ...props }) => <strong className="text-foreground font-bold" {...props} />,
          }}>
            {overviewText}
          </ReactMarkdown>
        </Section>

        {/* Growth Phases */}
        <Section icon={Layers} title="Ontogenetic Phases">
          <ReactMarkdown components={{
            p: ({ node, ...props }) => <p className="font-mono text-[12px] leading-[1.9] text-muted-foreground mb-2" {...props} />,
            strong: ({ node, ...props }) => <strong className="text-foreground font-bold" {...props} />,
          }}>
            {phaseLines}
          </ReactMarkdown>
        </Section>

        {/* Stress & Anomalies */}
        <Section icon={AlertTriangle} title="Stress & Anomalies">
          <ReactMarkdown components={{
            p: ({ node, ...props }) => <p className="font-mono text-[12px] leading-[1.9] text-muted-foreground" {...props} />,
            strong: ({ node, ...props }) => <strong className="text-foreground font-bold" {...props} />,
          }}>
            {anomalyText}
          </ReactMarkdown>
        </Section>

        {/* Physiological Status */}
        <Section icon={HeartPulse} title="Physiological Status" className="border-0">
          <ReactMarkdown components={{
            p: ({ node, ...props }) => <p className="font-mono text-[12px] leading-[1.9] text-muted-foreground" {...props} />,
            strong: ({ node, ...props }) => <strong className="text-foreground font-bold" {...props} />,
          }}>
            {healthText}
          </ReactMarkdown>
          {/* Health Indicator Bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-full h-2 bg-border/30 relative">
              <div
                className={cn(
                  "absolute top-0 left-0 h-full transition-all",
                  health.score >= 80 ? "bg-status-success" : health.score >= 60 ? "bg-yellow-500" : health.score >= 40 ? "bg-orange-500" : "bg-status-error"
                )}
                style={{ width: `${health.score}%` }}
              />
            </div>
            <span className={cn(
              "font-mono text-sm font-bold tabular-nums shrink-0",
              health.score >= 80 ? "text-status-success" : health.score >= 60 ? "text-yellow-500" : health.score >= 40 ? "text-orange-500" : "text-status-error"
            )}>
              {health.score}/100
            </span>
          </div>
        </Section>

      </div>
    </div>
  )
}
