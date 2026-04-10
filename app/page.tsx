import HomeClient from "./home-client"
import { generateReport, getActivities, getStats, getTickets } from "@/lib/db/tickets"
import { getMaintenances, getMaintenanceStats, getSites } from "@/lib/db/maintenances"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [tickets, activities, stats, report, maintenances, maintenanceStats, sites] = await Promise.all([
    getTickets(),
    getActivities(),
    getStats(),
    generateReport(),
    getMaintenances(),
    getMaintenanceStats(),
    getSites(),
  ])

  return (
    <HomeClient
      tickets={tickets}
      activities={activities}
      stats={stats}
      report={report}
      maintenances={maintenances}
      maintenanceStats={maintenanceStats}
      sites={sites}
    />
  )
}
