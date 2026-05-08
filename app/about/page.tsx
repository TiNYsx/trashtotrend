import { query } from "@/lib/db"
import AboutClient from "./page-client"

// Force the page to be re-rendered on each request
export const dynamic = "force-dynamic"
// Set a low revalidate time just in case, though force-dynamic should handle it
export const revalidate = 0

export default async function AboutPage() {
  let settings: Record<string, string> = {}
  
  try {
    // Fetch all about related settings directly from the database
    const result = await query(
      "SELECT key, value FROM event_settings WHERE key LIKE 'about_%'"
    )
    
    if (result && result.rows) {
      result.rows.forEach(row => {
        settings[row.key] = row.value
      })
    }
    
  } catch (err) {
    console.error("[AboutPage] Error fetching settings:", err)
  }

  // Next.js requires plain objects for props passed to client components
  const plainSettings = JSON.parse(JSON.stringify(settings))

  return <AboutClient initialSettings={plainSettings} />
}
