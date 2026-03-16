"use client"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST TOGGLE — Text-based [ON_] / [OFF] switch
   ═══════════════════════════════════════════════════════════════════ */

interface BrutalToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

export function BrutalToggle({ value, onChange, disabled }: BrutalToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`font-mono text-xs tracking-[0.15em] border-2 px-3 py-1  ${value
          ? "border-[#ea580c] bg-[#ea580c] text-white"
          : "border-[#333333] bg-transparent text-[#a3a3a3] hover:border-[#ea580c] hover:text-[#ea580c]"
        } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {value ? "[ON_]" : "[OFF]"}
    </button>
  )
}
