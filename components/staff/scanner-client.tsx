"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  } | null>(null)
  const [insecureWarning, setInsecureWarning] = useState<string | null>(null)
  const [cameraStatus, setCameraStatus] = useState<string>("")
  const [manualCode, setManualCode] = useState<string>("")
  const [showManualInput, setShowManualInput] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<any>(null)
  const hasScannedRef = useRef(false)

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

  const processScan = useCallback(async (decodedText: string) => {
    console.log("[Scan] Processing:", decodedText)
    
    if (!selectedCheckpoint) {
      console.log("[Scan] No checkpoint selected")
      return
    }

    // Robust token extraction
    let qrToken = decodedText
    if (decodedText && decodedText.includes('ftt_')) {
      const parts = decodedText.split('ftt_')
      qrToken = 'ftt_' + parts[parts.length - 1]
    }

    console.log("[Scan] Token extracted:", qrToken, "Booth:", selectedCheckpoint.slug)

    try {
      setScanning(false)
      setCameraStatus("")
      
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_token: qrToken, booth_id: parseInt(selectedCheckpoint.slug) }),
      })

      const data = await res.json()
      console.log("[Scan] API response:", res.status, data)

      console.log("[Scan] Response OK:", res.ok, "Data:", data)
      
      if (res.ok && data.success) {
        setResult({
          type: "success",
          message: `${t("checkpointCompleted")} (Booth: ${data.booth_id})`,
          userName: data.customer_email,
        })
      } else if (data.alreadyStamped) {
        setResult({
          type: "already",
          message: `${data.customer_email || ""} ${lang === "th" ? "ประทับตราที่บูธนี้แล้ว" : "already stamped at this booth"}`
        })
      } else if (data.error) {
        setResult({ type: "error", message: data.error })
      } else {
        setResult({ type: "error", message: `Unexpected response: ${JSON.stringify(data)}` })
      }
    } catch (err) {
      console.error("[Scan] API error:", err)
      setResult({ type: "error", message: t("networkError") })
    }
  }, [selectedCheckpoint, lang, t])

  const [debugLog, setDebugLog] = useState<string[]>([])
  const addLog = (msg: string) => {
    console.log(msg)
    setDebugLog(prev => [msg, ...prev].slice(0, 5))
  }

  useEffect(() => {
    if (!scanning) return

    let cancelled = false
    let videoStream: MediaStream | null = null
    let decodeTimeout: NodeJS.Timeout | null = null

    const startScanner = async () => {
      addLog("Loading ZXing...")
      hasScannedRef.current = false
      
      try {
        // Load ZXing from CDN if not already loaded
        if (!(window as any).ZXing) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js"
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        if (cancelled) return
        
        const ZXing = (window as any).ZXing
        const codeReader = new ZXing.BrowserQRCodeReader()
        addLog("ZXing Ready")

        const video = videoRef.current
        if (!video) {
          addLog("Video element missing")
          return
        }

        addLog("Starting camera...")
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        })
        
        if (cancelled) {
          videoStream.getTracks().forEach(t => t.stop())
          return
        }

        video.srcObject = videoStream
        // Critical for iOS
        video.setAttribute("playsinline", "true")
        video.setAttribute("muted", "true")
        video.setAttribute("autoplay", "true")
        
        await video.play()
        addLog("Video stream active")

        const decodeLoop = async () => {
          if (cancelled || hasScannedRef.current) return
          
          try {
            // Use decodeFromVideoElement which is very robust
            const result = await codeReader.decodeFromVideoElement(video)
            if (result && !hasScannedRef.current) {
              const text = result.getText()
              addLog("Scanned!")
              hasScannedRef.current = true
              
              if (videoStream) {
                videoStream.getTracks().forEach(t => t.stop())
              }
              processScan(text)
              return
            }
          } catch (e) {
            // No QR found in frame
          }
          
          if (!cancelled && !hasScannedRef.current) {
            decodeTimeout = setTimeout(decodeLoop, 300)
          }
        }

        decodeLoop()
        setCameraStatus(lang === "th" ? "กล้องพร้อมใช้งาน - จัด QR ให้อยู่ในกรอบ" : "Camera ready - position QR in frame")
      } catch (err: any) {
        addLog("Error: " + (err.message || String(err)))
        if (!cancelled) {
          setScanning(false)
          setResult({
            type: "error",
            message: `Scanner Error: ${err.message || String(err)}`,
          })
        }
      }
    }

    const timer = setTimeout(startScanner, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (decodeTimeout) clearTimeout(decodeTimeout)
      addLog("Cleaning up...")
      if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop())
      }
    }
  }, [scanning, lang, t, processScan])

  const handleManualScan = async () => {
    if (manualCode.trim()) {
      await processScan(manualCode.trim())
      setManualCode("")
      setShowManualInput(false)
    }
  }

  const startNewScan = async () => {
    console.log("[Scan] Starting new scan")
    setResult(null)
    hasScannedRef.current = false

    if (insecureWarning) {
      setResult({ type: "error", message: insecureWarning })
      return
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setResult({
        type: "error",
        message: lang === "th"
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

            {/* Camera view */}
            <div 
              className={`relative w-full rounded-xl border border-border bg-black overflow-hidden transition-all duration-300 ${
                scanning ? 'opacity-100 min-h-[300px]' : 'opacity-0 max-h-0'
              }`}
            >
              <video
                ref={videoRef}
                className="w-full"
                style={{ 
                  height: scanning ? "350px" : "0px", 
                  objectFit: "cover",
                  display: scanning ? "block" : "none" 
                }}
                playsInline
                muted
                autoPlay
                // @ts-ignore
                webkit-playsinline="true"
              />
              {scanning && (
                <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 m-8 rounded-lg animate-pulse" />
              )}
              {scanning && (
                <div className="absolute top-2 left-2 bg-black/60 p-2 rounded text-[10px] text-white font-mono z-20 pointer-events-none">
                  {debugLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
              {scanning && (
                <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/70 bg-black/40 py-1 z-10 pointer-events-none">
                  {cameraStatus || t("positionQR")}
                </p>
              )}
            </div>

            {/* Manual input */}
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
                      handleManualScan()
                    }
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
                    {lang === "th" ? "ยกเลิก" : "Cancel"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Result */}
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

            {/* Buttons */}
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
                Cancel
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
