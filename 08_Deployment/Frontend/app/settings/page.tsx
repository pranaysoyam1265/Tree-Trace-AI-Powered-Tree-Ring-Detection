"use client"

import React, { useState } from "react"
import { Navigation } from "@/components/ascii-hub/navigation"
import { SettingsSidebar, SettingsSection } from "@/components/settings/settings-sidebar"
import { SettingsSearch } from "@/components/settings/settings-search"
import { useSettings } from "@/lib/settings-store"
import Link from "next/link"
import { CornerAccents } from "@/components/ui/brutal/corner-accents"

// Sections
import { GeneralSettings } from "@/components/settings/sections/general"
import { AppearanceSettings } from "@/components/settings/sections/appearance"
import { AnalysisSettings } from "@/components/settings/sections/analysis"
import { ExportSettings } from "@/components/settings/sections/export"
import { NotificationsSettings } from "@/components/settings/sections/notifications"
import { PrivacySettings } from "@/components/settings/sections/privacy"
import { DataManagementSettings } from "@/components/settings/sections/data-management"
import { KeyboardSettings } from "@/components/settings/sections/keyboard-shortcuts"
import { AdvancedSettings } from "@/components/settings/sections/advanced"
import { AccountSettings } from "@/components/settings/sections/account"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true)
  const { unsavedChanges, saveSettings, discardChanges } = useSettings()

  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section)
    setIsMobileMenuOpen(false)
    window.scrollTo({ top: 0 })
  }

  const renderSection = () => {
    switch (activeSection) {
      case "general": return <GeneralSettings searchQuery={searchQuery} />
      case "appearance": return <AppearanceSettings searchQuery={searchQuery} />
      case "analysis": return <AnalysisSettings searchQuery={searchQuery} />
      case "export": return <ExportSettings searchQuery={searchQuery} />
      case "notifications": return <NotificationsSettings searchQuery={searchQuery} />
      case "privacy": return <PrivacySettings searchQuery={searchQuery} />
      case "data": return <DataManagementSettings searchQuery={searchQuery} />
      case "keyboard": return <KeyboardSettings searchQuery={searchQuery} />
      case "advanced": return <AdvancedSettings searchQuery={searchQuery} />
      case "account": return <AccountSettings searchQuery={searchQuery} />
      default: return (
        <div className="flex items-center justify-center py-20 border-2 border-dashed border-[#333333]">
          <p className="font-mono text-[#555555] uppercase tracking-[0.15em]">SECTION [{activeSection}] UNDER CONSTRUCTION</p>
        </div>
      )
    }
  }

  const MobileHeader = () => (
    <div className="md:hidden flex items-center mb-6">
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="flex items-center gap-2 text-[#a3a3a3] hover:text-[#ea580c] transition-none font-mono text-xs uppercase tracking-[0.15em]"
      >
        [← BACK TO MENU]
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navigation />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 pt-28 pb-16 flex flex-col md:flex-row gap-6">

        {/* Mobile Menu View */}
        {isMobileMenuOpen && (
          <div className="md:hidden w-full flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center border-2 border-[#333333] bg-[#141414] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] transition-none font-mono text-xs"
              >
                ←
              </Link>
              <h1 className="font-mono text-xs text-[#a3a3a3] tracking-[0.15em] uppercase">
                <span className="text-[#ea580c]">SYSTEM_CONFIGURATION</span>
              </h1>
            </div>

            <div className="border-2 border-[#333333] bg-[#141414] overflow-hidden flex flex-col">
              <SettingsSidebar activeSection={activeSection} onChangeSection={handleSectionChange} />
              <div className="flex flex-col p-2">
                {["general", "appearance", "analysis", "export", "notifications", "privacy", "data", "keyboard", "advanced", "account"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSectionChange(s as SettingsSection)}
                    className="text-left px-4 py-3 font-mono text-xs text-[#a3a3a3] border-b-2 border-[#222222] last:border-0 hover:bg-[#1f1f1f] hover:text-[#ea580c] uppercase tracking-[0.15em] transition-none"
                  >
                    {s.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar & Content wrapper */}
        <div className={`w-full flex md:gap-8 ${isMobileMenuOpen ? 'hidden md:flex' : 'flex'}`}>

          {/* Desktop Sidebar */}
          <div className="w-64 shrink-0 hidden md:block">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-[#333333] pb-4">
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center border-2 border-[#333333] bg-[#141414] text-[#a3a3a3] hover:text-[#ea580c] hover:border-[#ea580c] transition-none font-mono text-xs"
              >
                ←
              </Link>
              <h1 className="font-mono text-xs text-[#a3a3a3] tracking-[0.15em] uppercase">
                // CONFIG
              </h1>
            </div>
            <div className="sticky top-28 h-[calc(100vh-140px)] border-2 border-[#333333] overflow-hidden">
              <SettingsSidebar activeSection={activeSection} onChangeSection={handleSectionChange} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 max-w-4xl min-w-0">
            <MobileHeader />

            <SettingsSearch onSearch={setSearchQuery} />

            <div className="relative border-2 border-[#333333] bg-[#141414]">
              <CornerAccents />
              {/* Terminal Header */}
              <div className="h-8 border-b-2 border-[#333333] bg-[#0a0a0a] flex items-center px-4 justify-between select-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#ea580c]" />
                  <div className="w-2 h-2 bg-[#333333]" />
                  <div className="w-2 h-2 bg-[#333333]" />
                </div>
                <div className="font-mono text-[10px] text-[#555555] uppercase tracking-[0.15em]">
                  tty1 : settings_{activeSection}.sh
                </div>
              </div>

              <div className="p-6">
                {renderSection()}
              </div>
            </div>

            {/* Sticky Save Dock - Right Aligned to Settings Page */}
            {unsavedChanges > 0 && (
              <div className="sticky bottom-6 ml-auto mt-6 z-50 border-2 border-[#333333] bg-[#0a0a0a] p-2 sm:p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-fit flex items-center gap-4">
                <div className="flex items-center gap-3 pl-2 pr-2">
                  <div className="h-3 w-3 bg-[#ea580c]"></div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] text-[#a3a3a3] uppercase tracking-[0.15em] leading-none mb-1">UNSAVED</span>
                    <span className="font-mono text-[10px] text-[#555555] uppercase tracking-widest">{unsavedChanges} MODIFIED</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pr-2 border-l border-[#222222] pl-4">
                  <button
                    onClick={discardChanges}
                    className="px-3 py-2 text-[#555555] hover:text-[#a3a3a3] hover:bg-[#141414] font-mono text-[10px] uppercase tracking-[0.1em] transition-none whitespace-nowrap"
                  >
                    [ REVERT ]
                  </button>
                  <button
                    onClick={saveSettings}
                    className="px-5 py-2 bg-[#141414] text-[#ea580c] border-2 border-[#333333] font-mono text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#ea580c] hover:text-black hover:border-[#ea580c] active:translate-x-[2px] active:translate-y-[2px] transition-none whitespace-nowrap"
                  >
                    [▸ SAVE ]
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
