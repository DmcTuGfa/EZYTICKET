"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
    >
      Cerrar sesión
    </button>
  )
}