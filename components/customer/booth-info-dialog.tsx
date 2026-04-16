"use client"

import { useLanguage } from "@/components/providers"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Check, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

type Booth = {
  id: number
  name_en: string
  name_th: string
  description_en: string | null
  description_th: string | null
  image_url: string | null
  display_order: number
}

type Props = {
  booth: Booth | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isStamped: boolean
}

export function BoothInfoDialog({ booth, open, onOpenChange, isStamped }: Props) {
  const { lang, t } = useLanguage()

  if (!booth) return null

  const name = lang === "th" ? booth.name_th : booth.name_en
  const description = lang === "th" ? booth.description_th : booth.description_en

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                isStamped ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
              )}
            >
              {isStamped ? <Check className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <DialogTitle className="font-serif text-lg">{name}</DialogTitle>
              <DialogDescription className="mt-1">
                {isStamped ? (
                  <span className="text-accent">{t("visited")}</span>
                ) : (
                  <span>{t("notVisited")}</span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {booth.image_url && (
          <div className="overflow-hidden rounded-lg border border-border">
            <img
              src={booth.image_url}
              alt={name}
              className="h-48 w-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
        )}

        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}

        <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Booth #{booth.display_order}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
