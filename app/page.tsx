import { HomeClient } from "./home-client"
import { generateReport, getActivities, getStats, getTickets } from "@/lib/db/tickets"

export default async function Home() {
  const [tickets, activities, stats, report] = await Promise.all([
    getTickets(),
    getActivities(),
    getStats(),
    generateReport(),
  ])

  return <HomeClient tickets={tickets} activities={activities} stats={stats} report={report} />
}
