"use client"

import React, { useState } from "react"
import { SettingInput } from "../controls/setting-input"
import { CheckCircle2, ChevronRight, Fingerprint, HelpCircle, Mail, MapPin } from "lucide-react"

export function AccountSettings({ searchQuery }: { searchQuery: string }) {
  const [email, setEmail] = useState("dr.researcher@university.edu")

  const matches = (text: string) => text.toLowerCase().includes(searchQuery.toLowerCase())
  const hasResult = (keywords: string[]) => !searchQuery || keywords.some(matches)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-10">

      {/* IDENTITY_AND_SECURITY */}
      {hasResult(["identity", "email", "security", "password", "authentication", "2fa"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4 flex items-center gap-2">
            <Fingerprint size={12} />
            {"// [IDENTITY_MATRIX]"}
          </h2>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <SettingInput
                  label="Primary Email Address"
                  description="Used for secure authentication and system reports."
                  type="email"
                  value={email}
                  onChange={setEmail}
                />
              </div>
              <button
                className="h-[34px] px-4 shrink-0 rounded-none border border-border bg-white/5 font-mono text-xs text-foreground hover:bg-white/10 transition-colors"
                disabled={email === "dr.researcher@university.edu"}
              >
                Send Verification
              </button>
            </div>

            <div className="border border-border rounded-none-none p-4 bg-white/[0.01]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-mono text-sm text-foreground">Authentication Strategy</h3>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">Enhance your node security with a cryptographic signature step.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-accent/10 text-accent hover:bg-accent/20 font-mono text-xs border border-accent/20 transition-colors">
                  Setup 2FA <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-border pt-6">
              <div>
                <h3 className="font-mono text-sm text-foreground">Access Key Rotation</h3>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">Last rotated 42 days ago.</p>
              </div>
              <button className="px-4 py-1.5 rounded-none border border-border bg-transparent text-foreground hover:bg-white/5 font-mono text-xs transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CLOUD WORKSPACE PLAN */}
      {hasResult(["plan", "subscription", "cloud", "license", "billing", "quota"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4 flex items-center gap-2">
            <MapPin size={12} />
            {"// [WORKSPACE_LICENSE]"}
          </h2>

          <div className="rounded-lg border border-accent/20 bg-accent/[0.02] p-6 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 blur-3xl rounded-none-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-mono text-xl text-accent font-bold">RESEARCHER PRO</h3>
                  <span className="bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-none text-[9px] uppercase tracking-wider font-mono">
                    Active
                  </span>
                </div>
                <p className="font-mono text-[11px] text-foreground max-w-sm mb-4">
                  Academic license granted via University Consortium. Infinite cloud processing up to 300 batches per month.
                </p>

                <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-accent" /> GPU Pipeline Priority</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-accent" /> 250GB Vector Storage</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-accent" /> PDF Audit Reports</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-accent" /> Direct Support Bridge</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-3 md:items-end">
                <button className="px-5 py-2 rounded-none bg-white text-black hover:bg-zinc-200 font-mono text-sm font-medium transition-colors">
                  Manage Billing
                </button>
                <button className="text-xs font-mono text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                  View Quota Limits <HelpCircle size={12} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CONNECTED SERVICES */}
      {hasResult(["integration", "connect", "github", "google", "orcid", "services", "link"]) && (
        <section>
          <h2 className="font-mono text-[10px] text-accent uppercase tracking-[2px] mb-4">
            {"// [LINKED_NODES]"}
          </h2>
          <div className="grid gap-3">
            {[
              { id: "orcid", name: "ORCID Academic Registry", status: "Connected", description: "Links publications and datasets directly to your researcher identity." },
              { id: "github", name: "GitHub Version Control", status: "Connected", description: "Allows one-click JSON pushes to remote dataset repositories." },
              { id: "google", name: "Google Drive Storage", status: "Available", description: "Direct export sink for generated outputs and batch aggregates." }
            ].map((node) => (
              <div key={node.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-none border border-border bg-background">
                <div>
                  <h3 className="font-mono text-sm text-foreground flex items-center gap-2">
                    {node.name}
                    {node.status === "Connected" && <span className="w-1.5 h-1.5 rounded-none-none bg-accent" />}
                  </h3>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1 max-w-xs">{node.description}</p>
                </div>
                <button
                  className={`mt-4 sm:mt-0 font-mono text-xs px-4 py-1.5 rounded-none border transition-colors ${node.status === "Connected"
                      ? "border-red-500/20 text-red-500 hover:bg-red-500/10"
                      : "border-accent/20 text-accent hover:bg-accent/10"
                    }`}
                >
                  {node.status === "Connected" ? "Disconnect" : "Authorize"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
