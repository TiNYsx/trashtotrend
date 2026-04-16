"use client"

import Link from 'next/link'
import Image from 'next/image'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers'
import { ArrowLeft, Recycle, Leaf, Users, Globe, ArrowRight } from 'lucide-react'

export default function AboutClient() {
  const { lang } = useLanguage()

  const t = {
    back: lang === 'th' ? 'กลับ' : 'Back',
    aboutHoop: lang === 'th' ? 'เกี่ยวกับ HOOP' : 'About HOOP',
    fromTrashToTrend: lang === 'th' ? 'จากขยะสู่แนวโน้ม' : 'From Trash to Trend',
    ourMission: lang === 'th' ? 'พันธกิจของเรา' : 'Our Mission',
    missionDesc: lang === 'th' 
      ? 'HOOP คือนิทรรศการสร้างสรรค์ที่สำรวจการเปลี่ยนแปลงของอะลูมิเนียมจากของเสียสู่คุณค่า เราเชื่อว่าสิ่งที่สังคมทิ้งสามารถกลายเป็นสิ่งมีคุณค่าผ่านนวัตกรรม ความคิดสร้างสรรค์ และการบริโภคอย่างมีสติ'
      : 'HOOP is a creative exhibition exploring the transformation of aluminium from waste to worth. We believe that what society discards can become something valuable through innovation, creativity, and conscious consumption.',
    circularEconomy: lang === 'th' ? 'เศรษฐกิจหมุนเวียน' : 'Circular Economy',
    circularDesc: lang === 'th'
      ? 'วงจรอะลูมิเนียมเป็นหนึ่งในระบบรีไซเคิลที่มีประสิทธิภาพมากที่สุดในโลก คุณทราบหรือไม่ว่าอะลูมิเนียมสามารถรีไซเคิลได้ไม่สิ้นสุดโดยไม่สูญเสียคุณภาพ? ทุกกระป๋องที่คุณนำมาจะกลายเป็นส่วนหนึ่งของวงจรการฟื้นฟูที่ไม่มีที่สิ้นสุด'
      : 'The aluminium loop represents one of the most efficient recycling systems on Earth. Did you know that aluminium can be recycled infinitely without losing quality? Every can you bring becomes part of this endless cycle of renewal.',
    envImpact: lang === 'th' ? 'ผลกระทบต่อสิ่งแวดล้อม' : 'Environmental Impact',
    byParticipating: lang === 'th' ? 'เมื่อเข้าร่วม คุณช่วย:' : 'By participating, you help:',
    reduceWaste: lang === 'th' ? 'ลดของเสียในหลุมฝังกลบ' : 'Reduce landfill waste',
    saveEnergy: lang === 'th' ? 'ประหยัดพลังงาน 95% เมื่อเทียบกับการผลิตอะลูมิเนียมใหม่' : 'Save 95% energy compared to new aluminium production',
    supportLocal: lang === 'th' ? 'สนับสนุนโครงการรีไซเคิลในท้องถิ่น' : 'Support local recycling initiatives',
    createAwareness: lang === 'th' ? 'สร้างความตระหนักเกี่ยวกับแนวปฏิบัติที่ยั่งยืน' : 'Create awareness for sustainable practices',
    partners: lang === 'th' ? 'พันธมิตรและผู้สนับสนุน' : 'Partners & Sponsors',
    partnersDesc: lang === 'th'
      ? 'งานนิทรรศการนี้เป็นไปได้ด้วยความร่วมมือกับองค์กรด้านสิ่งแวดล้อม ธุรกิจท้องถิ่น และชุมชนสร้างสรรค์ที่มุ่งมั่นต่อความยั่งยืน'
      : 'This exhibition is made possible through partnerships with environmental organizations, local businesses, and creative communities committed to sustainability.',
    startJourney: lang === 'th' ? 'เริ่มต้นการเดินทาง' : 'Start Your Journey',
  }

  return (
    <main className="relative min-h-dvh gradient-bg overflow-hidden">
      {/* Chrome Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full animate-float" style={{
          background: 'radial-gradient(circle, rgba(192, 192, 192, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full animate-float" style={{
          background: 'radial-gradient(circle, rgba(150, 150, 170, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animationDelay: '-4s'
        }} />
      </div>

      <div className="relative z-10 min-h-dvh px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/images/Hoop 1.png"
                alt="HOOP"
                width={40}
                height={40}
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <span className="font-display text-xl font-bold chrome-text">HOOP</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">{t.back}</span>
            </Link>
          </div>
        </div>

        <div className="max-w-lg mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src="/images/Hoop 1.png"
                alt="HOOP"
                width={128}
                height={128}
                className="object-contain drop-shadow-xl"
              />
            </div>
            <h1 className="font-display text-4xl font-bold chrome-text">{t.aboutHoop}</h1>
            <p className="text-lg chrome-text-subtle italic">{t.fromTrashToTrend}</p>
          </div>

          {/* Mission Card */}
          <div className="rounded-2xl p-6 space-y-4 chrome-border glass">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)'
              }}>
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold chrome-text-subtle">{t.ourMission}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t.missionDesc}</p>
          </div>

          {/* Circular Economy Card */}
          <div className="rounded-2xl p-6 space-y-4 chrome-border glass">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)'
              }}>
                <Recycle className="h-6 w-6 text-accent" />
              </div>
              <h2 className="font-display text-xl font-bold chrome-text-subtle">{t.circularEconomy}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t.circularDesc}</p>
          </div>

          {/* Environmental Impact Card */}
          <div className="rounded-2xl p-6 space-y-4 chrome-border glass">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)'
              }}>
                <Globe className="h-6 w-6 text-chart-2" />
              </div>
              <h2 className="font-display text-xl font-bold chrome-text-subtle">{t.envImpact}</h2>
            </div>
            <div className="space-y-3">
              <p className="text-muted-foreground">{t.byParticipating}</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-primary">{t.reduceWaste}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-primary">{t.saveEnergy}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-primary">{t.supportLocal}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-primary">{t.createAwareness}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Partners Card */}
          <div className="rounded-2xl p-6 space-y-4 chrome-border glass">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)'
              }}>
                <Users className="h-6 w-6 text-chart-3" />
              </div>
              <h2 className="font-display text-xl font-bold chrome-text-subtle">{t.partners}</h2>
            </div>
            <p className="text-muted-foreground text-sm">{t.partnersDesc}</p>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-3 h-14 px-8 rounded-xl chrome-button font-semibold transition-all hover:scale-[1.02]"
            >
              <span className="chrome-text">{t.startJourney}</span>
              <ArrowRight className="h-5 w-5 chrome-text-subtle transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
