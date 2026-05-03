import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === "/admin/login"
  const isRootAdmin = req.nextUrl.pathname === "/admin"

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  if (isRootAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }
})

export const config = {
  matcher: ["/admin/:path*"],
}
