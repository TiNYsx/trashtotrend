import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query, getMany } from "@/lib/db"

// ensure table exists
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS scan_events (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      booth_id INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)
}

export async function GET() {
  const session = await getSession()
  if (!session || (session.role !== "customer" && session.role !== "user")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await ensureTable()

  try {
    // Try to get with customer_id first
    let events: any[] = []
    try {
      events = await getMany<{ booth_id: number }>(
        "SELECT booth_id FROM scan_events WHERE customer_id = $1 ORDER BY id ASC",
        [session.id]
      )
      
      if (events.length > 0) {
        await query("DELETE FROM scan_events WHERE customer_id = $1", [session.id])
      }
    } catch (err) {
      // Fallback to user_id/checkpoint_slug
      console.log("[API Scan Events] Schema mismatch, trying fallback")
      const fallbackEvents = await getMany<{ checkpoint_slug: string }>(
        "SELECT checkpoint_slug FROM scan_events WHERE user_id = $1 ORDER BY id ASC",
        [session.id]
      )
      events = fallbackEvents.map(e => ({ booth_id: parseInt(e.checkpoint_slug) }))
      
      if (events.length > 0) {
        await query("DELETE FROM scan_events WHERE user_id = $1", [session.id])
      }
    }

    return NextResponse.json({ booths: events.map((e) => e.booth_id).filter(id => !isNaN(id)) })
  } catch (err) {
    console.error("[API Scan Events] Error:", err)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
