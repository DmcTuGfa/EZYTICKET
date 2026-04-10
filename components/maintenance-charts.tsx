"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { MaintenanceStats } from "@/lib/types"

interface Props {
  stats: MaintenanceStats
}

export function MaintenanceCharts({ stats }: Props) {
  const typeData = [
    { name: "Preventivo", total: stats.byType.preventivo },
    { name: "Correctivo", total: stats.byType.correctivo },
  ]

  const siteData = Object.entries(stats.bySite).map(([name, total]) => ({ name, total }))
  const statusData = [
    { name: "Abierto", total: stats.byStatus.abierto },
    { name: "En proceso", total: stats.byStatus.en_proceso },
    { name: "Cerrado", total: stats.byStatus.cerrado },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader><CardTitle>Mantenimientos por sede</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={siteData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Tipos</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} dataKey="total" nameKey="name" outerRadius={90} label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-card border-border lg:col-span-3">
        <CardHeader><CardTitle>Estado de mantenimientos</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
