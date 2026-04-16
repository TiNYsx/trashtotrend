"use client"

import Link from 'next/link'
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
    <main className="relative min-h-dvh gradient-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-accent/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="relative z-10 min-h-dvh px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="font-display font-bold">HOOP</span>
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

        <div className="max-w-lg mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="font-display text-4xl font-bold">{t.aboutHoop}</h1>
            <p className="text-xl text-accent italic">{t.fromTrashToTrend}</p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">{t.ourMission}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t.missionDesc}</p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Recycle className="h-5 w-5 text-accent" />
              </div>
              <h2 className="font-display text-xl font-bold">{t.circularEconomy}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t.circularDesc}</p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-2/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-chart-2" />
              </div>
              <h2 className="font-display text-xl font-bold">{t.envImpact}</h2>
            </div>
            <div className="space-y-3">
              <p className="text-muted-foreground">{t.byParticipating}</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t.reduceWaste}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t.saveEnergy}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t.supportLocal}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t.createAwareness}
                </li>
              </ul>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-chart-3" />
              </div>
              <h2 className="font-display text-xl font-bold">{t.partners}</h2>
            </div>
            <p className="text-muted-foreground text-sm">{t.partnersDesc}</p>
          </div>

          <div className="text-center space-y-4">
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-2 h-14 px-8 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:scale-[1.02] glow-primary"
            >
              <span>{t.startJourney}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
