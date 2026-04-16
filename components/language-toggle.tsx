"use client"

import { useLanguage } from "@/components/providers"
import { cn } from "@/lib/utils"

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage()

  return (
    <div className={cn("flex items-center gap-1 rounded-full bg-secondary p-0.5", className)}>
      <button
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-all duration-200",
          lang === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLang("th")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-all duration-200",
          lang === "th"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        TH
      </button>
    </div>
  )
}
