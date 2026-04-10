"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/neon"
import type { Maintenance, MaintenanceLog, MaintenanceStats, MaintenanceStatus, MaintenanceType, Site } from "@/lib/types"

function toIso(value?: string | null) {
  return value ? new Date(value).toISOString() : new Date().toISOString()
}

function normalizeSite(row: Record<string, any>): Site {
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description || undefined,
    active: row.active ?? true,
  }
}

function normalizeMaintenance(row: Record<string, any>): Maintenance {
  return {
    id: Number(row.id),
    folio: row.folio,
    maintenanceType: row.maintenance_type,
    status: row.status,
    siteId: Number(row.site_id),
    siteName: row.site_name || row.name || undefined,
    title: row.title || "",
    description: row.description || undefined,
    reportedIssue: row.reported_issue || undefined,
    technicianName: row.technician_name || undefined,
    serialNumber: row.serial_number || undefined,
    responsibleName: row.responsible_name || undefined,
    receivedBy: row.received_by || row.requested_by || undefined,
    signatureData: row.signature_data || undefined,
    createdAt: toIso(row.created_at),
    updatedAt: row.updated_at ? toIso(row.updated_at) : undefined,
  }
}

function normalizeLog(row: Record<string, any>): MaintenanceLog {
  return {
    id: Number(row.id),
    maintenanceId: Number(row.maintenance_id),
    action: row.action,
    comment: row.comment || undefined,
    createdAt: toIso(row.created_at),
  }
}

async function addLog(maintenanceId: number, action: string, comment?: string) {
  try {
    await sql`
      insert into maintenance_logs (maintenance_id, action, comment)
      values (${maintenanceId}, ${action}, ${comment ?? null})
    `
  } catch {
    // tabla opcional para no romper el flujo
  }
}

export async function getSites(): Promise<Site[]> {
  const rows = await sql`
    select id, name, description, coalesce(active, true) as active
    from sites
    where coalesce(active, true) = true
    order by name asc
  `
  return rows.map(normalizeSite)
}

export async function getMaintenances(): Promise<Maintenance[]> {
  const rows = await sql`
    select m.*, s.name as site_name
    from maintenances m
    left join sites s on s.id = m.site_id
    order by m.created_at desc, m.id desc
  `
  return rows.map(normalizeMaintenance)
}

export async function getMaintenanceLogs(maintenanceId: number): Promise<MaintenanceLog[]> {
  try {
    const rows = await sql`
      select * from maintenance_logs
      where maintenance_id = ${maintenanceId}
      order by created_at desc, id desc
    `
    return rows.map(normalizeLog)
  } catch {
    return []
  }
}

export async function createMaintenance(data: Omit<Maintenance, "id" | "folio" | "createdAt" | "updatedAt" | "siteName" | "signatureData"> & { signatureData?: string }): Promise<Maintenance> {
  const folio = `MNT-${Date.now()}`
  const rows = await sql`
    insert into maintenances (
      folio, maintenance_type, status, site_id, title, description, reported_issue,
      technician_name, serial_number, responsible_name, received_by, signature_data, created_at, updated_at
    ) values (
      ${folio},
      ${data.maintenanceType},
      ${data.status},
      ${data.siteId},
      ${data.title},
      ${data.description ?? null},
      ${data.reportedIssue ?? null},
      ${data.technicianName ?? null},
      ${data.serialNumber ?? null},
      ${data.responsibleName ?? null},
      ${data.receivedBy ?? null},
      ${data.signatureData ?? null},
      now(),
      now()
    )
    returning *
  `

  const created = normalizeMaintenance(rows[0])
  await addLog(created.id, "CREADO", `Mantenimiento ${created.folio} creado`)
  revalidatePath("/")
  return created
}

export async function updateMaintenance(id: number, updates: Partial<Maintenance>): Promise<Maintenance | null> {
  const rows = await sql`
    update maintenances
    set
      maintenance_type = coalesce(${updates.maintenanceType ?? null}, maintenance_type),
      status = coalesce(${updates.status ?? null}, status),
      site_id = coalesce(${updates.siteId ?? null}, site_id),
      title = coalesce(${updates.title ?? null}, title),
      description = coalesce(${updates.description ?? null}, description),
      reported_issue = coalesce(${updates.reportedIssue ?? null}, reported_issue),
      technician_name = coalesce(${updates.technicianName ?? null}, technician_name),
      serial_number = coalesce(${updates.serialNumber ?? null}, serial_number),
      responsible_name = coalesce(${updates.responsibleName ?? null}, responsible_name),
      received_by = coalesce(${updates.receivedBy ?? null}, received_by),
      signature_data = coalesce(${updates.signatureData ?? null}, signature_data),
      updated_at = now()
    where id = ${id}
    returning *
  `

  if (!rows[0]) return null
  await addLog(id, "EDITADO", `Mantenimiento ${rows[0].folio} actualizado`)
  revalidatePath("/")
  return normalizeMaintenance(rows[0])
}

export async function closeMaintenance(id: number, confirmedBy: string, signatureData: string): Promise<Maintenance | null> {
  const rows = await sql`
    update maintenances
    set
      status = 'cerrado',
      received_by = ${confirmedBy},
      signature_data = ${signatureData},
      updated_at = now()
    where id = ${id}
    returning *
  `

  if (!rows[0]) return null
  await addLog(id, "CERRADO", `Cerrado por ${confirmedBy}`)
  revalidatePath("/")
  return normalizeMaintenance(rows[0])
}

export async function getMaintenanceStats(): Promise<MaintenanceStats> {
  const maintenances = await getMaintenances()
  const byStatus: Record<MaintenanceStatus, number> = {
    abierto: 0,
    en_proceso: 0,
    cerrado: 0,
  }
  const byType: Record<MaintenanceType, number> = {
    preventivo: 0,
    correctivo: 0,
  }
  const bySite: Record<string, number> = {}

  for (const item of maintenances) {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1
    byType[item.maintenanceType] = (byType[item.maintenanceType] || 0) + 1
    const key = item.siteName || `Sede ${item.siteId}`
    bySite[key] = (bySite[key] || 0) + 1
  }

  return {
    total: maintenances.length,
    byStatus,
    byType,
    bySite,
  }
}
