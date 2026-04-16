"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/components/providers"
import { motion, AnimatePresence } from "framer-motion"
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

type Booth = { id: number; name_en: string; name_th: string }

export function ScannerClient({ booths }: { booths: Booth[] }) {
  const { t, lang } = useLanguage()
  const [selectedBooth, setSelectedBooth] = useState<number | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error" | "already"
    message: string
    customer_email?: string
  } | null>(null)
  const [insecureWarning, setInsecureWarning] = useState<string | null>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrRef = useRef<unknown>(null)
  const isScannerRunningRef = useRef(false)

  // detect if we're running in an insecure context (http and not localhost)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const { protocol, hostname } = window.location
      if (
        protocol !== "https:" &&
        hostname !== "localhost" &&
        hostname !== "127.0.0.1"
      ) {
        setInsecureWarning(
          lang === "th"
            ? "เบราว์เซอร์ของคุณไม่อนุญาตการเข้าถึงกล้องบน HTTP ใช้ HTTPS หรือเปิดใน localhost เพื่อทดสอบ"
            : "Your browser blocks camera access over HTTP. Use HTTPS or localhost for testing."
        )
      }
    }
  }, [lang])

  // Try to request camera permission proactively to trigger browser prompt
  const ensureCameraPermission = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      // stop tracks immediately; html5-qrcode will open camera again
      stream.getTracks().forEach((t) => t.stop())
      return true
    } catch {
      return false
    }
  }

  // Start the camera scanner
  useEffect(() => {
    if (!scanning || !scannerRef.current) return

    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode")
      scanner = new Html5Qrcode("qr-reader")
      html5QrRef.current = scanner

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText: string) => {
            // Stop scanning immediately on success – only if running
            if (scanner && isScannerRunningRef.current) {
              try {
                // stop may throw if already stopped; guard with ref
                await (scanner as any).stop()
              } catch {
                /* already stopped or failed to stop */
              } finally {
                isScannerRunningRef.current = false
              }
            }

            setScanning(false)
            await handleScan(decodedText)
          },
          () => {
            /* ignore scan errors (no QR in frame) */
          }
        )

        // mark running after successful start
        isScannerRunningRef.current = true
      } catch {
        isScannerRunningRef.current = false
        setScanning(false)
        setResult({
          type: "error",
          message: "Camera access denied or unavailable",
        })
      }
    }

    startScanner()

    return () => {
      if (scanner) {
        try {
          if (isScannerRunningRef.current) {
            ;(scanner as any).stop().catch(() => {})
            isScannerRunningRef.current = false
          }
        } catch {
          /* ignore */
        }
        try {
          scanner.clear()
        } catch {
          /* ignore */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning])

  const handleScan = async (qrToken: string) => {
    if (!selectedBooth) return

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_token: qrToken, booth_id: selectedBooth }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          type: "success",
          message: t("scanSuccess"),
          customer_email: data.customer_email,
        })
      } else if (data.alreadyStamped) {
        setResult({ type: "already", message: t("alreadyStamped") })
      } else {
        setResult({ type: "error", message: data.error || t("scanError") })
      }
    } catch {
      setResult({ type: "error", message: "Network error" })
    }
  }

  const startNewScan = async () => {
    setResult(null)

    if (insecureWarning) {
      setResult({ type: "error", message: insecureWarning })
      return
    }

    const allowed = await ensureCameraPermission()
    if (!allowed) {
      setResult({
        type: "error",
        message:
          lang === "th"
            ? "โปรดอนุญาตการเข้าถึงกล้องในเบราว์เซอร์ของคุณ"
            : "Please allow camera access in your browser.",
      })
      return
    }

    setScanning(true)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/staff/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">{t("scanQR")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "th" ? "สแกน QR Code เพื่อประทับแสตมป์" : "Scan customer QR codes to stamp attendance"}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* show insecure context warning if any */}
        {insecureWarning && (
          <div className="mb-4 w-full max-w-sm rounded-lg bg-yellow-100 px-4 py-3 text-center text-sm text-yellow-800">
            {insecureWarning}
          </div>
        )}
        {/* Step 1: Select booth */}
        {!selectedBooth && (
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="mb-4 text-center text-sm font-medium text-foreground">
              {t("selectBooth")}
            </p>
            <div className="flex flex-col gap-2">
              {booths.map((booth) => (
                <button
                  key={booth.id}
                  onClick={() => setSelectedBooth(booth.id)}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-all hover:border-accent hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                    {booth.id}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {lang === "th" ? booth.name_th : booth.name_en}
                  </span>
                </button>
              ))}
              {booths.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("noBooths")}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Scanner or results */}
        {selectedBooth && (
          <motion.div
            className="flex w-full max-w-sm flex-col items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Booth indicator */}
            <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
              <span className="text-xs text-muted-foreground">
                {t("booths")}:
              </span>
              <span className="text-sm font-medium text-foreground">
                {lang === "th"
                  ? booths.find((b) => b.id === selectedBooth)?.name_th
                  : booths.find((b) => b.id === selectedBooth)?.name_en}
              </span>
              <button
                onClick={() => {
                  setSelectedBooth(null)
                  setScanning(false)
                  setResult(null)
                }}
                className="ml-1 text-xs text-accent hover:text-accent/80"
              >
                ({lang === "th" ? "เปลี่ยน" : "change"})
              </button>
            </div>

            {/* Camera view */}
            {scanning && (
              <div className="w-full overflow-hidden rounded-xl border border-border bg-foreground/5">
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full"
                  style={{ minHeight: "300px" }}
                />
                <p className="py-3 text-center text-xs text-muted-foreground">
                  {lang === "th"
                    ? "จัด QR Code ให้อยู่ในกรอบ"
                    : "Position QR code within the frame"}
                </p>
              </div>
            )}

            {/* Result display */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex w-full flex-col items-center gap-3 rounded-xl border p-6 ${
                    result.type === "success"
                      ? "border-green-200 bg-green-50"
                      : result.type === "already"
                        ? "border-amber-200 bg-amber-50"
                        : "border-red-200 bg-red-50"
                  }`}
                >
                  {result.type === "success" ? (
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  ) : result.type === "already" ? (
                    <AlertTriangle className="h-10 w-10 text-amber-600" />
                  ) : (
                    <XCircle className="h-10 w-10 text-red-600" />
                  )}
                  <p
                    className={`text-center text-sm font-medium ${
                      result.type === "success"
                        ? "text-green-800"
                        : result.type === "already"
                          ? "text-amber-800"
                          : "text-red-800"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.customer_email && (
                    <p className="text-xs text-muted-foreground">
                      {result.customer_email}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan button */}
            {!scanning && (
              <button
                onClick={startNewScan}
                className="flex h-14 items-center gap-3 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                <Camera className="h-5 w-5" />
                {result
                  ? lang === "th"
                    ? "สแกนอีกครั้ง"
                    : "Scan Again"
                  : lang === "th"
                    ? "เริ่มสแกน"
                    : "Start Scanning"}
              </button>
            )}

            {scanning && (
              <button
                onClick={() => {
                  setScanning(false)
                  const s = html5QrRef.current as {
                    stop: () => Promise<void>
                  } | null
                  if (s) s.stop().catch(() => {})
                }}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t("cancel")}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
