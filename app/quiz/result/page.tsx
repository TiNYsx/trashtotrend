'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Recycle, MapPin, Sparkles } from 'lucide-react'

const PERSONA_INFO = {
  A: {
    name: 'Creator',
    tagline: 'You transform waste into wonder',
    description: 'You see potential in everything discarded. Your creative spirit turns the overlooked into the extraordinary.',
    activities: ['Art Workshop', 'Embossing Station', 'Design Challenge'],
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary',
  },
  B: {
    name: 'Observer',
    tagline: 'You seek understanding before action',
    description: 'You pause to absorb and reflect. Your careful observation reveals hidden truths others miss.',
    activities: ['Art Showcase', 'Talk Sessions', 'Information Stations'],
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/20',
    borderColor: 'border-chart-3',
  },
  C: {
    name: 'Player',
    tagline: 'You dive in and discover through action',
    description: 'You learn by doing. Your adventurous spirit turns every activity into an exciting challenge.',
    activities: ['Hoop the Can', 'Hidden Can Puzzle', 'Interactive Games'],
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/20',
    borderColor: 'border-chart-4',
  },
  D: {
    name: 'Explorer',
    tagline: 'You find beauty in unexpected places',
    description: 'You wander with curious eyes. Every corner holds potential for discovery and wonder.',
    activities: ['Hidden Can Hunt', 'Social Media Trail', 'Discovery Walk'],
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/20',
    borderColor: 'border-chart-2',
  },
  E: {
    name: 'Resetter',
    tagline: 'You restore balance and clarity',
    description: 'You simplify the complex. Your thoughtful approach brings order and meaning to chaos.',
    activities: ['Note Loop', 'Message Exchange', 'Reflection Space'],
    color: 'text-accent',
    bgColor: 'bg-accent/20',
    borderColor: 'border-accent',
  },
}

export default function QuizResultPage() {
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') || 'A') as keyof typeof PERSONA_INFO
  const info = PERSONA_INFO[type] || PERSONA_INFO.A

  return (
    <main className="relative min-h-dvh gradient-bg overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full ${info.bgColor} blur-[120px]`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Your Personality Type</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${info.bgColor} border-4 ${info.borderColor} mb-4`}
          >
            <Recycle className={`h-12 w-12 ${info.color} animate-rotate-slow`} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`font-display text-5xl font-bold ${info.color} text-glow mb-2`}
          >
            {info.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-medium text-foreground/80"
          >
            {info.tagline}
          </motion.p>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 mb-6 max-w-md mx-auto w-full"
        >
          <p className="text-center text-muted-foreground leading-relaxed">
            {info.description}
          </p>
        </motion.div>

        {/* Recommended Activities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 mb-8 max-w-md mx-auto w-full"
        >
          <h3 className={`font-display font-bold ${info.color} mb-4 flex items-center gap-2`}>
            <MapPin className="h-5 w-5" />
            Recommended Activities
          </h3>
          <div className="space-y-2">
            {info.activities.map((activity, idx) => (
              <motion.div
                key={activity}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
              >
                <div className={`w-2 h-2 rounded-full ${info.borderColor.replace('border', 'bg')}`} />
                <span className="font-medium">{activity}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3 max-w-md mx-auto w-full mt-auto"
        >
          <Link
            href="/event/register"
            className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:scale-[1.02] glow-primary"
          >
            <span>Register for Event</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link
            href="/"
            className="flex h-12 items-center justify-center rounded-xl border border-border glass font-medium transition-all hover:bg-secondary/50"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
