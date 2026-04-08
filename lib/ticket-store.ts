"use client"

import type { 
  Ticket, 
  Activity, 
  TicketStats, 
  TicketStatus, 
  TicketPriority, 
  TicketCategory,
  ClasificacionFinal,
  CausaRaiz,
  AreaResponsable,
  TicketReportRow
} from "./types"

// Datos de ejemplo para inicializar
const initialTickets: Ticket[] = [
  {
    id: "TKT-001",
    title: "Error al iniciar sesion",
    description: "Los usuarios no pueden iniciar sesion desde la app movil",
    status: "abierto",
    priority: "alta",
    category: "bug",
    createdAt: "2026-04-06T10:00:00Z",
    updatedAt: "2026-04-06T10:00:00Z",
    reporter: "Juan Garcia",
    assignee: "Maria Lopez",
    areaResponsable: "TI",
    sistemaAfectado: "App Movil"
  },
  {
    id: "TKT-002",
    title: "Solicitud de nueva funcionalidad",
    description: "Agregar filtros avanzados en el panel de reportes",
    status: "en-progreso",
    priority: "media",
    category: "mejora",
    createdAt: "2026-04-05T14:30:00Z",
    updatedAt: "2026-04-07T09:15:00Z",
    reporter: "Ana Martinez",
    assignee: "Carlos Ruiz",
    areaResponsable: "Ventas",
    sistemaAfectado: "CRM"
  },
  {
    id: "TKT-003",
    title: "Consulta sobre facturacion",
    description: "Necesito informacion sobre el proceso de facturacion mensual",
    status: "cerrado",
    priority: "baja",
    category: "consulta",
    createdAt: "2026-04-04T08:00:00Z",
    updatedAt: "2026-04-05T11:00:00Z",
    closedAt: "2026-04-05T11:00:00Z",
    reporter: "Pedro Sanchez",
    areaResponsable: "Finanzas",
    sistemaAfectado: "SAP",
    clasificacionFinal: "operativa",
    causaRaiz: "falta-informacion"
  },
  {
    id: "TKT-004",
    title: "Sistema lento en horas pico",
    description: "El sistema presenta lentitud entre las 10am y 12pm",
    status: "en-espera-proveedor",
    priority: "urgente",
    category: "soporte",
    createdAt: "2026-04-07T10:30:00Z",
    updatedAt: "2026-04-07T10:30:00Z",
    reporter: "Laura Torres",
    assignee: "Maria Lopez",
    areaResponsable: "TI",
    sistemaAfectado: "ERP"
  },
  {
    id: "TKT-005",
    title: "Actualizacion de documentacion",
    description: "Los manuales de usuario necesitan actualizarse",
    status: "cerrado",
    priority: "baja",
    category: "otro",
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-03T16:00:00Z",
    closedAt: "2026-04-03T16:00:00Z",
    reporter: "Roberto Diaz",
    areaResponsable: "RH",
    sistemaAfectado: "Portal RH",
    clasificacionFinal: "solicitud",
    causaRaiz: "falta-informacion"
  },
  {
    id: "TKT-006",
    title: "Integracion con API externa",
    description: "Conectar el sistema con el servicio de pagos",
    status: "en-espera-area",
    priority: "alta",
    category: "mejora",
    createdAt: "2026-04-02T11:00:00Z",
    updatedAt: "2026-04-06T14:00:00Z",
    reporter: "Sofia Mendez",
    assignee: "Carlos Ruiz",
    areaResponsable: "Finanzas",
    sistemaAfectado: "Portal Pagos"
  },
  {
    id: "TKT-007",
    title: "Error en reporte de inventario",
    description: "El reporte muestra cantidades incorrectas",
    status: "cerrado",
    priority: "alta",
    category: "bug",
    createdAt: "2026-04-03T08:00:00Z",
    updatedAt: "2026-04-04T15:00:00Z",
    closedAt: "2026-04-04T15:00:00Z",
    reporter: "Miguel Angel",
    assignee: "Maria Lopez",
    areaResponsable: "Logistica",
    sistemaAfectado: "WMS",
    clasificacionFinal: "tecnica",
    causaRaiz: "falla-tecnica"
  },
  {
    id: "TKT-008",
    title: "Capacitacion sistema nuevo",
    description: "Solicitud de capacitacion para el nuevo modulo de compras",
    status: "en-espera-usuario",
    priority: "media",
    category: "consulta",
    createdAt: "2026-04-07T09:00:00Z",
    updatedAt: "2026-04-07T09:00:00Z",
    reporter: "Carmen Rojas",
    areaResponsable: "Compras",
    sistemaAfectado: "ERP"
  }
]

