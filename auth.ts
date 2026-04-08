import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/neon"

export const { handlers, auth, signIn, signOut } = NextAuth({
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
      try {
        if (!user?.email) return false

        const result = await sql`
          SELECT email, active
          FROM authorized_users
          WHERE email = ${user.email}
          LIMIT 1
        `

        if (!result.length) return false
        if (!result[0].active) return false

        return true
      } catch (error) {
        console.error("ERROR EN AUTH:", error)
        return false
      }
    },
  },
  pages: {
    signIn: "/login",
  },
})