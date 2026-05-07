import { query } from "@/lib/db"
import AboutClient from "./page-client"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  let settings: Record<string, string> = {}
  
  try {
    // Use query directly to be safer
    const result = await query(
      "SELECT key, value FROM event_settings WHERE key LIKE 'about_%'"
    )
    if (result && result.rows) {
      result.rows.forEach(row => {
        settings[row.key] = row.value
      })
    }
  } catch (err) {
    console.error("Failed to fetch about settings:", err)
  }

  // Ensure settings is a plain object for serialization
  const plainSettings = JSON.parse(JSON.stringify(settings))

  return <AboutClient initialSettings={plainSettings} />
}
