import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">Iniciar sesión</h1>
        <p className="text-zinc-400 mb-6">
          Accede con Google para entrar al sistema.
        </p>

        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium hover:bg-blue-500"
          >
            Acceder con Google
          </button>
        </form>
      </div>
    </div>
  )
}