"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/providers"
import { LanguageToggle } from "@/components/language-toggle"
import { StampGrid } from "@/components/customer/stamp-grid"
import { QRPopup } from "@/components/customer/qr-popup"
import { BoothInfoDialog } from "@/components/customer/booth-info-dialog"
import { logout } from "@/lib/actions/auth"
import { QrCode, LogOut } from "lucide-react"
import { motion } from "framer-motion"

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
  booths: Booth[]
  stampedBoothIds: number[]
  totalBooths: number
  totalStamped: number
  qrToken: string
  customerEmail: string
}

export function StampPageClient({
  booths,
  stampedBoothIds,
  totalBooths,
  totalStamped,
  qrToken,
  customerEmail,
}: Props) {
  const { t, lang } = useLanguage()
  const [qrOpen, setQrOpen] = useState(false)
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null)
  const [boothDialogOpen, setBoothDialogOpen] = useState(false)
  const [dynamicStampedIds, setDynamicStampedIds] = useState<number[]>(stampedBoothIds)

  const handleBoothClick = (booth: Booth) => {
    setSelectedBooth(booth)
    setBoothDialogOpen(true)
  }

  // poll for stamp grid updates every 5 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout
    const fetchUpdates = async () => {
      try {
        const res = await fetch("/api/stamps")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.stampedBoothIds)) {
            setDynamicStampedIds(data.stampedBoothIds)
          }
        }
      } catch {
        // ignore
      }
    }
    interval = setInterval(fetchUpdates, 5000)
    return () => clearInterval(interval)
  }, [])

  // poll for scan events and redirect customer to quiz when scanned
  useEffect(() => {
    let interval: NodeJS.Timeout
    const fetchScans = async () => {
      try {
        const res = await fetch("/api/scan-events")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.booths) && data.booths.length > 0) {
            const boothId = data.booths[0]
            window.location.href = `/stamps/quiz/${boothId}`
          }
        }
      } catch {
        // ignore
      }
    }
    interval = setInterval(fetchScans, 3000)
    // also run immediately
    fetchScans()
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex flex-col">
          <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">
            FROM TRASH
          </h1>
          <p className="font-serif text-sm italic text-accent">To Trend</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <form action={logout}>
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={t("logout")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Stamp count */}
      <div className="px-5 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-baseline gap-2"
        >
          <span className="font-serif text-4xl font-bold text-foreground">
            {totalStamped}
          </span>
          <span className="text-sm text-muted-foreground">
            / {totalBooths} {t("stampsCollected")}
          </span>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{
              width: totalBooths > 0 ? `${(totalStamped / totalBooths) * 100}%` : "0%",
            }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stamp grid */}
      <div className="flex-1 px-5 pb-24">
        <StampGrid
          booths={booths}
          stampedBoothIds={dynamicStampedIds}
          onBoothClick={handleBoothClick}
        />
      </div>

      {/* QR floating button */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center">
        <motion.button
          onClick={() => setQrOpen(true)}
          className="flex h-14 items-center gap-3 rounded-full bg-primary px-6 text-primary-foreground shadow-lg transition-shadow hover:shadow-xl"
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <QrCode className="h-5 w-5" />
          <span className="text-sm font-medium tracking-wide">{t("showQR")}</span>
        </motion.button>
      </div>

      {/* QR Popup */}
      <QRPopup
        open={qrOpen}
        onOpenChange={setQrOpen}
        qrToken={qrToken}
        customerEmail={customerEmail}
      />

      {/* Booth Info Dialog */}
      <BoothInfoDialog
        booth={selectedBooth}
        open={boothDialogOpen}
        onOpenChange={setBoothDialogOpen}
        isStamped={selectedBooth ? stampedBoothIds.includes(selectedBooth.id) : false}
      />
    </div>
  )
}
