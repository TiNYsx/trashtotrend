"use client"

import { useEffect, useState, useCallback } from "react"
import { useLanguage } from "@/components/providers"
import { X, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrToken: string
  customerEmail: string
}

export function QRPopup({ open, onOpenChange, qrToken, customerEmail }: Props) {
  const { t } = useLanguage()
  const [svgData, setSvgData] = useState<string>("")
  const [currentToken, setCurrentToken] = useState(qrToken)
  const [refreshing, setRefreshing] = useState(false)

  const generateQR = useCallback(async (token: string) => {
    if (!token) return
    try {
      const QRCode = (await import("qrcode")).default
      const svg = await QRCode.toString(token, {
        type: "svg",
        margin: 2,
        color: { dark: "#1A1A1A", light: "#FAFAF7" },
        width: 240,
      })
      setSvgData(svg)
    } catch {
      // QR generation failed
    }
  }, [])

  const refreshToken = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/qr/refresh", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setCurrentToken(data.token)
        await generateQR(data.token)
      }
    } catch {
      // refresh failed
    }
    setRefreshing(false)
  }, [generateQR])

  useEffect(() => {
    if (open) {
      refreshToken()
    }
  }, [open, refreshToken])

  useEffect(() => {
    if (currentToken) {
      generateQR(currentToken)
    }
  }, [currentToken, generateQR])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Card centered */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              {/* Decorative top accent */}
              <div className="h-1.5 bg-accent" />

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-3 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center px-6 pb-8 pt-6">
                {/* Title */}
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Event Pass
                </p>
                <h2 className="mt-1 font-serif text-xl font-bold text-foreground">
                  {t("showQR")}
                </h2>

                {/* QR Code */}
                <div className="relative mt-5 rounded-xl border border-border bg-card p-4">
                  {/* Decorative corner accents */}
                  <div className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-accent/40" />
                  <div className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-accent/40" />
                  <div className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-accent/40" />
                  <div className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-accent/40" />

                  {svgData ? (
                    <div
                      className="h-56 w-56"
                      dangerouslySetInnerHTML={{ __html: svgData }}
                    />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Email */}
                <p className="mt-4 text-xs text-muted-foreground">{customerEmail}</p>

                {/* Instruction */}
                <p className="mt-2 max-w-[240px] text-center text-xs leading-relaxed text-muted-foreground">
                  {t("scanToCollect")}
                </p>

                {/* Refresh button */}
                <button
                  onClick={refreshToken}
                  disabled={refreshing}
                  className="mt-4 flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh QR
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
