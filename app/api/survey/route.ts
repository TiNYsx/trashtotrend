import { NextRequest, NextResponse } from "next/server"
import { query, getMany } from "@/lib/db"
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

  const { pathname } = new URL(request.url)
  const type = pathname.includes("/pre") ? "pre" : "post"
  const table = TABLE_MAP[type]

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

  const { pathname } = new URL(request.url)
  const type = pathname.includes("/pre") ? "pre" : "post"
  const table = TABLE_MAP[type]

  try {
    const { questions } = await request.json()

    for (const q of questions) {
      if (q.id && q.id > 0) {
        await query(
          `UPDATE ${table} 
           SET question_en = $1, question_th = $2, question_type = $3, is_required = $4, display_order = $5, is_active = $6
           WHERE id = $7`,
          [q.question_en, q.question_th, q.question_type, q.is_required, q.display_order, q.is_active, q.id]
        )
      } else {
        await query(
          `INSERT INTO ${table} (question_en, question_th, question_type, is_required, display_order, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [q.question_en, q.question_th, q.question_type, q.is_required, q.display_order, q.is_active]
        )
      }
    }

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

  const { pathname } = new URL(request.url)
  const type = pathname.includes("/pre") ? "pre" : "post"
  const table = TABLE_MAP[type]
  const { searchParams } = new URL(request.url)
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