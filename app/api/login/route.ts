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
      select id, email, name, role, active, password
      from authorized_users
      where lower(email) = ${email}
      limit 1
    `

    if (!result.length) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 })
    }

    const user = result[0]

    if (!user.active) {
      return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 })
    }

    if (String(user.password || "").trim() !== password) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set("app_session", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    })

    return response
  } catch (error: any) {
    console.error("LOGIN ERROR:", error)
    return NextResponse.json({ error: error?.message || error?.toString() || "Error al validar acceso" }, { status: 500 })
  }
}
