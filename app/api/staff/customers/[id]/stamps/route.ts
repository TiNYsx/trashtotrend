import { NextRequest, NextResponse } from "next/server"
import { getMany, query } from "@/lib/db"
import { requireStaff } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const customerId = parseInt(id)

  try {
    const stamps = await getMany<{ booth_id: number }>(
      "SELECT booth_id FROM stamps WHERE customer_id = $1",
      [customerId]
    )
    
    return NextResponse.json({ stamps: stamps.map(s => s.booth_id) })
  } catch (error) {
    console.error("Fetch stamps error:", error)
    return NextResponse.json({ stamps: [] }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const customerId = parseInt(id)

  try {
    const { boothId } = await request.json()
    
    await query(
      "INSERT INTO stamps (customer_id, booth_id, scanned_by_staff_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [customerId, boothId, session.id]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Stamp error:", error)
    return NextResponse.json({ error: "Failed to add stamp" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const customerId = parseInt(id)

  const { searchParams } = new URL(request.url)
  const boothId = searchParams.get("boothId")

  if (!boothId) {
    return NextResponse.json({ error: "Missing boothId" }, { status: 400 })
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