"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createTicket } from "@/lib/db/tickets"
import type { TicketPriority, TicketCategory, AreaResponsable } from "@/lib/types"

interface TicketFormProps {
  onTicketCreated?: () => void
}

const areas: { value: AreaResponsable; label: string }[] = [
  { value: "TI", label: "TI" },
  { value: "RH", label: "Recursos Humanos" },
  { value: "Ventas", label: "Ventas" },
  { value: "Produccion", label: "Produccion" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "Compras", label: "Compras" },
  { value: "Calidad", label: "Calidad" },
  { value: "Logistica", label: "Logistica" },
  { value: "Otro", label: "Otro" },
]

export function TicketForm({ onTicketCreated }: TicketFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "media" as TicketPriority,
    category: "soporte" as TicketCategory,
    reporter: "",
    assignee: "",
    areaResponsable: undefined as AreaResponsable | undefined,
    sistemaAfectado: "",
    fechaAlta: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createTicket({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        reporter: formData.reporter || "Usuario",
        assignee: formData.assignee || undefined,
        status: "abierto",
        areaResponsable: formData.areaResponsable,
        sistemaAfectado: formData.sistemaAfectado || undefined,
        fechaAlta: formData.fechaAlta,
      })

      setFormData({
        title: "",
        description: "",
        priority: "media",
        category: "soporte",
        reporter: "",
        assignee: "",
        areaResponsable: undefined,
        sistemaAfectado: "",
        fechaAlta: new Date().toISOString().split("T")[0],
      })

      setOpen(false)
      onTicketCreated?.()
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Crear Nuevo Ticket</DialogTitle>
          <DialogDescription>
            Complete los detalles del ticket. Los campos con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Titulo *</Label>
            <Input id="title" placeholder="Describe brevemente el problema" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="bg-input border-border" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Descripcion *</Label>
            <Textarea id="description" placeholder="Proporciona detalles adicionales..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} className="bg-input border-border resize-none" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">Prioridad *</Label>
              <Select value={formData.priority} onValueChange={(value: TicketPriority) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value: TicketCategory) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="soporte">Soporte</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reporter" className="text-foreground">Reportado por *</Label>
              <Input id="reporter" placeholder="Nombre del solicitante" value={formData.reporter} onChange={(e) => setFormData({ ...formData, reporter: e.target.value })} required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-foreground">Asignado a</Label>
              <Input id="assignee" placeholder="Responsable" value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} className="bg-input border-border" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">Area responsable</Label>
              <Select value={formData.areaResponsable} onValueChange={(value: AreaResponsable) => setFormData({ ...formData, areaResponsable: value })}>
                <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Seleccionar area" /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {areas.map((area) => <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sistemaAfectado" className="text-foreground">Sistema afectado</Label>
              <Input id="sistemaAfectado" placeholder="ERP, RH, Portal, etc." value={formData.sistemaAfectado} onChange={(e) => setFormData({ ...formData, sistemaAfectado: e.target.value })} className="bg-input border-border" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaAlta" className="text-foreground">Fecha de alta *</Label>
            <Input id="fechaAlta" type="date" value={formData.fechaAlta} onChange={(e) => setFormData({ ...formData, fechaAlta: e.target.value })} required className="bg-input border-border" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Crear Ticket"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
