import { auth } from "@/auth"
import { redirect } from "next/navigation"
import HomeClient from "./home-client"
import { getActivities, getStats, getTickets } from "@/lib/db/tickets"

export const dynamic = "force-dynamic"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

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
      user={session.user}
    />
  )
}