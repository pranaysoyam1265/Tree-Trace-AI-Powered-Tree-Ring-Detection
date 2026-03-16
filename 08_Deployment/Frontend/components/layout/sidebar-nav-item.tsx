"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR NAV ITEM — Terminal-styled navigation entry
   ═══════════════════════════════════════════════════════════════════ */

interface SidebarNavItemProps {
  href: string
  label: string
  badge?: string
  onClick?: () => void
}

export function SidebarNavItem({ href, label, badge, onClick }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm
        transition-all duration-150
        ${isActive
          ? "bg-accent/10 text-accent border-l-2 border-accent pl-[10px]"
          : "text-muted-foreground hover:bg-white/[0.03] hover:text-text-accent border-l-2 border-transparent pl-[10px]"
        }
      `}
    >
      {/* Indicator */}
      <span className={`
        inline-block w-3 text-[10px] transition-all duration-150
        ${isActive
          ? "text-accent"
          : "text-muted-foreground/60 group-hover:text-accent"
        }
      `}>
        {isActive ? "◉" : <span className="group-hover:hidden">○</span>}
        {!isActive && <span className="hidden group-hover:inline">▸</span>}
      </span>

      {/* Label */}
      <span className="flex-1">{label}</span>

      {/* Optional badge */}
      {badge && (
        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
          {badge}
        </span>
      )}
    </Link>
  )
}
