'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'

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

export default function QuizPage() {
  const router = useRouter()
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
      setQuestions(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch questions:', error)
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
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4 px-6">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Quiz questions coming soon...</p>
        </div>
      </main>
    )
  }

  const currentQuestion = questions[currentIndex]
  
  if (!currentQuestion?.options || currentQuestion.options.length === 0) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4 px-6">
          <p className="text-muted-foreground">Loading question...</p>
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
            <span className="text-sm">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-display font-bold">HOOP</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
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
              className="w-full max-w-md text-center space-y-8"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-relaxed">
                {currentQuestion.question_en}
              </h2>
              <p className="text-muted-foreground">
                {currentQuestion.question_th}
              </p>
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
                  <span className="font-medium">{option.text_en}</span>
                  <p className="text-muted-foreground text-sm mt-1">{option.text_th}</p>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
