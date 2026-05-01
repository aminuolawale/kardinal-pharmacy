import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"
import { readAdmins, SUPER_ADMIN } from "@/lib/admins"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      if (user.email === SUPER_ADMIN) return true
      const { emails } = await readAdmins()
      return emails.includes(user.email)
    },
  },
})
