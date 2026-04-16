import { getMany, getOne } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { QuizManager } from "@/components/staff/quiz-manager"
import { notFound } from "next/navigation"

type QuizQuestion = {
  id: number
  booth_id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string; is_correct: boolean }[] | null
  correct_answer: string | null
  display_order: number
  is_active: boolean
}

type Booth = {
  id: number
  name_en: string
  name_th: string
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff()
  const { id } = await params
  const boothId = parseInt(id)

  let booth: Booth | null = null
  let questions: QuizQuestion[] = []

  try {
    booth = await getOne<Booth>("SELECT id, name_en, name_th FROM booths WHERE id = $1", [boothId])
    if (!booth) notFound()

    questions = await getMany<QuizQuestion>(
      "SELECT * FROM quiz_questions WHERE booth_id = $1 ORDER BY display_order ASC",
      [boothId]
    )
  } catch {
    // DB not connected
  }

  return (
    <QuizManager
      boothId={boothId}
      boothName={booth?.name_en || `Booth ${boothId}`}
      boothNameTh={booth?.name_th || `Booth ${boothId}`}
      initialQuestions={questions}
    />
  )
}
