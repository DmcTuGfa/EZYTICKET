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
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="bg-card border-border xl:col-span-2">
        <CardHeader>
          <CardTitle>Mantenimientos por sede</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] p-3 sm:h-80 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={siteData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={siteData.length > 3 ? -12 : 0} textAnchor={siteData.length > 3 ? "end" : "middle"} height={siteData.length > 3 ? 48 : 30} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
              <Tooltip />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Tipos</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] p-3 sm:h-80 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} dataKey="total" nameKey="name" outerRadius={72} label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-card border-border xl:col-span-3">
        <CardHeader>
          <CardTitle>Estado de mantenimientos</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px] p-3 sm:h-72 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
              <Tooltip />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
