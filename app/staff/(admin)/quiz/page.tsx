import { redirect } from "next/navigation"
import { getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { QuizSettingsClient } from "@/components/staff/quiz-settings-client"

export const dynamic = "force-dynamic"

type Question = {
  id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string; is_correct: boolean }[] | null
  display_order: number
  is_active: boolean
  booth_id: number | null
  quiz_category: string
}

type SettingsInput = {
  key: string
  value: string
}

type SettingsOutput = {
  start_journey_quiz_enabled: string
}

export default async function QuizPage() {
  const session = await requireStaff()
  
  if (!session) {
    redirect("/staff/login")
  }
  
  let questions: Question[] = []
  let settings: SettingsOutput = { start_journey_quiz_enabled: "true" }

  try {
    questions = await getMany<Question>(
      "SELECT * FROM quiz_questions WHERE quiz_category = 'journey' OR quiz_category IS NULL ORDER BY display_order ASC"
    )
    
    const settingsResult = await getMany<SettingsInput>(
      "SELECT key, value FROM event_settings WHERE key = 'start_journey_quiz_enabled'"
    )
    for (const s of settingsResult) {
      if (s.key === 'start_journey_quiz_enabled') settings.start_journey_quiz_enabled = s.value
    }
  } catch {
    // DB not connected
  }

  return (
    <QuizSettingsClient
      initialQuestions={questions}
      initialSettings={settings}
    />
  )
}