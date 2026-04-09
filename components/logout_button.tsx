import { logoutAction } from "@/app/actions/auth-actions"

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
      >
        Cerrar sesión
      </button>
    </form>
  )
}