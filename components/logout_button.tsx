"use client"

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" })
        window.location.href = "/login"
      }}
      className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
    >
      Cerrar sesión
    </button>
  )
}
