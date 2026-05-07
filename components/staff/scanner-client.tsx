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
  MapPin,
} from "lucide-react"
import Link from "next/link"

type Checkpoint = { id: number; slug: string; name_en: string; name_th: string }

export function ScannerClient({ checkpoints }: { checkpoints: Checkpoint[] }) {
  const { t, lang } = useLanguage()
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error" | "already"
    message: string
    userName?: string
    progress?: { completed: number; total: number }
  } | null>(null)
  const [insecureWarning, setInsecureWarning] = useState<string | null>(null)
  const [cameraStatus, setCameraStatus] = useState<string>("")
  const [manualCode, setManualCode] = useState<string>("")
  const [showManualInput, setShowManualInput] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<any>(null)
  const isScannerRunningRef = useRef(false)

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

  useEffect(() => {
    if (!scanning || !videoRef.current) return

    let scanner: any = null

    const startScanner = async () => {
      setCameraStatus(lang === "th" ? "กำลังเปิดกล้อง..." : "Starting camera...")
      
      try {
        const QrScanner = (await import('qr-scanner')).default
        
        const video = videoRef.current!
        video.playsInline = true
        video.muted = true
        video.setAttribute('playsinline', 'true')
        video.setAttribute('muted', 'true')
        
        scanner = new QrScanner(
          video,
          (result: any) => {
            console.log("QR detected:", result.data)
            if (scanner && isScannerRunningRef.current) {
              scanner.stop().catch(() => {})
              isScannerRunningRef.current = false
            }
            setScanning(false)
            setCameraStatus("")
            handleScan(result.data)
          },
          {
            preferredCamera: 'environment',
            maxScansPerSecond: 10,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )
        
        scannerRef.current = scanner
        await scanner.start()
        isScannerRunningRef.current = true
        setCameraStatus(lang === "th" ? "กล้องพร้อมใช้งาน - จัด QR ให้อยู่ในกรอบ" : "Camera ready - position QR in frame")
      } catch (err: any) {
        isScannerRunningRef.current = false
        setScanning(false)
        setCameraStatus("")
        console.error("Scanner start error:", err)
        const errorMessage = err?.message || err?.toString?.() || ""
        if (errorMessage.includes("Permission") || errorMessage.includes("permission") || errorMessage.includes("denied")) {
          setResult({
            type: "error",
            message: t("cameraDenied"),
          })
        } else {
          setResult({
            type: "error",
            message: lang === "th"
              ? `ไม่สามารถเปิดกล้องได้: ${errorMessage}`
              : `Could not start camera: ${errorMessage}`,
          })
        }
      }
    }

    startScanner()

    return () => {
      if (scanner) {
        try {
          if (isScannerRunningRef.current) {
            scanner.stop().catch(() => {})
            isScannerRunningRef.current = false
          }
        } catch {
          /* ignore */
        }
        try {
          scanner.destroy()
        } catch {
          /* ignore */
        }
      }
    }
  }, [scanning, lang, t])

  const handleScan = async (decodedText: string) => {
    if (!selectedCheckpoint) return

    let qrToken = decodedText
    if (decodedText.includes('/scan/')) {
      qrToken = decodedText.split('/scan/')[1]
    }

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_token: qrToken, booth_id: parseInt(selectedCheckpoint.slug) }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          type: "success",
          message: t("checkpointCompleted"),
          userName: data.customer_email,
        })
      } else if (data.alreadyStamped) {
        setResult({
          type: "already",
          message: `${data.customer_email || ""} ${lang === "th" ? "ประทับตราที่บูธนี้แล้ว" : "already stamped at this booth"}`
        })
      } else {
        setResult({ type: "error", message: data.error || t("scanFailed") })
      }
    } catch {
      setResult({ type: "error", message: t("networkError") })
    }
  }

  const startNewScan = async () => {
    setResult(null)

    if (insecureWarning) {
      setResult({ type: "error", message: insecureWarning })
      return
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setResult({
        type: "error",
        message:
          lang === "th"
            ? "เบราว์เซอร์ของคุณไม่รองรับการเข้าถึงกล้อง"
            : "Your browser does not support camera access.",
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

        {/* Insecure context warning */}
        {insecureWarning && (
          <div className="mb-4 w-full rounded-lg bg-destructive/20 px-4 py-3 text-center text-sm text-destructive">
            {insecureWarning}
          </div>
        )}

        {/* Step 1: Select booth */}
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

        {/* Step 2: Scanner or results */}
        {selectedCheckpoint && (
          <motion.div
            className="flex w-full flex-col items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Booth indicator */}
            <div className="flex items-center gap-2 rounded-full glass px-4 py-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {lang === "th"
                  ? selectedCheckpoint.name_th
                  : selectedCheckpoint.name_en}
              </span>
              <button
                onClick={() => {
                  setSelectedCheckpoint(null)
                  setScanning(false)
                  setResult(null)
                }}
                className="ml-2 text-xs text-accent hover:text-accent/80"
              >
                ({t("change")})
              </button>
            </div>

            {/* Camera view */}
            {scanning && (
              <div className="w-full rounded-xl border border-border bg-foreground/5">
                <video
                  ref={videoRef}
                  className="w-full"
                  style={{ height: "350px", objectFit: "cover" }}
                  playsInline
                  muted
                />
                <p className="py-3 text-center text-xs text-muted-foreground">
                  {cameraStatus || t("positionQR")}
                </p>
              </div>
            )}

            {/* Manual input fallback */}
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
                    if (e.key === "Enter" && manualCode.trim()) {
                      handleScan(manualCode.trim())
                      setManualCode("")
                      setShowManualInput(false)
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (manualCode.trim()) {
                        handleScan(manualCode.trim())
                        setManualCode("")
                        setShowManualInput(false)
                      }
                    }}
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
                    {lang === "th" ? "ยกเลิก" : "Cancel"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Result display */}
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

            {/* Scan button */}
            {!scanning && !showManualInput && (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={startNewScan}
                  className="flex h-14 items-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl glow-primary"
                >
                  <Camera className="h-5 w-5" />
                  {result
                    ? t("scanAgain")
                    : t("startScanning")}
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
                onClick={() => {
                  setScanning(false)
                  const s = scannerRef.current
                  if (s) s.stop().catch(() => {})
                }}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Cancel
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
