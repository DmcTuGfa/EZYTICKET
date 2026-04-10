"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createMaintenance } from "@/lib/db/maintenances"
import type { MaintenanceStatus, MaintenanceType, Site } from "@/lib/types"

interface MaintenanceFormProps {
  sites: Site[]
  onCreated?: () => void
}

export function MaintenanceForm({ sites, onCreated }: MaintenanceFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    maintenanceType: "preventivo" as MaintenanceType,
    status: "abierto" as MaintenanceStatus,
    siteId: sites[0]?.id ?? 1,
    title: "",
    description: "",
    reportedIssue: "",
    technicianName: "",
    requestedBy: "",
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createMaintenance(formData)
      setOpen(false)
      setFormData({
        maintenanceType: "preventivo",
        status: "abierto",
        siteId: sites[0]?.id ?? 1,
        title: "",
        description: "",
        reportedIssue: "",
        technicianName: "",
        requestedBy: "",
      })
      onCreated?.()
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Mantenimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo mantenimiento</DialogTitle>
          <DialogDescription>Registra un mantenimiento preventivo o correctivo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.maintenanceType} onValueChange={(value: MaintenanceType) => setFormData((prev) => ({ ...prev, maintenanceType: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sede</Label>
              <Select value={String(formData.siteId)} onValueChange={(value) => setFormData((prev) => ({ ...prev, siteId: Number(value) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Titulo</Label>
            <Input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Descripcion</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Problema reportado</Label>
            <Textarea value={formData.reportedIssue} onChange={(e) => setFormData((prev) => ({ ...prev, reportedIssue: e.target.value }))} rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tecnico</Label>
              <Input value={formData.technicianName} onChange={(e) => setFormData((prev) => ({ ...prev, technicianName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Solicitado por</Label>
              <Input value={formData.requestedBy} onChange={(e) => setFormData((prev) => ({ ...prev, requestedBy: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Guardando..." : "Guardar mantenimiento"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
