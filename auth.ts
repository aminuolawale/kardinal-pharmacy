import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"
import { googleClientId, googleClientSecret } from "./lib/auth-env"
import { readAdmins, SUPER_ADMIN } from "@/lib/admins"
import { sendAdminSignedInEmail } from "@/lib/mail"

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
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false
      const email = user.email.toLowerCase()
      if (email === SUPER_ADMIN.toLowerCase()) return true
      const { emails } = await readAdmins()
      const isListedAdmin = emails.some((adminEmail) => adminEmail.toLowerCase() === email)
      if (!isListedAdmin) return false

      try {
        await sendAdminSignedInEmail(email)
      } catch (error) {
        console.error('Failed to send admin sign-in notification', error)
      }

      return true
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
})
