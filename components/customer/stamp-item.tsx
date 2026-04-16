"use client"

import { useLanguage } from "@/components/providers"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Props = {
  name: string
  isStamped: boolean
  onClick: () => void
  index: number
}

export function StampItem({ name, isStamped, onClick, index }: Props) {
  const { t } = useLanguage()

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all duration-300",
        isStamped
          ? "border-accent bg-accent/5 shadow-sm"
          : "border-dashed border-border bg-card hover:border-muted-foreground/30 hover:shadow-sm"
      )}
    >
      {/* Wax seal circle */}
      <div
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 sm:h-20 sm:w-20",
          isStamped
            ? "bg-accent text-accent-foreground animate-stamp-press"
            : "border-2 border-dashed border-muted-foreground/30 text-muted-foreground/40"
        )}
      >
        {isStamped ? (
          <div className="flex flex-col items-center">
            <Check className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
          </div>
        ) : (
          <span className="font-serif text-lg font-bold sm:text-xl">{index}</span>
        )}

        {/* Decorative ring for stamped */}
        {isStamped && (
          <div className="absolute inset-0 rounded-full border-2 border-accent/30" />
        )}
      </div>

      {/* Booth name */}
      <span
        className={cn(
          "line-clamp-2 text-center text-xs font-medium leading-tight transition-colors sm:text-sm",
          isStamped ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {name}
      </span>

      {/* Status text */}
      <span
        className={cn(
          "text-[10px] tracking-wide",
          isStamped ? "text-accent" : "text-muted-foreground/50"
        )}
      >
        {isStamped ? t("visited") : t("tapToView")}
      </span>
    </button>
  )
}
