import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireStaff } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { customer_id, booth_id, staff_id } = await request.json()
    
    await query(
      "INSERT INTO stamps (customer_id, booth_id, scanned_by_staff_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [customer_id, booth_id, staff_id]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Stamp error:", error)
    return NextResponse.json({ error: "Failed to add stamp" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId")
  const boothId = searchParams.get("boothId")

  if (!customerId || !boothId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    await query(
      "DELETE FROM stamps WHERE customer_id = $1 AND booth_id = $2",
      [customerId, boothId]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete stamp error:", error)
    return NextResponse.json({ error: "Failed to delete stamp" }, { status: 500 })
  }
}