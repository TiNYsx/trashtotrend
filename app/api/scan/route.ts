import { NextResponse } from "next/server"
import { getSession, generateQRToken } from "@/lib/auth"
import { query, getOne } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getSession()
  console.log("[API Scan] Session:", session?.id, "Role:", session?.role)
  
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { qr_token, booth_id } = body
  
  console.log("[API Scan] Request:", { qr_token, booth_id })

  if (!qr_token || !booth_id) {
    console.log("[API Scan] Missing params")
    return NextResponse.json({ error: "Missing qr_token or booth_id" }, { status: 400 })
  }

  try {
    // Find customer by QR token
    const customer = await getOne<{ id: number; name: string; email: string }>(
      "SELECT id, email as name FROM customers WHERE qr_token = $1",
      [qr_token]
    )
    
    console.log("[API Scan] Customer found:", customer?.id, customer?.name)

    if (!customer) {
      console.log("[API Scan] Invalid QR token")
      return NextResponse.json({ error: "Invalid QR code" }, { status: 404 })
    }

    // Check if already stamped
    const existing = await getOne(
      "SELECT id FROM stamps WHERE customer_id = $1 AND booth_id = $2",
      [customer.id, booth_id]
    )
    
    console.log("[API Scan] Existing stamp:", existing?.id)

    if (existing) {
      return NextResponse.json({ error: "Already stamped at this booth", alreadyStamped: true }, { status: 409 })
    }

    // Create stamp for the customer
    console.log("[API Scan] Creating stamp for customer:", customer.id, "booth:", booth_id, "staff:", session.id)
    const insertResult = await query(
      "INSERT INTO stamps (customer_id, booth_id, scanned_by_staff_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [customer.id, booth_id, session.id]
    )
    
    // Verify stamp was created or already existed (due to ON CONFLICT)
    const verifyStamp = await getOne(
      "SELECT id FROM stamps WHERE customer_id = $1 AND booth_id = $2",
      [customer.id, booth_id]
    )
    
    if (!verifyStamp) {
      console.error("[API Scan] Stamp verification FAILED!")
      return NextResponse.json({ error: "Failed to create stamp" }, { status: 500 })
    }

    // record a scan event for the customer so frontend can redirect to quiz
    try {
      // Ensure table has correct columns for this app
      await query(`
        CREATE TABLE IF NOT EXISTS scan_events (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER NOT NULL,
          booth_id INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      
      // Try to insert with customer_id. If it fails because of schema mismatch, 
      // it's likely using the old user_id schema from 001-create-tables.sql
      await query(
        "INSERT INTO scan_events (customer_id, booth_id) VALUES ($1, $2)",
        [customer.id, booth_id]
      )
    } catch (eventErr: any) {
      console.log("[API Scan] Event insert error:", eventErr.message)
      // Fallback: if it's the old schema, try inserting with those column names
      try {
        await query(
          "INSERT INTO scan_events (user_id, checkpoint_slug) VALUES ($1, $2)",
          [customer.id, booth_id.toString()]
        )
      } catch (innerErr) {
        console.log("[API Scan] Fallback event insert error:", innerErr)
      }
    }

    console.log("[API Scan] Success!")
    return NextResponse.json({
      success: true,
      customer_id: customer.id,
      customer_email: customer.name,
      booth_id,
      quiz_url: `/stamps/quiz/${booth_id}`,
    })
  } catch (err) {
    console.error("[API Scan] Error:", err)
    return NextResponse.json({ error: "Scan failed" }, { status: 500 })
  }
}
