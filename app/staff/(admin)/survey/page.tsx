import { redirect } from "next/navigation"
import { getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { SurveySettingsClient } from "@/components/staff/survey-settings-client"

export const dynamic = "force-dynamic"

type SurveyQuestion = {
  id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string }[] | null
  is_required: boolean
  display_order: number
  is_active: boolean
}

export default async function SurveyPage() {
  const session = await requireStaff()
  
  if (!session) {
    redirect("/staff/login")
  }
  
  let preQuestions: SurveyQuestion[] = []
  let postQuestions: SurveyQuestion[] = []

  try {
    preQuestions = await getMany<SurveyQuestion>(
      "SELECT * FROM pre_survey_questions ORDER BY display_order ASC"
    )
    postQuestions = await getMany<SurveyQuestion>(
      "SELECT * FROM post_survey_questions ORDER BY display_order ASC"
    )
  } catch {
    // DB not connected
  }

  return (
    <SurveySettingsClient
      initialPreQuestions={preQuestions}
      initialPostQuestions={postQuestions}
    />
  )
}