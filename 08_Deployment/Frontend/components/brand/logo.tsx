"use client"

/* ═══════════════════════════════════════════════════════════════════
   TREETRACE LOGO — Brutalist Graphic Component
   Accurate SVG reproduction of the "TT" panel and trace logo.
   ═══════════════════════════════════════════════════════════════════ */

interface LogoProps {
  /** Height in px */
  size?: number
  /** Which variant to render */
  variant?: "mark" | "full" | "wordmark"
  /** Additional className */
  className?: string
}

export function Logo({ size = 32, variant = "full", className = "" }: LogoProps) {
  const accent = "#ea580c"

  // Base aspects of the SVG
  const widthRatio = 84 / 56
  const markWidth = size * widthRatio

  const mark = (
    <svg
      width={markWidth}
      height={size}
      viewBox="-1 -1 85 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={variant !== "mark"}
    >
      {/* LEFT T — Panels 1, 2, 3(Stem), 4 */}
      <rect x="0" y="0" width="9" height="14" fill={accent} />
      <rect x="10" y="0" width="9" height="14" fill={accent} />
      <rect x="20" y="0" width="9" height="48" fill={accent} />
      <rect x="30" y="0" width="9" height="14" fill={accent} />

      {/* RIGHT T — Panels 1, 2(Stem), 3, 4 */}
      <rect x="44" y="0" width="9" height="14" fill={accent} />
      <rect x="54" y="0" width="9" height="48" fill={accent} />
      <rect x="64" y="0" width="9" height="14" fill={accent} />
      <rect x="74" y="0" width="9" height="14" fill={accent} />

      {/* PCB TRACES */}
      <g stroke={accent} strokeWidth="1" fill="none" strokeLinecap="square" strokeLinejoin="miter">
        {/* Left Bottom Traces */}
        <polyline points="2,14 2,54 26,54 26,48" />
        <polyline points="6,14 6,50 22,50 22,48" />

        {/* Middle Connecting Traces */}
        <polyline points="33,14 33,22 50,22 50,14" />
        <polyline points="37,14 37,18 46,18 46,14" />

        {/* Right Bottom Traces */}
        <polyline points="81,14 81,54 57,54 57,48" />
        <polyline points="77,14 77,50 61,50 61,48" />
      </g>
    </svg>
  )

  if (variant === "mark") return mark

  if (variant === "wordmark") {
    return (
      <span className={`inline-flex items-center gap-0 tracking-[0.1em] ${className}`} style={{ height: size }}>
        <span
          className="font-mono font-bold uppercase text-white"
          style={{ fontSize: size * 0.65, lineHeight: 1 }}
        >
          TREE
        </span>
        <span
          className="font-mono font-bold uppercase"
          style={{ fontSize: size * 0.65, lineHeight: 1, color: accent }}
        >
          TRACE
        </span>
      </span>
    )
  }

  // variant === "full"
  const wordmarkFontSize = size * 0.65
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {mark}
      <span className="inline-flex items-baseline gap-0 tracking-[0.15em] hidden sm:inline-flex" style={{ lineHeight: 1 }}>
        <span
          className="font-mono font-bold uppercase text-white"
          style={{ fontSize: wordmarkFontSize }}
        >
          TREE
        </span>
        <span
          className="font-mono font-bold uppercase"
          style={{ fontSize: wordmarkFontSize, color: accent }}
        >
          TRACE
        </span>
      </span>
    </span>
  )
}
