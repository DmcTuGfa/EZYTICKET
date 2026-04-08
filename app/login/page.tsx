import { redirect } from "next/navigation"
import { AlertCircle, LockKeyhole, ShieldCheck } from "lucide-react"
import { auth } from "@/auth"
import { googleSignInAction } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session?.user) {
    redirect("/")
  }

  const params = (await searchParams) ?? {}
  const showDenied = params.error === "AccessDenied"

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Acceso a TicketHub</CardTitle>
              <CardDescription>Inicia sesión con Google. Solo los correos autorizados en la base de datos pueden entrar.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDenied && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Tu cuenta de Google no está autorizada para usar esta aplicación.</p>
            </div>
          )}

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <LockKeyhole className="h-4 w-4" />
              Validación de acceso
            </div>
            <p className="mt-1">
              Después del login, la app valida tu correo contra la tabla <code>authorized_users</code> en Neon.
            </p>
          </div>

          <form action={googleSignInAction}>
            <Button type="submit" className="w-full">
              Iniciar sesión con Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
