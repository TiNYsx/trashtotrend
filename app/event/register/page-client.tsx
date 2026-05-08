'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, QrCode, Snowflake, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/providers'
import { LanguageToggle } from '@/components/language-toggle'

interface FormData {
  name: string
  age: string
  gender: string
  contact: string
  email: string
  password: string
}

interface SurveyAnswer {
  questionNum: number
  score: number
}

interface SurveyQuestion {
  id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string }[] | null
  display_order: number
}

interface RegisterClientProps {
  surveyQuestions: SurveyQuestion[]
}

const GENDER_OPTIONS = [
  { value: 'male', label_en: 'Male', label_th: 'ชาย' },
  { value: 'female', label_en: 'Female', label_th: 'หญิง' },
  { value: 'other', label_en: 'Other', label_th: 'อื่นๆ' },
  { value: 'prefer_not', label_en: 'Prefer not to say', label_th: 'ไม่ระบุ' }
]

export default function RegisterClient({ surveyQuestions }: RegisterClientProps) {
  const router = useRouter()
  const { lang } = useLanguage()
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
    email: '',
    password: ''
  })
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer[]>([])
  const [currentSurveyQ, setCurrentSurveyQ] = useState(0)
  const [textAnswer, setTextAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const t = {
    back: lang === 'th' ? 'กลับ' : 'Back',
    eventReg: lang === 'th' ? 'ลงทะเบียนงาน' : 'Event Registration',
    bringCan: lang === 'th' ? 'นำกระป๋องอะลูมิเนียมของคุณมาเช็คอิน' : 'Bring your aluminium can to check in',
    name: lang === 'th' ? 'ชื่อ' : 'Name',
    yourName: lang === 'th' ? 'ชื่อของคุณ' : 'Your name',
    age: lang === 'th' ? 'อายุ' : 'Age',
    yourAge: lang === 'th' ? 'อายุ' : 'Age',
    gender: lang === 'th' ? 'เพศ' : 'Gender',
    select: lang === 'th' ? 'เลือก' : 'Select',
    contact: lang === 'th' ? 'ติดต่อ' : 'Contact',
    phoneLine: lang === 'th' ? 'โทรหรือไลน์ไอดี' : 'Phone or Line ID',
    email: lang === 'th' ? 'อีเมล' : 'Email',
    yourEmail: lang === 'th' ? 'อีเมลของคุณ' : 'your@email.com',
    password: lang === 'th' ? 'รหัสผ่าน' : 'Password',
    yourPassword: lang === 'th' ? 'รหัสผ่านของคุณ' : 'Your password',
    continueSurvey: lang === 'th' ? 'ดำเนินการต่อไปยังแบบสำรวจ' : 'Continue to Survey',
    preSurvey: lang === 'th' ? 'แบบสำรวจก่อนงาน' : 'Pre-Event Survey',
    question: lang === 'th' ? 'คำถาม' : 'Question',
    of: lang === 'th' ? 'จาก' : 'of',
    stronglyDisagree: lang === 'th' ? 'ไม่เห็นด้วยอย่างยิ่ง' : 'Strongly Disagree',
    stronglyAgree: lang === 'th' ? 'เห็นด้วยอย่างยิ่ง' : 'Strongly Agree',
    regComplete: lang === 'th' ? 'ลงทะเบียนสำเร็จแล้ว!' : 'Registration Complete!',
    qrReady: lang === 'th' ? 'คิวอาร์โค้ดของคุณพร้อมแล้ว เริ่มต้นการเดินทางของคุณ!' : 'Your QR code is ready. Start your journey!',
    goDashboard: lang === 'th' ? 'ไปที่แดชบอร์ด' : 'Go to Dashboard',
    regFailed: lang === 'th' ? 'การลงทะเบียนล้มเหลว' : 'Registration failed',
    somethingWrong: lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง' : 'Something went wrong. Please try again.',
  }

  const questions = surveyQuestions

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('survey')
  }

  const getNumericScore = (question: SurveyQuestion, answer: string | number): number => {
    if (question.question_type === 'yes_no') {
      return answer === 'yes' ? 5 : 1
    } else if (question.question_type === 'rating') {
      return answer as number
    } else if (question.question_type === 'multiple_choice' && question.options) {
      const optionIndex = question.options.findIndex(
        opt => (lang === 'th' ? opt.text_th : opt.text_en) === answer
      )
      return optionIndex + 1
    } else {
      // text or unknown
      return 3
    }
  }

  const handleSurveyAnswer = (answer: string | number) => {
    const currentQuestion = questions[currentSurveyQ]
    const numericScore = getNumericScore(currentQuestion, answer)
    const newAnswers = [...surveyAnswers.filter(a => a.questionNum !== currentSurveyQ + 1)]
    newAnswers.push({ questionNum: currentSurveyQ + 1, score: numericScore })
    setSurveyAnswers(newAnswers)
    setTextAnswer('')

    if (currentSurveyQ < questions.length - 1) {
      setCurrentSurveyQ(currentSurveyQ + 1)
    } else {
      submitRegistration(newAnswers)
    }
  }

  const handleTextSubmit = () => {
    if (!textAnswer.trim()) return
    handleSurveyAnswer(textAnswer)
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
        setError(data.error || t.regFailed)
      }
    } catch (err) {
      setError(t.somethingWrong)
    }
    setIsSubmitting(false)
  }

  const goBack = () => {
    if (step === 'survey' && currentSurveyQ > 0) {
      setCurrentSurveyQ(currentSurveyQ - 1)
    } else if (step === 'survey') {
      setStep('form')
    } else {
      router.back()
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
            {t.regComplete}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center mb-8"
          >
            {t.qrReady}
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
              <span>{t.goDashboard}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh gradient-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent/20 blur-[80px] animate-pulse-slow" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">{t.back}</span>
          </button>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

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
              <h1 className="font-display text-3xl font-bold mb-2">{t.eventReg}</h1>
              <p className="text-muted-foreground">{t.bringCan}</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleFormSubmit}
              className="w-full space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.name} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={t.yourName}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.age} *</label>
                  <input
                    type="text"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={t.yourAge}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.gender} *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">{t.select}</option>
                    {GENDER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {lang === 'th' ? opt.label_th : opt.label_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.contact} *</label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={t.phoneLine}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.email} *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={t.yourEmail}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.password} *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={t.yourPassword}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                className="group w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:scale-[1.02] mt-6"
              >
                <span>{t.continueSurvey}</span>
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
              <h1 className="font-display text-2xl font-bold mb-2">{t.preSurvey}</h1>
              <p className="text-muted-foreground text-sm">
                {t.question} {currentSurveyQ + 1} {t.of} {questions.length}
              </p>
            </motion.div>

            <div className="w-full mb-8">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSurveyQ + 1) / questions.length) * 100}%` }}
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
              <p className="text-xl font-medium leading-relaxed">
                {lang === 'th' ? questions[currentSurveyQ]?.question_th : questions[currentSurveyQ]?.question_en}
              </p>
            </motion.div>

            {/* Dynamic question input based on question_type */}
            {(() => {
              const currentQuestion = questions[currentSurveyQ]
              const qType = currentQuestion?.question_type

              if (qType === 'yes_no') {
                return (
                  <div className="w-full grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSurveyAnswer('yes')}
                      disabled={isSubmitting}
                      className="h-14 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50"
                    >
                      {lang === 'th' ? 'ใช่' : 'Yes'}
                    </button>
                    <button
                      onClick={() => handleSurveyAnswer('no')}
                      disabled={isSubmitting}
                      className="h-14 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50"
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
                        onClick={() => handleSurveyAnswer(lang === 'th' ? opt.text_th : opt.text_en)}
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
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder={lang === 'th' ? 'พิมพ์คำตอบของคุณ...' : 'Type your answer...'}
                      className="w-full h-32 p-4 rounded-xl border border-border bg-background resize-none"
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={handleTextSubmit}
                      disabled={isSubmitting || !textAnswer.trim()}
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
                        onClick={() => handleSurveyAnswer(score)}
                        disabled={isSubmitting}
                        className="h-14 rounded-xl border border-border glass font-bold text-lg transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50"
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <div className="w-full flex justify-between text-xs text-muted-foreground mt-2 px-2">
                    <span>{t.stronglyDisagree}</span>
                    <span>{t.stronglyAgree}</span>
                  </div>
                </>
              )
            })()}

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
