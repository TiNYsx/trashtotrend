"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Snowflake, Calendar, Zap, Globe, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Settings {
  ice_bath_capacity: string
  ice_bath_open_date: string
  event_date: string
  quiz_enabled: string
  home_title_en: string
  home_title_th: string
  home_tagline_en: string
  home_tagline_th: string
  home_description_en: string
  home_description_th: string
  about_mission_en: string
  about_mission_th: string
  about_circular_en: string
  about_circular_th: string
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<Settings>({
    ice_bath_capacity: '50',
    ice_bath_open_date: '2026-04-20',
    event_date: '2026-04-25',
    quiz_enabled: 'true',
    home_title_en: 'HOOP Creative Exhibition',
    home_title_th: 'นิทรรศการ HOOP',
    home_tagline_en: 'From Trash to Trend',
    home_tagline_th: 'จากขยะสู่แฟชั่น',
    home_description_en: 'Experience the transformation of aluminium from waste to worth.',
    home_description_th: 'สัมผัสการเปลี่ยนแปลงของอะลูมิเนียมจากขยะสู่คุณค่า',
    about_mission_en: '',
    about_mission_th: '',
    about_circular_en: '',
    about_circular_th: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(prev => ({ ...prev, ...data }))
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (res.ok) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (err) {
      toast.error('Failed to save settings')
    }
    setIsSaving(false)
  }

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure event settings and content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Ice Bath Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Snowflake className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Ice Bath</h2>
            <p className="text-sm text-muted-foreground">Configure ice bath registration settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Capacity</label>
            <input
              type="number"
              value={settings.ice_bath_capacity}
              onChange={(e) => handleChange('ice_bath_capacity', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Open Date</label>
            <input
              type="date"
              value={settings.ice_bath_open_date}
              onChange={(e) => handleChange('ice_bath_open_date', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Event Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Event</h2>
            <p className="text-sm text-muted-foreground">General event settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Date</label>
            <input
              type="date"
              value={settings.event_date}
              onChange={(e) => handleChange('event_date', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quiz Enabled</label>
            <select
              value={settings.quiz_enabled}
              onChange={(e) => handleChange('quiz_enabled', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Home Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-chart-2/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Home Page Content</h2>
            <p className="text-sm text-muted-foreground">Customize homepage text and messaging</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (English)</label>
              <input
                type="text"
                value={settings.home_title_en}
                onChange={(e) => handleChange('home_title_en', e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (Thai)</label>
              <input
                type="text"
                value={settings.home_title_th}
                onChange={(e) => handleChange('home_title_th', e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline (English)</label>
              <input
                type="text"
                value={settings.home_tagline_en}
                onChange={(e) => handleChange('home_tagline_en', e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline (Thai)</label>
              <input
                type="text"
                value={settings.home_tagline_th}
                onChange={(e) => handleChange('home_tagline_th', e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (English)</label>
              <textarea
                value={settings.home_description_en}
                onChange={(e) => handleChange('home_description_en', e.target.value)}
                className="w-full h-24 px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Thai)</label>
              <textarea
                value={settings.home_description_th}
                onChange={(e) => handleChange('home_description_th', e.target.value)}
                className="w-full h-24 px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* About Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
            <Globe className="h-5 w-5 text-chart-3" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">About Page Content</h2>
            <p className="text-sm text-muted-foreground">Customize about page text</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mission (English)</label>
            <textarea
              value={settings.about_mission_en}
              onChange={(e) => handleChange('about_mission_en', e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none"
              placeholder="Our mission..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mission (Thai)</label>
            <textarea
              value={settings.about_mission_th}
              onChange={(e) => handleChange('about_mission_th', e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none"
              placeholder="พันธกิจของเรา..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Circular Economy (English)</label>
            <textarea
              value={settings.about_circular_en}
              onChange={(e) => handleChange('about_circular_en', e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none"
              placeholder="About circular economy..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Circular Economy (Thai)</label>
            <textarea
              value={settings.about_circular_th}
              onChange={(e) => handleChange('about_circular_th', e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none"
              placeholder="เกี่ยวกับเศรษฐกิจหมุนเวียน..."
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
