import { NextResponse } from "next/server"
import { getSession, generateQRToken } from "@/lib/auth"
import { query, getOne } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { qr_token, booth_id } = await req.json()

  if (!qr_token || !booth_id) {
    return NextResponse.json({ error: "Missing qr_token or booth_id" }, { status: 400 })
  }

  try {
    // Find user by QR token
    const user = await getOne<{ id: number; name: string; email: string }>(
      "SELECT id, name, email FROM users WHERE qr_token = $1",
      [qr_token]
    )

    if (!user) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 404 })
    }

    // Check if already stamped
    const existing = await getOne(
      "SELECT id FROM stamps WHERE customer_id = $1 AND booth_id = $2",
      [user.id, booth_id]
    )

    if (existing) {
      return NextResponse.json({ error: "Already stamped at this booth", alreadyStamped: true }, { status: 409 })
    }

    // record a scan event for the customer so frontend can redirect to quiz
    try {
      await query(
        `CREATE TABLE IF NOT EXISTS scan_events (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER NOT NULL,
          booth_id INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      )
      await query(
        "INSERT INTO scan_events (customer_id, booth_id) VALUES ($1, $2)",
        [user.id, booth_id]
      )
    } catch {
      // ignore event creation errors
    }

    // regenerate QR token to prevent reuse
    const newToken = generateQRToken()
    await query("UPDATE users SET qr_token = $1 WHERE id = $2", [newToken, user.id])

    return NextResponse.json({
      success: true,
      customer_id: user.id,
      customer_email: user.email,
      booth_id,
      quiz_url: `/stamps/quiz/${booth_id}`,
    })
  } catch (err) {
    console.error("Scan error:", err)
    return NextResponse.json({ error: "Scan failed" }, { status: 500 })
  }
}
