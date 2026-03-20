import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  // Public routes — no auth required
  const publicPaths = ["/", "/auth", "/about", "/docs"]
  const isPublic =
    publicPaths.includes(nextUrl.pathname) ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/public") ||
    nextUrl.pathname.match(/\.(ico|svg|png|jpg|css|js)$/)

  // Redirect unauthenticated users to /auth
  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/auth", nextUrl))
  }

  // Redirect authenticated users away from /auth
  if (isLoggedIn && nextUrl.pathname === "/auth") {
    return NextResponse.redirect(new URL("/analyze", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
