import { requireCustomer } from "@/lib/auth"
import { getMany, getOne, query } from "@/lib/db"
import { QuizFlowClient } from "@/components/customer/quiz-flow-client"
import Link from "next/link"

type Question = {
  id: number
  booth_id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string; is_correct: boolean }[] | null
  correct_answer: string | null
  display_order: number
}

type Booth = {
  id: number
  name_en: string
  name_th: string
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ boothId: string }>
}) {
  await requireCustomer()
  const { boothId } = await params
  const bid = parseInt(boothId)

  let questions: Question[] = []
  let booth: Booth | null = null

  try {
    booth = await getOne<Booth>("SELECT id, name_en, name_th FROM booths WHERE id = $1", [
      bid,
    ])
    questions = await getMany<Question>(
      "SELECT id, booth_id, question_en, question_th, question_type, options, correct_answer, display_order FROM quiz_questions WHERE booth_id = $1 AND is_active = true ORDER BY display_order ASC",
      [bid]
    )
  } catch {
    // DB not connected
  }

  if (!booth) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">Booth not found</p>
        <Link
          href="/stamps"
          className="mt-4 text-sm text-accent underline-offset-4 hover:underline"
        >
          Back to stamps
        </Link>
      </div>
    )
  }

  if (questions.length === 0) {
    // auto-insert stamp if booth has no quiz
    const session = await requireCustomer()
    try {
      await query(
        "INSERT INTO stamps (customer_id, booth_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [session.id, bid]
      )
    } catch {
      // ignore stamp creation errors
    }

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
        <div className="animate-fade-in-up flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-xl font-bold text-foreground">
            Stamp Collected!
          </h2>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            No quiz for this booth. Your stamp has been recorded.
          </p>
          <Link
            href="/stamps"
            className="mt-2 flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Back to Stamps
          </Link>
        </div>
      </div>
    )
  }

  return (
    <QuizFlowClient
      boothId={bid}
      boothNameEn={booth.name_en}
      boothNameTh={booth.name_th}
      questions={questions}
    />
  )
}
