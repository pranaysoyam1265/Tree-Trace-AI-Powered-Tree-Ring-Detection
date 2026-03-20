"use client"

import { useAuth } from "@/lib/contexts/auth-context"
import { ExternalLink, Copy, Check } from "lucide-react"
import { useState } from "react"

/* ═══════════════════════════════════════════════════════════════════
   CONNECTED ACCOUNTS — External Integrations & Profile Sharing
   ═══════════════════════════════════════════════════════════════════ */

function ConnectionRow({ name, isConnected, onConnect }: { name: string; isConnected: boolean; onConnect: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-bg-modifier-hover px-2 -mx-2 rounded-none ">
      <span className="font-mono text-sm text-text-accent">{name}</span>
      {isConnected ? (
        <span className="font-mono text-xs text-accent flex items-center gap-1.5 px-2 bg-accent/10 rounded-none">
          <Check size={10} /> LINKED
        </span>
      ) : (
        <button
          onClick={onConnect}
          className="font-mono text-xs text-muted-foreground hover:text-accent  flex items-center gap-1"
        >
          NOT_LINKED <ExternalLink size={10} className="ml-0.5" />
        </button>
      )}
    </div>
  )
}

export function ConnectedAccounts() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [isPublic, setIsPublic] = useState(user?.connectedAccounts?.publicProfile ?? false)

  if (!user || !user.connectedAccounts) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(user.connectedAccounts.publicProfileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-none border border-border/50 bg-[var(--bg-surface)]/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-6 h-full">
      <span className="mb-6 block font-mono text-xs uppercase tracking-[2px] text-accent">
        {"// EXTERNAL_LINKS"}
      </span>

      <div className="mb-8">
        <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">Integrations</p>
        <div className="flex flex-col">
          <ConnectionRow name="Google" isConnected={user.connectedAccounts.google} onConnect={() => { }} />
          <ConnectionRow name="GitHub" isConnected={user.connectedAccounts.github} onConnect={() => { }} />
          <ConnectionRow name="ORCID" isConnected={user.connectedAccounts.orcid} onConnect={() => { }} />
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">Public Profile</p>

        <div className="flex items-center justify-between mb-3 border border-border/50 bg-card rounded-none pr-2 pl-3 py-2 cursor-pointer  hover:border-border" onClick={() => setIsPublic(!isPublic)}>
          <span className="font-mono text-sm text-text-accent">Make profile public</span>
          <div className={`w-8 h-4 rounded-none-none p-0.5  ${isPublic ? "bg-accent/30" : "bg-border-subtle"}`}>
            <div className={`w-3 h-3 rounded-none-none  ${isPublic ? "bg-accent translate-x-4 shadow-none" : "bg-text-tertiary translate-x-0"}`} />
          </div>
        </div>

        {isPublic && (
          <div className="  2 ">
            <p className="font-mono text-xs text-muted-foreground mb-2 leading-relaxed">
              Anyone with the link can view your basic stats and unlocked achievements.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={user.connectedAccounts.publicProfileUrl}
                className="flex-1 rounded-none border border-border/50 bg-card/50 px-2 py-1.5 font-mono text-[10px] text-text-accent focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-none border border-border/50 bg-card/50 text-muted-foreground hover:text-accent hover:border-accent/30 "
                title="Copy URL"
              >
                {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Portability (placeholder) */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <button disabled className="w-full rounded-none border border-border/50 bg-card/50 px-4 py-2 font-mono text-xs text-muted-foreground/60  cursor-not-allowed text-left flex items-center justify-between">
          Import External Analyses
          <span className="text-[9px] bg-[var(--bg-void)] px-1.5 py-0.5 rounded-none">SOON</span>
        </button>
      </div>
    </div>
  )
}
