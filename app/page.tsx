import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { HomeClient } from "./home-client"
import { generateReport, getActivities, getStats, getTickets } from "@/lib/db/tickets"

export const dynamic = "force-dynamic"

export default async function Home() {
  const session = await auth()
  const isLoggedIn = Boolean(session?.user?.email)
  const isActive = Boolean((session?.user as { active?: boolean } | undefined)?.active)

  if (!isLoggedIn || !isActive) {
    redirect(isLoggedIn ? "/login?error=AccessDenied" : "/login")
  }

  const [tickets, activities, stats, report] = await Promise.all([
    getTickets(),
    getActivities(),
    getStats(),
    generateReport(),
  ])

  return <HomeClient tickets={tickets} activities={activities} stats={stats} report={report} user={session?.user ?? null} />
}
