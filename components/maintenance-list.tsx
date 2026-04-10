"use client"

import type { Maintenance } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  maintenances: Maintenance[]
}

const statusLabels: Record<string, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  pendiente_confirmacion: "Pendiente confirmación",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
}

export function MaintenanceList({ maintenances }: Props) {
  return (
    <div className="grid gap-4">
      {maintenances.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.folio} · {item.siteName || `Sede ${item.siteId}`}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium capitalize">{item.maintenanceType}</p>
                <p className="text-xs text-muted-foreground">{statusLabels[item.status] || item.status}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
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
              <p className="text-xs text-muted-foreground">Confirmación</p>
              <p className="text-sm">{item.confirmedByName || "Sin confirmar"}{item.confirmedByPosition ? ` · ${item.confirmedByPosition}` : ""}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {!maintenances.length && (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No hay mantenimientos registrados.</CardContent></Card>
      )}
    </div>
  )
}
