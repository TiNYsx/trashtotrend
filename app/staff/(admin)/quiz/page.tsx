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

type PersonalityType = {
  id: number
  type_code: string
  name_en: string
  name_th: string
  description_en: string | null
  description_th: string | null
  display_order: number
  is_active: boolean
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
  let personalityTypes: PersonalityType[] = []
  let settings: SettingsOutput = { start_journey_quiz_enabled: "true" }

  try {
    questions = await getMany<Question>(
      "SELECT * FROM quiz_questions ORDER BY display_order ASC"
    )
    personalityTypes = await getMany<PersonalityType>(
      "SELECT * FROM personality_types ORDER BY display_order ASC"
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
      initialPersonalityTypes={personalityTypes}
      initialSettings={settings}
    />
  )
}