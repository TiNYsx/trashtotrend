'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers'

const SURVEY_QUESTIONS = [
  { en: 'I am aware of the environmental impact of aluminium waste.', th: 'ฉันตระหนักถึงผลกระทบต่อสิ่งแวดล้อมของของเสียอะลูมิเนียม' },
  { en: 'I understand the concept of circular economy.', th: 'ฉันเข้าใจแนวคิดเศรษฐกิจหมุนเวียน' },
  { en: 'I regularly recycle aluminium products.', th: 'ฉันสม่ำเสมอในการรีไซเคิลผลิตภัณฑ์อะลูมิเนียม' },
  { en: 'I believe individual actions can make a difference for the environment.', th: 'ฉันเชื่อว่าการกระทำของปัจเจกบุคคลสามารถสร้างความแตกต่างต่อสิ่งแวดล้อมได้' },
  { en: 'I am interested in learning more about sustainable practices.', th: 'ฉันสนใจที่จะเรียนรู้เพิ่มเติมเกี่ยวกับแนวปฏิบัติที่ยั่งยืน' },
  { en: 'I would be willing to pay more for eco-friendly products.', th: 'ฉันยินดีที่จะจ่ายมากขึ้นสำหรับผลิตภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม' },
  { en: 'I have participated in environmental activities before.', th: 'ฉันเคยเข้าร่วมกิจกรรมด้านสิ่งแวดล้อมมาก่อน' },
  { en: 'I believe businesses should be responsible for recycling their products.', th: 'ฉันเชื่อว่าธุรกิจควรรับผิดชอบในการรีไซเคิลผลิตภัณฑ์ของตน' }
]

export default function PreSurveyPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleAnswer = (score: number) => {
    const newAnswers = { ...answers, [currentQ]: score }
    setAnswers(newAnswers)

    if (currentQ < SURVEY_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      submitSurvey(newAnswers)
    }
  }

  const submitSurvey = async (finalAnswers: Record<number, number>) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/survey/pre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers })
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

  const progress = ((currentQ + 1) / SURVEY_QUESTIONS.length) * 100

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
            <span className="text-muted-foreground">{lang === 'th' ? 'คำถาม' : 'Question'} {currentQ + 1} {lang === 'th' ? 'จาก' : 'of'} {SURVEY_QUESTIONS.length}</span>
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
              {lang === 'th' ? SURVEY_QUESTIONS[currentQ].th : SURVEY_QUESTIONS[currentQ].en}
            </p>
          </motion.div>

          {/* Scale buttons */}
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
