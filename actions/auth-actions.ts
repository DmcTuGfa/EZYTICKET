"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signOutAction() {
  const cookieStore = await cookies()
  cookieStore.set("app_session", "", {
    maxAge: 0,
    path: "/",
  })
  redirect("/login")
}
