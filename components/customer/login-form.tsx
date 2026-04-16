"use client"

import { useActionState } from "react"
import { loginCustomer } from "@/lib/actions/auth"
import { useLanguage } from "@/components/providers"
import { LanguageToggle } from "@/components/language-toggle"
import Link from "next/link"

export function LoginForm() {
  const { t } = useLanguage()
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await loginCustomer(formData)
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
          {t("email")}
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
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-11 rounded-lg border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-medium tracking-wide text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? t("loading") : t("login")}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-accent underline-offset-4 hover:underline">
          {t("register")}
        </Link>
      </p>
    </form>
  )
}
