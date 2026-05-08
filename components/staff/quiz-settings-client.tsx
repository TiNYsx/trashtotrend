"use client"

import { useState } from "react"
import { useLanguage } from "@/components/providers"
import { motion } from "framer-motion"
import { Plus, Save, Trash2, Settings, BrainCircuit, ToggleLeft, ToggleRight, Loader2, X, ClipboardList, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type Question = {
  id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string; is_correct: boolean }[] | null
  display_order: number
  is_active: boolean
  booth_id: number | null
  quiz_category: string
}

type Settings = {
  start_journey_quiz_enabled: string
}

export function QuizSettingsClient({
  initialQuestions,
  initialSettings
}: {
  initialQuestions: Question[]
  initialSettings: Settings
}) {
  const { t, lang } = useLanguage()
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Question | null>(null)
  
  const [formEn, setFormEn] = useState("")
  const [formTh, setFormTh] = useState("")
  const [questionType, setQuestionType] = useState("multiple_choice")
  const [mcOptions, setMcOptions] = useState<{ text_en: string; text_th: string; type: string }[]>([])

  const filteredQuestions = questions.filter(q => q.quiz_category === "journey" || !q.quiz_category)
  const nextDisplayOrder = questions.length > 0 ? Math.max(...questions.map(q => q.display_order)) + 1 : 1

  const openAddQuestion = () => {
    setEditItem(null)
    setFormEn("")
    setFormTh("")
    setQuestionType("multiple_choice")
    setMcOptions([])
    setShowModal(true)
  }

  const openEditQuestion = (q: Question) => {
    setEditItem(q)
    setFormEn(q.question_en)
    setFormTh(q.question_th)
    setQuestionType(q.question_type || "multiple_choice")
    setMcOptions((q.options || []).map(o => ({ ...o, type: (o as any).type || "" })))
    setShowModal(true)
  }

  const saveQuestion = async () => {
    if (!formEn || !formTh) {
      toast.error(t("pleaseFillAll"))
      return
    }
    
    // For multiple choice and yes/no, ensure we have options
    if ((questionType === "multiple_choice" || questionType === "yes_no") && mcOptions.length === 0) {
      toast.error(lang === "th" ? "กรุณาเพิ่มตัวเลือกอย่างน้อย 1 ตัว" : "Please add at least 1 option")
      return
    }
    
    setIsSaving(true)
    try {
      // Determine options based on question type
      let questionOptions = null
      if (questionType === "multiple_choice" || questionType === "yes_no") {
        questionOptions = mcOptions
      }
      
      const question = {
        id: editItem?.id || 0,
        question_en: formEn,
        question_th: formTh,
        question_type: questionType,
        options: questionOptions,
        display_order: editItem ? editItem.display_order : nextDisplayOrder,
        is_active: true,
        booth_id: null,
        quiz_category: "journey"
      }

      const res = await fetch("/api/quiz/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: [question], category: "journey" })
      })
      
      if (res.ok) {
        if (editItem) {
          setQuestions(questions.map(q => q.id === editItem.id ? { ...q, question_en: formEn, question_th: formTh, question_type: questionType, options: questionOptions } : q))
        } else {
          setQuestions([...questions, { ...question, id: Date.now() }])
        }
        toast.success(t("saved"))
      } else {
        toast.error(t("error"))
      }
    } catch {
      toast.error(t("error"))
    }
    setIsSaving(false)
    setShowModal(false)
  }

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return
    try {
      await fetch(`/api/quiz/questions?id=${id}`, { method: "DELETE" })
      setQuestions(questions.filter(q => q.id !== id))
      toast.success(t("deleted"))
    } catch {
      toast.error(t("error"))
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        toast.success(t("saved"))
      }
    } catch {
      toast.error(t("error"))
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            {t("quizQuestions")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("manageQuizQuestions")}
          </p>
        </div>
        <Link
          href="/staff/quiz/surveys"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-secondary transition-colors"
        >
          <ClipboardList className="h-4 w-4 text-primary" />
          {lang === "th" ? "ตั้งค่าแบบสำรวจ" : "Survey Settings"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-4 p-4 rounded-xl border border-border bg-card">
        <button onClick={() => setSettings(s => ({ ...s, start_journey_quiz_enabled: s.start_journey_quiz_enabled === "true" ? "false" : "true" }))} className="flex items-center gap-2">
          {settings.start_journey_quiz_enabled === "true" ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
          <span className="text-sm font-medium">{t("startJourneyQuiz")}</span>
        </button>
        <button onClick={handleSaveSettings} disabled={isSaving} className="ml-auto flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("save")}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{t("quizQuestions")}</h2>
          <button onClick={openAddQuestion} className="flex items-center gap-1 text-sm text-primary hover:underline">
            <Plus className="h-4 w-4" />
            {t("addQuestion")}
          </button>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t("noQuestions")}</div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{lang === "th" ? q.question_th : q.question_en}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      {q.question_type === "yes_no"
                        ? (lang === "th" ? "ใช่/ไม่" : "Yes/No")
                        : q.question_type === "rating"
                        ? (lang === "th" ? "ให้คะแนน (1-5)" : "Rating (1-5)")
                        : q.question_type === "short_text"
                        ? (lang === "th" ? "ข้อความสั้น" : "Short Text")
                        : (lang === "th" ? "ตัวเลือก" : "Multiple Choice")
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditQuestion(q)} className="p-2 text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">
                {editItem ? t("editQuestion") : t("addQuestion")}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("questionEn")}</label>
                <input value={formEn} onChange={(e) => setFormEn(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">{t("questionTh")}</label>
                <input value={formTh} onChange={(e) => setFormTh(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">{t("questionType")}</label>
                <select value={questionType} onChange={(e) => {
                  const newType = e.target.value
                  setQuestionType(newType)
                  // Auto-populate yes/no options when switching to yes_no
                  if (newType === "yes_no") {
                    setMcOptions([
                      { text_en: "Yes", text_th: "ใช่", type: "yes" },
                      { text_en: "No", text_th: "ไม่", type: "no" }
                    ])
                  } else if (newType === "rating") {
                    setMcOptions([])
                  }
                }}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background mt-1">
                  <option value="multiple_choice">{t("multipleChoice")}</option>
                  <option value="yes_no">{lang === "th" ? "ใช่/ไม่" : "Yes/No"}</option>
                  <option value="rating">{lang === "th" ? "ให้คะแนน (1-5)" : "Rating (1-5)"}</option>
                  <option value="short_text">{t("shortText")}</option>
                </select>
              </div>
              
              {/* Show options editor for multiple choice and yes/no */}
              {(questionType === "multiple_choice" || questionType === "yes_no") && (
                <div className="space-y-3 p-4 rounded-lg border border-border bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t("options")}</label>
                    {questionType === "multiple_choice" && (
                      <button type="button" onClick={() => setMcOptions([...mcOptions, { text_en: "", text_th: "", type: "" }])}
                        className="flex items-center gap-1 text-sm text-primary hover:underline">
                        <Plus className="h-3 w-3" /> {t("addOption")}
                      </button>
                    )}
                  </div>
                  {mcOptions.length === 0 && (
                    <p className="text-sm text-muted-foreground">{lang === "th" ? "ยังไม่มีตัวเลือก" : "No options yet"}</p>
                  )}
                  {mcOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-6">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <input value={opt.text_en} onChange={(e) => {
                        const copy = [...mcOptions]; copy[i] = { ...copy[i], text_en: e.target.value }; setMcOptions(copy)
                      }} placeholder={lang === "th" ? "ตัวเลือก (EN)" : "Option (EN)"}
                        className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm" />
                      <input value={opt.text_th} onChange={(e) => {
                        const copy = [...mcOptions]; copy[i] = { ...copy[i], text_th: e.target.value }; setMcOptions(copy)
                      }} placeholder={lang === "th" ? "ตัวเลือก (TH)" : "Option (TH)"}
                        className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm" />
                      {questionType === "multiple_choice" && (
                        <button type="button" onClick={() => setMcOptions(mcOptions.filter((_, j) => j !== i))}
                          className="p-1.5 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Show rating preview */}
              {questionType === "rating" && (
                <div className="p-4 rounded-lg border border-border bg-secondary/30">
                  <label className="text-sm font-medium">{lang === "th" ? "ตัวอย่าง" : "Preview"}</label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-sm text-muted-foreground">
                        {num}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === "th" ? "ผู้ใช้จะเห็นตัวเลือกคะแนน 1-5" : "Users will see rating options 1-5"}
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-muted-foreground">
                  {t("cancel")}
                </button>
                <button onClick={saveQuestion} disabled={isSaving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
