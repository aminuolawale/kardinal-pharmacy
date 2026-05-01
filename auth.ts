import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const ALLOWED_EMAIL = "aminuolawalekan@gmail.com"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn({ user }) {
      return user.email === ALLOWED_EMAIL
    },
    session({ session, token }) {
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
})
