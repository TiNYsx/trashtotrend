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
    
    let updateColumn = field
    if (field === 'ice_bath_registered') {
      await query(
        "UPDATE customers SET ice_bath_registered = $1, ice_bath_time = $2 WHERE id = $3",
        [value, value ? new Date().toISOString() : null, customerId]
      )
    } else {
      await query(
        "UPDATE customers SET " + field + " = $1 WHERE id = $2",
        [value, customerId]
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Field update error:", error)
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 })
  }
}