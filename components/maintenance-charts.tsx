"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Maintenance } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Props {
  maintenances: Maintenance[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"]

export function MaintenanceCharts({ maintenances }: Props) {
  const bySite = Object.values(
    maintenances.reduce<Record<string, { name: string; total: number }>>((acc, item) => {
      const key = item.siteName || `Sede ${item.siteId}`
      if (!acc[key]) acc[key] = { name: key, total: 0 }
      acc[key].total += 1
      return acc
    }, {})
  )

  const byType = [
    { name: "Preventivo", value: maintenances.filter((m) => m.maintenanceType === "preventivo").length },
    { name: "Correctivo", value: maintenances.filter((m) => m.maintenanceType === "correctivo").length },
  ].filter((x) => x.value > 0)

  const byStatus = Object.values(
    maintenances.reduce<Record<string, { name: string; value: number }>>((acc, item) => {
      const labels: Record<string, string> = {
        abierto: "Abierto",
        en_proceso: "En proceso",
        pendiente_confirmacion: "Pendiente confirmación",
        cerrado: "Cerrado",
        cancelado: "Cancelado",
      }
      const key = labels[item.status] || item.status
      if (!acc[key]) acc[key] = { name: key, value: 0 }
      acc[key].value += 1
      return acc
    }, {})
  )

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">Cantidad: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Historial por sede</CardTitle>
          <CardDescription>Cantidad de mantenimientos registrados por sede</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bySite}>
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {bySite.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Preventivos vs correctivos</CardTitle>
            <CardDescription>Distribución por tipo de mantenimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {byType.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Estado actual</CardTitle>
            <CardDescription>Seguimiento de mantenimientos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byStatus} layout="vertical">
                <XAxis type="number" tick={{ fill: "#9ca3af" }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {byStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
