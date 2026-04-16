'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QrCode, MapPin, Trophy, LogOut, Loader2, CheckCircle, Lock, Sparkles, RefreshCw } from 'lucide-react'
import { LanguageToggle } from '@/components/language-toggle'
import QRCode from 'qrcode'

interface Checkpoint {
  id: number
  slug: string
  name_en: string
  name_th: string
  type: string
  completed: boolean
}

interface UserData {
  name: string
  email: string
  qr_token: string
  quiz_type: string | null
  checkpoints: Checkpoint[]
  checkpoint_count: number
  total_checkpoints: number
  pre_survey_completed: boolean
  post_survey_completed: boolean
  reward_claimed: boolean
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/dashboard')
      const data = await res.json()
      setUserData(data)
      
      if (data.qr_token) {
        const url = await QRCode.toDataURL(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://hoop.exhibition'}/scan/${data.qr_token}`, {
          width: 300,
          margin: 2,
          color: { dark: '#14b8a6', light: '#0a0a0f' }
        })
        setQrCodeUrl(url)
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    }
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  if (!userData) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Please login to view your dashboard</p>
          <a href="/login" className="text-primary hover:underline">Login</a>
        </div>
      </main>
    )
  }

  const canClaimReward = userData.checkpoint_count >= userData.total_checkpoints && userData.post_survey_completed && !userData.reward_claimed

  return (
    <main className="relative min-h-dvh gradient-bg">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        {userData.checkpoint_count >= userData.total_checkpoints && (
          <motion.div
            className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-accent/20 blur-[60px]"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      <div className="relative z-10 min-h-dvh px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold">Welcome, {userData.name}</h1>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="font-semibold">Your QR Code</span>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-sm text-primary hover:underline"
            >
              {showQR ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showQR && qrCodeUrl ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 rounded-2xl bg-white">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            </motion.div>
          ) : (
            <div className="h-48 flex items-center justify-center rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">Tap &quot;Show&quot; to display your QR code</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center mt-3">
            Show this to staff at each checkpoint
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="font-semibold">Progress</span>
            </div>
            <span className="font-display text-2xl font-bold text-primary">
              {userData.checkpoint_count} / {userData.total_checkpoints}
            </span>
          </div>
          
          <div className="h-3 rounded-full bg-secondary overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(userData.checkpoint_count / userData.total_checkpoints) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          {userData.checkpoint_count >= userData.total_checkpoints ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">All checkpoints completed!</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {userData.total_checkpoints - userData.checkpoint_count} more to unlock your reward
            </p>
          )}
        </motion.div>

        {/* Checkpoints Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Checkpoints
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {userData.checkpoints.map((checkpoint, idx) => (
              <motion.div
                key={checkpoint.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className={`glass rounded-xl p-4 text-center transition-all ${
                  checkpoint.completed 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  checkpoint.completed 
                    ? 'bg-primary/20' 
                    : 'bg-secondary'
                }`}>
                  {checkpoint.completed ? (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                  )}
                </div>
                <h3 className={`font-medium text-sm ${checkpoint.completed ? 'text-primary' : ''}`}>
                  {checkpoint.name_en}
                </h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {checkpoint.type}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Surveys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 mb-6"
        >
          <h2 className="font-semibold mb-4">Surveys</h2>
          
          <div className={`glass rounded-xl p-4 flex items-center justify-between ${
            userData.pre_survey_completed ? 'border-primary/30' : 'border-border'
          }`}>
            <div className="flex items-center gap-3">
              {userData.pre_survey_completed ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
              )}
              <span>Pre-Event Survey</span>
            </div>
            {userData.pre_survey_completed ? (
              <span className="text-sm text-primary">Completed</span>
            ) : (
              <a href="/survey/pre" className="text-sm text-primary hover:underline">
                Take Survey
              </a>
            )}
          </div>

          <div className={`glass rounded-xl p-4 flex items-center justify-between ${
            userData.post_survey_completed ? 'border-primary/30' : 'border-border'
          }`}>
            <div className="flex items-center gap-3">
              {userData.post_survey_completed ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : userData.checkpoint_count >= userData.total_checkpoints ? (
                <Sparkles className="h-5 w-5 text-accent" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              <span>Post-Event Survey</span>
            </div>
            {userData.post_survey_completed ? (
              <span className="text-sm text-primary">Completed</span>
            ) : userData.checkpoint_count >= userData.total_checkpoints ? (
              <a href="/survey/post" className="text-sm text-primary hover:underline">
                Take Survey
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Locked</span>
            )}
          </div>
        </motion.div>

        {/* Reward */}
        {canClaimReward && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-accent/30"
          >
            <div className="text-center">
              <Trophy className="h-12 w-12 text-accent mx-auto mb-4 animate-glow-pulse" />
              <h3 className="font-display text-xl font-bold mb-2">Reward Unlocked!</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Show this screen to claim your reward
              </p>
              <button
                onClick={() => alert('Show this to staff to claim your reward!')}
                className="w-full h-12 rounded-xl bg-accent text-accent-foreground font-semibold transition-all hover:scale-[1.02]"
              >
                Claim Reward
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
