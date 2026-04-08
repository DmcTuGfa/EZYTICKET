"use server"

import { sql } from "@/lib/neon"
import type {
  Activity,
  AreaResponsable,
  CausaRaiz,
  ClasificacionFinal,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketReportRow,
  TicketStats,
  TicketStatus,
} from "@/lib/types"

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
    sistemaAfectado: "App Movil",
    fechaAlta: "2026-04-06",
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
    sistemaAfectado: "CRM",
    fechaAlta: "2026-04-05",
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
    causaRaiz: "falta-informacion",
    fechaAlta: "2026-04-04",
  },
]

const initialActivities: Activity[] = [
  {
    id: "ACT-001",
    ticketId: "TKT-001",
    type: "created",
    description: "Ticket creado",
    timestamp: "2026-04-06T10:00:00Z",
    user: "Juan Garcia",
  },
  {
    id: "ACT-002",
    ticketId: "TKT-002",
    type: "status_change",
    description: "Estado cambiado de 'abierto' a 'en-progreso'",
    timestamp: "2026-04-07T09:15:00Z",
    user: "Carlos Ruiz",
    previousValue: "abierto",
    newValue: "en-progreso",
  },
]

let fallbackTickets = [...initialTickets]
let fallbackActivities = [...initialActivities]

function toIso(value?: string | null): string | undefined {
  return value ? new Date(value).toISOString() : undefined
}

function toDateOnly(value?: string | null): string | undefined {
  if (!value) return undefined
  return new Date(value).toISOString().split("T")[0]
}

function normalizeTicket(row: Record<string, any>): Ticket {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    category: row.category,
    createdAt: toIso(row.created_at) || new Date().toISOString(),
    updatedAt: toIso(row.updated_at) || new Date().toISOString(),
    closedAt: toIso(row.closed_at),
    assignee: row.assignee || undefined,
    reporter: row.reporter,
    areaResponsable: row.area_responsable || undefined,
    sistemaAfectado: row.sistema_afectado || undefined,
    fechaAlta: toDateOnly(row.fecha_alta) || undefined,
    clasificacionFinal: row.clasificacion_final || undefined,
    causaRaiz: row.causa_raiz || undefined,
  }
}

function normalizeActivity(row: Record<string, any>): Activity {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    type: row.type,
    description: row.description,
    timestamp: toIso(row.timestamp) || new Date().toISOString(),
    user: row.user_name || row.user || "Sistema",
    previousValue: row.previous_value || undefined,
    newValue: row.new_value || undefined,
  }
}

function nextId(prefix: string, current: string[]) {
  const max = current.reduce((acc, item) => {
    const num = Number(item.replace(`${prefix}-`, ""))
    return Number.isFinite(num) ? Math.max(acc, num) : acc
  }, 0)
  return `${prefix}-${String(max + 1).padStart(3, "0")}`
}

async function addActivityInternal(data: Omit<Activity, "id" | "timestamp">): Promise<Activity> {
  if (!sql) {
    const newActivity: Activity = {
      ...data,
      id: nextId("ACT", fallbackActivities.map((a) => a.id)),
      timestamp: new Date().toISOString(),
    }
    fallbackActivities = [newActivity, ...fallbackActivities]
    return newActivity
  }

  const inserted = await sql`
    insert into activities (ticket_id, type, description, user_name, previous_value, new_value)
    values (${data.ticketId}, ${data.type}, ${data.description}, ${data.user}, ${data.previousValue ?? null}, ${data.newValue ?? null})
    returning *
  `

  return normalizeActivity(inserted[0])
}

export async function getTickets(): Promise<Ticket[]> {
  if (!sql) return [...fallbackTickets]
  const rows = await sql`select * from tickets order by created_at desc`
  return rows.map(normalizeTicket)
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  if (!sql) return fallbackTickets.find((t) => t.id === id)
  const rows = await sql`select * from tickets where id = ${id} limit 1`
  return rows[0] ? normalizeTicket(rows[0]) : undefined
}

