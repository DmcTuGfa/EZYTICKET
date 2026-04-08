"use server"

import { revalidatePath } from "next/cache"
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

async function addActivityInternal(data: Omit<Activity, "id" | "timestamp">): Promise<Activity> {
  const inserted = await sql`
    insert into activities (ticket_id, type, description, user_name, previous_value, new_value)
    values (${data.ticketId}, ${data.type}, ${data.description}, ${data.user}, ${data.previousValue ?? null}, ${data.newValue ?? null})
    returning *
  `

  return normalizeActivity(inserted[0])
}

export async function getTickets(): Promise<Ticket[]> {
  const rows = await sql`select * from tickets order by created_at desc`
  return rows.map(normalizeTicket)
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  const rows = await sql`select * from tickets where id = ${id} limit 1`
  return rows[0] ? normalizeTicket(rows[0]) : undefined
}

export async function createTicket(data: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Promise<Ticket> {
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

  revalidatePath("/")
  return newTicket
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
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

  revalidatePath("/")
  return updatedTicket
}

export async function deleteTicket(id: string): Promise<boolean> {
  await sql`delete from activities where ticket_id = ${id}`
  const result = await sql`delete from tickets where id = ${id} returning id`
  revalidatePath("/")
  return result.length > 0
}

export async function getActivities(limit?: number): Promise<Activity[]> {
  const rows = typeof limit === "number"
    ? await sql`select * from activities order by timestamp desc limit ${limit}`
    : await sql`select * from activities order by timestamp desc`

  return rows.map(normalizeActivity)
}

export async function getActivitiesByTicket(ticketId: string): Promise<Activity[]> {
  const rows = await sql`select * from activities where ticket_id = ${ticketId} order by timestamp desc`
  return rows.map(normalizeActivity)
}

export async function addActivity(data: Omit<Activity, "id" | "timestamp">): Promise<Activity> {
  const activity = await addActivityInternal(data)
  revalidatePath("/")
  return activity
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
