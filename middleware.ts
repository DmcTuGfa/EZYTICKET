import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function middleware(req: Request) {
  const session = await auth()
  const url = new URL(req.url)
  const pathname = url.pathname

  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/icon-light-32x32.png" ||
    pathname === "/icon-dark-32x32.png" ||
    pathname === "/apple-icon.png"

  const isLoggedIn = !!session?.user?.email

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}