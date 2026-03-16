"use client"

import { CornerAccents } from "@/components/ui/brutal/corner-accents"

const ASCII_LOGO = `
 ████████╗████████╗
 ╚══██╔══╝╚══██╔══╝
    ██║      ██║
    ██║      ██║
    ██║      ██║
    ╚═╝      ╚═╝`

const socialLinks = [
  { name: "GITHUB", href: "https://github.com" },
  { name: "TWITTER", href: "https://twitter.com" },
  { name: "LINKEDIN", href: "https://linkedin.com" },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0 })
  }

  return (
    <footer className="border-t-[3px] border-t-[#333333] bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* ASCII Logo */}
          <div>
            <pre
              className="font-mono text-[8px] leading-[10px] text-[#ea580c]/40 md:text-[10px] md:leading-[12px]"
              aria-label="TreeTrace ASCII logo"
              role="img"
            >
              {ASCII_LOGO}
            </pre>
            <p className="mt-4 max-w-xs font-mono text-xs leading-relaxed text-[#a3a3a3]">
              AI-POWERED DENDROCHRONOLOGY ANALYSIS.
              DECODE THE STORY IN EVERY RING.
            </p>
          </div>

          {/* Social Grid */}
          <div>
            <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.25em] text-[#555555]">
              // CONNECT
            </span>
            <div className="flex flex-col gap-0">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 py-2 font-mono text-xs text-[#a3a3a3] uppercase tracking-[0.15em] hover:text-[#ea580c] transition-none"
                >
                  <span className="text-[#555555]">▸</span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Tech Stack & Back to top */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.25em] text-[#555555]">
                // TECH STACK
              </span>
              <div className="flex flex-wrap gap-2">
                {["CS-TRD", "PYTHON", "NEXT.JS", "REACT", "TAILWIND", "RECHARTS"].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="border border-[#333333] bg-[#141414] px-2 py-1 font-mono text-[10px] text-[#a3a3a3] uppercase tracking-[0.15em]"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-8 flex items-center gap-2 self-start font-mono text-xs text-[#555555] hover:text-[#ea580c] transition-none lg:self-end uppercase tracking-[0.15em]"
              aria-label="Back to top"
            >
              [↑ BACK TO TOP]
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t-2 border-[#333333] pt-8 sm:flex-row">
          <span className="font-mono text-[10px] text-[#555555] uppercase tracking-[0.15em]">
            // TREETRACE &mdash; {new Date().getFullYear()}
          </span>
          <span className="font-mono text-[10px] text-[#555555] uppercase tracking-[0.15em]">
            DECODE THE STORY IN EVERY RING.
          </span>
        </div>
      </div>
    </footer>
  )
}
