"use client"

import { useMemo, useState, useTransition } from "react"
import { createMaintenance } from "@/lib/db/maintenances"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SignaturePad } from "@/components/signature-pad"
import type { Site } from "@/lib/types"

interface Props {
  sites: Site[]
  currentUser?: string | null
  onCreated?: () => void
}

export function MaintenanceForm({ sites, currentUser, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [signatureData, setSignatureData] = useState("")
  const [form, setForm] = useState({
    maintenanceType: "preventivo",
    siteId: sites[0]?.id ? String(sites[0].id) : "",
    title: "",
    description: "",
    reportedIssue: "",
    workPerformed: "",
    recommendations: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    technicianName: currentUser || "",
    requestedByName: "",
    confirmedByName: "",
    confirmedByPosition: "",
  })

  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth <= 768, [])

  function submit() {
    startTransition(async () => {
      await createMaintenance({
        maintenanceType: form.maintenanceType as "preventivo" | "correctivo",
        siteId: Number(form.siteId),
        title: form.title,
        description: form.description || undefined,
        reportedIssue: form.reportedIssue || undefined,
        workPerformed: form.workPerformed || undefined,
        recommendations: form.recommendations || undefined,
        scheduledDate: form.scheduledDate || undefined,
        technicianName: form.technicianName || undefined,
        requestedByName: form.requestedByName || undefined,
        confirmedByName: form.confirmedByName || undefined,
        confirmedByPosition: form.confirmedByPosition || undefined,
        signatureData: signatureData || undefined,
        createdBy: currentUser || undefined,
      })
      setOpen(false)
      onCreated?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Nuevo mantenimiento</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mantenimiento preventivo / correctivo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.maintenanceType} onValueChange={(value) => setForm({ ...form, maintenanceType: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="preventivo">Preventivo</SelectItem>
                <SelectItem value="correctivo">Correctivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sede</Label>
            <Select value={form.siteId} onValueChange={(value) => setForm({ ...form, siteId: value })}>
              <SelectTrigger><SelectValue placeholder="Selecciona sede" /></SelectTrigger>
              <SelectContent>
                {sites.map((site) => <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej. Mantenimiento preventivo impresora recepción" />
          </div>
          <div className="space-y-2">
            <Label>Fecha programada</Label>
            <Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Técnico</Label>
            <Input value={form.technicianName} onChange={(e) => setForm({ ...form, technicianName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Solicitado por</Label>
            <Input value={form.requestedByName} onChange={(e) => setForm({ ...form, requestedByName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Confirma</Label>
            <Input value={form.confirmedByName} onChange={(e) => setForm({ ...form, confirmedByName: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Puesto de quien confirma</Label>
            <Input value={form.confirmedByPosition} onChange={(e) => setForm({ ...form, confirmedByPosition: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Problema reportado</Label>
            <Textarea value={form.reportedIssue} onChange={(e) => setForm({ ...form, reportedIssue: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Trabajo realizado</Label>
            <Textarea value={form.workPerformed} onChange={(e) => setForm({ ...form, workPerformed: e.target.value })} rows={4} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Recomendaciones</Label>
            <Textarea value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} rows={3} />
          </div>
          {isMobile && (
            <div className="space-y-2 md:col-span-2">
              <Label>Firma de conformidad</Label>
              <SignaturePad onChange={setSignatureData} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={pending || !form.title || !form.siteId}>
            {pending ? "Guardando..." : "Guardar mantenimiento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
