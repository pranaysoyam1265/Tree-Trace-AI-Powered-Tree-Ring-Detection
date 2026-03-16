"use client"

import React from "react"
import { Activity, Bell, FileDown, Keyboard, Lock, Monitor, Shield, Sliders, User, Zap } from "lucide-react"

export type SettingsSection =
  | "general"
  | "appearance"
  | "analysis"
  | "export"
  | "notifications"
  | "privacy"
  | "data"
  | "keyboard"
  | "advanced"
  | "account"

interface SettingsSidebarProps {
  activeSection: SettingsSection
  onChangeSection: (section: SettingsSection) => void
}

const SECTIONS: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Sliders size={14} /> },
  { id: "appearance", label: "Appearance", icon: <Monitor size={14} /> },
  { id: "analysis", label: "Analysis Defaults", icon: <Activity size={14} /> },
  { id: "export", label: "Export & Output", icon: <FileDown size={14} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
  { id: "privacy", label: "Privacy & Security", icon: <Shield size={14} /> },
  { id: "data", label: "Data Management", icon: <Lock size={14} /> },
  { id: "keyboard", label: "Keyboard Shortcuts", icon: <Keyboard size={14} /> },
  { id: "advanced", label: "Advanced", icon: <Zap size={14} /> },
  { id: "account", label: "Account", icon: <User size={14} /> },
]

export function SettingsSidebar({ activeSection, onChangeSection }: SettingsSidebarProps) {
  return (
    <nav className="w-full md:w-60 shrink-0 flex flex-col border-r border-border bg-background overflow-y-auto hidden md:flex">
      <div className="p-4 pt-5 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-accent flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-none-none bg-accent/70" />
          SYSTEM_CONFIG
        </span>
      </div>

      <div className="flex-1 py-4 px-3 flex flex-col gap-1">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id
          return (
            <button
              key={section.id}
              onClick={() => onChangeSection(section.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-none-none text-left transition-all font-mono text-xs w-full group ${isActive
                  ? "bg-accent/10 text-accent border-l-4 border-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
                }`}
            >
              <div className={`${isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground transition-colors"}`}>
                {section.icon}
              </div>
              {section.label}
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-2 mb-1 text-muted-foreground">
          <Shield size={10} />
          <span className="font-mono text-[9px] uppercase">Connection Secure</span>
        </div>
        <div className="font-mono text-[9px] text-muted-foreground">v2.1.0-beta.4</div>
      </div>
    </nav>
  )
}
