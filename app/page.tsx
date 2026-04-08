import { HomeClient } from "./home-client"
import { auth } from "@/auth"
import { generateReport, getActivities, getStats, getTickets } from "@/lib/db/tickets"

export const dynamic = "force-dynamic"

export default async function Home() {
  const session = await auth()

  const [tickets, activities, stats, report] = await Promise.all([
    getTickets(),
    getActivities(),
    getStats(),
    generateReport(),
  ])

  return <HomeClient tickets={tickets} activities={activities} stats={stats} report={report} user={session?.user ?? null} />
}
