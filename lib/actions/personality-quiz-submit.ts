"use server"

import { query } from "@/lib/db"
import { requireCustomer } from "@/lib/auth"

export async function submitPersonalityQuiz(
  responses: { question_id: number; answer: string }[],
  dominantType: string
) {
  const session = await requireCustomer()

  try {
    // Save each quiz response
    for (const r of responses) {
      await query(
        "INSERT INTO quiz_responses (customer_id, question_id, answer) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [session.id, r.question_id, r.answer]
      )
    }

    // Save dominant personality type to customer record
    await query(
      "UPDATE customers SET quiz_type = $1 WHERE id = $2",
      [dominantType, session.id]
    )

    return { success: true }
  } catch {
    return { error: "Failed to submit quiz responses" }
  }
}
