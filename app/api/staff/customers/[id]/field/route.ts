import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireStaff } from "@/lib/auth"

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
    const { field, value } = await request.json()
    
    await query(
      "UPDATE customers SET " + field + " = $1 WHERE id = $2",
      [value, customerId]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Field update error:", error)
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 })
  }
}