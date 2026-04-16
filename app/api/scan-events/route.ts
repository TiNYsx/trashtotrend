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
  if (!session || session.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await ensureTable()

  try {
    const events = await getMany<{ booth_id: number }>(
      "SELECT booth_id FROM scan_events WHERE customer_id = $1 ORDER BY id ASC",
      [session.id]
    )

    // optionally clear fetched events
    if (events.length > 0) {
      await query("DELETE FROM scan_events WHERE customer_id = $1", [session.id])
    }

    return NextResponse.json({ booths: events.map((e) => e.booth_id) })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
