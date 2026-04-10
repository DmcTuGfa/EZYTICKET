"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Maintenance } from "@/lib/types"
import { ClipboardCheck, ShieldAlert, Wrench, CheckCircle } from "lucide-react"

interface Props {
  maintenances: Maintenance[]
}

export function MaintenanceStatsCards({ maintenances }: Props) {
  const total = maintenances.length
  const preventivos = maintenances.filter((m) => m.maintenanceType === "preventivo").length
  const correctivos = maintenances.filter((m) => m.maintenanceType === "correctivo").length
  const cerrados = maintenances.filter((m) => m.status === "cerrado").length

  const cards = [
    { title: "Total", value: total, description: "Mantenimientos registrados", icon: ClipboardCheck, color: "text-primary" },
    { title: "Preventivos", value: preventivos, description: "Programados y de rutina", icon: Wrench, color: "text-chart-1" },
    { title: "Correctivos", value: correctivos, description: "Atención por falla", icon: ShieldAlert, color: "text-warning" },
    { title: "Cerrados", value: cerrados, description: "Finalizados", icon: CheckCircle, color: "text-success" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
