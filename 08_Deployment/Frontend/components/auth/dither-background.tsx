"use client"

import { useEffect, useRef } from "react"

export function DitherBackground() {
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  const blob3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frameId: number
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = (now - start) * 0.0005 // slow continuous time

      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${Math.sin(elapsed * 0.5) * 20}vw, ${Math.cos(elapsed * 0.6) * 20}vh) scale(${1 + Math.sin(elapsed) * 0.2})`
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${Math.cos(elapsed * 0.4) * -25}vw, ${Math.sin(elapsed * 0.7) * 25}vh) scale(${1 + Math.cos(elapsed * 0.8) * 0.2})`
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate(${Math.sin(elapsed * 0.3) * 15}vw, ${Math.cos(elapsed * 0.9) * -15}vh) scale(${1 + Math.sin(elapsed * 1.2) * 0.3})`
      }

      frameId = requestAnimationFrame(animate)
    }

    animate(performance.now())
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505]">
      {/* Heavy Gaussian Blur glowing orbs */}
      <div className="absolute inset-0 flex items-center justify-center opacity-70">
        <div
          ref={blob1Ref}
          className="absolute w-[40vw] h-[40vw] rounded-full bg-[#ea580c] mix-blend-screen blur-[120px]"
          style={{ willChange: "transform" }}
        />
        <div
          ref={blob2Ref}
          className="absolute w-[50vw] h-[30vw] rounded-full bg-[#a33b00] mix-blend-screen blur-[100px]"
          style={{ willChange: "transform" }}
        />
        <div
          ref={blob3Ref}
          className="absolute w-[35vw] h-[45vw] rounded-full bg-[#521c00] mix-blend-screen blur-[150px]"
          style={{ willChange: "transform" }}
        />
      </div>

      {/* SVG Dither Overlay (Noise) */}
      <div
        className="absolute inset-0 z-10 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* CRT Scanlines */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  )
}
