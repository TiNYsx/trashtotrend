'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers'

interface QuizOption {
  text_en: string
  text_th: string
  type: string
}

interface QuizQuestion {
  id: number
  question_en: string
  question_th: string
  options: QuizOption[]
}

const PERSONA_TYPES = {
  A: { name: 'Creator', icon: '✨', color: 'text-primary' },
  B: { name: 'Observer', icon: '👁️', color: 'text-chart-3' },
  C: { name: 'Player', icon: '🎮', color: 'text-chart-4' },
  D: { name: 'Explorer', icon: '🧭', color: 'text-chart-2' },
  E: { name: 'Resetter', icon: '🔄', color: 'text-accent' },
}

const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question_en: 'How do you approach creative projects?',
    question_th: 'คุณเข้าหาโปรเจกต์ที่สร้างสรรค์อย่างไร?',
    options: [
      { text_en: 'I love starting from scratch and building something new', text_th: 'ฉันชอบเริ่มจากศูนย์และสร้างสิ่งใหม่', type: 'A' },
      { text_en: 'I prefer exploring different approaches before deciding', text_th: 'ฉันชอบสำรวจแนวทางต่างๆ ก่อนตัดสินใจ', type: 'D' },
      { text_en: 'I observe and learn from others first', text_th: 'ฉันสังเกตและเรียนรู้จากผู้อื่นก่อน', type: 'B' },
      { text_en: 'I jump in and figure it out as I go', text_th: 'ฉันลงมือทำเลยแล้วค่อยปรับตัว', type: 'C' },
      { text_en: 'I reset and simplify complex ideas', text_th: 'ฉันทำให้ความคิดซับซ้อนเรียบง่ายขึ้น', type: 'E' },
    ]
  },
  {
    id: 2,
    question_en: 'What draws you to sustainability?',
    question_th: 'อะไรดึงดูดคุณในเรื่องความยั่งยืน?',
    options: [
      { text_en: 'Creating new things from waste materials', text_th: 'การสร้างสิ่งใหม่จากวัสดุเหลือใช้', type: 'A' },
      { text_en: 'Discovering hidden connections in nature', text_th: 'การค้นพบความเชื่อมโยงที่ซ่อนเร้นในธรรมชาติ', type: 'D' },
      { text_en: 'Understanding the bigger picture', text_th: 'การเข้าใจภาพรวม', type: 'B' },
      { text_en: 'Taking action and making immediate impact', text_th: 'การลงมือทำและสร้างผลกระทบทันที', type: 'C' },
      { text_en: 'Finding clarity in environmental chaos', text_th: 'การหาความชัดเจนในความวุ่นวายด้านสิ่งแวดล้อม', type: 'E' },
    ]
  },
  {
    id: 3,
    question_en: 'At an exhibition, you typically...',
    question_th: 'เมื่อไปงานนิทรรศการ คุณมักจะ...',
    options: [
      { text_en: 'Create your own content to share', text_th: 'สร้างคอนเทนต์ของตัวเองเพื่อแชร์', type: 'A' },
      { text_en: 'Wander and discover unexpected things', text_th: 'เดินชมและค้นพบสิ่งไม่คาดคิด', type: 'D' },
      { text_en: 'Take time to understand each exhibit deeply', text_th: 'ใช้เวลาทำความเข้าใจแต่ละรายการอย่างลึกซึ้ง', type: 'B' },
      { text_en: 'Try every interactive activity available', text_th: 'ลองทุกกิจกรรมที่โต้ตอบได้', type: 'C' },
      { text_en: 'Focus on the most important messages', text_th: 'โฟกัสที่ข้อความสำคัญที่สุด', type: 'E' },
    ]
  },
  {
    id: 4,
    question_en: 'How do you prefer to learn?',
    question_th: 'คุณชอบเรียนรู้อย่างไร?',
    options: [
      { text_en: 'Through hands-on creation and making', text_th: 'ผ่านการลงมือทำจริง', type: 'A' },
      { text_en: 'Through exploration and discovery', text_th: 'ผ่านการสำรวจและค้นพบ', type: 'D' },
      { text_en: 'Through careful observation and reading', text_th: 'ผ่านการสังเกตและอ่านอย่างระมัดระวัง', type: 'B' },
      { text_en: 'Through games and challenges', text_th: 'ผ่านเกมและการท้าทาย', type: 'C' },
      { text_en: 'Through simplified explanations', text_th: 'ผ่านคำอธิบายที่เรียบง่าย', type: 'E' },
    ]
  },
  {
    id: 5,
    question_en: 'What motivates you most?',
    question_th: 'อะไรเป็นแรงจูงใจหลักของคุณ?',
    options: [
      { text_en: 'Making something beautiful from waste', text_th: 'การสร้างสิ่งสวยงามจากของเหลือใช้', type: 'A' },
      { text_en: 'Discovering how things work together', text_th: 'การค้นพบว่าสิ่งต่างๆ ทำงานร่วมกันอย่างไร', type: 'D' },
      { text_en: 'Understanding the deeper meaning', text_th: 'การเข้าใจความหมายที่ลึกซึ้ง', type: 'B' },
      { text_en: 'Winning and achieving goals', text_th: 'การชนะและบรรลุเป้าหมาย', type: 'C' },
      { text_en: 'Restoring balance and order', text_th: 'การฟื้นฟูความสมดุลและความเป็นระเบียบ', type: 'E' },
    ]
  },
]

