"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Clock, CheckCircle, AlertTriangle, Hourglass, Timer } from "lucide-react"
import type { TicketStats } from "@/lib/types"

interface StatsCardsProps {
  stats: TicketStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const enEspera = stats.byStatus["en-espera-usuario"] + 
                   stats.byStatus["en-espera-area"] + 
                   stats.byStatus["en-espera-proveedor"]

  const cards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: Ticket,
      description: "Tickets registrados",
      color: "text-primary"
    },
    {
      title: "Abiertos",
      value: stats.byStatus.abierto,
      icon: AlertTriangle,
      description: "Pendientes de atencion",
      color: "text-warning"
    },
    {
      title: "En Progreso",
      value: stats.byStatus["en-progreso"],
      icon: Clock,
      description: "En proceso de solucion",
      color: "text-chart-1"
    },
    {
      title: "En Espera",
      value: enEspera,
      icon: Hourglass,
      description: "Usuario, area o proveedor",
      color: "text-chart-5"
    },
    {
      title: "Resueltos",
      value: stats.byStatus.resuelto + stats.byStatus.cerrado,
      icon: CheckCircle,
      description: "Completados exitosamente",
      color: "text-success"
    },
    {
      title: "Tiempo Promedio",
      value: stats.avgResolutionTime > 24 
        ? `${Math.round(stats.avgResolutionTime / 24)}d`
        : `${stats.avgResolutionTime}h`,
      icon: Timer,
      description: "Tiempo de resolucion",
      color: "text-chart-2"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
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
