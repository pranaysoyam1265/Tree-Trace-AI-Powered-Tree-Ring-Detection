"use client"

import { useEffect, useState } from "react"

/* ═══════════════════════════════════════════════════════════════════
   TREETRACE LOGO — Animated Draw-In
   Rings draw concentrically (innermost first → outward), then the
   scan line fades in last.  Plays once per session.
   ═══════════════════════════════════════════════════════════════════ */

interface AnimatedLogoProps {
  size?: number
  color?: "green" | "mono"
  className?: string
  /** Override: force animation even if already played this session */
  forceAnimate?: boolean
}

const SESSION_KEY = "treetrace-logo-animated"

export function LogoAnimated({ size = 48, color = "green", className = "", forceAnimate = false }: AnimatedLogoProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (forceAnimate || !sessionStorage.getItem(SESSION_KEY)) {
      setShouldAnimate(true)
      sessionStorage.setItem(SESSION_KEY, "1")
    }
  }, [forceAnimate])

  const green = color === "green" ? "#10B981" : "#A1A1AA"
  const greenDim = color === "green" ? "#065F46" : "#52525B"
  const cx = 50, cy = 50

  const rings = [
    { r: 12, dash: false, opacity: 0.9, delay: 0 },
    { r: 20, dash: false, opacity: 0.7, delay: 0.15 },
    { r: 28, dash: true, opacity: 0.5, delay: 0.30 },
    { r: 36, dash: false, opacity: 0.6, delay: 0.45 },
    { r: 44, dash: false, opacity: 0.35, delay: 0.60 },
  ]

  const animDur = "0.4s"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>{`
        @keyframes tt-ring-draw {
          from { stroke-dashoffset: var(--circ); opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: var(--op); }
        }
        @keyframes tt-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .tt-ring {
          ${shouldAnimate ? `animation: tt-ring-draw ${animDur} ease-out forwards;` : ""}
        }
        .tt-scan {
          ${shouldAnimate ? "animation: tt-fade-in 0.3s ease-out 0.9s forwards; opacity: 0;" : ""}
        }
        .tt-pith {
          ${shouldAnimate ? "animation: tt-fade-in 0.2s ease-out 1.1s forwards; opacity: 0;" : ""}
        }
        .tt-bracket {
          ${shouldAnimate ? "animation: tt-fade-in 0.2s ease-out 1.3s forwards; opacity: 0;" : ""}
        }
      `}</style>

      {/* Outer boundary */}
      <circle cx={cx} cy={cy} r={47} stroke={greenDim} strokeWidth={1} opacity={0.2}
        className={shouldAnimate ? "tt-scan" : ""} style={shouldAnimate ? undefined : { opacity: 0.2 }}
      />

      {/* Concentric rings */}
      {rings.map((ring, i) => {
        const circ = 2 * Math.PI * ring.r
        return (
          <ellipse
            key={i}
            cx={cx + (i % 2 === 0 ? 0.5 : -0.3)}
            cy={cy + (i % 2 === 0 ? -0.3 : 0.5)}
            rx={ring.r + (i === 1 ? 0.8 : i === 3 ? -0.5 : 0)}
            ry={ring.r + (i === 2 ? 0.6 : i === 4 ? -0.4 : 0)}
            stroke={green}
            strokeWidth={i === 0 ? 2 : 1.5}
            strokeDasharray={ring.dash ? "3 3" : `${circ}`}
            fill="none"
            className="tt-ring"
            style={{
              "--circ": `${circ}`,
              "--op": `${ring.opacity}`,
              animationDelay: shouldAnimate ? `${ring.delay}s` : undefined,
              opacity: shouldAnimate ? 0 : ring.opacity,
              strokeDashoffset: shouldAnimate ? circ : 0,
            } as React.CSSProperties}
          />
        )
      })}

      {/* Scan line */}
      <line x1={cx} y1={4} x2={cx} y2={96} stroke={green} strokeWidth={1.5}
        className="tt-scan" style={shouldAnimate ? undefined : { opacity: 0.6 }}
      />

      {/* Pith crosshair + dot */}
      <g className="tt-pith" style={shouldAnimate ? undefined : { opacity: 1 }}>
        <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={green} strokeWidth={1.5} opacity={0.8} />
        <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke={green} strokeWidth={1.5} opacity={0.8} />
        <circle cx={cx} cy={cy} r={2.5} fill={green} opacity={0.9} />
      </g>

      {/* Corner brackets */}
      <g className="tt-bracket" style={shouldAnimate ? undefined : { opacity: 0.3 }}>
        <path d="M8,8 L8,18" stroke={greenDim} strokeWidth={1} />
        <path d="M8,8 L18,8" stroke={greenDim} strokeWidth={1} />
        <path d="M92,8 L82,8" stroke={greenDim} strokeWidth={1} />
        <path d="M92,8 L92,18" stroke={greenDim} strokeWidth={1} />
        <path d="M8,92 L8,82" stroke={greenDim} strokeWidth={1} />
        <path d="M8,92 L18,92" stroke={greenDim} strokeWidth={1} />
        <path d="M92,92 L82,92" stroke={greenDim} strokeWidth={1} />
        <path d="M92,92 L92,82" stroke={greenDim} strokeWidth={1} />
      </g>
    </svg>
  )
}
