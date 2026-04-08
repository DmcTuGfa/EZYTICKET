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
          prompt: "select_account", // fuerza selector de cuenta
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        // validar que venga email
        if (!user?.email) {
          console.error("No hay email en user")
          return false
        }

        // consultar BD
        const result = await sql`
          SELECT email, active
          FROM authorized_users
          WHERE email = ${user.email}
          LIMIT 1
        `

        // no existe
        if (!result.length) {
          console.log("Usuario no autorizado:", user.email)
          return false
        }

        // no activo
        if (!result[0].active) {
          console.log("Usuario inactivo:", user.email)
          return false
        }

        // autorizado
        console.log("Acceso permitido:", user.email)
        return true

      } catch (error) {
        console.error("ERROR EN AUTH:", error)
        return false
      }
    },
  },

  pages: {
    signIn: "/login", // redirige a tu pantalla
  },
})
