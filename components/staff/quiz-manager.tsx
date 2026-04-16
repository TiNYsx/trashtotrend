"use client"

import { useState, useActionState } from "react"
import { useLanguage } from "@/components/providers"
import { createQuizQuestion, updateQuizQuestion, deleteQuizQuestion } from "@/lib/actions/quiz"
import { Plus, Pencil, Trash2, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type QuizQuestion = {
  id: number
  booth_id: number
  question_en: string
  question_th: string
  question_type: string
  options: { text_en: string; text_th: string; is_correct: boolean }[] | null
  correct_answer: string | null
  display_order: number
  is_active: boolean
}

type Props = {
  boothId: number
  boothName: string
  boothNameTh: string
  initialQuestions: QuizQuestion[]
}

export function QuizManager({ boothId, boothName, boothNameTh, initialQuestions }: Props) {
  const { t, lang } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [editingQ, setEditingQ] = useState<QuizQuestion | null>(null)
  const [qType, setQType] = useState<string>("multiple_choice")
  const [mcOptions, setMcOptions] = useState<{ text_en: string; text_th: string; is_correct: boolean }[]>([
    { text_en: "", text_th: "", is_correct: false },
    { text_en: "", text_th: "", is_correct: false },
  ])

  const resetForm = () => {
    setShowForm(false)
    setEditingQ(null)
    setQType("multiple_choice")
    setMcOptions([
      { text_en: "", text_th: "", is_correct: false },
      { text_en: "", text_th: "", is_correct: false },
    ])
  }

  const startEdit = (q: QuizQuestion) => {
    setEditingQ(q)
    setShowForm(false)
    setQType(q.question_type)
    if (q.options) {
      setMcOptions(q.options)
    }
  }

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      formData.set("booth_id", boothId.toString())
      if (qType === "multiple_choice") {
        formData.set("options", JSON.stringify(mcOptions))
      }
      const result = editingQ
        ? await updateQuizQuestion(formData)
        : await createQuizQuestion(formData)
      if (result.success) {
        resetForm()
        toast.success(editingQ ? "Question updated" : "Question created")
      }
      return result
    },
    null
  )

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return
    const result = await deleteQuizQuestion(id, boothId)
    if (result.success) toast.success("Question deleted")
    else toast.error(result.error)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/staff/booths" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">{t("quizQuestions")}</h1>
          <p className="text-sm text-muted-foreground">{lang === "th" ? boothNameTh : boothName}</p>
        </div>
      </div>

      <button onClick={() => { setShowForm(true); setEditingQ(null) }}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        <Plus className="h-4 w-4" /> {t("add")}
      </button>

      {/* Form */}
      {(showForm || editingQ) && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">
              {editingQ ? t("edit") : t("add")} {t("question")}
            </h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            {editingQ && <input type="hidden" name="id" value={editingQ.id} />}
            <input type="hidden" name="booth_id" value={boothId} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t("question")} (EN)</label>
                <textarea name="question_en" defaultValue={editingQ?.question_en || ""} required rows={2}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t("question")} (TH)</label>
                <textarea name="question_th" defaultValue={editingQ?.question_th || ""} required rows={2}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t("questionType")}</label>
                <select name="question_type" value={qType} onChange={(e) => setQType(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="multiple_choice">{t("multipleChoice")}</option>
                  <option value="short_text">{t("shortText")}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t("order")}</label>
                <input name="display_order" type="number" defaultValue={editingQ?.display_order || 0}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
            </div>

            {qType === "multiple_choice" && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium">{t("options")}</label>
                {mcOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
                    <input value={opt.text_en} onChange={(e) => {
                      const copy = [...mcOptions]; copy[i] = { ...copy[i], text_en: e.target.value }; setMcOptions(copy)
                    }} placeholder="EN" className="h-9 flex-1 rounded-lg border border-input px-3 text-sm outline-none focus:border-accent" />
                    <input value={opt.text_th} onChange={(e) => {
                      const copy = [...mcOptions]; copy[i] = { ...copy[i], text_th: e.target.value }; setMcOptions(copy)
                    }} placeholder="TH" className="h-9 flex-1 rounded-lg border border-input px-3 text-sm outline-none focus:border-accent" />
                    <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <input type="checkbox" checked={opt.is_correct} onChange={(e) => {
                        const copy = [...mcOptions]; copy[i] = { ...copy[i], is_correct: e.target.checked }; setMcOptions(copy)
                      }} className="rounded" />
                      {t("isCorrect")}
                    </label>
                    {mcOptions.length > 2 && (
                      <button type="button" onClick={() => setMcOptions(mcOptions.filter((_, j) => j !== i))}
                        className="text-destructive text-xs">{t("removeOption")}</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setMcOptions([...mcOptions, { text_en: "", text_th: "", is_correct: false }])}
                  className="flex items-center gap-1 self-start text-sm text-accent hover:underline">
                  <Plus className="h-3 w-3" /> {t("addOption")}
                </button>
              </div>
            )}

            {qType === "short_text" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t("correctAnswer")} ({lang === "th" ? "ไม่บังคับ" : "optional"})</label>
                <input name="correct_answer" defaultValue={editingQ?.correct_answer || ""}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
            )}

            {editingQ && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">{t("active")}</label>
                <select name="is_active" defaultValue={editingQ.is_active ? "true" : "false"}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={pending}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {pending ? t("loading") : t("save")}
              </button>
              <button type="button" onClick={resetForm}
                className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions list */}
      <div className="mt-6 space-y-3">
        {initialQuestions.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{t("noQuestions")}</p>
        ) : (
          initialQuestions.map((q) => (
            <div key={q.id} className="rounded-xl border border-border bg-card px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      q.question_type === "multiple_choice" ? "bg-accent/10 text-accent" : "bg-gold/10 text-gold"
                    )}>
                      {q.question_type === "multiple_choice" ? "MC" : "Text"}
                    </span>
                    <span className="text-xs text-muted-foreground">#{q.display_order}</span>
                    {!q.is_active && <span className="text-[10px] text-muted-foreground">(inactive)</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground">{lang === "th" ? q.question_th : q.question_en}</p>
                  {q.options && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {q.options.map((opt, i) => (
                        <span key={i} className={cn(
                          "rounded-full px-2.5 py-1 text-xs",
                          opt.is_correct ? "bg-accent/10 text-accent font-medium" : "bg-secondary text-muted-foreground"
                        )}>
                          {lang === "th" ? opt.text_th : opt.text_en}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(q)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(q.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