const initialActivities: Activity[] = [
  {
    id: "ACT-001",
    ticketId: "TKT-004",
    type: "created",
    description: "Ticket creado",
    timestamp: "2026-04-07T10:30:00Z",
    user: "Laura Torres"
  },
  {
    id: "ACT-002",
    ticketId: "TKT-002",
    type: "status_change",
    description: "Estado cambiado de 'abierto' a 'en-progreso'",
    timestamp: "2026-04-07T09:15:00Z",
    user: "Carlos Ruiz",
    previousValue: "abierto",
    newValue: "en-progreso"
  },
  {
    id: "ACT-003",
    ticketId: "TKT-001",
    type: "assigned",
    description: "Ticket asignado a Maria Lopez",
    timestamp: "2026-04-06T10:30:00Z",
    user: "Admin"
  },
  {
    id: "ACT-004",
    ticketId: "TKT-006",
    type: "status_change",
    description: "Estado cambiado a 'En espera de area'",
    timestamp: "2026-04-06T14:00:00Z",
    user: "Carlos Ruiz",
    previousValue: "en-progreso",
    newValue: "en-espera-area"
  },
  {
    id: "ACT-005",
    ticketId: "TKT-003",
    type: "closed",
    description: "Ticket cerrado - Clasificacion: Operativa, Causa: Falta de informacion",
    timestamp: "2026-04-05T11:00:00Z",
    user: "Soporte"
  },
  {
    id: "ACT-006",
    ticketId: "TKT-007",
    type: "closed",
    description: "Ticket cerrado - Clasificacion: Tecnica, Causa: Falla tecnica",
    timestamp: "2026-04-04T15:00:00Z",
    user: "Maria Lopez"
  }
]

// Store en memoria (simula base de datos)
let tickets: Ticket[] = [...initialTickets]
let activities: Activity[] = [...initialActivities]

// Funciones del store
export function getTickets(): Ticket[] {
  return [...tickets]
}

export function getTicketById(id: string): Ticket | undefined {
  return tickets.find(t => t.id === id)
}

