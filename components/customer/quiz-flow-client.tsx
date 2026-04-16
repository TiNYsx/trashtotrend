"use client"

import { useState, useTransition } from "react"
import { useLanguage } from "@/components/providers"
import { submitQuizResponses } from "@/lib/actions/quiz-submit"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ArrowRight, Trophy } from "lucide-react"
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

type Props = {
  boothId: number
  boothNameEn: string
  boothNameTh: string
  questions: Question[]
}

export function QuizFlowClient({
  boothId,
  boothNameEn,
  boothNameTh,
  questions,
}: Props) {
  const { t, lang } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [done, setDone] = useState(false)
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null)
  const [isPending, startTransition] = useTransition()

  const question = questions[current]
  const isLast = current === questions.length - 1
  const boothName = lang === "th" ? boothNameTh : boothNameEn

  const setAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: answer }))
  }

  const handleNext = () => {
    if (isLast) {
      handleSubmit()
    } else {
      setCurrent((prev) => prev + 1)
    }
  }

  const handleSubmit = () => {
    startTransition(async () => {
      const responses = questions.map((q) => {
        const answer = answers[q.id] || ""
        let isCorrect = false

        if (q.question_type === "multiple_choice" && q.options) {
          const selectedOpt = q.options.find(
            (o) => (lang === "th" ? o.text_th : o.text_en) === answer
          )
          isCorrect = selectedOpt?.is_correct ?? false
        } else if (q.question_type === "short_text" && q.correct_answer) {
          isCorrect =
            answer.toLowerCase().trim() ===
            q.correct_answer.toLowerCase().trim()
        }

        return { question_id: q.id, answer, is_correct: isCorrect }
      })

      const result = await submitQuizResponses(boothId, responses)
      if (result.success) {
        setScore({ correct: result.score ?? 0, total: result.total ?? questions.length })
      }
      setDone(true)
    })
  }

  // Completion screen
  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
        <motion.div
          className="flex w-full max-w-sm flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 12 }}
          >
            <Trophy className="h-10 w-10 text-gold" />
          </motion.div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {t("quizComplete")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{boothName}</p>
          </div>

          {score && (
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-4xl font-bold text-primary">
                {score.correct}
              </span>
              <span className="text-lg text-muted-foreground">/ {score.total}</span>
              <span className="ml-1 text-sm text-muted-foreground">
                {t("quizScore")}
              </span>
            </div>
          )}

          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("quizThankYou")}
          </p>

          <Link
            href="/stamps"
            className="flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("backToStamps")}
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {t("quizTitle")}
          </p>
          <h1 className="font-serif text-lg font-bold text-foreground">
            {boothName}
          </h1>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
          <span className="text-sm font-bold text-foreground">{current + 1}</span>
          <span className="text-xs text-muted-foreground">
            / {questions.length}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="h-1 bg-secondary">
        <motion.div
          className="h-full bg-accent"
          animate={{
            width: `${((current + 1) / questions.length) * 100}%`,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Question area */}
      <div className="flex flex-1 flex-col px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            {/* Question text */}
            <h2 className="text-balance font-serif text-xl font-bold leading-relaxed text-foreground">
              {lang === "th" ? question.question_th : question.question_en}
            </h2>

            {/* Options */}
            <div className="mt-8 flex flex-col gap-3">
              {question.question_type === "multiple_choice" &&
                question.options?.map((opt, idx) => {
                  const label = lang === "th" ? opt.text_th : opt.text_en
                  const selected = answers[question.id] === label

                  return (
                    <button
                      key={idx}
                      onClick={() => setAnswer(label)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                        selected
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border bg-card text-foreground hover:border-accent/50"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                          selected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {selected ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </div>
                      <span>{label}</span>
                    </button>
                  )
                })}

              {question.question_type === "short_text" && (
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t("typeAnswer")}
                  className="h-12 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer action */}
      <div className="border-t border-border px-5 py-4">
        <button
          onClick={handleNext}
          disabled={!answers[question.id] || isPending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
        >
          {isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <>
              {isLast ? t("finish") : t("next")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
