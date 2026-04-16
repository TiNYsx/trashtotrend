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
  Trophy,
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
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrRef = useRef<unknown>(null)
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

  const ensureCameraPermission = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      stream.getTracks().forEach((t) => t.stop())
      return true
    } catch {
      return false
    }
  }

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
            if (scanner && isScannerRunningRef.current) {
              try {
                await (scanner as any).stop()
              } catch {
                /* already stopped */
              } finally {
                isScannerRunningRef.current = false
              }
            }

            setScanning(false)
            await handleScan(decodedText)
          },
          () => {
            /* ignore scan errors */
          }
        )

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
  }, [scanning])

  const handleScan = async (qrToken: string) => {
    if (!selectedCheckpoint) return

    try {
      const res = await fetch("/api/checkpoint/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken, checkpointSlug: selectedCheckpoint.slug }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          type: "success",
          message: `Checkpoint completed!`,
          userName: data.user,
          progress: data.progress,
        })
      } else if (data.error === "Already completed") {
        setResult({ 
          type: "already", 
          message: `${data.user} already completed ${data.checkpoint}` 
        })
      } else {
        setResult({ type: "error", message: data.error || "Scan failed" })
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
              Scan Checkpoint
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan customer QR codes to mark checkpoint completion
            </p>
          </div>
        </div>

        {/* Insecure context warning */}
        {insecureWarning && (
          <div className="mb-4 w-full rounded-lg bg-destructive/20 px-4 py-3 text-center text-sm text-destructive">
            {insecureWarning}
          </div>
        )}

        {/* Step 1: Select checkpoint */}
        {!selectedCheckpoint && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="mb-4 text-center text-sm font-medium text-foreground">
              Select a checkpoint:
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
                  No checkpoints configured
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
            {/* Checkpoint indicator */}
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
                (change)
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
                  Position QR code within the frame
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
                  {result.progress && (
                    <div className="flex items-center gap-2 mt-2">
                      <Trophy className="h-4 w-4 text-accent" />
                      <span className="text-sm text-muted-foreground">
                        Progress: {result.progress.completed} / {result.progress.total}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan button */}
            {!scanning && (
              <button
                onClick={startNewScan}
                className="flex h-14 items-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl glow-primary"
              >
                <Camera className="h-5 w-5" />
                {result
                  ? "Scan Again"
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
                Cancel
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
