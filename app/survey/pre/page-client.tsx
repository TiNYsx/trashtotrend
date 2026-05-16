'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers'

interface SurveyQuestion {
  id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string }[] | null
  display_order: number
}

interface PreSurveyClientProps {
  surveyQuestions: SurveyQuestion[]
}

export default function PreSurveyPage({ surveyQuestions }: PreSurveyClientProps) {
  const router = useRouter()
  const { lang } = useLanguage()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/user/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.pre_survey_completed) {
          router.push('/dashboard')
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [])

  const handleAnswer = (answer: string | number) => {
    const newAnswers = { ...answers, [currentQ]: answer }
    setAnswers(newAnswers)

    if (currentQ < surveyQuestions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      submitSurvey(newAnswers)
    }
  }

  const handleTextSubmit = () => {
    const answer = answers[currentQ]
    if (!answer || (typeof answer === 'string' && answer.trim() === '')) return
    
    if (currentQ < surveyQuestions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      submitSurvey(answers)
    }
  }

  const submitSurvey = async (finalAnswers: Record<number, string | number>) => {
    setIsSubmitting(true)
    try {
      // Convert answers to score + answer text for database storage
      const formattedAnswers: Record<number, { score: number; answer: string }> = {}
      for (const [idx, answer] of Object.entries(finalAnswers)) {
        const question = surveyQuestions[parseInt(idx)]
        if (question.question_type === 'yes_no') {
          // Store Yes/No as answer text, score 5/1
          const isYes = answer === 'yes'
          formattedAnswers[parseInt(idx)] = {
            score: isYes ? 5 : 1,
            answer: isYes ? (lang === 'th' ? 'ใช่' : 'Yes') : (lang === 'th' ? 'ไม่' : 'No')
          }
        } else if (question.question_type === 'rating') {
          // Store rating number as both score and answer
          formattedAnswers[parseInt(idx)] = {
            score: answer as number,
            answer: String(answer)
          }
        } else if (question.question_type === 'multiple_choice') {
          // Store option text as answer, option index + 1 as score
          const optionIndex = question.options?.findIndex(
            opt => (lang === 'th' ? opt.text_th : opt.text_en) === answer
          ) ?? 0
          formattedAnswers[parseInt(idx)] = {
            score: optionIndex + 1,
            answer: String(answer)
          }
        } else {
          // For text, store actual text answer
          formattedAnswers[parseInt(idx)] = {
            score: 1,
            answer: String(answer)
          }
        }
      }

      const res = await fetch('/api/survey/pre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers })
      })

      setIsComplete(true)
    } catch (err) {
      console.error('Failed to submit survey:', err)
      setIsComplete(true)
    }
  }

  const goBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1)
    } else {
      router.back()
    }
  }

  if (isComplete) {
    return (
      <main className="relative min-h-dvh gradient-bg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          />
        </div>
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-6"
          >
            <CheckCircle className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-center mb-4"
          >
            {lang === 'th' ? 'สำรวจเสร็จแล้ว!' : 'Survey Complete!'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-center mb-8"
          >
            {lang === 'th' ? 'ขอบคุณสำหรับความคิดเห็นของคุณ' : 'Thank you for your feedback'}
          </motion.p>
          <button
            onClick={() => router.push('/dashboard')}
            className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            {lang === 'th' ? 'กลับสู่แดชบอร์ด' : 'Return to Dashboard'}
          </button>
        </div>
      </main>
    )
  }

  if (checking) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </main>
    )
  }

  const progress = ((currentQ + 1) / surveyQuestions.length) * 100

  return (
    <main className="relative min-h-dvh gradient-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[100px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">{lang === 'th' ? 'กลับ' : 'Back'}</span>
          </button>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <span className="text-sm text-muted-foreground">
              {lang === 'th' ? 'แบบสำรวจก่อนงาน' : 'Pre-Survey'}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{lang === 'th' ? 'คำถาม' : 'Question'} {currentQ + 1} {lang === 'th' ? 'จาก' : 'of'} {surveyQuestions.length}</span>
            <span className="font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full text-center mb-12"
          >
            <p className="text-xl font-medium leading-relaxed">
              {lang === 'th' ? surveyQuestions[currentQ].question_th : surveyQuestions[currentQ].question_en}
            </p>
          </motion.div>

          {/* Dynamic question input based on question_type */}
          {(() => {
            const currentQuestion = surveyQuestions[currentQ]
            const qType = currentQuestion.question_type

            if (qType === 'yes_no') {
              return (
                <div className="w-full grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswer('yes')}
                    disabled={isSubmitting}
                    className="h-16 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50"
                  >
                    {lang === 'th' ? 'ใช่' : 'Yes'}
                  </button>
                  <button
                    onClick={() => handleAnswer('no')}
                    disabled={isSubmitting}
                    className="h-16 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50"
                  >
                    {lang === 'th' ? 'ไม่' : 'No'}
                  </button>
                </div>
              )
            }

            if (qType === 'multiple_choice' && currentQuestion.options) {
              return (
                <div className="w-full space-y-3">
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(lang === 'th' ? opt.text_th : opt.text_en)}
                      disabled={isSubmitting}
                      className="w-full p-4 rounded-xl border border-border glass text-left transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50"
                    >
                      <span className="font-medium">{lang === 'th' ? opt.text_th : opt.text_en}</span>
                    </button>
                  ))}
                </div>
              )
            }

            if (qType === 'text') {
              return (
                <div className="w-full space-y-4">
                  <textarea
                    value={(answers[currentQ] as string) || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
                    placeholder={lang === 'th' ? 'พิมพ์คำตอบของคุณ...' : 'Type your answer...'}
                    className="w-full h-32 p-4 rounded-xl border border-border bg-background resize-none"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={isSubmitting || !(answers[currentQ] as string)?.trim()}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    {lang === 'th' ? 'ถัดไป' : 'Next'}
                  </button>
                </div>
              )
            }

            // Default: rating (1-5)
            return (
              <>
                <div className="w-full grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswer(score)}
                      disabled={isSubmitting}
                      className="h-16 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50"
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="w-full flex justify-between text-xs text-muted-foreground mt-3 px-2">
                  <span>{lang === 'th' ? 'ไม่เห็นด้วยอย่างยิ่ง' : 'Strongly Disagree'}</span>
                  <span>{lang === 'th' ? 'เห็นด้วยอย่างยิ่ง' : 'Strongly Agree'}</span>
                </div>
              </>
            )
          })()}
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        )}
      </div>
    </main>
  )
}
