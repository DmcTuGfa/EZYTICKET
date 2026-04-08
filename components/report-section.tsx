"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { generateReport, exportToCSV } from "@/lib/ticket-store"
import type { TicketStats } from "@/lib/types"

interface ReportSectionProps {
  stats: TicketStats
}

const statusColors: Record<string, string> = {
  abierto: "bg-warning/20 text-warning",
  "en-progreso": "bg-chart-1/20 text-chart-1",
  "en-espera-usuario": "bg-chart-5/20 text-chart-5",
  "en-espera-area": "bg-chart-3/20 text-chart-3",
  "en-espera-proveedor": "bg-chart-4/20 text-chart-4",
  resuelto: "bg-success/20 text-success",
  cerrado: "bg-muted-foreground/20 text-muted-foreground"
}

const statusLabels: Record<string, string> = {
  abierto: "Abierto",
  "en-progreso": "En Progreso",
  "en-espera-usuario": "Espera Usuario",
  "en-espera-area": "Espera Area",
  "en-espera-proveedor": "Espera Proveedor",
  resuelto: "Resuelto",
  cerrado: "Cerrado"
}

export function ReportSection({ stats }: ReportSectionProps) {
  const report = generateReport()

  const handleExportCSV = () => {
    const csv = exportToCSV()
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-tickets-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  // Resumen estadístico
  const closedTickets = stats.byStatus.resuelto + stats.byStatus.cerrado
  const openTickets = stats.total - closedTickets
  const tecnicoCount = stats.byClasificacion.tecnica || 0
  const operativoCount = stats.byClasificacion.operativa || 0
  const solicitudCount = stats.byClasificacion.solicitud || 0
  const proyectoCount = stats.byClasificacion.proyecto || 0

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {openTickets} abiertos / {closedTickets} cerrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tecnicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-1">{tecnicoCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {closedTickets > 0 ? Math.round((tecnicoCount / closedTickets) * 100) : 0}% de cerrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{operativoCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {closedTickets > 0 ? Math.round((operativoCount / closedTickets) * 100) : 0}% de cerrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {stats.avgResolutionTime > 24 
                ? `${Math.round(stats.avgResolutionTime / 24)}d`
                : `${stats.avgResolutionTime}h`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De resolucion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Botones de exportación */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Exportar Reporte</CardTitle>
              <CardDescription>Descarga el reporte completo de tickets</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            El reporte incluye: ID, Fecha, Titulo, Area, Tipo (clasificacion), Causa raiz, Tiempo de resolucion y Estado.
          </p>
          
          {/* Vista previa del reporte */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-muted-foreground">Titulo</TableHead>
                  <TableHead className="text-muted-foreground">Area</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Causa</TableHead>
                  <TableHead className="text-muted-foreground">T. Resolucion</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.slice(0, 10).map((row) => (
                  <TableRow key={row.id} className="hover:bg-secondary/30">
                    <TableCell className="font-mono text-sm text-primary">{row.id}</TableCell>
                    <TableCell className="text-muted-foreground">{row.fecha}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{row.titulo}</TableCell>
                    <TableCell>{row.area}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        row.tipo === "Tecnica" ? "bg-chart-1/20 text-chart-1 border-chart-1/30" :
                        row.tipo === "Operativa" ? "bg-success/20 text-success border-success/30" :
                        row.tipo === "Solicitud" ? "bg-warning/20 text-warning border-warning/30" :
                        row.tipo === "Proyecto" ? "bg-chart-5/20 text-chart-5 border-chart-5/30" :
                        "bg-muted text-muted-foreground"
                      }>
                        {row.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.causa}</TableCell>
                    <TableCell className="text-muted-foreground">{row.tiempoResolucion}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[row.estado] || "bg-muted text-muted-foreground"}>
                        {statusLabels[row.estado] || row.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {report.length > 10 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Mostrando 10 de {report.length} registros. Exporta el CSV para ver todos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resumen por clasificación */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Resumen por Clasificacion</CardTitle>
            <CardDescription>Distribucion de tickets cerrados por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Tecnica", value: tecnicoCount, color: "bg-chart-1" },
                { label: "Operativa", value: operativoCount, color: "bg-success" },
                { label: "Solicitud", value: solicitudCount, color: "bg-warning" },
                { label: "Proyecto", value: proyectoCount, color: "bg-chart-5" }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm text-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {closedTickets > 0 ? Math.round((item.value / closedTickets) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Resumen por Area</CardTitle>
            <CardDescription>Distribucion de tickets por area responsable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.byArea)
                .filter(([_, value]) => value > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([area, count], index) => (
                  <div key={area} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      ["bg-chart-1", "bg-success", "bg-warning", "bg-chart-5", "bg-chart-4", "bg-destructive"][index]
                    }`} />
                    <span className="flex-1 text-sm text-foreground">{area}</span>
                    <span className="text-sm font-medium text-foreground">{count}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
