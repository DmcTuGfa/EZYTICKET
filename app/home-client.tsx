"use client"

import Image from "next/image"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { ActivityFeed } from "@/components/activity-feed"
import { AppSidebar } from "@/components/app-sidebar"
import { ReportSection } from "@/components/report-section"
import { StatsCards } from "@/components/stats-cards"
import { TicketCharts } from "@/components/ticket-charts"
import { TicketForm } from "@/components/ticket-form"
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/actions/auth-actions"
import { TicketList } from "@/components/ticket-list"
import type { Activity, Ticket, TicketReportRow, TicketStats } from "@/lib/types"

type View = "dashboard" | "tickets" | "activity" | "reports"

interface HomeClientProps {
  tickets: Ticket[]
  activities: Activity[]
  stats: TicketStats
  report: TicketReportRow[]
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  } | null
}

export function HomeClient({ tickets, activities, stats, report, user }: HomeClientProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const router = useRouter()

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  const statusLabels: Record<string, string> = {
    abierto: "Abierto",
    "en-progreso": "En Progreso",
    "en-espera-usuario": "Espera Usuario",
    "en-espera-area": "Espera Area",
    "en-espera-proveedor": "Espera Proveedor",
    resuelto: "Resuelto",
    cerrado: "Cerrado",
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-background/95 backdrop-blur border-b border-border">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {currentView === "dashboard" && "Panel de Control"}
              {currentView === "tickets" && "Gestion de Tickets"}
              {currentView === "activity" && "Registro de Actividad"}
              {currentView === "reports" && "Reportes"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentView === "dashboard" && "Vista general del sistema de tickets"}
              {currentView === "tickets" && "Administra y da seguimiento a los tickets"}
              {currentView === "activity" && "Historial de cambios y actualizaciones"}
              {currentView === "reports" && "Genera y exporta reportes del sistema"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || user.email || "Usuario"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">{user.name || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}
            <form action={signOutAction}>
              <Button type="submit" variant="outline">
                Cerrar sesión
              </Button>
            </form>
            <TicketForm onTicketCreated={refresh} />
          </div>
        </header>

        <div className="p-6 space-y-6">
          {currentView === "dashboard" && (
            <>
              <StatsCards stats={stats} />
              <TicketCharts stats={stats} />
              <div className="grid gap-6 lg:grid-cols-2">
                <ActivityFeed activities={activities.slice(0, 10)} />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Tickets Recientes</h3>
                  <div className="space-y-3">
                    {tickets.slice(0, 5).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm text-primary">{ticket.id}</span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                ticket.priority === "urgente"
                                  ? "bg-destructive/20 text-destructive"
                                  : ticket.priority === "alta"
                                    ? "bg-warning/20 text-warning"
                                    : ticket.priority === "media"
                                      ? "bg-chart-1/20 text-chart-1"
                                      : "bg-success/20 text-success"
                              }`}
                            >
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                            {ticket.areaResponsable && (
                              <span className="text-xs text-muted-foreground">{ticket.areaResponsable}</span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-foreground truncate">{ticket.title}</p>
                        </div>
                        <span
                          className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            ticket.status === "abierto"
                              ? "bg-warning/20 text-warning"
                              : ticket.status === "en-progreso"
                                ? "bg-chart-1/20 text-chart-1"
                                : ticket.status === "resuelto" || ticket.status === "cerrado"
                                  ? "bg-success/20 text-success"
                                  : ticket.status.includes("espera")
                                    ? "bg-chart-5/20 text-chart-5"
                                    : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {statusLabels[ticket.status] || ticket.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {currentView === "tickets" && <TicketList tickets={tickets} onUpdate={refresh} />}

          {currentView === "activity" && (
            <div className="max-w-4xl">
              <ActivityFeed activities={activities} />
            </div>
          )}

          {currentView === "reports" && <ReportSection stats={stats} report={report} />}
        </div>
      </main>
    </div>
  )
}
