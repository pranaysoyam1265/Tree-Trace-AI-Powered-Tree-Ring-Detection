"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"

interface SettingsSearchProps {
  onSearch: (query: string) => void
}

export function SettingsSearch({ onSearch }: SettingsSearchProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onSearch(val)
  }

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
        <Search size={14} />
      </div>
      <input
        type="text"
        className="block w-full rounded-none-none border border-border bg-surface py-2.5 pl-9 pr-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors "
        placeholder="SEARCH_SETTINGS..."
        value={query}
        onChange={handleSearch}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="font-mono text-[9px] text-muted-foreground px-1.5 py-0.5 rounded-none border border-border bg-black">CTRL+F</span>
      </div>
    </div>
  )
}
