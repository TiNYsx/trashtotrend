"use server"

import { query } from "@/lib/db"
import { requireCustomer } from "@/lib/auth"

export async function submitQuizResponses(
  boothId: number,
  responses: { question_id: number; answer: string; is_correct: boolean }[]
) {
  const session = await requireCustomer()

  try {
    for (const r of responses) {
      await query(
        "INSERT INTO quiz_responses (customer_id, question_id, booth_id, answer, is_correct) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
        [session.id, r.question_id, boothId, r.answer, r.is_correct]
      )
    }

    // after recording responses, ensure stamp exists
    try {
      await query(
        "INSERT INTO stamps (customer_id, booth_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [session.id, boothId]
      )
    } catch {
      // ignore stamp failure
    }

    const correctCount = responses.filter((r) => r.is_correct).length
    return { success: true, score: correctCount, total: responses.length }
  } catch {
    return { error: "Failed to submit quiz responses" }
  }
}
