import type { NextAuthConfig } from "next-auth"

// Edge-compatible config — no Node.js modules.
// Used by middleware to check session existence only.
export const authConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
  providers: [],
} satisfies NextAuthConfig
