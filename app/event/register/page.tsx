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

const SURVEY_QUESTIONS = {
  en: [
    'I am aware of the environmental impact of aluminium waste.',
    'I understand the concept of circular economy.',
    'I regularly recycle aluminium products.',
    'I believe individual actions can make a difference for the environment.',
    'I am interested in learning more about sustainable practices.',
    'I would be willing to pay more for eco-friendly products.',
    'I have participated in environmental activities before.',
    'I believe businesses should be responsible for recycling their products.'
  ],
  th: [
    'ฉันตระหนักถึงผลกระทบต่อสิ่งแวดล้อมของของเสียอะลูมิเนียม',
    'ฉันเข้าใจแนวคิดเศรษฐกิจหมุนเวียน',
    'ฉันสม่ำเสมอในการรีไซเคิลผลิตภัณฑ์อะลูมิเนียม',
    'ฉันเชื่อว่าการกระทำของปัจเจกบุคคลสามารถสร้างความแตกต่างต่อสิ่งแวดล้อมได้',
    'ฉันสนใจที่จะเรียนรู้เพิ่มเติมเกี่ยวกับแนวปฏิบัติที่ยั่งยืน',
    'ฉันยินดีที่จะจ่ายมากขึ้นสำหรับผลิตภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม',
    'ฉันเคยเข้าร่วมกิจกรรมด้านสิ่งแวดล้อมมาก่อน',
    'ฉันเชื่อว่าธุรกิจควรรับผิดชอบในการรีไซเคิลผลิตภัณฑ์ของตน'
  ]
}

const GENDER_OPTIONS = [
  { value: 'male', label_en: 'Male', label_th: 'ชาย' },
  { value: 'female', label_en: 'Female', label_th: 'หญิง' },
  { value: 'other', label_en: 'Other', label_th: 'อื่นๆ' },
  { value: 'prefer_not', label_en: 'Prefer not to say', label_th: 'ไม่ระบุ' }
]

export default function EventRegisterPage() {
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

  const questions = lang === 'th' ? SURVEY_QUESTIONS.th : SURVEY_QUESTIONS.en

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('survey')
  }

  const handleSurveyAnswer = (score: number) => {
    const newAnswers = [...surveyAnswers.filter(a => a.questionNum !== currentSurveyQ + 1)]
    newAnswers.push({ questionNum: currentSurveyQ + 1, score })
    setSurveyAnswers(newAnswers)

    if (currentSurveyQ < questions.length - 1) {
      setCurrentSurveyQ(currentSurveyQ + 1)
    } else {
      submitRegistration(newAnswers)
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
              <span className="font-display font-bold">HOOP</span>
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
              <p className="text-lg font-medium leading-relaxed">
                {questions[currentSurveyQ]}
              </p>
            </motion.div>

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