export function createTicket(data: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Ticket {
  const newTicket: Ticket = {
    ...data,
    id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  tickets = [newTicket, ...tickets]
  
  addActivity({
    ticketId: newTicket.id,
    type: "created",
    description: `Ticket "${newTicket.title}" creado`,
    user: newTicket.reporter
  })
  
  return newTicket
}

export function updateTicket(id: string, updates: Partial<Ticket>): Ticket | null {
  const index = tickets.findIndex(t => t.id === id)
  if (index === -1) return null
  
  const oldTicket = tickets[index]
  const updatedTicket: Ticket = {
    ...oldTicket,
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  // Si se cierra el ticket, registrar fecha de cierre
  if ((updates.status === "cerrado" || updates.status === "resuelto") && !oldTicket.closedAt) {
    updatedTicket.closedAt = new Date().toISOString()
  }
  
  tickets[index] = updatedTicket
  
  // Registrar cambios de estado
  if (updates.status && updates.status !== oldTicket.status) {
    const isClosed = updates.status === "cerrado" || updates.status === "resuelto"
    addActivity({
      ticketId: id,
      type: isClosed ? "closed" : "status_change",
      description: isClosed 
        ? `Ticket cerrado - Clasificacion: ${updates.clasificacionFinal || "N/A"}, Causa: ${updates.causaRaiz || "N/A"}`
        : `Estado cambiado de "${oldTicket.status}" a "${updates.status}"`,
      user: "Sistema",
      previousValue: oldTicket.status,
      newValue: updates.status
    })
  }
  
  // Registrar cambios de prioridad
  if (updates.priority && updates.priority !== oldTicket.priority) {
    addActivity({
      ticketId: id,
      type: "priority_change",
      description: `Prioridad cambiada de "${oldTicket.priority}" a "${updates.priority}"`,
      user: "Sistema",
      previousValue: oldTicket.priority,
      newValue: updates.priority
    })
  }
  
  return updatedTicket
}

export function deleteTicket(id: string): boolean {
  const initialLength = tickets.length
  tickets = tickets.filter(t => t.id !== id)
  activities = activities.filter(a => a.ticketId !== id)
  return tickets.length < initialLength
}

export function getActivities(limit?: number): Activity[] {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  return limit ? sorted.slice(0, limit) : sorted
}

export function getActivitiesByTicket(ticketId: string): Activity[] {
  return activities
    .filter(a => a.ticketId === ticketId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function addActivity(data: Omit<Activity, "id" | "timestamp">): Activity {
  const newActivity: Activity = {
    ...data,
    id: `ACT-${String(activities.length + 1).padStart(3, "0")}`,
    timestamp: new Date().toISOString()
  }
  activities = [newActivity, ...activities]
  return newActivity
}

export function getStats(): TicketStats {
  const byStatus: Record<TicketStatus, number> = {
    abierto: 0,
    "en-progreso": 0,
    "en-espera-usuario": 0,
    "en-espera-area": 0,
    "en-espera-proveedor": 0,
    resuelto: 0,
    cerrado: 0
  }
  
  const byPriority: Record<TicketPriority, number> = {
    baja: 0,
    media: 0,
    alta: 0,
    urgente: 0
  }
  
  const byCategory: Record<TicketCategory, number> = {
    soporte: 0,
    bug: 0,
    mejora: 0,
    consulta: 0,
    otro: 0
  }

  const byClasificacion: Record<ClasificacionFinal, number> = {
    tecnica: 0,
    operativa: 0,
    solicitud: 0,
    proyecto: 0
  }

  const byArea: Record<AreaResponsable, number> = {
    TI: 0,
    RH: 0,
    Ventas: 0,
    Produccion: 0,
    Finanzas: 0,
    Compras: 0,
    Calidad: 0,
    Logistica: 0,
    Otro: 0
  }

  let totalResolutionTime = 0
  let closedCount = 0
  
  tickets.forEach(ticket => {
    byStatus[ticket.status]++
    byPriority[ticket.priority]++
    byCategory[ticket.category]++
    
    if (ticket.clasificacionFinal) {
      byClasificacion[ticket.clasificacionFinal]++
    }
    
    if (ticket.areaResponsable) {
      byArea[ticket.areaResponsable]++
    }

    // Calcular tiempo promedio de resolución
    if (ticket.closedAt && ticket.createdAt) {
      const created = new Date(ticket.createdAt).getTime()
      const closed = new Date(ticket.closedAt).getTime()
      totalResolutionTime += (closed - created) / (1000 * 60 * 60) // en horas
      closedCount++
    }
  })
  
  // Actividades en las últimas 24 horas
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentActivity = activities.filter(
    a => new Date(a.timestamp) > oneDayAgo
  ).length
  
  return {
    total: tickets.length,
    byStatus,
    byPriority,
    byCategory,
    byClasificacion,
    byArea,
    recentActivity,
    avgResolutionTime: closedCount > 0 ? Math.round(totalResolutionTime / closedCount) : 0
  }
}

// Función para generar reporte exportable
export function generateReport(): TicketReportRow[] {
  const clasificacionLabels: Record<ClasificacionFinal, string> = {
    tecnica: "Tecnica",
    operativa: "Operativa",
    solicitud: "Solicitud",
    proyecto: "Proyecto"
  }

  const causaLabels: Record<CausaRaiz, string> = {
    "falla-tecnica": "Falla tecnica",
    "error-captura": "Error de captura",
    "uso-incorrecto": "Uso incorrecto",
    "falta-informacion": "Falta de informacion",
    "proveedor-externo": "Proveedor externo"
  }

  return tickets.map(ticket => {
    let tiempoResolucion = "En proceso"
    if (ticket.closedAt && ticket.createdAt) {
      const created = new Date(ticket.createdAt).getTime()
      const closed = new Date(ticket.closedAt).getTime()
      const hours = Math.round((closed - created) / (1000 * 60 * 60))
      tiempoResolucion = hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`
    }

    return {
      id: ticket.id,
      fecha: new Date(ticket.createdAt).toLocaleDateString("es-ES"),
      titulo: ticket.title,
      area: ticket.areaResponsable || "Sin asignar",
      tipo: ticket.clasificacionFinal ? clasificacionLabels[ticket.clasificacionFinal] : "Sin clasificar",
      causa: ticket.causaRaiz ? causaLabels[ticket.causaRaiz] : "Sin definir",
      tiempoResolucion,
      estado: ticket.status
    }
  })
}

// Exportar reporte a CSV
export function exportToCSV(): string {
  const report = generateReport()
  const headers = ["ID", "Fecha", "Titulo", "Area", "Tipo", "Causa", "Tiempo Resolucion", "Estado"]
  const rows = report.map(r => [
    r.id,
    r.fecha,
    `"${r.titulo.replace(/"/g, '""')}"`,
    r.area,
    r.tipo,
    r.causa,
    r.tiempoResolucion,
    r.estado
  ])
  
  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
}
