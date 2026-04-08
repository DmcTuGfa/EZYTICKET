"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Eye, Trash2, Filter, Download } from "lucide-react"
import type { Ticket, TicketStatus, TicketPriority, AreaResponsable } from "@/lib/types"
import { updateTicket, deleteTicket, exportToCSV } from "@/lib/ticket-store"
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.reporter.toLowerCase().includes(search.toLowerCase()) ||
      (ticket.sistemaAfectado?.toLowerCase().includes(search.toLowerCase()))
    
    const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "todos" || ticket.priority === priorityFilter
    const matchesArea = areaFilter === "todos" || ticket.areaResponsable === areaFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesArea
  })

  const handleStatusChange = (ticket: Ticket, newStatus: TicketStatus) => {
    // Si se va a cerrar o resolver, abrir el diálogo de cierre
    if (newStatus === "cerrado" || newStatus === "resuelto") {
      setTicketToClose({ ...ticket, status: newStatus })
    } else {
      updateTicket(ticket.id, { status: newStatus })
      onUpdate?.()
    }
  }

  const handleDelete = (ticketId: string) => {
    if (confirm("¿Estas seguro de eliminar este ticket?")) {
      deleteTicket(ticketId)
      onUpdate?.()
    }
  }

  const handleExport = () => {
    const csv = exportToCSV()
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Lista de Tickets</CardTitle>
              <CardDescription>{filteredTickets.length} tickets encontrados</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-input border-border w-full sm:w-[180px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "todos")}>
                <SelectTrigger className="bg-input border-border w-[150px]">
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
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | "todos")}>
                <SelectTrigger className="bg-input border-border w-[120px]">
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
              <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v as AreaResponsable | "todos")}>
                <SelectTrigger className="bg-input border-border w-[120px]">
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
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Titulo</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground">Prioridad</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Area</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Sistema</TableHead>
                  <TableHead className="text-muted-foreground hidden xl:table-cell">Fecha</TableHead>
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
                    <TableRow key={ticket.id} className="hover:bg-secondary/30">
                      <TableCell className="font-mono text-sm text-primary">{ticket.id}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{ticket.title}</TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(value: TicketStatus) => handleStatusChange(ticket, value)}
                        >
                          <SelectTrigger className={`w-[140px] h-7 text-xs border ${statusColors[ticket.status]}`}>
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
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${priorityColors[ticket.priority]}`}>
                          {priorityLabels[ticket.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {ticket.areaResponsable || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {ticket.sistemaAfectado || "-"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem 
                              onClick={() => setSelectedTicket(ticket)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(ticket.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
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
        </CardContent>
      </Card>

      <TicketDetail 
        ticket={selectedTicket} 
        onClose={() => setSelectedTicket(null)}
        onUpdate={onUpdate}
        onCloseTicket={(ticket) => {
          setSelectedTicket(null)
          setTicketToClose(ticket)
        }}
      />

      <CloseTicketDialog
        ticket={ticketToClose}
        onClose={() => setTicketToClose(null)}
        onConfirm={(data) => {
          if (ticketToClose) {
            updateTicket(ticketToClose.id, {
              status: ticketToClose.status,
              clasificacionFinal: data.clasificacionFinal,
              causaRaiz: data.causaRaiz
            })
            setTicketToClose(null)
            onUpdate?.()
          }
        }}
      />
    </>
  )
}
