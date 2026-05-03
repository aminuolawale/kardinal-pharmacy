import type { NextAuthConfig } from "next-auth"

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
  providers: [],
} satisfies NextAuthConfig
