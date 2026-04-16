"use client"

import { useActionState } from "react"
import { registerCustomer } from "@/lib/actions/auth"
import { useLanguage } from "@/components/providers"
import { LanguageToggle } from "@/components/language-toggle"
import Link from "next/link"

type RegistrationField = {
  id: number
  field_key: string
  label_en: string
  label_th: string
  field_type: string
  options: string[] | null
  is_required: boolean
  display_order: number
}

export function RegisterForm({ fields }: { fields: RegistrationField[] }) {
  const { t, lang } = useLanguage()
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await registerCustomer(formData)
    },
    null
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      {state?.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {t("email")} <span className="text-accent">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 rounded-lg border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder="email@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          {t("password")} <span className="text-accent">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="h-11 rounded-lg border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          {t("confirmPassword")} <span className="text-accent">*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="h-11 rounded-lg border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Dynamic registration fields from database */}
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col gap-2">
          <label htmlFor={`field_${field.field_key}`} className="text-sm font-medium text-foreground">
            {lang === "th" ? field.label_th : field.label_en}
            {field.is_required && <span className="text-accent"> *</span>}
          </label>
          {field.field_type === "select" && field.options ? (
            <select
              id={`field_${field.field_key}`}
              name={`field_${field.field_key}`}
              required={field.is_required}
              className="h-11 rounded-lg border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="">--</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`field_${field.field_key}`}
              name={`field_${field.field_key}`}
              type={field.field_type === "tel" ? "tel" : field.field_type === "number" ? "number" : "text"}
              required={field.is_required}
              className="h-11 rounded-lg border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-medium tracking-wide text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? t("loading") : t("register")}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-accent underline-offset-4 hover:underline">
          {t("login")}
        </Link>
      </p>
    </form>
  )
}
