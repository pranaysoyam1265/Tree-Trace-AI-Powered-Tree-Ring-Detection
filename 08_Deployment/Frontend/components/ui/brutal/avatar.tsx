"use client"

/* ═══════════════════════════════════════════════════════════════════
   BRUTALIST AVATAR — Square with initials in accent color
   ═══════════════════════════════════════════════════════════════════ */

interface BrutalAvatarProps {
  name: string
  src?: string | null
  size?: number
  className?: string
}

export function BrutalAvatar({ name, src, size = 36, className = "" }: BrutalAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`border-2 border-[#333333] bg-[#1a1a1a] flex items-center justify-center font-mono text-xs font-bold text-[#ea580c] uppercase overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}
