"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardCheck, Wrench, CircleDot, CheckCircle } from "lucide-react"
import type { MaintenanceStats } from "@/lib/types"

interface Props {
  stats: MaintenanceStats
}

export function MaintenanceStatsCards({ stats }: Props) {
  const cards = [
    { title: "Total", value: stats.total, icon: ClipboardCheck, color: "text-primary", description: "Mantenimientos registrados" },
    { title: "Preventivos", value: stats.byType.preventivo, icon: CircleDot, color: "text-chart-2", description: "Programados y preventivos" },
    { title: "Correctivos", value: stats.byType.correctivo, icon: Wrench, color: "text-warning", description: "Atencion correctiva" },
    { title: "Cerrados", value: stats.byStatus.cerrado, icon: CheckCircle, color: "text-success", description: "Con firma de cierre" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
