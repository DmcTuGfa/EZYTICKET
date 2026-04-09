import { loginAction } from "@/app/actions/auth-actions"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">Iniciar sesión</h1>
        <p className="text-zinc-400 mb-6">
          Accede con tu correo y contraseña.
        </p>

        <form action={loginAction} className="space-y-4">
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

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium hover:bg-blue-500"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}