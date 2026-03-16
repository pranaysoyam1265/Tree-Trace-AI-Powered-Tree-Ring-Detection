import React from "react"
import { Navigation } from "@/components/ascii-hub/navigation"

export default function ColorsPlayground() {
  return (
    <main className="min-h-screen relative font-mono selection:bg-accent selection:text-text-inverse animate-in fade-in duration-300">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-10">
          <h1 className="text-3xl font-pixel text-text-accent mb-2">Color System Playground</h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            This workspace displays all configured CSS custom properties for the active theme. Switch themes in <span className="text-text-terminal px-1 py-0.5 bg-card rounded">/settings</span> to see these values cascade globally.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Column 1 */}
          <div className="flex flex-col gap-10">

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 border-b border-border pb-2 mb-4">Backgrounds & Layers</h2>
              <div className="flex flex-col gap-0.5 rounded-lg overflow-hidden border border-border">
                <ColorRow name="bg-void" cssVar="var(--bg-void)" desc="Deepest foundation layer / html background" bgClass="bg-background dot-grid-bg scanline-overlay" />
                <ColorRow name="bg-base" cssVar="var(--bg-base)" desc="Primary application background" bgClass="bg-background" />
                <ColorRow name="bg-raised" cssVar="var(--bg-raised)" desc="Cards and elevated containers" bgClass="bg-bg-raised" />
                <ColorRow name="bg-surface" cssVar="var(--bg-surface)" desc="Interactive surfaces, inputs" bgClass="bg-card" />
                <ColorRow name="bg-overlay" cssVar="var(--bg-overlay)" desc="Modals and floating menus" bgClass="bg-bg-overlay" />
                <ColorRow name="bg-highlight" cssVar="var(--bg-highlight)" desc="Selected/Active states" bgClass="bg-bg-highlight" />
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 border-b border-border pb-2 mb-4">Typography Hierarchy</h2>
              <div className="p-6 rounded-lg bg-bg-raised border border-border flex flex-col gap-4">
                <p className="text-2xl text-text-accent">Primary text — Headers and emphasis.</p>
                <p className="text-base text-muted-foreground">Secondary text — Body paragraphs and standard readable material.</p>
                <p className="text-sm text-muted-foreground/60">Tertiary text — Helper text, datestamps, and minor labels.</p>
                <p className="text-sm text-text-disabled">Disabled text — Inactive states and unselectable items.</p>

                <div className="mt-4 p-4 bg-card border border-border/50 rounded flex flex-col gap-2">
                  <p className="font-pixel text-text-terminal text-lg">Terminal Output text.</p>
                  <p className="text-text-terminal-dim text-sm">Dimmed terminal text / comments.</p>
                  <p className="text-text-mono text-sm">Standard monospace data strings (JSON, CSV).</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 border-b border-border pb-2 mb-4">Theme Accents</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-bg-raised flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent shadow-[0_0_20px_var(--color-accent)]" />
                  <p className="text-xs text-muted-foreground">Primary Accent</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-bg-raised flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent-secondary" />
                  <p className="text-xs text-muted-foreground">Secondary Accent</p>
                </div>
              </div>
            </section>

          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-10">

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 border-b border-border pb-2 mb-4">Status & Logic</h2>
              <div className="flex flex-col gap-3">
                <StatusRow name="Success" color="var(--status-success)" bg="var(--status-success-bg)" text="var(--status-success-text)" />
                <StatusRow name="Warning" color="var(--status-warning)" bg="var(--status-warning-bg)" text="var(--status-warning-text)" />
                <StatusRow name="Error" color="var(--status-error)" bg="var(--status-error-bg)" text="var(--status-error-text)" />
                <StatusRow name="Info" color="var(--status-info)" bg="var(--status-info-bg)" text="var(--status-info-text)" />
                <StatusRow name="Processing" color="var(--status-processing)" bg="var(--status-processing-bg)" text="var(--status-processing)" />
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 border-b border-border pb-2 mb-4">Borders & Separators</h2>
              <div className="flex flex-col gap-4 p-6 bg-background border border-border rounded-lg">
                <div className="p-4 border border-border/50 rounded text-sm text-muted-foreground">border-subtle (panels)</div>
                <div className="p-4 border border-border rounded text-sm text-text-accent">border-default (standard)</div>
                <div className="p-4 border-2 border-border-strong rounded font-medium text-text-accent">border-strong (emphasis)</div>
                <div className="p-4 border border-accent rounded text-text-terminal bg-card">border-accent (interactive)</div>
                <div className="p-4 border-2 border-accent-full rounded font-pixel text-accent">border-accent-full</div>
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 border-b border-border pb-2 mb-4">Interactive Sandbox</h2>
              <div className="p-6 bg-bg-raised border border-border rounded-lg flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Enter parameters..."
                  className="w-full bg-card border border-border rounded-md px-4 py-2 text-sm text-text-accent focus:outline-none focus:border-accent focus:ring-1 focus:ring-border-accent transition-all placeholder:text-muted-foreground/60"
                />

                <div className="flex gap-3 mt-2">
                  <button className="flex-1 bg-accent text-text-inverse font-medium text-sm py-2 rounded-md hover:opacity-90 transition-opacity">
                    Execute
                  </button>
                  <button className="flex-1 bg-card border border-border text-muted-foreground font-medium text-sm py-2 rounded-md hover:bg-bg-highlight hover:text-text-accent transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  )
}

function ColorRow({ name, cssVar, desc, bgClass }: { name: string, cssVar: string, desc: string, bgClass: string }) {
  return (
    <div className={`flex items-center gap-4 p-3 ${bgClass}`}>
      <div className="w-16 h-8 rounded border border-white/10 shadow-inner" style={{ backgroundColor: cssVar }} />
      <div className="flex-1">
        <p className="font-mono text-xs font-semibold" style={{ color: 'var(--text-accent)' }}>{name}</p>
        <p className="text-[10px] opacity-70" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
      </div>
      <code className="text-[10px] px-2 py-1 rounded bg-black/30" style={{ color: 'var(--text-tertiary)' }}>{cssVar}</code>
    </div>
  )
}

function StatusRow({ name, color, bg, text }: { name: string, color: string, bg: string, text: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded border border-border bg-bg-raised">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium" style={{ color: text }}>{name}</span>
      </div>
      <span className="text-[10px] font-mono px-2 py-1 rounded uppercase tracking-wider" style={{ backgroundColor: bg, color: text }}>
        [STATUS_OK]
      </span>
    </div>
  )
}
