"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ArrowRight, MessageSquare, UserPlus, Flag } from "lucide-react"
import type { Activity } from "@/lib/types"

interface ActivityFeedProps {
  activities: Activity[]
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora mismo"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "created":
      return <Plus className="h-4 w-4 text-success" />
    case "status_change":
      return <ArrowRight className="h-4 w-4 text-chart-1" />
    case "comment":
      return <MessageSquare className="h-4 w-4 text-primary" />
    case "assigned":
      return <UserPlus className="h-4 w-4 text-chart-5" />
    case "priority_change":
      return <Flag className="h-4 w-4 text-warning" />
    default:
      return <ArrowRight className="h-4 w-4 text-muted-foreground" />
  }
}

function getActivityLabel(type: Activity["type"]): string {
  switch (type) {
    case "created":
      return "Creado"
    case "status_change":
      return "Estado"
    case "comment":
      return "Comentario"
    case "assigned":
      return "Asignado"
    case "priority_change":
      return "Prioridad"
    default:
      return "Actividad"
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Actividad Reciente</CardTitle>
        <CardDescription>Ultimos movimientos en tickets</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay actividad reciente
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="mt-0.5 rounded-full bg-secondary p-2">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {activity.ticketId}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getActivityLabel(activity.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground mt-1 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
