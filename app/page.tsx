import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import HomeClient from "./home-client"
import { generateReport, getActivities, getStats, getTickets } from "@/lib/db/tickets"

export const dynamic = "force-dynamic"

export default async function Page() {
  const cookieStore = await cookies()
  const session = cookieStore.get("app_session")?.value

  if (!session) {
    redirect("/login")
  }

  let user = null

  try {
    user = JSON.parse(session)
  } catch {
    redirect("/login")
  }

  const [tickets, activities, stats, report] = await Promise.all([
    getTickets(),
    getActivities(),
    getStats(),
    generateReport(),
  ])

  return <HomeClient tickets={tickets} activities={activities} stats={stats} report={report} user={user} />
}
