'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Snowflake, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react'

interface EventSettings {
  ice_bath_capacity: string
  ice_bath_open_date: string
}

export default function IceBathPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null)
  const [currentCount, setCurrentCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', contact: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'closed' | 'open' | 'full' | 'success'>('closed')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [settingsRes, countRes] = await Promise.all([
        fetch('/api/ice-bath/settings'),
        fetch('/api/ice-bath/count')
      ])
      const settingsData = await settingsRes.json()
      const countData = await countRes.json()
      
      setSettings(settingsData)
      setCurrentCount(countData.count || 0)
      
      const capacity = parseInt(settingsData.ice_bath_capacity || '50')
      const openDate = new Date(settingsData.ice_bath_open_date || '2026-04-20')
      const now = new Date()
      
      if (now < openDate) {
        setStatus('closed')
      } else if (countData.count >= capacity) {
        setStatus('full')
      } else {
        setStatus('open')
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/ice-bath/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setStatus('success')
        setCurrentCount(prev => prev + 1)
      } else {
        const data = await res.json()
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center gradient-bg">
        <div className="text-center space-y-4">
          <Snowflake className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  const capacity = parseInt(settings?.ice_bath_capacity || '50')
  const openDate = new Date(settings?.ice_bath_open_date || '2026-04-20')
  const spotsLeft = capacity - currentCount

  return (
    <main className="relative min-h-dvh gradient-bg">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[100px]"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 h-48 w-48 rounded-full bg-primary/20 blur-[80px]"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: -2 }}
        />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-accent" />
            <span className="font-display font-bold">HOOP</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4"
            >
              <Snowflake className="h-10 w-10 text-accent animate-glow-pulse" />
            </motion.div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Ice Bath Experience
            </h1>
            <p className="text-muted-foreground">
              Challenge yourself with our exclusive arctic immersion
            </p>
          </motion.div>

          {/* Status Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full space-y-4"
          >
            {/* Availability */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Available Spots</span>
                </div>
                <span className="font-display text-2xl font-bold text-primary">
                  {spotsLeft} / {capacity}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(spotsLeft / capacity) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Status Message */}
            {status === 'closed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-6 border border-accent/30"
              >
                <div className="flex items-start gap-4">
                  <Calendar className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Registration Opens Soon</h3>
                    <p className="text-sm text-muted-foreground">
                      Ice Bath registration opens on {openDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'full' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-6 border border-destructive/30"
              >
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Fully Booked</h3>
                    <p className="text-sm text-muted-foreground">
                      All spots have been claimed. Check back for cancellations.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-6 border border-primary/30"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-primary">Registration Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      You're registered for the Ice Bath experience. See you there!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Registration Form */}
            {status === 'open' && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubmit}
                className="glass rounded-2xl p-6 space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact (Phone/Line)</label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Phone number or Line ID"
                  />
                </div>
                
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Registering...'
                  ) : (
                    <>
                      <span>Reserve Your Spot</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  )
}
