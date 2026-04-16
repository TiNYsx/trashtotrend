"use server"

import { query } from "@/lib/db"
import { requireCustomer } from "@/lib/auth"

export async function createStampForBoothWithoutQuiz(boothId: number) {
  const session = await requireCustomer()

  try {
    await query(
      "INSERT INTO stamps (customer_id, booth_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [session.id, boothId]
    )
    return { success: true }
  } catch {
    return { error: "Failed to create stamp" }
  }
}
