"use client"

import { useState, useActionState } from "react"
import { useLanguage } from "@/components/providers"
import { createBooth, updateBooth, deleteBooth } from "@/lib/actions/booths"
import { Plus, Pencil, Trash2, FileQuestion, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Booth = {
  id: number
  name_en: string
  name_th: string
  description_en: string | null
  description_th: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

export function BoothsManager({ initialBooths }: { initialBooths: Booth[] }) {
  const { t, lang } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null)

  const [createState, createAction, createPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createBooth(formData)
      if (result.success) {
        setShowForm(false)
        toast.success(t("boothCreated"))
      }
      return result
    },
    null
  )

  const [updateState, updateAction, updatePending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await updateBooth(formData)
      if (result.success) {
        setEditingBooth(null)
        toast.success(t("boothUpdated"))
      }
      return result
    },
    null
  )

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return
    const result = await deleteBooth(id)
    if (result.success) toast.success(t("boothDeleted"))
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
            <h1 className="font-serif text-2xl font-bold text-foreground">{t("booths")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("manageBooths")}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingBooth(null) }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("add")}
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showForm || editingBooth) && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">
              {editingBooth ? t("edit") : t("add")} {t("booths")}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingBooth(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={editingBooth ? updateAction : createAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editingBooth && <input type="hidden" name="id" value={editingBooth.id} />}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("boothName")} ({t("english")})</label>
              <input name="name_en" defaultValue={editingBooth?.name_en || ""} required
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("boothName")} ({t("thai")})</label>
              <input name="name_th" defaultValue={editingBooth?.name_th || ""} required
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("description")} ({t("english")})</label>
              <textarea name="description_en" defaultValue={editingBooth?.description_en || ""} rows={3}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("description")} ({t("thai")})</label>
              <textarea name="description_th" defaultValue={editingBooth?.description_th || ""} rows={3}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("imageUrl")}</label>
              <input name="image_url" defaultValue={editingBooth?.image_url || ""}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("order")}</label>
              <input name="display_order" type="number" defaultValue={editingBooth?.display_order || 0}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>

            {editingBooth && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <label className="text-sm font-medium">{t("active")}</label>
                <select name="is_active" defaultValue={editingBooth.is_active ? "true" : "false"}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="true">{t("yes")}</option>
                  <option value="false">{t("no")}</option>
                </select>
              </div>
            )}

            {(createState?.error || updateState?.error) && (
              <p className="text-sm text-destructive sm:col-span-2">{createState?.error || updateState?.error}</p>
            )}

            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={createPending || updatePending}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {createPending || updatePending ? t("loading") : t("save")}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingBooth(null) }}
                className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Booth list */}
      <div className="mt-6 space-y-3">
        {initialBooths.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{t("noBooths")}</p>
        ) : (
          initialBooths.map((booth) => (
            <div key={booth.id} className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                booth.is_active ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
              )}>
                {booth.display_order}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {lang === "th" ? booth.name_th : booth.name_en}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {lang === "th" ? booth.name_en : booth.name_th}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/staff/booths/${booth.id}/quiz`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                  title={t("manageQuiz")}>
                  <FileQuestion className="h-4 w-4" />
                </Link>
                <button onClick={() => { setEditingBooth(booth); setShowForm(false) }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(booth.id)}
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
