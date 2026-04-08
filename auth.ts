import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/neon"

async function getAuthorizedUser(email: string) {
  const result = await sql`
    select email, active, role
    from authorized_users
    where lower(email) = lower(${email})
    limit 1
  `

  return result[0] ?? null
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      const authorizedUser = await getAuthorizedUser(user.email)
      if (!authorizedUser) return false
      if (!authorizedUser.active) return false

      return true
    },
    async jwt({ token, user, trigger }) {
      const email = user?.email ?? token.email
      if (!email) {
        token.active = false
        token.role = undefined
        return token
      }

      if (user || trigger === "update" || token.active === undefined) {
        const authorizedUser = await getAuthorizedUser(email)
        token.active = Boolean(authorizedUser?.active)
        token.role = authorizedUser?.role ?? undefined
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as typeof session.user & { role?: string; active?: boolean }).role = token.role as string | undefined
        ;(session.user as typeof session.user & { active?: boolean }).active = Boolean(token.active)
      }

      return session
    },
  },
})
