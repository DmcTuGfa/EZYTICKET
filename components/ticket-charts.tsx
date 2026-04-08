"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { TicketStats } from "@/lib/types"

interface TicketChartsProps {
  stats: TicketStats
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

const priorityLabels: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente"
}

const clasificacionLabels: Record<string, string> = {
  tecnica: "Tecnica",
  operativa: "Operativa",
  solicitud: "Solicitud",
  proyecto: "Proyecto"
}

const COLORS = {
  status: ["#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4", "#f97316", "#10b981", "#6b7280"],
  priority: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
  clasificacion: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
  area: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#6b7280"]
}

export function TicketCharts({ stats }: TicketChartsProps) {
  const statusData = Object.entries(stats.byStatus)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: statusLabels[key] || key,
      value
    }))

  const priorityData = Object.entries(stats.byPriority)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: priorityLabels[key] || key,
      value
    }))

  const clasificacionData = Object.entries(stats.byClasificacion)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: clasificacionLabels[key] || key,
      value
    }))

  const areaData = Object.entries(stats.byArea)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value
    }))
    .sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
          <p className="text-sm text-foreground font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">{`Cantidad: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Pie Chart - Estado */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Por Estado</CardTitle>
          <CardDescription>Distribucion de tickets por estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
                labelLine={false}
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Prioridad */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Por Prioridad</CardTitle>
          <CardDescription>Distribucion de tickets por nivel de urgencia</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
                labelLine={false}
              >
                {priorityData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.priority[index % COLORS.priority.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Clasificación (Técnicos vs Operativos) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Tecnicos vs Operativos</CardTitle>
          <CardDescription>Clasificacion final de tickets cerrados</CardDescription>
        </CardHeader>
        <CardContent>
          {clasificacionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clasificacionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
                  labelLine={false}
                >
                  {clasificacionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.clasificacion[index % COLORS.clasificacion.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No hay tickets cerrados con clasificacion
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Por Área */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Por Area</CardTitle>
          <CardDescription>Tickets agrupados por area responsable</CardDescription>
        </CardHeader>
        <CardContent>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={areaData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#9ca3af" }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {areaData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.area[index % COLORS.area.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No hay tickets con area asignada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
