"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import type { Ticket, ClasificacionFinal, CausaRaiz } from "@/lib/types"

interface CloseTicketDialogProps {
  ticket: Ticket | null
  onClose: () => void
  onConfirm: (data: { clasificacionFinal: ClasificacionFinal; causaRaiz: CausaRaiz }) => void
}

const clasificaciones: { value: ClasificacionFinal; label: string; description: string }[] = [
  { value: "tecnica", label: "Tecnica", description: "Problema relacionado con infraestructura o codigo" },
  { value: "operativa", label: "Operativa (uso del sistema)", description: "Relacionado con el uso correcto del sistema" },
  { value: "solicitud", label: "Solicitud", description: "Peticion de informacion o servicio" },
  { value: "proyecto", label: "Proyecto", description: "Parte de un proyecto o mejora planificada" }
]

const causas: { value: CausaRaiz; label: string; description: string }[] = [
  { value: "falla-tecnica", label: "Falla tecnica", description: "Error en el sistema o infraestructura" },
  { value: "error-captura", label: "Error de captura", description: "Datos ingresados incorrectamente" },
  { value: "uso-incorrecto", label: "Uso incorrecto", description: "El usuario no siguio el proceso correcto" },
  { value: "falta-informacion", label: "Falta de informacion", description: "No se tenia la informacion necesaria" },
  { value: "proveedor-externo", label: "Proveedor externo", description: "Problema originado por un tercero" }
]

export function CloseTicketDialog({ ticket, onClose, onConfirm }: CloseTicketDialogProps) {
  const [clasificacionFinal, setClasificacionFinal] = useState<ClasificacionFinal | undefined>(undefined)
  const [causaRaiz, setCausaRaiz] = useState<CausaRaiz | undefined>(undefined)

  useEffect(() => {
    if (ticket) {
      setClasificacionFinal(ticket.clasificacionFinal)
      setCausaRaiz(ticket.causaRaiz)
    }
  }, [ticket])

  const handleConfirm = () => {
    if (clasificacionFinal && causaRaiz) {
      onConfirm({ clasificacionFinal, causaRaiz })
      setClasificacionFinal(undefined)
      setCausaRaiz(undefined)
    }
  }

  const handleClose = () => {
    setClasificacionFinal(undefined)
    setCausaRaiz(undefined)
    onClose()
  }

  const isValid = clasificacionFinal && causaRaiz

  return (
    <Dialog open={!!ticket} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Cerrar Ticket {ticket?.id}
          </DialogTitle>
          <DialogDescription>
            Para cerrar este ticket es necesario completar la clasificacion y causa raiz.
            Estos campos son obligatorios para el reporte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              Clasificacion Final <span className="text-destructive">*</span>
            </Label>
            <Select
              value={clasificacionFinal}
              onValueChange={(value: ClasificacionFinal) => setClasificacionFinal(value)}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Seleccionar clasificacion" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {clasificaciones.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex flex-col">
                      <span>{c.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clasificacionFinal && (
              <p className="text-xs text-muted-foreground">
                {clasificaciones.find(c => c.value === clasificacionFinal)?.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              Causa Raiz <span className="text-destructive">*</span>
            </Label>
            <Select
              value={causaRaiz}
              onValueChange={(value: CausaRaiz) => setCausaRaiz(value)}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Seleccionar causa raiz" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {causas.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex flex-col">
                      <span>{c.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {causaRaiz && (
              <p className="text-xs text-muted-foreground">
                {causas.find(c => c.value === causaRaiz)?.description}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-border"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!isValid}
            className="bg-success hover:bg-success/90"
          >
            Confirmar Cierre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
