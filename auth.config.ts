import type { NextAuthConfig } from "next-auth"
import { authSecret } from "./lib/auth-env"

// Edge-compatible config — no Node.js modules.
// Used by middleware to check session existence only.
export const authConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      if (isOnAdmin) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }
      return true
    },
  },
  session: { strategy: "jwt" },
  secret: authSecret,
  trustHost: true,
  // session-only cookies: they expire when the browser is closed
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [],
} satisfies NextAuthConfig
