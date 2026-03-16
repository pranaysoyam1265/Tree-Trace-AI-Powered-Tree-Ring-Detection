import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="border-2 border-border bg-card p-12 text-center max-w-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/30">
          <span className="font-mono text-xl">☰</span>
        </div>
        <h1 className="font-pixel-line text-3xl font-bold text-foreground">Documentation</h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          API reference, usage guides, and technical documentation for the TreeTrace platform.
        </p>
        <p className="mt-6 font-mono text-xs text-muted-foreground/60">Coming soon</p>
        <Link href="/" className="mt-6 inline-block font-mono text-xs text-accent hover:underline">← Back to Home</Link>
      </div>
    </div>
  )
}
