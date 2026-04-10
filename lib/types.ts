export type TicketStatus = "abierto" | "en-progreso" | "en-espera-usuario" | "en-espera-area" | "en-espera-proveedor" | "resuelto" | "cerrado"
export type TicketPriority = "baja" | "media" | "alta" | "urgente"
export type TicketCategory = "soporte" | "bug" | "mejora" | "consulta" | "otro"
export type ClasificacionFinal = "tecnica" | "operativa" | "solicitud" | "proyecto"
export type CausaRaiz = "falla-tecnica" | "error-captura" | "uso-incorrecto" | "falta-informacion" | "otro"
export type AreaResponsable = "TI" | "RH" | "Ventas" | "Produccion" | "Finanzas" | "Compras" | "Calidad" | "Logistica" | "Otro"

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  createdAt: string
  updatedAt: string
  closedAt?: string
  assignee?: string
  reporter: string
  areaResponsable?: AreaResponsable
  sistemaAfectado?: string
  fechaAlta?: string
  clasificacionFinal?: ClasificacionFinal
  causaRaiz?: CausaRaiz
}

export interface Activity {
  id: string
  ticketId: string
  type: "created" | "status_change" | "comment" | "assigned" | "priority_change" | "closed"
  description: string
  timestamp: string
  user: string
  previousValue?: string
  newValue?: string
}

export interface TicketStats {
  total: number
  byStatus: Record<TicketStatus, number>
  byPriority: Record<TicketPriority, number>
  byCategory: Record<TicketCategory, number>
  byClasificacion: Record<ClasificacionFinal, number>
  byArea: Record<AreaResponsable, number>
  recentActivity: number
  avgResolutionTime: number
}

export interface TicketReportRow {
  id: string
  fecha: string
  titulo: string
  area: string
  tipo: string
  causa: string
  tiempoResolucion: string
  estado: string
}

export type MaintenanceType = "preventivo" | "correctivo"
export type MaintenanceStatus = "abierto" | "en_proceso" | "pendiente_confirmacion" | "cerrado" | "cancelado"

export interface Site {
  id: number
  code: string
  name: string
  address?: string
  description?: string
  active: boolean
}

export interface Maintenance {
  id: number
  folio: string
  maintenanceType: MaintenanceType
  status: MaintenanceStatus
  siteId: number
  siteName?: string
  title: string
  description?: string
  reportedIssue?: string
  workPerformed?: string
  recommendations?: string
  scheduledDate?: string
  openedAt: string
  completedAt?: string
  technicianName?: string
  requestedByName?: string
  confirmedByName?: string
  confirmedByPosition?: string
  signatureData?: string
  mobileOnly: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}
