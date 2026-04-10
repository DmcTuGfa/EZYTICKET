"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { MaintenanceStats } from "@/lib/types"

interface Props {
  stats: MaintenanceStats
}

const tooltipStyle = {
  backgroundColor: "#1f2124",
  border: "1px solid #393d42",
  borderRadius: "12px",
  color: "#f5f5f5",
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
      <Card className="border-border bg-card shadow-sm xl:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle>Mantenimientos por sede</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] p-3 sm:h-80 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={siteData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#a1a1aa" }} interval={0} angle={siteData.length > 3 ? -12 : 0} textAnchor={siteData.length > 3 ? "end" : "middle"} height={siteData.length > 3 ? 48 : 30} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} width={28} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Tipos</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] p-3 sm:h-80 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} dataKey="total" nameKey="name" outerRadius={72} label />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border-border bg-card shadow-sm xl:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle>Estado de mantenimientos</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px] p-3 sm:h-72 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#a1a1aa" }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} width={28} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
