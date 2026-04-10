import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import HomeClient from "./home-client"
import { getActivities, getStats, getTickets, generateReport } from "@/lib/db/tickets"
import { getMaintenances, getSites } from "@/lib/db/maintenances"

export const dynamic = "force-dynamic"

export default async function Page() {
  const cookieStore = await cookies()
  const session = cookieStore.get("app_session")?.value

  if (!session) {
    redirect("/login")
  }

  const user = JSON.parse(session)

  const [tickets, maintenances, sites, activities, stats, report] = await Promise.all([
    getTickets(),
    getMaintenances(),
    getSites(),
    getActivities(),
    getStats(),
    generateReport(),
  ])

  return <HomeClient tickets={tickets} maintenances={maintenances} sites={sites} activities={activities} stats={stats} report={report} user={user} />
}
