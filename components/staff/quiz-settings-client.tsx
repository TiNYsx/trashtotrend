"use client"

import { useState } from "react"
import { useLanguage } from "@/components/providers"
import { motion } from "framer-motion"
import { Plus, Save, Trash2, Settings, BrainCircuit, Users, ToggleLeft, ToggleRight, Loader2, X, ClipboardList, ArrowRight } from "lucide-react"
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

type PersonalityType = {
  id: number
  type_code: string
  name_en: string
  name_th: string
  description_en: string | null
  description_th: string | null
  display_order: number
  is_active: boolean
}

type Settings = {
  start_journey_quiz_enabled: string
}

export function QuizSettingsClient({
  initialQuestions,
  initialPersonalityTypes,
  initialSettings
}: {
  initialQuestions: Question[]
  initialPersonalityTypes: PersonalityType[]
  initialSettings: Settings
}) {
  const { t, lang } = useLanguage()
  const [activeTab, setActiveTab] = useState<"journey" | "personality">("journey")
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [personalityTypes, setPersonalityTypes] = useState<PersonalityType[]>(initialPersonalityTypes)
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState<"question" | "personality" | null>(null)
  const [editItem, setEditItem] = useState<Question | PersonalityType | null>(null)
  
  const [formEn, setFormEn] = useState("")
  const [formTh, setFormTh] = useState("")
  const [formCode, setFormCode] = useState("")
  const [formDescEn, setFormDescEn] = useState("")
  const [formDescTh, setFormDescTh] = useState("")
  const [questionType, setQuestionType] = useState("multiple_choice")
  const [mcOptions, setMcOptions] = useState<{ text_en: string; text_th: string }[]>([])

  const filteredQuestions = questions.filter(q => q.quiz_category === "journey" || !q.quiz_category)
  const nextDisplayOrder = questions.length > 0 ? Math.max(...questions.map(q => q.display_order)) + 1 : 1

  const openAddQuestion = () => {
    setEditItem(null)
    setFormEn("")
    setFormTh("")
    setQuestionType("multiple_choice")
    setMcOptions([])
    setShowModal("question")
  }

  const openEditQuestion = (q: Question) => {
    setEditItem(q)
    setFormEn(q.question_en)
    setFormTh(q.question_th)
    setQuestionType(q.question_type || "multiple_choice")
    setMcOptions(q.options || [])
    setShowModal("question")
  }

  const openAddPersonality = () => {
    setEditItem(null)
    setFormCode("")
    setFormEn("")
    setFormTh("")
    setFormDescEn("")
    setFormDescTh("")
    setShowModal("personality")
  }

  const openEditPersonality = (p: PersonalityType) => {
    setEditItem(p)
    setFormCode(p.type_code)
    setFormEn(p.name_en)
    setFormTh(p.name_th)
    setFormDescEn(p.description_en || "")
    setFormDescTh(p.description_th || "")
    setShowModal("personality")
  }

  const saveQuestion = async () => {
    if (!formEn || !formTh) {
      toast.error(t("pleaseFillAll"))
      return
    }
    
    setIsSaving(true)
    try {
      const question = {
        id: editItem?.id || 0,
        question_en: formEn,
        question_th: formTh,
        question_type: questionType,
        options: questionType === "multiple_choice" ? mcOptions : null,
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
          setQuestions(questions.map(q => q.id === editItem.id ? { ...q, question_en: formEn, question_th: formTh, question_type: questionType, options: questionType === "multiple_choice" ? mcOptions : null } : q))
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
    setShowModal(null)
  }

  const savePersonality = async () => {
    if (!formCode || !formEn || !formTh) {
      toast.error(t("pleaseFillAll"))
      return
    }
    
    setIsSaving(true)
    try {
      const type = {
        id: editItem?.id || 0,
        type_code: formCode,
        name_en: formEn,
        name_th: formTh,
        description_en: formDescEn || null,
        description_th: formDescTh || null,
        display_order: personalityTypes.length + 1,
        is_active: true
      }

      const res = await fetch("/api/quiz/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ types: [type] })
      })
      
      if (res.ok) {
        if (editItem) {
          setPersonalityTypes(personalityTypes.map(p => p.id === editItem.id ? { ...p, name_en: formEn, name_th: formTh, description_en: formDescEn, description_th: formDescTh } : p))
        } else {
          setPersonalityTypes([...personalityTypes, { ...type, id: Date.now() }])
        }
        toast.success(t("saved"))
      } else {
        toast.error(t("error"))
      }
    } catch {
      toast.error(t("error"))
    }
    setIsSaving(false)
    setShowModal(null)
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

  const handleDeletePersonality = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return
    try {
      await fetch(`/api/quiz/personality?id=${id}`, { method: "DELETE" })
      setPersonalityTypes(personalityTypes.filter(p => p.id !== id))
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

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setActiveTab("journey")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "journey" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          {t("startJourneyQuiz")}
        </button>
        <button onClick={() => setActiveTab("personality")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "personality" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          {t("personalityTypes")}
        </button>
      </div>

      {activeTab !== "personality" && (
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
      )}

      {activeTab === "personality" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium flex items-center gap-2"><Users className="h-4 w-4" />{t("personalityTypes")}</h2>
            <button onClick={openAddPersonality} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus className="h-4 w-4" />
              {t("addType")}
            </button>
          </div>

          {personalityTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("noQuestions")}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personalityTypes.map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">{p.type_code}</span>
                      <h3 className="font-medium mt-2">{lang === "th" ? p.name_th : p.name_en}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{lang === "th" ? p.description_th : p.description_en}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditPersonality(p)} className="p-2 text-muted-foreground hover:text-foreground">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeletePersonality(p.id)} className="p-2 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">
                {showModal === "question" 
                  ? (editItem ? t("editQuestion") : t("addQuestion"))
                  : (editItem ? t("editType") : t("addType"))
                }
              </h2>
              <button onClick={() => setShowModal(null)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {showModal === "question" ? (
                <>
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
                    <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background mt-1">
                      <option value="multiple_choice">{t("multipleChoice")}</option>
                      <option value="short_text">{t("shortText")}</option>
                    </select>
                  </div>
                  {questionType === "multiple_choice" && (
                    <div className="space-y-3 p-4 rounded-lg border border-border bg-secondary/30">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">{t("options")}</label>
                        <button type="button" onClick={() => setMcOptions([...mcOptions, { text_en: "", text_th: "" }])}
                          className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Plus className="h-3 w-3" /> {t("addOption")}
                        </button>
                      </div>
                      {mcOptions.length === 0 && (
                        <p className="text-sm text-muted-foreground">{lang === "th" ? "ยังไม่มีตัวเลือก" : "No options yet"}</p>
                      )}
                      {mcOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input value={opt.text_en} onChange={(e) => {
                            const copy = [...mcOptions]; copy[i] = { ...copy[i], text_en: e.target.value }; setMcOptions(copy)
                          }} placeholder={lang === "th" ? "ตัวเลือก (EN)" : "Option (EN)"}
                            className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm" />
                          <input value={opt.text_th} onChange={(e) => {
                            const copy = [...mcOptions]; copy[i] = { ...copy[i], text_th: e.target.value }; setMcOptions(copy)
                          }} placeholder={lang === "th" ? "ตัวเลือก (TH)" : "Option (TH)"}
                            className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm" />
                          <button type="button" onClick={() => setMcOptions(mcOptions.filter((_, j) => j !== i))}
                            className="p-1.5 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">{t("code")}</label>
                    <input value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} maxLength={2} className="w-full h-10 px-3 rounded-lg border border-input bg-background mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("nameEn")}</label>
                    <input value={formEn} onChange={(e) => setFormEn(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("nameTh")}</label>
                    <input value={formTh} onChange={(e) => setFormTh(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("descEn")}</label>
                    <textarea value={formDescEn} onChange={(e) => setFormDescEn(e.target.value)} className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("descTh")}</label>
                    <textarea value={formDescTh} onChange={(e) => setFormDescTh(e.target.value)} className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background mt-1" />
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowModal(null)} className="px-4 py-2 text-sm text-muted-foreground">
                  {t("cancel")}
                </button>
                <button onClick={showModal === "question" ? saveQuestion : savePersonality} disabled={isSaving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
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