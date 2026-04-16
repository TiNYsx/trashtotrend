import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getMany, getOne } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "customer") {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const booths = await getMany(
      "SELECT id, name_en, name_th, description_en, description_th, image_url, display_order FROM booths WHERE is_active = true ORDER BY display_order ASC"
    )

    const stampedRows = await getMany<{ booth_id: number }>(
      "SELECT booth_id FROM stamps WHERE customer_id = $1",
      [session.id]
    )
    const stampedBoothIds = stampedRows.map((r) => r.booth_id)

    const totalBooths = booths.length
    const totalStamped = stampedBoothIds.length

    return NextResponse.json({ booths, stampedBoothIds, totalBooths, totalStamped })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}