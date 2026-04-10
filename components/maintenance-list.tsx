"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, ShieldCheck, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SignaturePad } from "@/components/signature-pad"
import { closeMaintenance, updateMaintenance } from "@/lib/db/maintenances"
import type { Maintenance, MaintenanceStatus, MaintenanceType, Site } from "@/lib/types"

interface Props {
  maintenances: Maintenance[]
  sites: Site[]
  onUpdate?: () => void
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
          <Card key={item.id} className="bg-card border-border">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.folio} · {item.siteName || `Sede ${item.siteId}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{item.maintenanceType}</span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{statusLabel[item.status]}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Descripcion:</span> {item.description || "Sin descripcion"}</p>
                <p><span className="font-medium">Problema:</span> {item.reportedIssue || "Sin problema reportado"}</p>
                <p><span className="font-medium">Tecnico:</span> {item.technicianName || "Sin asignar"}</p>
                <p><span className="font-medium">Solicitado por:</span> {item.requestedBy || "No definido"}</p>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Smartphone className="h-4 w-4" />
                  Cierre con firma en celular
                </div>
                <p className="mt-1">Usa el boton <span className="font-semibold">Finalizar y pedir firma</span>. Se abrira una ventana donde aparece el area para firmar con el dedo.</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" className="gap-2" onClick={() => setEditItem({ ...item })}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                {item.status !== "cerrado" && (
                  <Button className="gap-2" onClick={() => setCloseItem(item)}>
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
        <DialogContent className="sm:max-w-[650px] bg-card border-border max-h-[90vh] overflow-y-auto">
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
                  <Label>Solicitado por</Label>
                  <Input value={editItem.requestedBy || ""} onChange={(e) => setEditItem((prev) => prev ? { ...prev, requestedBy: e.target.value } : prev)} />
                </div>
              </div>
              <DialogFooter>
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
                <Label>Quien confirma</Label>
                <Input value={closingName} onChange={(e) => setClosingName(e.target.value)} placeholder="Nombre de la persona que recibe / confirma" />
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
