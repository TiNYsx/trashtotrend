"use client"

import { useState } from "react"
import { useLanguage } from "@/components/providers"
import { motion } from "framer-motion"
import { 
  Plus, 
  Save, 
  Trash2, 
  Settings,
  FormInput,
  ClipboardList,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

type SurveyQuestion = {
  id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string }[] | null
  is_required: boolean
  display_order: number
  is_active: boolean
}

export function SurveySettingsClient({
  initialPreQuestions,
  initialPostQuestions
}: {
  initialPreQuestions: SurveyQuestion[]
  initialPostQuestions: SurveyQuestion[]
}) {
  const { t, lang } = useLanguage()
  const [activeTab, setActiveTab] = useState<"pre" | "post">("pre")
  const [preQuestions, setPreQuestions] = useState<SurveyQuestion[]>(initialPreQuestions)
  const [postQuestions, setPostQuestions] = useState<SurveyQuestion[]>(initialPostQuestions)
  const [isSaving, setIsSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null)

  const questions = activeTab === "pre" ? preQuestions : postQuestions

  const handleSave = async () => {
    setIsSaving(true)
    const data = activeTab === "pre" ? preQuestions : postQuestions
    
    try {
      const res = await fetch(`/api/survey/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: data })
      })
      
      if (res.ok) {
        toast.success(lang === "th" ? "บันทึกสำเร็จ!" : "Saved!")
      } else {
        toast.error(lang === "th" ? "เกิดข้อผิดพลาด" : "Error")
      }
    } catch {
      toast.error(lang === "th" ? "เกิดข้อผิดพลาด" : "Error")
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(lang === "th" ? "ลบคำถามนี้?" : "Delete this question?")) return
    
    if (activeTab === "pre") {
      setPreQuestions(preQuestions.filter(q => q.id !== id))
    } else {
      setPostQuestions(postQuestions.filter(q => q.id !== id))
    }
    
    try {
      await fetch(`/api/survey/${activeTab}?id=${id}`, { method: "DELETE" })
      toast.success(lang === "th" ? "ลบแล้ว" : "Deleted!")
    } catch {
      toast.error(lang === "th" ? "เกิดข้อผิดพลาด" : "Error")
    }
  }

  const handleAddQuestion = (q: SurveyQuestion) => {
    if (activeTab === "pre") {
      setPreQuestions([...preQuestions, { ...q, id: Date.now() }])
    } else {
      setPostQuestions([...postQuestions, { ...q, id: Date.now() }])
    }
    setShowAdd(false)
  }

  const handleUpdateQuestion = (q: SurveyQuestion) => {
    if (activeTab === "pre") {
      setPreQuestions(preQuestions.map(eq => eq.id === editingQuestion?.id ? q : eq))
    } else {
      setPostQuestions(postQuestions.map(eq => eq.id === editingQuestion?.id ? q : eq))
    }
    setEditingQuestion(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FormInput className="h-6 w-6 text-primary" />
            {t("surveys")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "th" ? "จัดการคำถามแบบสำรวจ" : "Manage survey questions"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("pre")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "pre"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("preSurvey")}
        </button>
        <button
          onClick={() => setActiveTab("post")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "post"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("postSurvey")}
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            {activeTab === "pre" 
              ? lang === "th" ? "คำถามก่อนงาน" : "Pre-Event Questions"
              : lang === "th" ? "คำถามหลังงาน" : "Post-Event Questions"
            }
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            {lang === "th" ? "เพิ่มคำถาม" : "Add Question"}
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {lang === "th" ? "ยังไม่มีคำถาม" : "No questions yet"}
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    {lang === "th" ? q.question_th : q.question_en}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      {q.question_type}
                    </span>
                    {q.is_required && (
                      <span className="text-xs text-destructive">
                        {lang === "th" ? "จำเป็น" : "Required"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingQuestion(q)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {lang === "th" ? "บันทึก" : "Save"}
        </button>
      </div>

      {/* Add/Edit Modal */}
      {(showAdd || editingQuestion) && (
        <SurveyQuestionModal
          question={editingQuestion}
          onClose={() => {
            setShowAdd(false)
            setEditingQuestion(null)
          }}
          onSave={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
        />
      )}
    </div>
  )
}

function SurveyQuestionModal({
  question,
  onClose,
  onSave
}: {
  question?: SurveyQuestion | null
  onClose: () => void
  onSave: (q: SurveyQuestion) => void
}) {
  const { lang } = useLanguage()
  const [questionEn, setQuestionEn] = useState(question?.question_en || "")
  const [questionTh, setQuestionTh] = useState(question?.question_th || "")
  const [questionType, setQuestionType] = useState(question?.question_type || "rating")
  const [isRequired, setIsRequired] = useState(question?.is_required ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: question?.id || 0,
      question_en: questionEn,
      question_th: questionTh,
      question_type: questionType,
      options: null,
      is_required: isRequired,
      display_order: question?.display_order || 0,
      is_active: true
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold">
          {question 
            ? (lang === "th" ? "แก้ไขคำถาม" : "Edit Question")
            : (lang === "th" ? "เพิ่มคำถาม" : "Add Question")
          }
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">English</label>
            <input
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background"
              placeholder="Question in English"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Thai</label>
            <input
              value={questionTh}
              onChange={(e) => setQuestionTh(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background"
              placeholder="คำถามภาษาไทย"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{lang === "th" ? "ประเภท" : "Type"}</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background"
            >
              <option value="rating">Rating (1-5)</option>
              <option value="text">Text</option>
              <option value="multiple_choice">Multiple Choice</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            <span className="text-sm">{lang === "th" ? "จำเป็น" : "Required"}</span>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground">
              {lang === "th" ? "ยกเลิก" : "Cancel"}
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
              {lang === "th" ? "บันทึก" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}