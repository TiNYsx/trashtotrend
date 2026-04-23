import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireStaff } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; boothId: string }> }
) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, boothId } = await params
  const customerId = parseInt(id)
  const booth_id = parseInt(boothId)

  try {
    await query(
      "INSERT INTO stamps (customer_id, booth_id, scanned_by_staff_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [customerId, booth_id, session.id]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Stamp error:", error)
    return NextResponse.json({ error: "Failed to add stamp" }, { status: 500 })
  }
}