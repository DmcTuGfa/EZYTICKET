import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || "").trim().toLowerCase()
    const password = String(body?.password || "").trim()

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña requeridos" }, { status: 400 })
    }

    const result = await sql`
      select id, email, name, role
      from authorized_users
      where lower(email) = ${email}
        and password = ${password}
        and active = true
      limit 1
    `

    if (!result.length) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const user = result[0]
    const response = NextResponse.json({ ok: true, user })

    response.cookies.set("app_session", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    })

    return response
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    return NextResponse.json({ error: "Error al validar acceso" }, { status: 500 })
  }
}
