"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { ActivityFeed } from "@/components/activity-feed"
import { AppSidebar } from "@/components/app-sidebar"
import { MaintenanceCharts } from "@/components/maintenance-charts"
import { MaintenanceForm } from "@/components/maintenance-form"
import { MaintenanceList } from "@/components/maintenance-list"
import { MaintenanceStatsCards } from "@/components/maintenance-stats-cards"
import { ReportSection } from "@/components/report-section"
import { StatsCards } from "@/components/stats-cards"
import { TicketCharts } from "@/components/ticket-charts"
import { TicketForm } from "@/components/ticket-form"
import { TicketList } from "@/components/ticket-list"
import type { Activity, Maintenance, MaintenanceStats, Site, Ticket, TicketReportRow, TicketStats } from "@/lib/types"

type View = "dashboard" | "tickets" | "maintenances" | "activity" | "reports"

interface HomeClientProps {
  tickets: Ticket[]
  activities: Activity[]
  stats: TicketStats
  report: TicketReportRow[]
  maintenances: Maintenance[]
  maintenanceStats: MaintenanceStats
  sites: Site[]
}

export function HomeClient({ tickets, activities, stats, report, maintenances, maintenanceStats, sites }: HomeClientProps) {
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
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-background/95 backdrop-blur border-b border-border gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {currentView === "dashboard" && "Panel de Control"}
              {currentView === "tickets" && "Gestion de Tickets"}
              {currentView === "maintenances" && "Gestion de Mantenimientos"}
              {currentView === "activity" && "Registro de Actividad"}
              {currentView === "reports" && "Reportes"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentView === "dashboard" && "Vista general del sistema de tickets y mantenimientos"}
              {currentView === "tickets" && "Administra y da seguimiento a los tickets"}
              {currentView === "maintenances" && "Edita, cierra y controla mantenimientos por sede"}
              {currentView === "activity" && "Historial de cambios y actualizaciones"}
              {currentView === "reports" && "Genera y exporta reportes del sistema"}
            </p>
          </div>
          {currentView === "tickets" ? <TicketForm onTicketCreated={refresh} /> : null}
          {currentView === "maintenances" ? <MaintenanceForm sites={sites} onCreated={refresh} /> : null}
        </header>

        <div className="p-6 space-y-6">
          {currentView === "dashboard" && (
            <>
              <StatsCards stats={stats} />
              <TicketCharts stats={stats} />
              <MaintenanceStatsCards stats={maintenanceStats} />
              <MaintenanceCharts stats={maintenanceStats} />
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
          {currentView === "maintenances" && <MaintenanceList maintenances={maintenances} sites={sites} onUpdate={refresh} />}

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

export default HomeClient
