"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/providers"
import PhotobookCarousel from "@/components/photobook-carousel"
import { 
  ArrowRight, 
  MapPin
} from "lucide-react"

interface HomeClientProps {
  initialSettings: Record<string, string>
}

export default function HomeClient({ initialSettings }: HomeClientProps) {
  const { lang } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch(() => {
        // Autoplay was prevented, will try again on user interaction
      })
    }
  }, [])

  const t = {
    login: lang === 'th' ? 'เข้าสู่ระบบ' : 'Login',
    staffPortal: lang === 'th' ? 'พอร์ทัลเจ้าหน้าที่' : 'Staff Portal',
    startJourney: lang === 'th' ? 'เริ่มต้นการเดินทาง' : 'Start Your Journey',
    explore: lang === 'th' ? 'สำรวจ' : 'Explore',
    bringCan: lang === 'th' ? 'อย่าลืม: นำกระป๋องอะลูมิเนียมของคุณมาเพื่อเข้าร่วม' : 'Remember: Bring your own aluminium can to participate',
    footer: lang === 'th' ? 'นิทรรศการเศรษฐกิจหมุนเวียน • โครงการวงจรอะลูมิเนียม' : 'Circular Economy Exhibition • Aluminium Loop Initiative',
    tagline: lang === 'th' 
      ? (initialSettings.home_tagline_th || 'จากขยะสู่แนวโน้ม')
      : (initialSettings.home_tagline_en || 'From Trash to Trend'),
    description: lang === 'th' 
      ? (initialSettings.home_description_th || 'สัมผัสการเปลี่ยนแปลงของอะลูมิเนียมจากของเสียสู่คุณค่า เข้าร่วมการเดินทางสู่เศรษฐกิจหมุนเวียนและค้นพบว่าขยะกลายเป็นสมบัติได้อย่างไร')
      : (initialSettings.home_description_en || 'Experience the transformation of aluminium from waste to worth. Join our circular economy journey and discover how trash becomes treasure.'),
    title: lang === 'th'
      ? (initialSettings.home_title_th || 'นิทรรศการ HOOP')
      : (initialSettings.home_title_en || 'HOOP Creative Exhibition'),
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Faded Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/images/photobook/1st.jpg"
        >
          <source src="/images/photobook/photobook.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b" />
      </div>

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
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <Link href="/" className="group flex-shrink-0">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
              <Image
                src="/images/Hoop 1.png"
                alt="HOOP"
                width={56}
                height={56}
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageToggle />
            <Link
              href="/login"
              className="text-sm text-foreground font-medium transition-colors hover:text-primary hover:opacity-80 whitespace-nowrap drop-shadow-sm"
              style={{ textShadow: '0 1px 2px rgba(255,255,255,0.7)' }}
            >
              {t.login}
            </Link>
            <Link
              href="/staff/login"
              className="text-sm text-foreground font-medium transition-colors hover:text-primary hover:opacity-80 whitespace-nowrap drop-shadow-sm"
              style={{ textShadow: '0 1px 2px rgba(255,255,255,0.7)' }}
            >
              {t.staffPortal}
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
          <div className="text-center max-w-lg mx-auto space-y-6 sm:space-y-10 bg-background/70 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-lg">
            {/* Hoop Logo Image */}
            <div className="relative mx-auto animate-fade-in-up" style={{ animationDelay: '0s' }}>
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto">
                <Image
                  src="/images/Hoop main.png"
                  alt={t.title}
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 -z-10 mx-auto w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(192, 192, 192, 0.2) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold chrome-text">{t.tagline}</h2>
              <p className="text-foreground text-lg leading-relaxed font-medium animate-fade-in-up drop-shadow-sm" style={{ animationDelay: '0.2s', textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>
                {t.description}
              </p>
            </div>

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

              <div>
                <Link
                  href="/about"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl chrome-border glass font-medium transition-all hover:bg-secondary/30"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  {t.explore}
                </Link>
              </div>
            </div>

            {/* Requirement Notice */}
            <p className="text-sm text-foreground font-medium animate-fade-in-up drop-shadow-sm" style={{ animationDelay: '0.4s', textShadow: '0 1px 2px rgba(255,255,255,0.7)' }}>
              {t.bringCan}
            </p>
          </div>
        </div>

        {/* Photobook Carousel Section */}
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20 bg-background/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <PhotobookCarousel />
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 py-4 sm:px-6 sm:py-6 text-center">
          <p className="text-sm text-foreground font-medium break-words drop-shadow-sm" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
            {t.footer}
          </p>
        </footer>
      </div>
    </main>
  )
}
