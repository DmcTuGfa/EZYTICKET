"use client"

import { useMemo, useState } from "react"
import type { Maintenance, Site } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Props {
  maintenances: Maintenance[]
  sites: Site[]
}

const statusLabels: Record<string, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  pendiente_confirmacion: "Pendiente confirmación",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
}

export function MaintenanceList({ maintenances, sites }: Props) {
  const [siteFilter, setSiteFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    if (siteFilter === "all") return maintenances
    return maintenances.filter((item) => String(item.siteId) === siteFilter)
  }, [maintenances, siteFilter])

  const selectedSiteName = siteFilter === "all"
    ? "Todas las sedes"
    : sites.find((site) => String(site.id) === siteFilter)?.name || "Sede"

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">Historial por sede</p>
            <p className="text-sm text-muted-foreground">Visualiza los mantenimientos registrados por cada sede.</p>
          </div>
          <div className="w-full md:w-72">
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra por sede" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sedes</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Mostrando <span className="font-medium text-foreground">{filtered.length}</span> mantenimiento(s) en <span className="font-medium text-foreground">{selectedSiteName}</span>.
      </div>

      <div className="grid gap-4">
        {filtered.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.folio} · {item.siteName || `Sede ${item.siteId}`}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="capitalize">{item.maintenanceType}</Badge>
                  <Badge variant="secondary">{statusLabels[item.status] || item.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Descripción</p>
                <p className="text-sm">{item.description || "Sin descripción"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Problema reportado</p>
                <p className="text-sm">{item.reportedIssue || "Sin problema reportado"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trabajo realizado</p>
                <p className="text-sm">{item.workPerformed || "Pendiente"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Técnico</p>
                <p className="text-sm">{item.technicianName || "Sin asignar"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Solicitado por</p>
                <p className="text-sm">{item.requestedByName || "Sin dato"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conformidad</p>
                <p className="text-sm">{item.confirmedByName || "Sin confirmar"}{item.confirmedByPosition ? ` · ${item.confirmedByPosition}` : ""}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha programada</p>
                <p className="text-sm">{item.scheduledDate || "Sin fecha"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No hay mantenimientos registrados para esta sede.</CardContent></Card>
        )}
      </div>
    </div>
  )
}
