import { NextRequest, NextResponse } from "next/server"
import { query, getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"

export async function GET() {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const types = await getMany(
      "SELECT * FROM personality_types ORDER BY display_order ASC"
    )
    return NextResponse.json(types)
  } catch (error) {
    console.error("Failed to fetch personality types:", error)
    return NextResponse.json({ error: "Failed to fetch personality types" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { types } = await request.json()

    for (const t of types) {
      if (t.id) {
        await query(
          `UPDATE personality_types 
           SET type_code = $1, name_en = $2, name_th = $3, description_en = $4, description_th = $5, display_order = $6, is_active = $7
           WHERE id = $8`,
          [t.type_code, t.name_en, t.name_th, t.description_en, t.description_th, t.display_order, t.is_active, t.id]
        )
      } else {
        await query(
          `INSERT INTO personality_types (type_code, name_en, name_th, description_en, description_th, display_order, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [t.type_code, t.name_en, t.name_th, t.description_en, t.description_th, t.display_order, t.is_active]
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save personality types:", error)
    return NextResponse.json({ error: "Failed to save personality types" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  try {
    await query("DELETE FROM personality_types WHERE id = $1", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete personality type:", error)
    return NextResponse.json({ error: "Failed to delete personality type" }, { status: 500 })
  }
}