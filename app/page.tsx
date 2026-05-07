import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import HomeClient from "./page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const session = await getSession()

  if (session?.role === "user" || session?.role === "customer") {
    redirect("/dashboard")
  }
  if (session?.role === "staff" || session?.role === "admin") {
    redirect("/staff/dashboard")
  }

  let settings: Record<string, string> = {}
  try {
    const result = await query(
      "SELECT key, value FROM event_settings WHERE key LIKE 'home_%'"
    )
    if (result && result.rows) {
      result.rows.forEach(row => {
        settings[row.key] = row.value
      })
    }
  } catch (err) {
    console.error("[HomePage] Error fetching settings:", err)
  }

  const plainSettings = JSON.parse(JSON.stringify(settings))

  return <HomeClient initialSettings={plainSettings} />
}
