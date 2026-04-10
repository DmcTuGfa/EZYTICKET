"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Pencil, ShieldCheck, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { SignaturePad } from "@/components/signature-pad"
import { closeMaintenance, updateMaintenance } from "@/lib/db/maintenances"
import type { Maintenance, MaintenanceStatus, MaintenanceType, Site } from "@/lib/types"

interface Props {
  maintenances: Maintenance[]
  sites: Site[]
  onUpdate?: () => void
}

const statusColors: Record<MaintenanceStatus, string> = {
  abierto: "bg-warning/20 text-warning border-warning/30",
  en_proceso: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  cerrado: "bg-success/20 text-success border-success/30",
}

const typeColors: Record<MaintenanceType, string> = {
  preventivo: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  correctivo: "bg-warning/20 text-warning border-warning/30",
}


function formatDate(value?: string) {
  if (!value) return "-"
  return new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
}

function escapeHtml(value?: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function MaintenanceList({ maintenances, sites, onUpdate }: Props) {
  const router = useRouter()
  const [selectedSite, setSelectedSite] = useState<string>("all")
  const [editItem, setEditItem] = useState<Maintenance | null>(null)
  const [closeItem, setCloseItem] = useState<Maintenance | null>(null)
  const [closingName, setClosingName] = useState("")
  const [signatureData, setSignatureData] = useState("")
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    return maintenances.filter((item) => selectedSite === "all" || String(item.siteId) === selectedSite)
  }, [maintenances, selectedSite])

  const handleEdit = async () => {
    if (!editItem) return
    setSaving(true)
    try {
      await updateMaintenance(editItem.id, editItem)
      setEditItem(null)
      onUpdate?.()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = async () => {
    if (!closeItem || !closingName.trim() || !signatureData) return
    setSaving(true)
    try {
      await closeMaintenance(closeItem.id, closingName.trim(), signatureData)
      setCloseItem(null)
      setClosingName("")
      setSignatureData("")
      onUpdate?.()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const statusLabel: Record<MaintenanceStatus, string> = {
    abierto: "Abierto",
    en_proceso: "En proceso",
    cerrado: "Cerrado",
  }

  const handleDownloadPDF = (item: Maintenance) => {
    const printWindow = window.open("", "_blank", "width=900,height=1200")
    if (!printWindow) return

    const siteName = item.siteName || `Sede ${item.siteId}`
    const status = statusLabel[item.status]
    const type = item.maintenanceType.charAt(0).toUpperCase() + item.maintenanceType.slice(1)
    const signatureBlock = item.signatureData
      ? `<div class="signature-box"><img src="${item.signatureData}" alt="Firma" /></div>`
      : `<div class="signature-box empty">Sin firma registrada</div>`

    printWindow.document.write(`
      <html>
        <head>
          <title>${escapeHtml(item.folio)} - Mantenimiento</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 24px; }
            .sheet { max-width: 900px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 700; }
            .folio { font-size: 14px; color: #4b5563; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .card { border: 1px solid #d1d5db; border-radius: 14px; padding: 16px; background: #f9fafb; }
            .label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .04em; }
            .value { font-size: 15px; color: #111827; white-space: pre-wrap; word-break: break-word; }
            .full { grid-column: 1 / -1; }
            .signature-title { margin-top: 8px; margin-bottom: 8px; font-size: 14px; font-weight: 700; }
            .signature-box { min-height: 180px; border: 2px dashed #9ca3af; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: #fff; padding: 8px; }
            .signature-box.empty { color: #6b7280; font-size: 14px; }
            .signature-box img { max-width: 100%; max-height: 160px; object-fit: contain; }
            @media print { body { padding: 0; } .sheet { max-width: none; } }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div>
                <div class="title">Reporte individual de mantenimiento</div>
                <div class="folio">${escapeHtml(item.folio)}</div>
              </div>
              <div class="folio">Generado: ${escapeHtml(formatDate(new Date().toISOString()))}</div>
            </div>

            <div class="grid">
              <div class="card"><span class="label">Sede</span><div class="value">${escapeHtml(siteName)}</div></div>
              <div class="card"><span class="label">Estado</span><div class="value">${escapeHtml(status)}</div></div>
              <div class="card"><span class="label">Tipo</span><div class="value">${escapeHtml(type)}</div></div>
              <div class="card"><span class="label">Fecha</span><div class="value">${escapeHtml(formatDate(item.createdAt))}</div></div>
              <div class="card full"><span class="label">Título</span><div class="value">${escapeHtml(item.title)}</div></div>
              <div class="card full"><span class="label">Descripción</span><div class="value">${escapeHtml(item.description || "Sin descripción")}</div></div>
              <div class="card full"><span class="label">Problema reportado</span><div class="value">${escapeHtml(item.reportedIssue || "Sin problema reportado")}</div></div>
              <div class="card"><span class="label">Técnico</span><div class="value">${escapeHtml(item.technicianName || "Sin asignar")}</div></div>
              <div class="card"><span class="label">Número de serie</span><div class="value">${escapeHtml(item.serialNumber || "No definido")}</div></div>
              <div class="card"><span class="label">Responsable</span><div class="value">${escapeHtml(item.responsibleName || "No definido")}</div></div>
              <div class="card"><span class="label">Recibido por</span><div class="value">${escapeHtml(item.receivedBy || "No definido")}</div></div>
              <div class="card full">
                <div class="signature-title">Firma de conformidad</div>
                ${signatureBlock}
              </div>
            </div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 300)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label>Filtrar por sede</Label>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las sedes</SelectItem>
              {sites.map((site) => (
                <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">Historial total: {filtered.length} mantenimiento(s)</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-base break-words">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground break-all">{item.folio} · {item.siteName || `Sede ${item.siteId}`}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={typeColors[item.maintenanceType]}>{item.maintenanceType}</Badge>
                <Badge className={statusColors[item.status]}>{statusLabel[item.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-sm">
                <p><span className="font-medium text-foreground">Descripcion:</span> {item.description || "Sin descripcion"}</p>
                <p><span className="font-medium text-foreground">Problema:</span> {item.reportedIssue || "Sin problema reportado"}</p>
                <p><span className="font-medium text-foreground">Tecnico:</span> {item.technicianName || "Sin asignar"}</p>
                <p><span className="font-medium text-foreground">Numero de serie:</span> {item.serialNumber || "No definido"}</p>
                <p><span className="font-medium text-foreground">Responsable:</span> {item.responsibleName || "No definido"}</p>
                <p><span className="font-medium text-foreground">Recibido por:</span> {item.receivedBy || "No definido"}</p>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Smartphone className="h-4 w-4" />
                  Cierre con firma en celular
                </div>
                <p className="mt-1">Usa el boton <span className="font-semibold">Finalizar y pedir firma</span>. Se abrira una ventana donde aparece el area para firmar con el dedo.</p>
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => setEditItem({ ...item })}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => handleDownloadPDF(item)}>
                  <FileText className="h-4 w-4" />
                  PDF individual
                </Button>
                {item.status !== "cerrado" && (
                  <Button className="w-full gap-2 sm:w-auto" onClick={() => setCloseItem(item)}>
                    <ShieldCheck className="h-4 w-4" />
                    Finalizar y pedir firma
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(editItem)} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[650px] bg-card border-border max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Editar mantenimiento</DialogTitle>
            <DialogDescription>Actualiza los datos del mantenimiento seleccionado.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={editItem.maintenanceType} onValueChange={(value: MaintenanceType) => setEditItem((prev) => prev ? { ...prev, maintenanceType: value } : prev)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="correctivo">Correctivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={editItem.status} onValueChange={(value: MaintenanceStatus) => setEditItem((prev) => prev ? { ...prev, status: value } : prev)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="en_proceso">En proceso</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sede</Label>
                <Select value={String(editItem.siteId)} onValueChange={(value) => setEditItem((prev) => prev ? { ...prev, siteId: Number(value) } : prev)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input value={editItem.title} onChange={(e) => setEditItem((prev) => prev ? { ...prev, title: e.target.value } : prev)} />
              </div>
              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea rows={3} value={editItem.description || ""} onChange={(e) => setEditItem((prev) => prev ? { ...prev, description: e.target.value } : prev)} />
              </div>
              <div className="space-y-2">
                <Label>Problema reportado</Label>
                <Textarea rows={3} value={editItem.reportedIssue || ""} onChange={(e) => setEditItem((prev) => prev ? { ...prev, reportedIssue: e.target.value } : prev)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tecnico</Label>
                  <Input value={editItem.technicianName || ""} onChange={(e) => setEditItem((prev) => prev ? { ...prev, technicianName: e.target.value } : prev)} />
                </div>
                <div className="space-y-2">
                  <Label>Numero de serie</Label>
                  <Input value={editItem.serialNumber || ""} onChange={(e) => setEditItem((prev) => prev ? { ...prev, serialNumber: e.target.value } : prev)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre del responsable</Label>
                  <Input value={editItem.responsibleName || ""} onChange={(e) => setEditItem((prev) => prev ? { ...prev, responsibleName: e.target.value } : prev)} />
                </div>
                <div className="space-y-2">
                  <Label>Recibido por</Label>
                  <Input value={editItem.receivedBy || ""} onChange={(e) => setEditItem((prev) => prev ? { ...prev, receivedBy: e.target.value } : prev)} />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button>
                <Button onClick={handleEdit} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(closeItem)} onOpenChange={(open) => !open && setCloseItem(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[760px] rounded-xl bg-card border-border max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Finalizar mantenimiento con firma</DialogTitle>
            <DialogDescription>
              En celular, firma directamente en el recuadro blanco con el dedo. La firma es obligatoria para cerrar.
            </DialogDescription>
          </DialogHeader>
          {closeItem && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">{closeItem.title}</p>
                <p className="text-muted-foreground">{closeItem.folio} · {closeItem.siteName || `Sede ${closeItem.siteId}`}</p>
              </div>
              <div className="space-y-2">
                <Label>Recibido por</Label>
                <Input value={closingName} onChange={(e) => setClosingName(e.target.value)} placeholder="Nombre de la persona que recibe y firma" />
              </div>
              <div className="space-y-2">
                <Label>Firma de confirmacion</Label>
                <SignaturePad value={signatureData} onChange={setSignatureData} />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => { setCloseItem(null); setClosingName(""); setSignatureData("") }}>Cancelar</Button>
                <Button onClick={handleClose} disabled={saving || !closingName.trim() || !signatureData}>
                  {saving ? "Cerrando..." : "Finalizar y cerrar"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
