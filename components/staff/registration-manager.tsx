"use client"

import { useState, useActionState } from "react"
import { useLanguage } from "@/components/providers"
import { createRegistrationField, updateRegistrationField, deleteRegistrationField } from "@/lib/actions/registration"
import Link from "next/link"
import { Plus, Pencil, Trash2, X, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Field = {
  id: number
  field_key: string
  label_en: string
  label_th: string
  field_type: string
  options: string[] | null
  is_required: boolean
  display_order: number
  is_active: boolean
}

export function RegistrationManager({ initialFields }: { initialFields: Field[] }) {
  const { t, lang } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)

  const [, createAction, createPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createRegistrationField(formData)
      if (result.success) { setShowForm(false); toast.success(t("fieldCreated")) }
      return result
    },
    null
  )

  const [, updateAction, updatePending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await updateRegistrationField(formData)
      if (result.success) { setEditingField(null); toast.success(t("fieldUpdated")) }
      return result
    },
    null
  )

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return
    const result = await deleteRegistrationField(id)
    if (result.success) toast.success(t("fieldDeleted"))
    else toast.error(result.error)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/staff/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">{t("registrationFields")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("manageRegistrationFields")}
            </p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditingField(null) }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {t("add")}
        </button>
      </div>

      {(showForm || editingField) && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">{editingField ? t("edit") : t("add")}</h3>
            <button onClick={() => { setShowForm(false); setEditingField(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={editingField ? updateAction : createAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editingField && <input type="hidden" name="id" value={editingField.id} />}

            {!editingField && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t("fieldKey")}</label>
                <input name="field_key" required placeholder="e.g. full_name"
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("labelEn")}</label>
              <input name="label_en" defaultValue={editingField?.label_en || ""} required
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("labelTh")}</label>
              <input name="label_th" defaultValue={editingField?.label_th || ""} required
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("fieldType")}</label>
              <select name="field_type" defaultValue={editingField?.field_type || "text"}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="text">{t("shortText")}</option>
                <option value="email">{t("email")}</option>
                <option value="tel">Phone</option>
                <option value="number">Number</option>
                <option value="select">{t("selectDropdown")}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("options")} ({t("commaSeparated")})</label>
              <input name="options" defaultValue={editingField?.options?.join(", ") || ""} placeholder="Option A, Option B"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("order")}</label>
              <input name="display_order" type="number" defaultValue={editingField?.display_order || 0}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex items-center gap-4">
<label className="flex items-center gap-2 text-sm">
                  <select name="is_required" defaultValue={editingField?.is_required ? "true" : "false"}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="true">{t("required")}: {t("yes")}</option>
                    <option value="false">{t("required")}: {t("no")}</option>
                  </select>
                </label>
                {editingField && (
                  <label className="flex items-center gap-2 text-sm">
                    <select name="is_active" defaultValue={editingField.is_active ? "true" : "false"}
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                      <option value="true">{t("active")}: {t("yes")}</option>
                      <option value="false">{t("active")}: {t("no")}</option>
                    </select>
                  </label>
                )}
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={createPending || updatePending}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {createPending || updatePending ? t("loading") : t("save")}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingField(null) }}
                className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {initialFields.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{t("noRegistrationFields")}</p>
        ) : (
          initialFields.map((field) => (
            <div key={field.id} className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono">{field.field_key}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{field.field_type}</span>
                  {field.is_required && <span className="text-[10px] text-accent font-medium">{t("required")}</span>}
                  {!field.is_active && <span className="text-[10px] text-muted-foreground">({t("inactive")})</span>}
                </div>
                <p className="text-sm font-medium text-foreground">{lang === "th" ? field.label_th : field.label_en}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingField(field); setShowForm(false) }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(field.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
