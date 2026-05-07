import { NextRequest, NextResponse } from "next/server"
import { query, getMany, withTransaction } from "@/lib/db"
import { requireStaff } from "@/lib/auth"

const TABLE_MAP = {
  pre: "pre_survey_questions",
  post: "post_survey_questions"
}

export async function GET(request: NextRequest) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "post"
  const table = TABLE_MAP[type as keyof typeof TABLE_MAP]

  if (!table) {
    return NextResponse.json({ error: "Invalid survey type" }, { status: 400 })
  }

  try {
    const questions = await getMany(`SELECT * FROM ${table} ORDER BY display_order ASC`)
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "post"
  const table = TABLE_MAP[type as keyof typeof TABLE_MAP]

  if (!table) {
    return NextResponse.json({ error: "Invalid survey type" }, { status: 400 })
  }

  try {
    const { questions } = await request.json()

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }

    await withTransaction(async (client) => {
      for (const q of questions) {
        // Validate required fields
        if (!q.question_en || !q.question_th) continue

        // Postgres INTEGER max is 2,147,483,647. Front-end might send Date.now() as temp ID.
        if (q.id && q.id > 0 && q.id < 2000000000) {
          await client.query(
            `UPDATE ${table} 
             SET question_en = $1, question_th = $2, question_type = $3, options = $4, is_required = $5, display_order = $6, is_active = $7
             WHERE id = $8`,
            [q.question_en, q.question_th, q.question_type || 'rating', q.options ? JSON.stringify(q.options) : null, q.is_required ?? true, q.display_order || 0, q.is_active ?? true, q.id]
          )
        } else {
          await client.query(
            `INSERT INTO ${table} (question_en, question_th, question_type, options, is_required, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [q.question_en, q.question_th, q.question_type || 'rating', q.options ? JSON.stringify(q.options) : null, q.is_required ?? true, q.display_order || 0, q.is_active ?? true]
          )
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save questions:", error)
    return NextResponse.json({ error: "Failed to save questions" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "post"
  const table = TABLE_MAP[type]
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  try {
    await query(`DELETE FROM ${table} WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}