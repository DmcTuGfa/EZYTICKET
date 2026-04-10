"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import type { Maintenance, MaintenanceStats, TicketReportRow, TicketStats } from "@/lib/types"

interface ReportSectionProps {
  stats: TicketStats
  report: TicketReportRow[]
  maintenances: Maintenance[]
  maintenanceStats: MaintenanceStats
}

const statusColors: Record<string, string> = {
  abierto: "bg-warning/20 text-warning",
  "en-progreso": "bg-chart-1/20 text-chart-1",
  "en-espera-usuario": "bg-chart-5/20 text-chart-5",
  "en-espera-area": "bg-chart-3/20 text-chart-3",
  "en-espera-proveedor": "bg-chart-4/20 text-chart-4",
  resuelto: "bg-success/20 text-success",
  cerrado: "bg-muted-foreground/20 text-muted-foreground",
  en_proceso: "bg-chart-1/20 text-chart-1",
}

const statusLabels: Record<string, string> = {
  abierto: "Abierto",
  "en-progreso": "En Progreso",
  "en-espera-usuario": "Espera Usuario",
  "en-espera-area": "Espera Area",
  "en-espera-proveedor": "Espera Proveedor",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
  en_proceso: "En proceso",
}

function openPrintableTable(title: string, headers: string[], rows: string[][]) {
  const printableRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("")

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; vertical-align: top; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${printableRows}</tbody>
        </table>
      </body>
    </html>
  `

  const printWindow = window.open("", "_blank", "width=1000,height=800")
  if (!printWindow) return
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

export function ReportSection({ stats, report, maintenances, maintenanceStats }: ReportSectionProps) {
  const handleExportTicketsCSV = () => {
    const headers = ["ID", "Fecha", "Titulo", "Area", "Tipo", "Causa", "Tiempo Resolucion", "Estado"]
    const rows = report.map((r) => [
      r.id,
      r.fecha,
      `"${r.titulo.replace(/"/g, '""')}"`,
      r.area,
      r.tipo,
      r.causa,
      r.tiempoResolucion,
      r.estado,
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-tickets-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleExportMaintenancesCSV = () => {
    const headers = ["Folio", "Tipo", "Estado", "Sede", "Titulo", "Tecnico", "Solicitado por", "Fecha"]
    const rows = maintenances.map((m) => [
      m.folio,
      m.maintenanceType,
      m.status,
      `"${(m.siteName || `Sede ${m.siteId}`).replace(/"/g, '""')}"`,
      `"${(m.title || "").replace(/"/g, '""')}"`,
      `"${(m.technicianName || "").replace(/"/g, '""')}"`,
      `"${(m.requestedBy || "").replace(/"/g, '""')}"`,
      new Date(m.createdAt).toLocaleDateString("es-MX"),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-mantenimientos-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleExportTicketsPDF = () => {
    const headers = ["ID", "Fecha", "Titulo", "Area", "Estado"]
    const rows = report.slice(0, 50).map((r) => [r.id, r.fecha, r.titulo, r.area, statusLabels[r.estado] || r.estado])
    openPrintableTable("Reporte de Tickets", headers, rows)
  }

  const handleExportMaintenancesPDF = () => {
    const headers = ["Folio", "Sede", "Tipo", "Titulo", "Estado"]
    const rows = maintenances.slice(0, 50).map((m) => [
      m.folio,
      m.siteName || `Sede ${m.siteId}`,
      m.maintenanceType,
      m.title || "",
      statusLabels[m.status] || m.status,
    ])
    openPrintableTable("Reporte de Mantenimientos", headers, rows)
  }

  const closedTickets = stats.byStatus.resuelto + stats.byStatus.cerrado
  const openTickets = stats.total - closedTickets

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Abiertos: {openTickets} · Cerrados: {closedTickets}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mantenimientos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{maintenanceStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Preventivos: {maintenanceStats.byType.preventivo} · Correctivos: {maintenanceStats.byType.correctivo}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mantenimientos Cerrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{maintenanceStats.byStatus.cerrado}</div>
            <p className="text-xs text-muted-foreground mt-1">Con firma registrada</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sedes con historial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{Object.keys(maintenanceStats.bySite).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Distribucion por sede</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="gap-3">
          <div>
            <CardTitle>Reporte de Tickets</CardTitle>
            <CardDescription>Exporta y consulta tickets cerrados y resueltos</CardDescription>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:w-fit">
            <Button variant="outline" onClick={handleExportTicketsCSV} className="w-full gap-2">
              <Download className="h-4 w-4" />
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportTicketsPDF} className="w-full gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.slice(0, 10).map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell className="max-w-[260px] truncate">{row.titulo}</TableCell>
                    <TableCell>{row.area}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[row.estado] || ""}>{statusLabels[row.estado] || row.estado}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="gap-3">
          <div>
            <CardTitle>Reporte de Mantenimientos</CardTitle>
            <CardDescription>Historial por sede, tipo y estado</CardDescription>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:w-fit">
            <Button variant="outline" onClick={handleExportMaintenancesCSV} className="w-full gap-2">
              <Download className="h-4 w-4" />
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportMaintenancesPDF} className="w-full gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead>Folio</TableHead>
                  <TableHead>Sede</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenances.slice(0, 10).map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{row.folio}</TableCell>
                    <TableCell>{row.siteName || `Sede ${row.siteId}`}</TableCell>
                    <TableCell>{row.maintenanceType}</TableCell>
                    <TableCell className="max-w-[260px] truncate">{row.title}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[row.status] || ""}>{statusLabels[row.status] || row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}