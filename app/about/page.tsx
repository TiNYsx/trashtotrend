import { getMany } from "@/lib/db"
import AboutClient from "./page-client"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  let settings: Record<string, string> = {}
  
  try {
    const rows = await getMany<{ key: string, value: string }>(
      "SELECT key, value FROM event_settings WHERE key LIKE 'about_%'"
    )
    rows.forEach(row => {
      settings[row.key] = row.value
    })
  } catch (err) {
    console.error("Failed to fetch about settings:", err)
  }

  return <AboutClient initialSettings={settings} />
}
