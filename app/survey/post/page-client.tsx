'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Trophy, Loader2, Lock } from 'lucide-react'
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

interface PostSurveyClientProps {
  surveyQuestions: SurveyQuestion[]
}

export default function PostSurveyPage({ surveyQuestions }: PostSurveyClientProps) {
  const router = useRouter()
  const { lang } = useLanguage()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isLocked, setIsLocked] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      const res = await fetch('/api/user/dashboard')
      const data = await res.json()
      if (data.checkpoint_count >= data.total_checkpoints) {
        setIsLocked(false)
      }
    } catch (err) {
      console.error('Failed to check access:', err)
    }
    setIsLoading(false)
  }

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
      // Convert answers to numeric scores for database storage
      const numericAnswers: Record<number, number> = {}
      for (const [idx, answer] of Object.entries(finalAnswers)) {
        const question = surveyQuestions[parseInt(idx)]
        if (question.question_type === 'yes_no') {
          // Map yes/no to 5/1
          numericAnswers[parseInt(idx)] = answer === 'yes' ? 5 : 1
        } else if (question.question_type === 'rating') {
          numericAnswers[parseInt(idx)] = answer as number
        } else if (question.question_type === 'multiple_choice') {
          // Store the option index + 1 as score
          const optionIndex = question.options?.findIndex(
            opt => (lang === 'th' ? opt.text_th : opt.text_en) === answer
          ) ?? 0
          numericAnswers[parseInt(idx)] = optionIndex + 1
        } else {
          // For text, store as 3 (neutral)
          numericAnswers[parseInt(idx)] = 3
        }
      }

      const res = await fetch('/api/survey/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: numericAnswers })
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-accent/20 blur-[120px]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-primary/20 blur-[80px]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 mb-6"
          >
            <Trophy className="h-12 w-12 text-accent animate-glow-pulse" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-center mb-2"
          >
            {lang === 'th' ? 'ทำได้ดีมาก!' : 'Amazing Work!'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-center mb-8"
          >
            {lang === 'th' ? 'ของรางวัลของคุณถูกปลดล็อกแล้ว!' : 'Your reward has been unlocked!'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 text-center max-w-sm w-full mb-6"
          >
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'th' ? 'แสดงหน้าจอนี้ให้เจ้าหน้าที่ที่จุดรับของรางวัลเพื่อรับรางวัลของคุณ' : 'Show this screen to staff at the reward counter to claim your prize.'}
            </p>
          </motion.div>
          <button
            onClick={() => router.push('/dashboard')}
            className="h-12 px-8 rounded-xl bg-accent text-accent-foreground font-semibold"
          >
            {lang === 'th' ? 'กลับสู่แดชบอร์ด' : 'Return to Dashboard'}
          </button>
        </div>
      </main>
    )
  }

  const progress = ((currentQ + 1) / surveyQuestions.length) * 100

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-accent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (isLocked) {
    return (
      <main className="relative min-h-dvh gradient-bg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-accent/10 blur-[80px]" />
        </div>
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary mb-6"
          >
            <Lock className="h-12 w-12 text-muted-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-center mb-2"
          >
            {lang === 'th' ? 'ถูกล็อก' : 'Locked'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-center mb-8"
          >
            {lang === 'th' ? 'กรุณารวบรวมแสตมป์ครบทุกด่านก่อนทำแบบสำรวจ' : 'Complete all checkpoints to unlock this survey'}
          </motion.p>
          <button
            onClick={() => router.push('/dashboard')}
            className="h-12 px-8 rounded-xl bg-accent text-accent-foreground font-semibold"
          >
            {lang === 'th' ? 'กลับสู่แดชบอร์ด' : 'Return to Dashboard'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh gradient-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-accent/10 blur-[100px] animate-pulse-slow" />
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
            <span className="text-sm text-accent font-medium">
              {lang === 'th' ? 'แบบสำรวจหลังงาน' : 'Post-Survey'}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{lang === 'th' ? 'คำถาม' : 'Question'} {currentQ + 1} {lang === 'th' ? 'จาก' : 'of'} {surveyQuestions.length}</span>
            <span className="font-semibold text-accent">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
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
                    className="h-16 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-accent hover:text-accent-foreground hover:border-accent disabled:opacity-50"
                  >
                    {lang === 'th' ? 'ใช่' : 'Yes'}
                  </button>
                  <button
                    onClick={() => handleAnswer('no')}
                    disabled={isSubmitting}
                    className="h-16 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-accent hover:text-accent-foreground hover:border-accent disabled:opacity-50"
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
                      className="w-full p-4 rounded-xl border border-border glass text-left transition-all hover:bg-accent hover:text-accent-foreground hover:border-accent disabled:opacity-50"
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
                    className="w-full h-12 rounded-xl bg-accent text-accent-foreground font-semibold transition-all hover:bg-accent/90 disabled:opacity-50"
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
                      className="h-16 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-accent hover:text-accent-foreground hover:border-accent disabled:opacity-50"
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
            <Loader2 className="h-10 w-10 text-accent animate-spin" />
          </div>
        )}
      </div>
    </main>
  )
}
