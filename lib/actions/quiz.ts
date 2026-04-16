"use server"

import { query, getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getQuizQuestions(boothId: number) {
  return getMany<{
    id: number
    booth_id: number
    question_en: string
    question_th: string
    question_type: string
    options: { text_en: string; text_th: string; is_correct: boolean }[] | null
    correct_answer: string | null
    display_order: number
    is_active: boolean
  }>("SELECT * FROM quiz_questions WHERE booth_id = $1 ORDER BY display_order ASC", [boothId])
}

export async function createQuizQuestion(formData: FormData) {
  await requireStaff()
  const booth_id = parseInt(formData.get("booth_id") as string)
  const question_en = formData.get("question_en") as string
  const question_th = formData.get("question_th") as string
  const question_type = formData.get("question_type") as string
  const display_order = parseInt(formData.get("display_order") as string) || 0
  const optionsRaw = formData.get("options") as string
  const correct_answer = formData.get("correct_answer") as string

  if (!question_en || !question_th) {
    return { error: "Both English and Thai questions are required" }
  }

  let options = null
  if (question_type === "multiple_choice" && optionsRaw) {
    try {
      options = JSON.parse(optionsRaw)
    } catch {
      return { error: "Invalid options format" }
    }
  }

  try {
    await query(
      "INSERT INTO quiz_questions (booth_id, question_en, question_th, question_type, options, correct_answer, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [booth_id, question_en, question_th, question_type, options ? JSON.stringify(options) : null, correct_answer || null, display_order]
    )
    revalidatePath(`/staff/booths/${booth_id}/quiz`)
    return { success: true }
  } catch {
    return { error: "Failed to create question" }
  }
}

export async function updateQuizQuestion(formData: FormData) {
  await requireStaff()
  const id = parseInt(formData.get("id") as string)
  const booth_id = parseInt(formData.get("booth_id") as string)
  const question_en = formData.get("question_en") as string
  const question_th = formData.get("question_th") as string
  const question_type = formData.get("question_type") as string
  const display_order = parseInt(formData.get("display_order") as string) || 0
  const optionsRaw = formData.get("options") as string
  const correct_answer = formData.get("correct_answer") as string
  const is_active = formData.get("is_active") === "true"

  let options = null
  if (question_type === "multiple_choice" && optionsRaw) {
    try {
      options = JSON.parse(optionsRaw)
    } catch {
      return { error: "Invalid options format" }
    }
  }

  try {
    await query(
      "UPDATE quiz_questions SET question_en=$1, question_th=$2, question_type=$3, options=$4, correct_answer=$5, display_order=$6, is_active=$7 WHERE id=$8",
      [question_en, question_th, question_type, options ? JSON.stringify(options) : null, correct_answer || null, display_order, is_active, id]
    )
    revalidatePath(`/staff/booths/${booth_id}/quiz`)
    return { success: true }
  } catch {
    return { error: "Failed to update question" }
  }
}

export async function deleteQuizQuestion(id: number, boothId: number) {
  await requireStaff()
  try {
    await query("DELETE FROM quiz_questions WHERE id = $1", [id])
    revalidatePath(`/staff/booths/${boothId}/quiz`)
    return { success: true }
  } catch {
    return { error: "Failed to delete question" }
  }
}
