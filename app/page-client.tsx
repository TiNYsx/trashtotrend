"use client"

import Link from "next/link"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/providers"
import { 
  ArrowRight, 
  QrCode, 
  Trophy, 
  MapPin, 
  Sparkles,
  Recycle,
  Users,
  Zap
} from "lucide-react"

export default function HomeClient() {
  const { lang } = useLanguage()
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-float rounded-full bg-primary/20 blur-[128px]" />
          <div className="absolute right-1/4 top-1/2 h-80 w-80 animate-float rounded-full bg-accent/20 blur-[100px]" style={{ animationDelay: '-3s' }} />
          <div className="absolute bottom-1/4 left-1/2 h-72 w-72 animate-float rounded-full bg-primary/10 blur-[120px]" style={{ animationDelay: '-5s' }} />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/40 animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + i}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Recycle className="h-8 w-8 text-primary animate-rotate-slow" />
              <div className="absolute inset-0 animate-glow-pulse">
                <Recycle className="h-8 w-8 text-primary/50 blur-sm" />
              </div>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">HOOP</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/staff/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Staff Portal
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="text-center max-w-lg mx-auto space-y-8">
            {/* Title */}
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="font-display text-7xl md:text-8xl font-bold tracking-tight text-primary text-glow">
                Hoop
              </h1>
              <p className="font-display text-xl md:text-2xl font-medium text-muted-foreground">
                From Trash to Trend
              </p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {lang === 'th' 
                ? 'สัมผัสการเปลี่ยนแปลงของอะลูมิเนียมจากของเสียสู่คุณค่า เข้าร่วมการเดินทางสู่เศรษฐกิจหมุนเวียนและค้นพบว่าขยะกลายเป็นสมบัติได้อย่างไร'
                : 'Experience the transformation of aluminium from waste to worth. Join our circular economy journey and discover how trash becomes treasure.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/quiz"
                className="group relative flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:scale-[1.02] glow-primary"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 rounded-xl animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]" />
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/about"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border glass font-medium transition-all hover:bg-secondary/50"
                >
                  <MapPin className="h-4 w-4" />
                  Explore
                </Link>
                <Link
                  href="/ice-bath"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-accent/50 glass font-medium transition-all hover:bg-accent/10 group"
                >
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="text-accent">Ice Bath</span>
                </Link>
              </div>
            </div>

            {/* Requirement Notice */}
            <p className="text-xs text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Remember: Bring your own aluminium can to participate
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="px-6 pb-12">
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <FeatureCard
              icon={<QrCode className="h-5 w-5" />}
              title="Scan & Collect"
              description="Check in at booths"
              delay={0.4}
            />
            <FeatureCard
              icon={<Trophy className="h-5 w-5" />}
              title="Earn Rewards"
              description="Complete all 7 stations"
              delay={0.5}
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Join the Loop"
              description="Circular economy"
              delay={0.6}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Circular Economy Exhibition • Aluminium Loop Initiative
          </p>
        </footer>
      </div>
    </main>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  delay 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}) {
  return (
    <div 
      className="group glass rounded-xl p-4 text-center transition-all hover:bg-secondary/30 animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex justify-center mb-2 text-primary group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
