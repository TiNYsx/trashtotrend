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
    const { registered, waved } = await request.json()
    
    await query(
      `UPDATE customers 
       SET ice_bath_registered = $1, ice_bath_waved = $2, ice_bath_time = $3
       WHERE id = $4`,
      [registered, waved, registered ? new Date().toISOString() : null, customerId]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ice bath update error:", error)
    return NextResponse.json({ error: "Failed to update ice bath" }, { status: 500 })
  }
}