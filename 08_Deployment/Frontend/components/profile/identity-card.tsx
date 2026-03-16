"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { Pencil } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   IDENTITY CARD — Profile dossier info, avatar, edit mode
   ═══════════════════════════════════════════════════════════════════ */

export function IdentityCard() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)

  // Edit state
  const [name, setName] = useState(user?.name ?? "")
  const [role, setRole] = useState(user?.role ?? "")
  const [institution, setInstitution] = useState(user?.institution ?? "")
  const [location, setLocation] = useState(user?.location ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")

  if (!user) return null

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
  const memberDays = Math.floor((Date.now() - new Date(user.memberSince).getTime()) / 86400000)
  const memberDateStr = new Date(user.memberSince).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  // Profile completeness
  const fields = [user.name, user.email, user.role, user.institution, user.location, user.bio, user.avatar]
  const filled = fields.filter(Boolean).length
  const completeness = Math.round((filled / fields.length) * 100)

  const handleSave = () => {
    // In a real app we'd call an API. For now, just exit edit mode.
    // We could update the mock context here if we extended it.
    setEditing(false)
  }

  return (
    <div className="relative rounded-lg border border-border bg-[var(--bg-base)] p-6 overflow-hidden">
      {/* HUD Background elements */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent/30" />

      {/* Header label */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs uppercase tracking-[2px] text-accent">
          {"// OPERATOR DOSSIER"}
        </span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors"
          >
            <Pencil size={12} />
            <span className="font-mono text-xs uppercase tracking-wider">Edit</span>
          </button>
        )}
      </div>

      {/* Avatar with completeness ring */}
      <div className="mb-6 flex justify-center">
        <div className="relative group cursor-pointer">
          {/* Completeness ring */}
          <svg width="132" height="132" viewBox="0 0 132 132" className="absolute -inset-1.5">
            <circle cx="66" cy="66" r="63" fill="none" stroke="var(--color-border-default)" strokeWidth="2" />
            <circle
              cx="66" cy="66" r="63"
              fill="none" stroke="var(--color-accent)" strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 63}`}
              strokeDashoffset={`${2 * Math.PI * 63 * (1 - completeness / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 66 66)"
              className="transition-all duration-700"
            />
          </svg>

          {/* Avatar (120px) */}
          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-[var(--color-accent-dark)] ring-2 ring-accent/30 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-mono text-3xl font-bold text-text-inverse">{initials}</span>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-mono text-xs uppercase tracking-wider text-accent">Change</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info / Edit Form */}
      <div className="text-center mb-6">
        {editing ? (
          <div className="flex flex-col gap-3 text-left">
            <div>
              <label className="mb-1 block font-mono text-[10px] text-muted-foreground/60 uppercase">Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded border border-border/50 bg-card px-3 py-2 font-mono text-sm text-text-accent focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] text-muted-foreground/60 uppercase">Role / Title</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Dendrochronology Researcher"
                className="w-full rounded border border-border/50 bg-card px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] text-muted-foreground/60 uppercase">Institution</label>
              <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. Forest Research Institute"
                className="w-full rounded border border-border/50 bg-card px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] text-muted-foreground/60 uppercase">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Dehradun, India"
                className="w-full rounded border border-border/50 bg-card px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground/60 uppercase">
                <span>Bio</span>
                <span>{bio.length}/160</span>
              </label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short bio..." maxLength={160} rows={3}
                className="w-full rounded border border-border/50 bg-card px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none resize-none" />
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-mono text-2xl font-bold text-text-accent mb-1 tracking-tight">{user.name}</h2>
            <p className="font-mono text-sm mb-3 text-muted-foreground">{user.email}</p>

            {(user.role || user.institution) && (
              <div className="mb-3">
                {user.role && <p className="font-mono text-sm text-accent font-semibold">{user.role}</p>}
                {user.institution && <p className="font-mono text-xs text-muted-foreground mt-0.5">{user.institution}</p>}
              </div>
            )}

            {user.location && (
              <p className="font-mono text-xs text-muted-foreground/60 flex items-center justify-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                {user.location}
              </p>
            )}

            {user.bio && (
              <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                {user.bio}
              </p>
            )}
          </>
        )}
      </div>

      {/* Member Metadata */}
      {!editing && (
        <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--bg-void)]/30 p-3 mb-4">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-[var(--color-border-subtle)]">
            <span className="font-mono text-xs text-muted-foreground/60 uppercase">Member Since</span>
            <span className="font-mono text-xs text-muted-foreground">{memberDateStr} <span className="text-muted-foreground/60">({memberDays}d)</span></span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground/60 uppercase">Plan</span>
            <span className="font-mono text-xs text-accent uppercase flex items-center gap-2">
              {user.plan}
              {user.plan === "free" && <button className="text-[11px] text-[var(--color-accent-dark)] hover:text-accent transition-colors">Upgrade →</button>}
            </span>
          </div>
        </div>
      )}

      {/* Edit Actions */}
      {editing && (
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 rounded bg-accent py-2.5 font-mono text-sm hover:bg-[var(--color-accent-hover)] text-text-inverse transition-colors font-semibold">
            Save Profile
          </button>
          <button onClick={() => setEditing(false)} className="flex-1 rounded border border-border/50 py-2.5 font-mono text-sm hover:bg-bg-modifier-hover transition-colors">
            Cancel
          </button>
        </div>
      )}

      {/* Footer ID */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] flex justify-between items-center">
        <span className="font-mono text-[11px] text-muted-foreground/60">ID: {user.id}</span>
        <span className="font-mono text-[11px] text-muted-foreground/60">COMPLETENESS: {completeness}%</span>
      </div>
    </div>
  )
}
