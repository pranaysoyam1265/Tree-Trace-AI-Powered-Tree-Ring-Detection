import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 dot-grid-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/[0.02] blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/[0.01] blur-[80px] pointer-events-none rounded-full" />

      <div className="w-full max-w-sm border-2 border-border bg-surface/90 backdrop-blur-sm p-8 relative z-10 shadow-[8px_8px_0_0_rgba(234,88,12,0.15)]">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-accent" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent" />

        <div className="mb-8 text-center border-b border-border/50 pb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xl tracking-[4px] text-foreground font-bold hover:text-accent transition-colors">
            <span className="text-accent animate-pulse">█</span> TREETRACE
          </Link>
          <div className="mt-6 flex flex-col gap-1 items-center">
            <h1 className="font-mono text-sm uppercase tracking-[2px] font-bold text-accent">
              {"// SYSTEM_LOGIN"}
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[1px]">
              AUTHENTICATION REQUIRED
            </p>
          </div>
        </div>

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground">
              [USER_IDENTIFIER]
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@university.edu"
              className="rounded-none border-2 border-border/50 bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground flex justify-between">
              <span>[ACCESS_KEY]</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="rounded-none border-2 border-border/50 bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent tracking-widest"
            />
          </div>
          <button
            type="submit"
            className="mt-4 border-2 border-accent bg-accent px-4 py-3 font-mono text-sm uppercase tracking-[2px] font-bold text-background transition-all hover:bg-transparent hover:text-accent shadow-[4px_4px_0_0_rgba(234,88,12,0.3)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            [INITIATE_SESSION]
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">
          UNAUTHORIZED ACCESS?{" "}
          <Link href="/signup" className="text-accent hover:border-b hover:border-accent pb-0.5 transition-all">
            REQUEST CLEARANCE
          </Link>
        </p>
      </div>
    </div>
  )
}
