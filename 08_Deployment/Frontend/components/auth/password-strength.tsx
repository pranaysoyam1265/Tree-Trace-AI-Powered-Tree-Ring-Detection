"use client"

/* ═══════════════════════════════════════════════════════════════════
   PASSWORD STRENGTH — Brutalist rule-based strength meter
   ═══════════════════════════════════════════════════════════════════ */

interface PasswordStrengthProps {
  password: string
}

const RULES = [
  { label: "MIN 8 CHARACTERS", test: (p: string) => p.length >= 8 },
  { label: "UPPERCASE LETTER", test: (p: string) => /[A-Z]/.test(p) },
  { label: "NUMBER", test: (p: string) => /[0-9]/.test(p) },
  { label: "SPECIAL CHARACTER", test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
]

function getStrength(password: string): { level: string; color: string; percent: number } {
  const passed = RULES.filter(r => r.test(password)).length
  if (password.length === 0) return { level: "", color: "#333333", percent: 0 }
  if (passed <= 1) return { level: "WEAK", color: "#ef4444", percent: 25 }
  if (passed === 2) return { level: "FAIR", color: "#f59e0b", percent: 50 }
  if (passed === 3) return { level: "GOOD", color: "#ea580c", percent: 75 }
  return { level: "STRONG", color: "#22c55e", percent: 100 }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password)

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] text-[#888888] uppercase tracking-[0.15em] shrink-0">
          STRENGTH:
        </span>
        <div className="flex-1 h-1.5 bg-[#1a1a1a] border border-[#333333]">
          <div
            className="h-full transition-all duration-150"
            style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
          />
        </div>
        <span
          className="font-mono text-[9px] uppercase tracking-[0.15em] font-bold shrink-0"
          style={{ color: strength.color }}
        >
          {strength.level}
        </span>
      </div>

      {/* Rule checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {RULES.map(rule => {
          const passed = rule.test(password)
          return (
            <span
              key={rule.label}
              className="font-mono text-[9px] uppercase tracking-[0.1em]"
              style={{ color: passed ? "#22c55e" : "#555555" }}
            >
              [{passed ? "✓" : "✗"}] {rule.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
