import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/neon"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      const result = await sql`
        select email, active, role
        from authorized_users
        where lower(email) = lower(${user.email})
        limit 1
      `

      if (!result.length) return false
      if (!result[0].active) return false
      return true
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email
      if (!email) return token

      const result = await sql`
        select role, active
        from authorized_users
        where lower(email) = lower(${email})
        limit 1
      `

      if (result[0]) {
        token.role = result[0].role
        token.active = result[0].active
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as typeof session.user & { role?: string; active?: boolean }).role = token.role as string | undefined
        ;(session.user as typeof session.user & { active?: boolean }).active = token.active as boolean | undefined
      }

      return session
    },
  },
})
