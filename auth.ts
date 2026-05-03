import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"
import { googleClientId, googleClientSecret } from "./lib/auth-env"
import { readAdmins, SUPER_ADMIN } from "@/lib/admins"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const email = user.email.toLowerCase()
      if (email === SUPER_ADMIN.toLowerCase()) return true
      const { emails } = await readAdmins()
      return emails.some(e => e.toLowerCase() === email)
    },
  },
})
