"use client"

/* ═══════════════════════════════════════════════════════════════════
   CORNER ACCENTS — Hardware reticle markers at container corners
   ═══════════════════════════════════════════════════════════════════ */

export function CornerAccents({ color = "bg-[#ea580c]" }: { color?: string }) {
  return (
    <>
      <span className={`absolute -top-[2px] -left-[2px] w-2 h-2 ${color}`} />
      <span className={`absolute -top-[2px] -right-[2px] w-2 h-2 ${color}`} />
      <span className={`absolute -bottom-[2px] -left-[2px] w-2 h-2 ${color}`} />
      <span className={`absolute -bottom-[2px] -right-[2px] w-2 h-2 ${color}`} />
    </>
  )
}
