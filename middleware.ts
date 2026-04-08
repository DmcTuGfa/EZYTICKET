import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/icon-light-32x32.png" ||
    pathname === "/icon-dark-32x32.png" ||
    pathname === "/apple-icon.png"

  const isLoggedIn = Boolean(req.auth?.user?.email)
  const isActive = Boolean((req.auth?.user as { active?: boolean } | undefined)?.active)

  if (!isPublicPath && (!isLoggedIn || !isActive)) {
    const loginUrl = new URL("/login", req.url)
    if (isLoggedIn && !isActive) {
      loginUrl.searchParams.set("error", "AccessDenied")
    }
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/login" && isLoggedIn && isActive) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
