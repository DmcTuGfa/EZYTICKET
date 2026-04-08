"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, User, Tag, Clock, MessageSquare, Building2, Monitor, CheckCircle2 } from "lucide-react"
import type { Ticket, TicketStatus, TicketPriority, Activity } from "@/lib/types"
import { updateTicket, getActivitiesByTicket } from "@/lib/db/tickets"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface TicketDetailProps {
  ticket: Ticket | null
  onClose: () => void
  onUpdate?: () => void
  onCloseTicket?: (ticket: Ticket) => void
}

const statusColors: Record<TicketStatus, string> = {
  abierto: "bg-warning/20 text-warning border-warning/30",
  "en-progreso": "bg-chart-1/20 text-chart-1 border-chart-1/30",
  "en-espera-usuario": "bg-chart-5/20 text-chart-5 border-chart-5/30",
  "en-espera-area": "bg-chart-3/20 text-chart-3 border-chart-3/30",
  "en-espera-proveedor": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  resuelto: "bg-success/20 text-success border-success/30",
  cerrado: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30"
}

const statusLabels: Record<TicketStatus, string> = {
  abierto: "Abierto",
  "en-progreso": "En Progreso",
  "en-espera-usuario": "Espera Usuario",
  "en-espera-area": "Espera Area",
  "en-espera-proveedor": "Espera Proveedor",
  resuelto: "Resuelto",
  cerrado: "Cerrado"
}

const priorityColors: Record<TicketPriority, string> = {
  baja: "bg-success/20 text-success border-success/30",
  media: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  alta: "bg-warning/20 text-warning border-warning/30",
  urgente: "bg-destructive/20 text-destructive border-destructive/30"
}

const categoryLabels: Record<string, string> = {
  soporte: "Soporte",
  bug: "Bug",
  mejora: "Mejora",
  consulta: "Consulta",
  otro: "Otro"
}

const clasificacionLabels: Record<string, string> = {
  tecnica: "Tecnica",
  operativa: "Operativa",
  solicitud: "Solicitud",
  proyecto: "Proyecto"
}

const causaLabels: Record<string, string> = {
  "falla-tecnica": "Falla tecnica",
  "error-captura": "Error de captura",
  "uso-incorrecto": "Uso incorrecto",
  "falta-informacion": "Falta de informacion",
  "proveedor-externo": "Proveedor externo"
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
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

export function TicketDetail({ ticket, onClose, onUpdate, onCloseTicket }: TicketDetailProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const router = useRouter()

  useEffect(() => {
    async function loadActivities() {
      if (ticket) {
        setActivities(await getActivitiesByTicket(ticket.id))
      }
    }
    loadActivities()
  }, [ticket])

  if (!ticket) return null

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (newStatus === "cerrado" || newStatus === "resuelto") {
      onCloseTicket?.({ ...ticket, status: newStatus })
    } else {
      await updateTicket(ticket.id, { status: newStatus })
      setActivities(await getActivitiesByTicket(ticket.id))
      onUpdate?.()
      router.refresh()
    }
  }

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    await updateTicket(ticket.id, { priority: newPriority })
    setActivities(await getActivitiesByTicket(ticket.id))
    onUpdate?.()
    router.refresh()
  }

  const isClosed = ticket.status === "cerrado" || ticket.status === "resuelto"

  return (
    <Sheet open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border overflow-hidden">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-primary">
              {ticket.id}
            </Badge>
            <Badge variant="outline" className={`${statusColors[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </Badge>
          </div>
          <SheetTitle className="text-foreground text-left">{ticket.title}</SheetTitle>
          <SheetDescription className="text-left">
            {ticket.description}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Información del ticket */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reportado por:</span>
                <span className="text-foreground font-medium">{ticket.reporter}</span>
              </div>

              {ticket.assignee && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Asignado a:</span>
                  <span className="text-foreground font-medium">{ticket.assignee}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Categoria:</span>
                <Badge variant="secondary">{categoryLabels[ticket.category]}</Badge>
              </div>

              {ticket.areaResponsable && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Area responsable:</span>
                  <span className="text-foreground font-medium">{ticket.areaResponsable}</span>
                </div>
              )}

              {ticket.sistemaAfectado && (
                <div className="flex items-center gap-3 text-sm">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sistema afectado:</span>
                  <span className="text-foreground font-medium">{ticket.sistemaAfectado}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Creado:</span>
                <span className="text-foreground">{formatDate(ticket.createdAt)}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Actualizado:</span>
                <span className="text-foreground">{formatDate(ticket.updatedAt)}</span>
              </div>

              {ticket.closedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Cerrado:</span>
                  <span className="text-foreground">{formatDate(ticket.closedAt)}</span>
                </div>
              )}
            </div>

            {/* Información de cierre (si aplica) */}
            {isClosed && (ticket.clasificacionFinal || ticket.causaRaiz) && (
              <>
                <Separator className="bg-border" />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Informacion de Cierre</h4>
                  <div className="grid gap-3 p-4 rounded-lg bg-secondary/30">
                    {ticket.clasificacionFinal && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Clasificacion Final:</span>
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                          {clasificacionLabels[ticket.clasificacionFinal]}
                        </Badge>
                      </div>
                    )}
                    {ticket.causaRaiz && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Causa Raiz:</span>
                        <Badge variant="outline">
                          {causaLabels[ticket.causaRaiz]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator className="bg-border" />

            {/* Controles de estado y prioridad */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Gestionar Ticket</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Estado</label>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className={`${statusColors[ticket.status]} border`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="en-progreso">En Progreso</SelectItem>
                      <SelectItem value="en-espera-usuario">Espera Usuario</SelectItem>
                      <SelectItem value="en-espera-area">Espera Area</SelectItem>
                      <SelectItem value="en-espera-proveedor">Espera Proveedor</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Prioridad</label>
                  <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className={`${priorityColors[ticket.priority]} border`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isClosed && (
                <Button 
                  onClick={() => onCloseTicket?.({ ...ticket, status: "cerrado" })}
                  variant="outline"
                  className="w-full border-success text-success hover:bg-success/10"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Cerrar Ticket
                </Button>
              )}
            </div>

            <Separator className="bg-border" />

            {/* Historial de actividad */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Historial de Actividad
              </h4>
              
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividad registrada
                </p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 text-sm p-3 rounded-lg bg-secondary/30"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        activity.type === "closed" ? "bg-success" : "bg-primary"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
