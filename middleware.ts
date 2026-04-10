import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get("app_session")?.value

  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/icon-light-32x32.png" ||
    pathname === "/icon-dark-32x32.png" ||
    pathname === "/apple-icon.png" ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/logout")

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
