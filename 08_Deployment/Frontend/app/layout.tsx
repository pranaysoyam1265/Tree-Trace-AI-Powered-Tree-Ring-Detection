import type { Metadata, Viewport } from "next"
import { Geist_Mono, Silkscreen, JetBrains_Mono } from "next/font/google"
import { GeistPixelLine } from "geist/font/pixel"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { SettingsProvider } from "@/lib/settings-store"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { AnalysisProvider } from "@/lib/contexts/analysis-context"
import { DendroLabProvider } from "@/lib/contexts/dendrolab-context"
import "./globals.css"

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pixel",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

const geistPixelLine = GeistPixelLine

export const metadata: Metadata = {
  title: "TreeTrace | AI-Powered Tree Ring Detection",
  description:
    "Decode the story in every ring. TreeTrace uses AI-powered CS-TRD detection to automatically identify tree ring boundaries, count rings, and measure widths for dendrochronology research.",
  keywords: [
    "tree rings",
    "dendrochronology",
    "ring detection",
    "CS-TRD",
    "tree age",
    "ring width",
    "forestry",
  ],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${geistPixelLine.variable}`} suppressHydrationWarning>
      <body
        className={`${geistMono.variable} ${silkscreen.variable} ${jetbrainsMono.variable} font-mono antialiased`}
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Space Mono', 'Courier New', monospace" }}
      >
        <AuthProvider>
          <SettingsProvider>
            <AnalysisProvider>
              <DendroLabProvider>
                <ThemeProvider attribute="data-theme" defaultTheme="forest" enableSystem={false}>
                  {children}
                </ThemeProvider>
              </DendroLabProvider>
            </AnalysisProvider>
          </SettingsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
