"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/providers"
import { motion, AnimatePresence } from "framer-motion"
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  MapPin,
  RefreshCw,
  ImageUp,
} from "lucide-react"
import Link from "next/link"
import type QrScanner from "qr-scanner"

type Checkpoint = { id: number; slug: string; name_en: string; name_th: string }
type ScanResult = {
  type: "success" | "error" | "already"
  message: string
  userName?: string
}

const QR_WORKER_PATH = "/qr-scanner-worker.min.js"

function extractQrToken(decodedText: string) {
  const text = decodedText.trim()
  if (!text) return ""

  const directToken = text.match(/ftt_[A-Za-z0-9_-]+/)
  if (directToken) return directToken[0]

  try {
    const url = new URL(text)
    const paramToken =
      url.searchParams.get("qr_token") ||
      url.searchParams.get("qrToken") ||
      url.searchParams.get("token")

    if (paramToken) return paramToken.trim()

    const scanPathToken = url.pathname.match(/\/scan\/([^/?#]+)/)
    if (scanPathToken?.[1]) return decodeURIComponent(scanPathToken[1])
  } catch {
    const scanPathToken = text.match(/\/scan\/([^/?#]+)/)
    if (scanPathToken?.[1]) return decodeURIComponent(scanPathToken[1])
  }

  return text
}

function getScanText(scanResult: string | QrScanner.ScanResult) {
  return typeof scanResult === "string" ? scanResult : scanResult.data
}

async function loadQrScanner() {
  const module = await import("qr-scanner")
  const Scanner = module.default
  Scanner.WORKER_PATH = QR_WORKER_PATH
  return Scanner
}

export function ScannerClient({ checkpoints }: { checkpoints: Checkpoint[] }) {
  const { t, lang } = useLanguage()
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [insecureWarning, setInsecureWarning] = useState<string | null>(null)
  const [cameraStatus, setCameraStatus] = useState("")
  const [manualCode, setManualCode] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasScannedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const { protocol, hostname } = window.location
    if (protocol !== "https:" && hostname !== "localhost" && hostname !== "127.0.0.1") {
      setInsecureWarning(
        lang === "th"
          ? "เบราว์เซอร์บล็อกการเข้าถึงกล้องบน HTTP กรุณาใช้ HTTPS หรือ localhost สำหรับทดสอบ"
          : "Your browser blocks camera access over HTTP. Use HTTPS or localhost for testing."
      )
    }
  }, [lang])

  const stopScanner = useCallback(() => {
    const scanner = scannerRef.current
    scannerRef.current = null

    if (scanner) {
      try {
        scanner.stop()
      } catch {
        // The scanner may already be stopped after a successful decode.
      }
      scanner.destroy()
    }
  }, [])

  const processScan = useCallback(async (decodedText: string) => {
    if (!selectedCheckpoint) return

    const qrToken = extractQrToken(decodedText)
    const boothId = Number(selectedCheckpoint.slug)

    if (!qrToken || !Number.isInteger(boothId)) {
      setScanning(false)
      setCameraStatus("")
      setResult({ type: "error", message: t("scanError") })
      return
    }

    try {
      setScanning(false)
      setCameraStatus("")

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_token: qrToken, booth_id: boothId }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setResult({
          type: "success",
          message: `${t("checkpointCompleted")} (Booth: ${data.booth_id})`,
          userName: data.customer_email,
        })
      } else if (data.alreadyStamped) {
        setResult({
          type: "already",
          message: `${data.customer_email || ""} ${t("alreadyStamped")}`.trim(),
        })
      } else {
        setResult({ type: "error", message: data.error || t("scanError") })
      }
    } catch {
      setResult({ type: "error", message: t("networkError") })
    }
  }, [selectedCheckpoint, t])

  useEffect(() => {
    if (!scanning) {
      stopScanner()
      return
    }

    let cancelled = false
    const startScanner = async () => {
      setCameraStatus(lang === "th" ? "กำลังเตรียมกล้อง..." : "Preparing camera...")
      hasScannedRef.current = false

      try {
        const video = videoRef.current
        if (!video) return

        video.setAttribute("playsinline", "true")
        video.setAttribute("webkit-playsinline", "true")
        video.muted = true

        const Scanner = await loadQrScanner()
        if (cancelled) return

        const scanner = new Scanner(
          video,
          (scanResult) => {
            if (hasScannedRef.current) return

            const decodedText = getScanText(scanResult)
            if (!decodedText) return

            hasScannedRef.current = true
            stopScanner()
            void processScan(decodedText)
          },
          {
            preferredCamera: "environment",
            maxScansPerSecond: 10,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
            onDecodeError: () => {
              // No QR in frame yet; keep scanning.
            },
          }
        )

        scannerRef.current = scanner
        await scanner.start()

        if (cancelled) {
          stopScanner()
          return
        }

        setCameraStatus(lang === "th" ? "กล้องพร้อมแล้ว วาง QR ให้อยู่ในกรอบ" : "Camera ready. Position QR in frame.")
      } catch (err) {
        if (cancelled) return

        setScanning(false)
        setCameraStatus("")
        setResult({
          type: "error",
          message:
            err instanceof Error && err.name === "NotAllowedError"
              ? t("allowCamera")
              : t("cameraDenied"),
        })
      }
    }

    const timer = window.setTimeout(startScanner, 150)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      stopScanner()
    }
  }, [lang, processScan, scanning, stopScanner, t])

  const handleImageScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingImage(true)
    setResult(null)

    try {
      const Scanner = await loadQrScanner()
      const scanResult = await Scanner.scanImage(file, {
        returnDetailedScanResult: true,
        alsoTryWithoutScanRegion: true,
      })
      await processScan(getScanText(scanResult))
    } catch {
      setResult({
        type: "error",
        message:
          lang === "th"
            ? "ไม่พบ QR Code ในภาพ กรุณาถ่ายให้เห็น QR ทั้งหมดและหลีกเลี่ยงแสงสะท้อน"
            : "No QR code found in the image. Keep the full QR visible and avoid glare.",
      })
    } finally {
      setIsProcessingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleManualScan = async () => {
    if (!manualCode.trim()) return

    await processScan(manualCode.trim())
    setManualCode("")
    setShowManualInput(false)
  }

  const startNewScan = async () => {
    setResult(null)
    setShowManualInput(false)
    hasScannedRef.current = false

    if (insecureWarning) {
      setResult({ type: "error", message: insecureWarning })
      return
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setResult({
        type: "error",
        message: lang === "th" ? "เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้อง" : "This browser does not support camera access.",
      })
      return
    }

    setScanning(true)
  }

  return (
    <div className="gradient-bg min-h-dvh p-6">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/staff/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t("scanBooth")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("scanCustomerQR")}
            </p>
          </div>
        </div>

        {insecureWarning && (
          <div className="mb-4 w-full rounded-lg bg-destructive/20 px-4 py-3 text-center text-sm text-destructive">
            {insecureWarning}
          </div>
        )}

        {!selectedCheckpoint && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="mb-4 text-center text-sm font-medium text-foreground">
              {t("selectBooth")}:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {checkpoints.map((checkpoint, idx) => (
                <button
                  key={checkpoint.id}
                  onClick={() => setSelectedCheckpoint(checkpoint)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {lang === "th" ? checkpoint.name_th : checkpoint.name_en}
                  </span>
                </button>
              ))}
              {checkpoints.length === 0 && (
                <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                  {t("noBooths")}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {selectedCheckpoint && (
          <motion.div
            className="flex w-full flex-col items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 rounded-full glass px-4 py-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {lang === "th" ? selectedCheckpoint.name_th : selectedCheckpoint.name_en}
              </span>
              <button
                onClick={() => {
                  setSelectedCheckpoint(null)
                  setScanning(false)
                  setResult(null)
                  setShowManualInput(false)
                }}
                className="ml-2 text-xs text-accent hover:text-accent/80"
              >
                ({t("change")})
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageScan}
            />

            <div
              className={`relative w-full overflow-hidden rounded-xl border border-border bg-black transition-all duration-300 ${
                scanning ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0"
              }`}
            >
              <video
                ref={videoRef}
                className="block w-full"
                style={{
                  height: scanning ? "350px" : "0px",
                  objectFit: "cover",
                }}
                playsInline
                muted
                autoPlay
              />
              {scanning && (
                <>
                  <div className="absolute inset-8 rounded-lg border-2 border-primary/40 pointer-events-none" />
                  <p className="absolute bottom-2 left-0 right-0 z-10 bg-black/45 px-3 py-1 text-center text-[10px] text-white/80">
                    {cameraStatus || t("positionQR")}
                  </p>
                </>
              )}
            </div>

            {scanning && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm disabled:opacity-50"
              >
                {isProcessingImage ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageUp className="h-4 w-4" />
                )}
                {lang === "th" ? "สแกนจากภาพถ่าย" : "Scan from Photo"}
              </button>
            )}

            {!scanning && showManualInput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col gap-3"
              >
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder={lang === "th" ? "ป้อนรหัส QR ด้วยตนเอง" : "Enter QR code manually"}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleManualScan()
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleManualScan}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    {lang === "th" ? "ยืนยัน" : "Submit"}
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(false)
                      setManualCode("")
                    }}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`w-full flex flex-col items-center gap-3 rounded-xl border p-6 ${
                    result.type === "success"
                      ? "border-primary/50 bg-primary/10"
                      : result.type === "already"
                        ? "border-accent/50 bg-accent/10"
                        : "border-destructive/50 bg-destructive/10"
                  }`}
                >
                  {result.type === "success" ? (
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  ) : result.type === "already" ? (
                    <AlertTriangle className="h-12 w-12 text-accent" />
                  ) : (
                    <XCircle className="h-12 w-12 text-destructive" />
                  )}
                  <p
                    className={`text-center text-sm font-medium ${
                      result.type === "success"
                        ? "text-primary"
                        : result.type === "already"
                          ? "text-accent"
                          : "text-destructive"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.userName && (
                    <p className="text-lg font-bold text-foreground">{result.userName}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!scanning && !showManualInput && (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={startNewScan}
                  className="flex h-14 items-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl glow-primary"
                >
                  <Camera className="h-5 w-5" />
                  {result ? t("scanAgain") : t("startScanning")}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="flex items-center gap-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
                >
                  {isProcessingImage && <RefreshCw className="h-3 w-3 animate-spin" />}
                  {lang === "th" ? "หรือสแกนจากภาพถ่าย" : "Or scan from a photo"}
                </button>
                <button
                  onClick={() => setShowManualInput(true)}
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {lang === "th" ? "หรือป้อนรหัสด้วยตนเอง" : "Or enter code manually"}
                </button>
              </div>
            )}

            {scanning && (
              <button
                onClick={() => setScanning(false)}
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
