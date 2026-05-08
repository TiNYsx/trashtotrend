import { query } from "@/lib/db"
import RegisterClient from "./page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

type SurveyQuestion = {
  id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string }[] | null
  display_order: number
}

export default async function EventRegisterPage() {
  let preQuestions: SurveyQuestion[] = []
  
  try {
    const result = await query(
      "SELECT id, question_en, question_th, question_type, options, display_order FROM pre_survey_questions WHERE is_active = true ORDER BY display_order ASC"
    )
    if (result && result.rows) {
      preQuestions = result.rows.map((row: any) => ({
        ...row,
        options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options
      })) as SurveyQuestion[]
    }
  } catch (err) {
    console.error("Failed to fetch pre survey questions:", err)
  }

  // Fallback if none in db
  if (preQuestions.length === 0) {
    preQuestions = [
      { id: 1, question_en: 'I am aware of the environmental impact of aluminium waste.', question_th: 'ฉันตระหนักถึงผลกระทบต่อสิ่งแวดล้อมของของเสียอะลูมิเนียม', question_type: 'rating', options: null, display_order: 1 }
    ]
  }

  return <RegisterClient surveyQuestions={preQuestions} />
}
