"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
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
import type { Maintenance, MaintenanceStats, Site, Ticket, TicketReportRow, TicketStats } from "@/lib/types"

type View = "dashboard" | "tickets" | "maintenances" | "reports"

interface HomeClientProps {
  tickets: Ticket[]
  activities: unknown[]
  stats: TicketStats
  report: TicketReportRow[]
  maintenances: Maintenance[]
  maintenanceStats: MaintenanceStats
  sites: Site[]
}

export function HomeClient({ tickets, stats, report, maintenances, maintenanceStats, sites }: HomeClientProps) {
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
    <div className="flex min-h-screen bg-background">
      <AppSidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:h-16 md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
          <div className="pl-12 md:pl-0 min-w-0">
            <h1 className="text-lg font-semibold text-foreground md:text-xl truncate">
              {currentView === "dashboard" && "Panel de Control"}
              {currentView === "tickets" && "Gestion de Tickets"}
              {currentView === "maintenances" && "Gestion de Mantenimientos"}
              {currentView === "reports" && "Reportes"}
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              {currentView === "dashboard" && "Vista general del sistema de tickets y mantenimientos"}
              {currentView === "tickets" && "Administra y da seguimiento a los tickets"}
              {currentView === "maintenances" && "Edita, cierra con firma y consulta historial por sede"}
              {currentView === "reports" && "Consulta reportes de tickets y mantenimientos"}
            </p>
          </div>
          <div className="flex w-full md:w-auto md:justify-end">
            {currentView === "tickets" ? <TicketForm onTicketCreated={refresh} /> : null}
            {currentView === "maintenances" ? <MaintenanceForm sites={sites} onCreated={refresh} /> : null}
          </div>
        </header>

        <div className="space-y-4 p-4 md:space-y-6 md:p-6">
          {currentView === "dashboard" && (
            <>
              <StatsCards stats={stats} />
              <TicketCharts stats={stats} />
              <MaintenanceStatsCards stats={maintenanceStats} />
              <MaintenanceCharts stats={maintenanceStats} />
              <div className="grid gap-4 xl:grid-cols-2 xl:gap-6">
                <div className="space-y-4 min-w-0">
                  <h3 className="text-base font-semibold text-foreground md:text-lg">Tickets Recientes</h3>
                  <div className="space-y-3">
                    {tickets.slice(0, 5).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm text-primary break-all">{ticket.id}</span>
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
                            <p className="mt-1 text-sm text-foreground break-words">{ticket.title}</p>
                          </div>
                          <span
                            className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
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
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 min-w-0">
                  <h3 className="text-base font-semibold text-foreground md:text-lg">Mantenimientos Recientes</h3>
                  <div className="space-y-3">
                    {maintenances.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm text-primary break-all">{item.folio}</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                {item.maintenanceType}
                              </span>
                              <span className="text-xs text-muted-foreground">{item.siteName || `Sede ${item.siteId}`}</span>
                            </div>
                            <p className="mt-1 text-sm text-foreground break-words">{item.title}</p>
                          </div>
                          <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-muted text-muted-foreground">
                            {item.status === "en_proceso" ? "En proceso" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {currentView === "tickets" && <TicketList tickets={tickets} onUpdate={refresh} />}
          {currentView === "maintenances" && <MaintenanceList maintenances={maintenances} sites={sites} onUpdate={refresh} />}
          {currentView === "reports" && (
            <ReportSection
              stats={stats}
              report={report}
              maintenances={maintenances}
              maintenanceStats={maintenanceStats}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default HomeClient
