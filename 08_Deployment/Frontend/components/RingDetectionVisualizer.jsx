"use client";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const RING_RADII = [22, 40, 58, 76, 94, 112, 130, 148, 164, 178, 192, 205];
const CX = 250, CY = 250;
const ROTATION_SPEED = 90; // degrees per second (full turn = 4s)
const TRAIL_DEGREES = 40;

// ─── Helper: SVG arc path for the radar trail wedge ──────────────────────────
function describeArc(cx, cy, r, startAngle, endAngle) {
  // angles are 0=top, clockwise (matching CSS rotate convention)
  const toRad = (deg) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = (endAngle - startAngle + 360) % 360 > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function RingDetectionVisualizer({ width = 500, height = 500 }) {
  // Stable ring data
  const rings = useMemo(() =>
    RING_RADII.map((r, i) => ({
      id: i,
      radius: r,
      stroke: i % 2 === 0 ? "#7A4A2A" : "#3D1A08",
      strokeWidth: i % 2 === 0 ? 2 : 5,
    })), []);

  // React state only for what drives declarative render (ring opacity is
  // handled via direct DOM for performance; this tracks logical state)
  const [, forceUpdate] = useState(0);

  // Animation refs — no re-renders per frame
  const angleRef        = useRef(0);
  const prevAngleRef    = useRef(0);
  const rafRef          = useRef(null);
  const lastTsRef       = useRef(null);
  const nextRingRef     = useRef(0);
  const phaseRef        = useRef("scanning"); // "scanning" | "waiting" | "resetting"
  const resetTimerRef   = useRef(null);

  // DOM refs
  const rayGroupRef     = useRef(null);
  const trailPathRef    = useRef(null);
  const ringEls         = useRef([]);  // main ring circles
  const glowEls         = useRef([]);  // glow circles

  // ── Reveal a ring directly via DOM ────────────────────────────────────────
  const revealRing = useCallback((i) => {
    const ring = ringEls.current[i];
    const glow = glowEls.current[i];

    if (ring) {
      ring.style.transition = "opacity 0.4s ease-out";
      ring.style.opacity = "0.9";
    }

    if (glow) {
      glow.style.transition = "opacity 0.15s ease-out";
      glow.style.opacity = "0.5";
      setTimeout(() => {
        glow.style.transition = "opacity 0.55s ease-out";
        glow.style.opacity = "0";
      }, 200);
    }
  }, []);

  // ── Reset all rings, restart reveal sequence ───────────────────────────────
  const resetAll = useCallback(() => {
    phaseRef.current = "resetting";

    ringEls.current.forEach((el) => {
      if (!el) return;
      el.style.transition = "opacity 0.5s ease-out";
      el.style.opacity = "0";
    });
    glowEls.current.forEach((el) => {
      if (el) el.style.opacity = "0";
    });

    resetTimerRef.current = setTimeout(() => {
      nextRingRef.current = 0;
      prevAngleRef.current = angleRef.current;
      phaseRef.current = "scanning";
    }, 600);
  }, []);

  // ── Main animation loop ────────────────────────────────────────────────────
  useEffect(() => {
    function loop(ts) {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      const prev = angleRef.current;
      angleRef.current = (prev + ROTATION_SPEED * dt) % 360;
      const angle = angleRef.current;

      // Rotate ray group directly via DOM
      if (rayGroupRef.current) {
        rayGroupRef.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      }

      // Update trail arc path directly
      if (trailPathRef.current) {
        const trailStart = (angle - TRAIL_DEGREES + 360) % 360;
        trailPathRef.current.setAttribute("d", describeArc(CX, CY, 212, trailStart, angle));
      }

      // Detect crossing of 0° (top of disc) — reveal one ring per revolution
      if (phaseRef.current === "scanning") {
        const crossed = prev > 350 && angle < 10;
        if (crossed && nextRingRef.current < rings.length) {
          revealRing(nextRingRef.current);
          nextRingRef.current += 1;

          if (nextRingRef.current >= rings.length) {
            phaseRef.current = "waiting";
            resetTimerRef.current = setTimeout(resetAll, 2000);
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resetTimerRef.current);
    };
  }, [rings.length, revealRing, resetAll]);

  return (
    <div
      style={{ width, height }}
      className="relative rounded-2xl overflow-hidden bg-[#0d0d0d]"
    >
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── SVG Defs ──────────────────────────────────────────────────── */}
        <defs>
          {/* Wood disc: warm reddish-brown center → near-black edge */}
          <radialGradient id="discGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#6B3A2A" />
            <stop offset="55%"  stopColor="#3B1A0A" />
            <stop offset="100%" stopColor="#1C0A04" />
          </radialGradient>

          {/* Ray: opaque orange at pith (bottom of line) → transparent at tip */}
          <linearGradient id="rayGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#CC6D21" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#CC6D21" stopOpacity="0"    />
          </linearGradient>

          {/* Ring detection glow blur */}
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pith pulse animation */}
          <style>{`
            @keyframes pithPulse {
              0%, 100% { r: 6px; opacity: 1; }
              50%       { r: 10px; opacity: 0.6; }
            }
            #pith-dot { animation: pithPulse 1.5s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* ── Layer 1: Wood disc ────────────────────────────────────────── */}
        <circle
          cx={CX} cy={CY} r={220}
          fill="url(#discGradient)"
        />

        {/* ── Layer 2: Ring glow circles (hidden, flash on detect) ──────── */}
        {rings.map((ring, i) => (
          <circle
            key={`glow-${ring.id}`}
            ref={(el) => { glowEls.current[i] = el; }}
            cx={CX} cy={CY}
            r={ring.radius}
            fill="none"
            stroke="#CC6D21"
            strokeWidth={10}
            opacity={0}
            filter="url(#glowFilter)"
          />
        ))}

        {/* ── Layer 3: Ring circles (hidden until ray reveals) ──────────── */}
        {rings.map((ring, i) => (
          <circle
            key={`ring-${ring.id}`}
            ref={(el) => { ringEls.current[i] = el; }}
            cx={CX} cy={CY}
            r={ring.radius}
            fill="none"
            stroke={ring.stroke}
            strokeWidth={ring.strokeWidth}
            opacity={0}
          />
        ))}

        {/* ── Layer 4: Radar trail wedge (updated via ref each frame) ───── */}
        <path
          ref={trailPathRef}
          d=""
          fill="#CC6D21"
          opacity={0.17}
          style={{ pointerEvents: "none" }}
        />

        {/* ── Layer 5: Scanning ray (rotated via ref each frame) ─────────── */}
        <g
          ref={rayGroupRef}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {/* Line from pith (y=250) up to disc edge (y=30) */}
          <line
            x1={CX} y1={CY}
            x2={CX} y2={30}
            stroke="url(#rayGradient)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>

        {/* ── Layer 6: Pith dot — always on top, CSS pulsed ─────────────── */}
        <circle
          id="pith-dot"
          cx={CX} cy={CY}
          r={6}
          fill="#CC6D21"
        />
      </svg>
    </div>
  );
}

export default RingDetectionVisualizer;
