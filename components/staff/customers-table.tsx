"use client"

import Link from "next/link"
import { useLanguage } from "@/components/providers"
import { Users, ArrowLeft } from "lucide-react"

type Customer = {
  id: number
  email: string
  registration_data: Record<string, string>
  created_at: string
  stamp_count: string
  quiz_count: string
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const { t } = useLanguage()

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link
          href="/staff/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">{t("customers")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{customers.length} {t("totalCustomers").toLowerCase()}</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <Users className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{t("noCustomers")}</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("email")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("stampCount")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("quizCount")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("registeredAt")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-card/50">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                      {c.stamp_count}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                      {c.quiz_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {c.registration_data && Object.keys(c.registration_data).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(c.registration_data).map(([key, val]) => (
                          <span key={key} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
