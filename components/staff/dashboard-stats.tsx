"use client"

import { useLanguage } from "@/components/providers"
import { Users, Stamp, FileText, Store } from "lucide-react"
import { motion } from "framer-motion"

type Props = {
  stats: {
    total_customers: string
    total_stamps: string
    total_quiz_responses: string
    total_booths: string
  }
}

const cards = [
  { key: "total_customers" as const, labelKey: "totalCustomers" as const, icon: Users },
  { key: "total_stamps" as const, labelKey: "totalStamps" as const, icon: Stamp },
  { key: "total_quiz_responses" as const, labelKey: "totalQuizResponses" as const, icon: FileText },
  { key: "total_booths" as const, labelKey: "booths" as const, icon: Store },
]

export function DashboardStats({ stats }: Props) {
  const { t, lang } = useLanguage()

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground">{t("dashboard")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("eventOverview")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats[card.key]}</p>
              <p className="text-xs text-muted-foreground">{t(card.labelKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
