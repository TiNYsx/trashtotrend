import { NextRequest, NextResponse } from "next/server"
import { query, getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"

export async function GET() {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const questions = await getMany(
      "SELECT * FROM quiz_questions ORDER BY display_order ASC"
    )
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

  try {
    const { questions, category } = await request.json()

    for (const q of questions) {
      if (q.id) {
        await query(
          `UPDATE quiz_questions 
           SET question_en = $1, question_th = $2, question_type = $3, options = $4, display_order = $5, is_active = $6, booth_id = $7, quiz_category = $8
           WHERE id = $9`,
          [q.question_en, q.question_th, q.question_type, JSON.stringify(q.options), q.display_order, q.is_active, q.booth_id, q.quiz_category || category, q.id]
        )
      } else {
        await query(
          `INSERT INTO quiz_questions (question_en, question_th, question_type, options, display_order, is_active, booth_id, quiz_category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [q.question_en, q.question_th, q.question_type, JSON.stringify(q.options), q.display_order, q.is_active, q.booth_id, q.quiz_category || category]
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

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  try {
    await query("DELETE FROM quiz_questions WHERE id = $1", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}