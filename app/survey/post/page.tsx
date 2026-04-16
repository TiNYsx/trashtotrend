'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Trophy, Loader2, Lock } from 'lucide-react'
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

export default function PostSurveyPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
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
      const res = await fetch('/api/survey/post', {
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

  const progress = ((currentQ + 1) / SURVEY_QUESTIONS.length) * 100

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
            <span className="text-muted-foreground">{lang === 'th' ? 'คำถาม' : 'Question'} {currentQ + 1} {lang === 'th' ? 'จาก' : 'of'} {SURVEY_QUESTIONS.length}</span>
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