export async function createTicket(data: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Promise<Ticket> {
  const now = new Date().toISOString()

  if (!sql) {
    const newTicket: Ticket = {
      ...data,
      id: nextId("TKT", fallbackTickets.map((t) => t.id)),
      createdAt: now,
      updatedAt: now,
    }
    fallbackTickets = [newTicket, ...fallbackTickets]
    await addActivityInternal({
      ticketId: newTicket.id,
      type: "created",
      description: `Ticket "${newTicket.title}" creado`,
      user: newTicket.reporter,
    })
    return newTicket
  }

  const rows = await sql`
    insert into tickets (
      title, description, status, priority, category, reporter, assignee,
      area_responsable, sistema_afectado, fecha_alta, clasificacion_final, causa_raiz
    ) values (
      ${data.title}, ${data.description}, ${data.status}, ${data.priority}, ${data.category}, ${data.reporter}, ${data.assignee ?? null},
      ${data.areaResponsable ?? null}, ${data.sistemaAfectado ?? null}, ${data.fechaAlta ?? null}, ${data.clasificacionFinal ?? null}, ${data.causaRaiz ?? null}
    )
    returning *
  `

  const newTicket = normalizeTicket(rows[0])

  await addActivityInternal({
    ticketId: newTicket.id,
    type: "created",
    description: `Ticket "${newTicket.title}" creado`,
    user: newTicket.reporter,
  })

  return newTicket
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
  if (!sql) {
    const index = fallbackTickets.findIndex((t) => t.id === id)
    if (index === -1) return null
    const oldTicket = fallbackTickets[index]
    const updatedTicket: Ticket = {
      ...oldTicket,
      ...updates,
      updatedAt: new Date().toISOString(),
      closedAt:
        (updates.status === "cerrado" || updates.status === "resuelto") && !oldTicket.closedAt
          ? new Date().toISOString()
          : oldTicket.closedAt,
    }
    fallbackTickets[index] = updatedTicket

    if (updates.status && updates.status !== oldTicket.status) {
      const isClosed = updates.status === "cerrado" || updates.status === "resuelto"
      await addActivityInternal({
        ticketId: id,
        type: isClosed ? "closed" : "status_change",
        description: isClosed
          ? `Ticket cerrado - Clasificacion: ${updates.clasificacionFinal || "N/A"}, Causa: ${updates.causaRaiz || "N/A"}`
          : `Estado cambiado de "${oldTicket.status}" a "${updates.status}"`,
        user: "Sistema",
        previousValue: oldTicket.status,
        newValue: updates.status,
      })
    }

    if (updates.priority && updates.priority !== oldTicket.priority) {
      await addActivityInternal({
        ticketId: id,
        type: "priority_change",
        description: `Prioridad cambiada de "${oldTicket.priority}" a "${updates.priority}"`,
        user: "Sistema",
        previousValue: oldTicket.priority,
        newValue: updates.priority,
      })
    }

    return updatedTicket
  }

  const current = await getTicketById(id)
  if (!current) return null

  const shouldClose = (updates.status === "cerrado" || updates.status === "resuelto") && !current.closedAt
  const rows = await sql`
    update tickets
    set
      title = ${updates.title ?? current.title},
      description = ${updates.description ?? current.description},
      status = ${updates.status ?? current.status},
      priority = ${updates.priority ?? current.priority},
      category = ${updates.category ?? current.category},
      reporter = ${updates.reporter ?? current.reporter},
      assignee = ${updates.assignee ?? current.assignee ?? null},
      area_responsable = ${updates.areaResponsable ?? current.areaResponsable ?? null},
      sistema_afectado = ${updates.sistemaAfectado ?? current.sistemaAfectado ?? null},
      fecha_alta = ${updates.fechaAlta ?? current.fechaAlta ?? null},
      clasificacion_final = ${updates.clasificacionFinal ?? current.clasificacionFinal ?? null},
      causa_raiz = ${updates.causaRaiz ?? current.causaRaiz ?? null},
      closed_at = ${shouldClose ? new Date().toISOString() : current.closedAt ?? null},
      updated_at = now()
    where id = ${id}
    returning *
  `

  const updatedTicket = normalizeTicket(rows[0])

  if (updates.status && updates.status !== current.status) {
    const isClosed = updates.status === "cerrado" || updates.status === "resuelto"
    await addActivityInternal({
      ticketId: id,
      type: isClosed ? "closed" : "status_change",
      description: isClosed
        ? `Ticket cerrado - Clasificacion: ${updates.clasificacionFinal || updatedTicket.clasificacionFinal || "N/A"}, Causa: ${updates.causaRaiz || updatedTicket.causaRaiz || "N/A"}`
        : `Estado cambiado de "${current.status}" a "${updates.status}"`,
      user: "Sistema",
      previousValue: current.status,
      newValue: updates.status,
    })
  }

  if (updates.priority && updates.priority !== current.priority) {
    await addActivityInternal({
      ticketId: id,
      type: "priority_change",
      description: `Prioridad cambiada de "${current.priority}" a "${updates.priority}"`,
      user: "Sistema",
      previousValue: current.priority,
      newValue: updates.priority,
    })
  }

  return updatedTicket
}

export async function deleteTicket(id: string): Promise<boolean> {
  if (!sql) {
    const initialLength = fallbackTickets.length
    fallbackTickets = fallbackTickets.filter((t) => t.id !== id)
    fallbackActivities = fallbackActivities.filter((a) => a.ticketId !== id)
    return fallbackTickets.length < initialLength
  }

  await sql`delete from activities where ticket_id = ${id}`
  const result = await sql`delete from tickets where id = ${id} returning id`
  return result.length > 0
}

export async function getActivities(limit?: number): Promise<Activity[]> {
  if (!sql) {
    const sorted = [...fallbackActivities].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted
  }

  const rows = typeof limit === "number"
    ? await sql`select * from activities order by timestamp desc limit ${limit}`
    : await sql`select * from activities order by timestamp desc`

  return rows.map(normalizeActivity)
}

export async function getActivitiesByTicket(ticketId: string): Promise<Activity[]> {
  if (!sql) {
    return fallbackActivities
      .filter((a) => a.ticketId === ticketId)
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
  }

  const rows = await sql`select * from activities where ticket_id = ${ticketId} order by timestamp desc`
  return rows.map(normalizeActivity)
}

export async function addActivity(data: Omit<Activity, "id" | "timestamp">): Promise<Activity> {
  return addActivityInternal(data)
}

export async function getStats(): Promise<TicketStats> {
  const tickets = await getTickets()
  const activities = await getActivities()

  const byStatus: Record<TicketStatus, number> = {
    abierto: 0,
    "en-progreso": 0,
    "en-espera-usuario": 0,
    "en-espera-area": 0,
    "en-espera-proveedor": 0,
    resuelto: 0,
    cerrado: 0,
  }

  const byPriority: Record<TicketPriority, number> = { baja: 0, media: 0, alta: 0, urgente: 0 }
  const byCategory: Record<TicketCategory, number> = { soporte: 0, bug: 0, mejora: 0, consulta: 0, otro: 0 }
  const byClasificacion: Record<ClasificacionFinal, number> = { tecnica: 0, operativa: 0, solicitud: 0, proyecto: 0 }
  const byArea: Record<AreaResponsable, number> = {
    TI: 0,
    RH: 0,
    Ventas: 0,
    Produccion: 0,
    Finanzas: 0,
    Compras: 0,
    Calidad: 0,
    Logistica: 0,
    Otro: 0,
  }

  let totalResolutionTime = 0
  let closedCount = 0

  for (const ticket of tickets) {
    byStatus[ticket.status]++
    byPriority[ticket.priority]++
    byCategory[ticket.category]++
    if (ticket.clasificacionFinal) byClasificacion[ticket.clasificacionFinal]++
    if (ticket.areaResponsable) byArea[ticket.areaResponsable]++
    if (ticket.closedAt) {
      totalResolutionTime += (+new Date(ticket.closedAt) - +new Date(ticket.createdAt)) / 36e5
      closedCount++
    }
  }

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  const recentActivity = activities.filter((a) => +new Date(a.timestamp) > oneDayAgo).length

  return {
    total: tickets.length,
    byStatus,
    byPriority,
    byCategory,
    byClasificacion,
    byArea,
    recentActivity,
    avgResolutionTime: closedCount > 0 ? Math.round(totalResolutionTime / closedCount) : 0,
  }
}

export async function generateReport(): Promise<TicketReportRow[]> {
  const tickets = await getTickets()
  const clasificacionLabels: Record<ClasificacionFinal, string> = {
    tecnica: "Tecnica",
    operativa: "Operativa",
    solicitud: "Solicitud",
    proyecto: "Proyecto",
  }
  const causaLabels: Record<CausaRaiz, string> = {
    "falla-tecnica": "Falla tecnica",
    "error-captura": "Error de captura",
    "uso-incorrecto": "Uso incorrecto",
    "falta-informacion": "Falta de informacion",
    "proveedor-externo": "Proveedor externo",
  }

  return tickets.map((ticket) => {
    let tiempoResolucion = "En proceso"
    if (ticket.closedAt) {
      const hours = Math.round((+new Date(ticket.closedAt) - +new Date(ticket.createdAt)) / 36e5)
      tiempoResolucion = hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`
    }
    return {
      id: ticket.id,
      fecha: new Date(ticket.fechaAlta || ticket.createdAt).toLocaleDateString("es-ES"),
      titulo: ticket.title,
      area: ticket.areaResponsable || "Sin asignar",
      tipo: ticket.clasificacionFinal ? clasificacionLabels[ticket.clasificacionFinal] : "Sin clasificar",
      causa: ticket.causaRaiz ? causaLabels[ticket.causaRaiz] : "Sin definir",
      tiempoResolucion,
      estado: ticket.status,
    }
  })
}

export async function exportToCSV(): Promise<string> {
  const report = await generateReport()
  const headers = ["ID", "Fecha", "Titulo", "Area", "Tipo", "Causa", "Tiempo Resolucion", "Estado"]
  const rows = report.map((r) => [
    r.id,
    r.fecha,
    `"${r.titulo.replace(/"/g, '""')}"`,
    r.area,
    r.tipo,
    r.causa,
    r.tiempoResolucion,
    r.estado,
  ])
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}
