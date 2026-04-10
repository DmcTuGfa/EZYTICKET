"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const form = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "No se pudo iniciar sesión")
        return
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">Iniciar sesión</h1>
        <p className="text-zinc-400 mb-6">Accede con tu correo y contraseña.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Correo</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
