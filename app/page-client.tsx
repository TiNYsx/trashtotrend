"use client"

import Link from "next/link"
import Image from "next/image"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/providers"
import { 
  ArrowRight, 
  QrCode, 
  Trophy, 
  MapPin,
  Zap
} from "lucide-react"

export default function HomeClient() {
  const { lang } = useLanguage()

  const t = {
    login: lang === 'th' ? 'เข้าสู่ระบบ' : 'Login',
    staffPortal: lang === 'th' ? 'พอร์ทัลเจ้าหน้าที่' : 'Staff Portal',
    startJourney: lang === 'th' ? 'เริ่มต้นการเดินทาง' : 'Start Your Journey',
    explore: lang === 'th' ? 'สำรวจ' : 'Explore',
    scanCollect: lang === 'th' ? 'สแกนและสะสม' : 'Scan & Collect',
    scanDesc: lang === 'th' ? 'เช็คอินที่บูธ' : 'Check in at booths',
    earnRewards: lang === 'th' ? 'รับรางวัล' : 'Earn Rewards',
    rewardsDesc: lang === 'th' ? 'ทำ миссияทั้งหมด' : 'Complete all missions',
    joinLoop: lang === 'th' ? 'เข้าร่วมวงจร' : 'Join the Loop',
    loopDesc: lang === 'th' ? 'เศรษฐกิจหมุนเวียน' : 'Circular economy',
    bringCan: lang === 'th' ? 'อย่าลืม: นำกระป๋องอะลูมิเนียมของคุณมาเพื่อเข้าร่วม' : 'Remember: Bring your own aluminium can to participate',
    footer: lang === 'th' ? 'นิทรรศการเศรษฐกิจหมุนเวียน • โครงการวงจรอะลูมิเนียม' : 'Circular Economy Exhibition • Aluminium Loop Initiative',
    tagline: 'From Trash to Trend',
    taglineTh: 'จากขยะสู่แนวโน้ม',
    description: lang === 'th' 
      ? 'สัมผัสการเปลี่ยนแปลงของอะลูมิเนียมจากของเสียสู่คุณค่า เข้าร่วมการเดินทางสู่เศรษฐกิจหมุนเวียนและค้นพบว่าขยะกลายเป็นสมบัติได้อย่างไร'
      : 'Experience the transformation of aluminium from waste to worth. Join our circular economy journey and discover how trash becomes treasure.',
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg">
        {/* Chrome gradient overlay */}
        <div className="absolute inset-0 opacity-40" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(192, 192, 192, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(128, 128, 128, 0.1) 0%, transparent 40%)'
        }} />
        
        {/* Floating orbs */}
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-float rounded-full" style={{
          background: 'radial-gradient(circle, rgba(192, 192, 192, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }} />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] animate-float rounded-full" style={{
          background: 'radial-gradient(circle, rgba(150, 150, 170, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '-3s'
        }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: i % 3 === 0 ? '4px' : '2px',
              height: i % 3 === 0 ? '4px' : '2px',
              background: i % 2 === 0 ? 'rgba(192, 192, 192, 0.4)' : 'rgba(160, 160, 180, 0.3)',
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 22}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${6 + i}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="group">
            <div className="relative w-14 h-14">
              <Image
                src="/images/Hoop 1.png"
                alt="HOOP"
                width={56}
                height={56}
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>
          </Link>
          <div className="flex items-center gap-5">
            <LanguageToggle />
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:opacity-80"
            >
              {t.login}
            </Link>
            <Link
              href="/staff/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:opacity-80"
            >
              {t.staffPortal}
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="text-center max-w-lg mx-auto space-y-10">
            {/* Hoop Logo Image */}
            <div className="relative mx-auto animate-fade-in-up" style={{ animationDelay: '0s' }}>
              <div className="relative w-72 h-72 mx-auto">
                <Image
                  src="/images/Hoop main.png"
                  alt="HOOP"
                  width={288}
                  height={288}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 -z-10 mx-auto w-96 h-96 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(192, 192, 192, 0.2) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }} />
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 pt-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/quiz"
                className="group relative flex h-14 items-center justify-center gap-3 rounded-xl chrome-button font-semibold transition-all hover:scale-[1.02] glow-primary"
              >
                <span className="chrome-text">{t.startJourney}</span>
                <ArrowRight className="h-5 w-5 chrome-text-subtle transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 rounded-xl animate-chrome-shine" />
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/about"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl chrome-border glass font-medium transition-all hover:bg-secondary/30"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  {t.explore}
                </Link>
                <Link
                  href="/ice-bath"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl chrome-border glass font-medium transition-all hover:bg-secondary/30 group"
                >
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="text-accent">Ice Bath</span>
                </Link>
              </div>
            </div>

            {/* Requirement Notice */}
            <p className="text-xs text-muted-foreground/70 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {t.bringCan}
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="px-6 pb-12">
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <FeatureCard
              icon={<QrCode className="h-5 w-5" />}
              title={t.scanCollect}
              description={t.scanDesc}
              delay={0.4}
            />
            <FeatureCard
              icon={<Trophy className="h-5 w-5" />}
              title={t.earnRewards}
              description={t.rewardsDesc}
              delay={0.5}
            />
            <FeatureCard
              icon={<MapPin className="h-5 w-5" />}
              title={t.joinLoop}
              description={t.loopDesc}
              delay={0.6}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            {t.footer}
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
      className="group rounded-xl p-4 text-center transition-all hover:bg-secondary/20 animate-fade-in-up chrome-border glass"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex justify-center mb-2 text-primary group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1 text-primary">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
