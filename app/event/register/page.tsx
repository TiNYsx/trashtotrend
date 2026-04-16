'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, QrCode, Snowflake, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/providers'

interface FormData {
  name: string
  age: string
  gender: string
  contact: string
  email: string
}

interface SurveyAnswer {
  questionNum: number
  score: number
}

const SURVEY_QUESTIONS = [
  'I am aware of the environmental impact of aluminium waste.',
  'I understand the concept of circular economy.',
  'I regularly recycle aluminium products.',
  'I believe individual actions can make a difference for the environment.',
  'I am interested in learning more about sustainable practices.',
  'I would be willing to pay more for eco-friendly products.',
  'I have participated in environmental activities before.',
  'I believe businesses should be responsible for recycling their products.'
]

const GENDER_OPTIONS = [
  { value: 'male', label_en: 'Male', label_th: 'ชาย' },
  { value: 'female', label_en: 'Female', label_th: 'หญิง' },
  { value: 'other', label_en: 'Other', label_th: 'อื่นๆ' },
  { value: 'prefer_not', label_en: 'Prefer not to say', label_th: 'ไม่ระบุ' }
]

export default function EventRegisterPage() {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const [step, setStep] = useState<'form' | 'survey' | 'success'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('registrationStep')
      if (saved === 'survey' || saved === 'success') return saved
    }
    return 'form'
  })
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    contact: '',
    email: ''
  })
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer[]>([])
  const [currentSurveyQ, setCurrentSurveyQ] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('survey')
  }

  const handleSurveyAnswer = (score: number) => {
    const newAnswers = [...surveyAnswers.filter(a => a.questionNum !== currentSurveyQ + 1)]
    newAnswers.push({ questionNum: currentSurveyQ + 1, score })
    setSurveyAnswers(newAnswers)

    if (currentSurveyQ < SURVEY_QUESTIONS.length - 1) {
      setCurrentSurveyQ(currentSurveyQ + 1)
    } else {
      submitRegistration([...newAnswers, { questionNum: currentSurveyQ + 1, score }])
    }
  }

  const submitRegistration = async (answers: SurveyAnswer[]) => {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, surveyAnswers: answers })
      })

      if (res.ok) {
        setStep('success')
      } else {
        const data = await res.json()
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setIsSubmitting(false)
  }

  const goBack = () => {
    if (step === 'survey' && currentSurveyQ > 0) {
      setCurrentSurveyQ(currentSurveyQ - 1)
    } else if (step === 'survey') {
      setStep('form')
    }
  }

  if (step === 'success') {
    return (
      <main className="relative min-h-dvh gradient-bg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
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
            transition={{ delay: 0.2 }}
            className="font-display text-3xl font-bold text-center mb-2"
          >
            Registration Complete!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center mb-8"
          >
            Your QR code is ready. Start your journey!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-8 transition-all hover:scale-[1.02] glow-primary"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh gradient-bg">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent/20 blur-[80px] animate-pulse-slow" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">HOOP</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${step === 'form' ? 'bg-primary' : 'bg-primary/50'}`} />
          <div className="w-8 h-0.5 bg-border" />
          <div className="w-3 h-3 rounded-full bg-primary" />
        </div>

        {step === 'form' ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-3xl font-bold mb-2">Event Registration</h1>
              <p className="text-muted-foreground">
                Bring your aluminium can to check in
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleFormSubmit}
              className="w-full space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age *</label>
                  <input
                    type="text"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Age"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select</option>
                    {GENDER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {lang === 'th' ? opt.label_th : opt.label_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact *</label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Phone or Line ID"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                className="group w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:scale-[1.02] mt-6"
              >
                <span>Continue to Survey</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-2xl font-bold mb-2">Pre-Event Survey</h1>
              <p className="text-muted-foreground text-sm">
                Question {currentSurveyQ + 1} of {SURVEY_QUESTIONS.length}
              </p>
            </motion.div>

            {/* Progress */}
            <div className="w-full mb-8">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSurveyQ + 1) / SURVEY_QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <motion.div
              key={currentSurveyQ}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center mb-8"
            >
              <p className="text-lg font-medium leading-relaxed">
                {SURVEY_QUESTIONS[currentSurveyQ]}
              </p>
            </motion.div>

            {/* Scale buttons */}
            <div className="w-full grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleSurveyAnswer(score)}
                  disabled={isSubmitting}
                  className="h-14 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50"
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="w-full flex justify-between text-xs text-muted-foreground mt-2 px-2">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>

            {isSubmitting && (
              <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
