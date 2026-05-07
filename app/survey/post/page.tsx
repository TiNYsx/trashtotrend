import { query } from "@/lib/db"
import PostSurveyClient from "./page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

type SurveyQuestion = {
  id: number
  question_en: string
  question_th: string
  display_order: number
}

export default async function PostSurveyPage() {
  let postQuestions: SurveyQuestion[] = []
  
  try {
    const result = await query(
      "SELECT id, question_en, question_th, display_order FROM post_survey_questions WHERE is_active = true ORDER BY display_order ASC"
    )
    if (result && result.rows) {
      postQuestions = result.rows as SurveyQuestion[]
    }
  } catch (err) {
    console.error("Failed to fetch post survey questions:", err)
  }

  if (postQuestions.length === 0) {
    postQuestions = [
      { id: 1, question_en: 'How much did you enjoy the event?', question_th: 'คุณ enjoy งานมากแค่ไหน?', display_order: 1 }
    ]
  }

  return <PostSurveyClient surveyQuestions={postQuestions} />
}
