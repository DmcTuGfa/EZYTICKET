"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Eye, Trash2, Filter, Download } from "lucide-react"
import type { Ticket, TicketStatus, TicketPriority, AreaResponsable } from "@/lib/types"
import { updateTicket, deleteTicket, exportToCSV } from "@/lib/db/tickets"
import { TicketDetail } from "./ticket-detail"
import { CloseTicketDialog } from "./close-ticket-dialog"

interface TicketListProps {
  tickets: Ticket[]
  onUpdate?: () => void
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

const priorityColors: Record<TicketPriority, string> = {
  baja: "bg-success/20 text-success border-success/30",
  media: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  alta: "bg-warning/20 text-warning border-warning/30",
  urgente: "bg-destructive/20 text-destructive border-destructive/30"
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

const priorityLabels: Record<TicketPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente"
}

function formatDateOnly(dateString?: string): string {
  if (!dateString) return "Sin fecha"
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

export function TicketList({ tickets, onUpdate }: TicketListProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "todos">("todos")
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "todos">("todos")
  const [areaFilter, setAreaFilter] = useState<AreaResponsable | "todos">("todos")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [ticketToClose, setTicketToClose] = useState<Ticket | null>(null)
  const router = useRouter()

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.reporter.toLowerCase().includes(search.toLowerCase()) ||
      ticket.sistemaAfectado?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "todos" || ticket.priority === priorityFilter
    const matchesArea = areaFilter === "todos" || ticket.areaResponsable === areaFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesArea
  })

  const handleStatusChange = async (ticket: Ticket, newStatus: TicketStatus) => {
    if (newStatus === "cerrado" || newStatus === "resuelto") {
      setTicketToClose({ ...ticket, status: newStatus })
    } else {
      await updateTicket(ticket.id, { status: newStatus })
      onUpdate?.()
      router.refresh()
    }
  }

  const handleDelete = async (ticketId: string) => {
    if (confirm("¿Estas seguro de eliminar este ticket?")) {
      await deleteTicket(ticketId)
      onUpdate?.()
      router.refresh()
    }
  }

  const handleExport = async () => {
    const csv = await exportToCSV()
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-tickets-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-foreground">Lista de Tickets</CardTitle>
              <CardDescription>{filteredTickets.length} tickets encontrados</CardDescription>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
              <div className="relative sm:col-span-2 xl:w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-input border-border w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "todos") }>
                <SelectTrigger className="bg-input border-border w-full xl:w-[170px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="abierto">Abierto</SelectItem>
                  <SelectItem value="en-progreso">En Progreso</SelectItem>
                  <SelectItem value="en-espera-usuario">Espera Usuario</SelectItem>
                  <SelectItem value="en-espera-area">Espera Area</SelectItem>
                  <SelectItem value="en-espera-proveedor">Espera Proveedor</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | "todos") }>
                <SelectTrigger className="bg-input border-border w-full xl:w-[140px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v as AreaResponsable | "todos") }>
                <SelectTrigger className="bg-input border-border w-full xl:w-[150px]">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="TI">TI</SelectItem>
                  <SelectItem value="RH">RH</SelectItem>
                  <SelectItem value="Ventas">Ventas</SelectItem>
                  <SelectItem value="Produccion">Produccion</SelectItem>
                  <SelectItem value="Finanzas">Finanzas</SelectItem>
                  <SelectItem value="Compras">Compras</SelectItem>
                  <SelectItem value="Calidad">Calidad</SelectItem>
                  <SelectItem value="Logistica">Logistica</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} className="gap-2 w-full sm:w-auto xl:w-auto">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:hidden">
            {filteredTickets.length === 0 ? (
              <div className="rounded-lg border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
                No se encontraron tickets
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-primary break-all">{ticket.id}</p>
                      <h3 className="mt-1 font-medium text-foreground break-words">{ticket.title}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={() => setSelectedTicket(ticket)}>
                          <Eye className="h-4 w-4 mr-2" /> Ver detalle
                        </DropdownMenuItem>
                        {ticket.status !== "cerrado" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(ticket, "cerrado") }>
                            Cerrar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(ticket.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                    <Badge className={priorityColors[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
                    {ticket.areaResponsable ? <Badge variant="outline">{ticket.areaResponsable}</Badge> : null}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Reporta:</span> {ticket.reporter}</p>
                    <p><span className="font-medium text-foreground">Sistema:</span> {ticket.sistemaAfectado || "Sin sistema"}</p>
                    <p><span className="font-medium text-foreground">Fecha alta:</span> {formatDateOnly(ticket.fechaAlta || ticket.createdAt)}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" className="w-full" onClick={() => setSelectedTicket(ticket)}>
                      Ver detalle
                    </Button>
                    {ticket.status !== "cerrado" ? (
                      <Button className="w-full" onClick={() => handleStatusChange(ticket, "cerrado") }>
                        Cerrar
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block rounded-md border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="text-muted-foreground">ID</TableHead>
                    <TableHead className="text-muted-foreground">Titulo</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="text-muted-foreground">Prioridad</TableHead>
                    <TableHead className="text-muted-foreground">Area</TableHead>
                    <TableHead className="text-muted-foreground">Sistema</TableHead>
                    <TableHead className="text-muted-foreground">Fecha alta</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No se encontraron tickets
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-primary">{ticket.id}</TableCell>
                        <TableCell className="max-w-[260px] truncate">{ticket.title}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
                        </TableCell>
                        <TableCell>{ticket.areaResponsable || "-"}</TableCell>
                        <TableCell className="max-w-[180px] truncate">{ticket.sistemaAfectado || "-"}</TableCell>
                        <TableCell>{formatDateOnly(ticket.fechaAlta || ticket.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => setSelectedTicket(ticket)}>
                                <Eye className="h-4 w-4 mr-2" /> Ver detalle
                              </DropdownMenuItem>
                              {ticket.status !== "cerrado" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(ticket, "cerrado") }>Cerrar</DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDelete(ticket.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTicket ? <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={onUpdate} /> : null}
      {ticketToClose ? (
        <CloseTicketDialog
          ticket={ticketToClose}
          open={Boolean(ticketToClose)}
          onOpenChange={(open) => !open && setTicketToClose(null)}
          onClosed={() => {
            setTicketToClose(null)
            onUpdate?.()
            router.refresh()
          }}
        />
      ) : null}
    </>
  )
}
