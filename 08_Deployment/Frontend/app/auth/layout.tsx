import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TreeTrace | Authentication",
  description: "Sign in or create an account to access TreeTrace's AI-powered dendrochronology analysis platform.",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
