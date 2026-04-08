// Nuevos estatus incluyendo esperas
export type TicketStatus = 
  | "abierto" 
  | "en-progreso" 
  | "en-espera-usuario" 
  | "en-espera-area" 
  | "en-espera-proveedor" 
  | "resuelto" 
  | "cerrado"

export type TicketPriority = "baja" | "media" | "alta" | "urgente"
export type TicketCategory = "soporte" | "bug" | "mejora" | "consulta" | "otro"

// Clasificación final (obligatorio al cerrar)
export type ClasificacionFinal = "tecnica" | "operativa" | "solicitud" | "proyecto"

// Causa raíz (obligatorio al cerrar)
export type CausaRaiz = 
  | "falla-tecnica" 
  | "error-captura" 
  | "uso-incorrecto" 
  | "falta-informacion" 
  | "proveedor-externo"

// Áreas responsables
export type AreaResponsable = 
  | "TI" 
  | "RH" 
  | "Ventas" 
  | "Produccion" 
  | "Finanzas" 
  | "Compras" 
  | "Calidad" 
  | "Logistica"
  | "Otro"

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
  // Nuevos campos
  areaResponsable?: AreaResponsable
  sistemaAfectado?: string
  // Campos obligatorios al cerrar
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
  avgResolutionTime: number // en horas
}

// Para exportación de reportes
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