export default function QuizPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0, E: 0 })
  const [answers, setAnswers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/quiz')
      const data = await res.json()
      if (data && data.length > 0) {
        setQuestions(data)
      } else {
        setQuestions(FALLBACK_QUESTIONS)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      setQuestions(FALLBACK_QUESTIONS)
      setIsLoading(false)
    }
  }

  const handleAnswer = async (option: QuizOption) => {
    setIsSubmitting(true)
    
    const newScores = { ...scores }
    newScores[option.type as keyof typeof scores]++
    setScores(newScores)
    
    const newAnswers = [...answers, option.type === 'A' ? 1 : option.type === 'B' ? 2 : option.type === 'C' ? 3 : option.type === 'D' ? 4 : 5]
    setAnswers(newAnswers)

    if (currentIndex < questions.length - 1) {
      setDirection(1)
      await new Promise(r => setTimeout(r, 300))
      setCurrentIndex(currentIndex + 1)
    } else {
      const dominantType = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0][0]
      localStorage.setItem('quizScores', JSON.stringify(newScores))
      localStorage.setItem('quizDominantType', dominantType)
      router.push(`/quiz/result?type=${dominantType}`)
    }
    
    setIsSubmitting(false)
  }

  const goBack = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">{lang === 'th' ? 'กำลังโหลด...' : 'Loading quiz...'}</p>
        </div>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4 px-6">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">{lang === 'th' ? 'คำถามกำลังจะมา...' : 'Quiz questions coming soon...'}</p>
        </div>
      </main>
    )
  }

  const currentQuestion = questions[currentIndex]
  
  if (!currentQuestion?.options || currentQuestion.options.length === 0) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4 px-6">
          <p className="text-muted-foreground">{lang === 'th' ? 'กำลังโหลดคำถาม...' : 'Loading question...'}</p>
        </div>
      </main>
    )
  }
  
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <main className="relative min-h-dvh gradient-bg">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[80px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent/10 blur-[60px] animate-pulse-slow" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 text-muted-foreground transition-colors disabled:opacity-30 hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">{lang === 'th' ? 'กลับ' : 'Back'}</span>
          </button>
          
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="font-display font-bold">HOOP</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{lang === 'th' ? 'คำถาม' : 'Question'} {currentIndex + 1} {lang === 'th' ? 'จาก' : 'of'} {questions.length}</span>
            <span className="font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md text-center space-y-4"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-relaxed">
                {lang === 'th' ? currentQuestion.question_th : currentQuestion.question_en}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Options */}
        <div className="space-y-3 pb-8 max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={isSubmitting}
                  className="group w-full p-4 rounded-xl border border-border glass text-left transition-all hover:border-primary hover:bg-primary/10 disabled:opacity-50"
                >
                  <span className="text-muted-foreground text-sm mr-2">{idx + 1}.</span>
                  <span className="font-medium">{lang === 'th' ? option.text_th : option.text_en}</span>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
