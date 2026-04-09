import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import HomeClient from "./home-client"
import { getActivities, getStats, getTickets } from "@/lib/db/tickets"

export const dynamic = "force-dynamic"

export default async function Page() {
  const cookieStore = await cookies()
  const session = cookieStore.get("app_session")?.value

  if (!session) {
    redirect("/login")
  }

  const user = JSON.parse(session)

  const [tickets, activities, stats] = await Promise.all([
    getTickets(),
    getActivities(),
    getStats(),
  ])

  return (
    <HomeClient
      tickets={tickets}
      activities={activities}
      stats={stats}
      user={user}
    />
  )
}