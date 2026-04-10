"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/neon"
import type { Maintenance, MaintenanceStatus, MaintenanceType, Site } from "@/lib/types"

function toIso(value?: string | null): string | undefined {
  return value ? new Date(value).toISOString() : undefined
}

function toDateOnly(value?: string | null): string | undefined {
  if (!value) return undefined
  return new Date(value).toISOString().split("T")[0]
}

function normalizeSite(row: Record<string, any>): Site {
  return {
    id: Number(row.id),
    code: row.code,
    name: row.name,
    address: row.address || undefined,
    description: row.description || undefined,
    active: !!row.active,
  }
}

function normalizeMaintenance(row: Record<string, any>): Maintenance {
  return {
    id: Number(row.id),
    folio: row.folio,
    maintenanceType: row.maintenance_type as MaintenanceType,
    status: row.status as MaintenanceStatus,
    siteId: Number(row.site_id),
    siteName: row.site_name || undefined,
    title: row.title,
    description: row.description || undefined,
    reportedIssue: row.reported_issue || undefined,
    workPerformed: row.work_performed || undefined,
    recommendations: row.recommendations || undefined,
    scheduledDate: toDateOnly(row.scheduled_date),
    openedAt: toIso(row.opened_at) || new Date().toISOString(),
    completedAt: toIso(row.completed_at),
    technicianName: row.technician_name || undefined,
    requestedByName: row.requested_by_name || undefined,
    confirmedByName: row.confirmed_by_name || undefined,
    confirmedByPosition: row.confirmed_by_position || undefined,
    signatureData: row.signature_data || undefined,
    mobileOnly: !!row.mobile_only,
    createdBy: row.created_by || undefined,
    createdAt: toIso(row.created_at) || new Date().toISOString(),
    updatedAt: toIso(row.updated_at) || new Date().toISOString(),
  }
}

export async function getSites(): Promise<Site[]> {
  const rows = await sql`select * from sites where active = true order by name asc`
  return rows.map(normalizeSite)
}

export async function getMaintenances(): Promise<Maintenance[]> {
  const rows = await sql`
    select m.*, s.name as site_name
    from maintenances m
    join sites s on s.id = m.site_id
    order by m.created_at desc
  `
  return rows.map(normalizeMaintenance)
}

export async function createMaintenance(data: {
  maintenanceType: MaintenanceType
  siteId: number
  title: string
  description?: string
  reportedIssue?: string
  workPerformed?: string
  recommendations?: string
  scheduledDate?: string
  technicianName?: string
  requestedByName?: string
  confirmedByName?: string
  confirmedByPosition?: string
  signatureData?: string
  createdBy?: string
}): Promise<Maintenance> {
  const folioRows = await sql`
    select coalesce(max(id), 0) + 1 as next_id from maintenances
  `
  const nextId = Number(folioRows[0]?.next_id || 1)
  const folio = `MNT-${String(nextId).padStart(4, "0")}`

  const rows = await sql`
    insert into maintenances (
      folio, maintenance_type, status, site_id, title, description, reported_issue,
      work_performed, recommendations, scheduled_date, technician_name,
      requested_by_name, confirmed_by_name, confirmed_by_position, signature_data,
      mobile_only, created_by
    ) values (
      ${folio}, ${data.maintenanceType}, ${"pendiente_confirmacion"}, ${data.siteId}, ${data.title}, ${data.description ?? null}, ${data.reportedIssue ?? null},
      ${data.workPerformed ?? null}, ${data.recommendations ?? null}, ${data.scheduledDate ?? null}, ${data.technicianName ?? null},
      ${data.requestedByName ?? null}, ${data.confirmedByName ?? null}, ${data.confirmedByPosition ?? null}, ${data.signatureData ?? null},
      true, ${data.createdBy ?? null}
    )
    returning *
  `

  await sql`
    insert into maintenance_logs (maintenance_id, action, description, performed_by)
    values (${rows[0].id}, ${"created"}, ${"Mantenimiento creado"}, ${data.createdBy ?? "Sistema"})
  `

  revalidatePath("/")
  const full = await sql`
    select m.*, s.name as site_name
    from maintenances m
    join sites s on s.id = m.site_id
    where m.id = ${rows[0].id}
    limit 1
  `
  return normalizeMaintenance(full[0])
}
