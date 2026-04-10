"use client"

import Image from "next/image"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { ActivityFeed } from "@/components/activity-feed"
import { AppSidebar } from "@/components/app-sidebar"
import { MaintenanceForm } from "@/components/maintenance-form"
import { MaintenanceList } from "@/components/maintenance-list"
import { MaintenanceCharts } from "@/components/maintenance-charts"
import { MaintenanceStatsCards } from "@/components/maintenance-stats-cards"
import { ReportSection } from "@/components/report-section"
import LogoutButton from "@/components/logout_button"
import { StatsCards } from "@/components/stats-cards"
import { TicketCharts } from "@/components/ticket-charts"
import { TicketForm } from "@/components/ticket-form"
import { TicketList } from "@/components/ticket-list"
import type { Activity, Maintenance, Site, Ticket, TicketReportRow, TicketStats } from "@/lib/types"

type View = "dashboard" | "tickets" | "maintenances" | "activity" | "reports"

interface HomeClientProps {
  tickets: Ticket[]
  maintenances: Maintenance[]
  sites: Site[]
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

export default function HomeClient({ tickets, maintenances, sites, activities, stats, report, user }: HomeClientProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const router = useRouter()
  const refresh = useCallback(() => { router.refresh() }, [router])

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
              {currentView === "tickets" && "Gestión de Tickets"}
              {currentView === "maintenances" && "Mantenimientos"}
              {currentView === "activity" && "Registro de Actividad"}
              {currentView === "reports" && "Reportes"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentView === "dashboard" && "Vista general del sistema"}
              {currentView === "tickets" && "Administra y da seguimiento a los tickets"}
              {currentView === "maintenances" && "Preventivos, correctivos y conformidad con firma"}
              {currentView === "activity" && "Historial de cambios y actualizaciones"}
              {currentView === "reports" && "Genera y exporta reportes del sistema"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                {user.image ? (
                  <Image src={user.image} alt={user.name || user.email || "Usuario"} width={32} height={32} className="rounded-full" />
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
            <LogoutButton />
            {currentView === "tickets" && <TicketForm onTicketCreated={refresh} />}
            {currentView === "maintenances" && <MaintenanceForm sites={sites} currentUser={user?.name || user?.email} onCreated={refresh} />}
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
                  <h3 className="text-lg font-semibold text-foreground">Mantenimientos recientes</h3>
                  <div className="space-y-3">
                    {maintenances.slice(0, 5).map((item) => (
                      <div key={item.id} className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{item.folio}</p>
                            <p className="text-sm text-muted-foreground">{item.title}</p>
                          </div>
                          <span className="text-xs capitalize text-primary">{item.maintenanceType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {currentView === "tickets" && <TicketList tickets={tickets} onUpdate={refresh} />}
          {currentView === "maintenances" && (
            <div className="space-y-6">
              <MaintenanceStatsCards maintenances={maintenances} />
              <MaintenanceCharts maintenances={maintenances} />
              <MaintenanceList maintenances={maintenances} sites={sites} />
            </div>
          )}
          {currentView === "activity" && <div className="max-w-4xl"><ActivityFeed activities={activities} /></div>}
          {currentView === "reports" && <ReportSection stats={stats} report={report} />}
        </div>
      </main>
    </div>
  )
}
