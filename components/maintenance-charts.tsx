"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { MaintenanceStats } from "@/lib/types"

interface Props {
  stats: MaintenanceStats
}

const COLORS = {
  status: {
    abierto: "#f59e0b",
    en_proceso: "#3b82f6",
    cerrado: "#10b981",
  },
  site: ["#3b82f6", "#ef4444", "#f97316", "#10b981", "#8b5cf6"],
  type: ["#3b82f6", "#10b981"],
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function MaintenanceCharts({ stats }: Props) {
  const typeData = [
    { name: "Preventivo", value: stats.byType.preventivo },
    { name: "Correctivo", value: stats.byType.correctivo },
  ]

  const siteData = Object.entries(stats.bySite).map(([name, value]) => ({ name, value }))
  const statusData = [
    { name: "Abierto", value: stats.byStatus.abierto, fill: COLORS.status.abierto },
    { name: "En Progreso", value: stats.byStatus.en_proceso, fill: COLORS.status.en_proceso },
    { name: "Cerrado", value: stats.byStatus.cerrado, fill: COLORS.status.cerrado },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Estado de Mantenimientos</CardTitle>
          <CardDescription>Mantenimientos agrupados por estado</CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af" }} />
                <YAxis tick={{ fill: "#9ca3af" }} allowDecimals={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">No hay datos</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Tipos de Mantenimiento</CardTitle>
          <CardDescription>Preventivos y correctivos</CardDescription>
        </CardHeader>
        <CardContent>
          {typeData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => (percent && percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : "")}
                  labelLine={false}
                >
                  {typeData.map((_, index) => (
                    <Cell key={index} fill={COLORS.type[index % COLORS.type.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">No hay datos</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">Mantenimientos por Sede</CardTitle>
          <CardDescription>Historial agrupado por sede</CardDescription>
        </CardHeader>
        <CardContent>
          {siteData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={siteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af" }} interval={0} />
                <YAxis tick={{ fill: "#9ca3af" }} allowDecimals={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {siteData.map((_, index) => (
                    <Cell key={index} fill={COLORS.site[index % COLORS.site.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">No hay datos por sede</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
