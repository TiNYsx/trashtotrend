'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Recycle, MapPin, Sparkles } from 'lucide-react'
import { useLanguage } from '@/components/providers'

const PERSONA_INFO = {
  A: {
    name: 'Creator',
    nameTh: 'ผู้สร้างสรรค์',
    tagline: 'You transform waste into wonder',
    taglineTh: 'คุณเปลี่ยนของเสียเป็นสิ่งมหัศจรรย์',
    description: 'You see potential in everything discarded. Your creative spirit turns the overlooked into the extraordinary.',
    descriptionTh: 'คุณเห็นศักยภาพในทุกสิ่งที่ถูกทิ้ง จิตวิญญาณสร้างสรรค์ของคุณเปลี่ยนสิ่งที่ถูกมองข้ามให้กลายเป็นสิ่งพิเศษ',
    activities: ['Art Workshop', 'Embossing Station', 'Design Challenge'],
    activitiesTh: ['เวิร์คช็อปศิลปะ', 'จุดปั๊มลาย', 'ดีไซน์แชเลนจ์'],
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary',
  },
  B: {
    name: 'Observer',
    nameTh: 'ผู้สังเกตการณ์',
    tagline: 'You seek understanding before action',
    taglineTh: 'คุณแสวงหาความเข้าใจก่อนลงมือทำ',
    description: 'You pause to absorb and reflect. Your careful observation reveals hidden truths others miss.',
    descriptionTh: 'คุณหยุดเพื่อซึมซับและไตร่ตรอง การสังเกตอย่างระมัดระวังของคุณเปิดเผยความจริงที่ซ่อนเร้นที่ผู้อื่นพลาด',
    activities: ['Art Showcase', 'Talk Sessions', 'Information Stations'],
    activitiesTh: ['งานแสดงศิลปะ', 'ห้องเสวนา', 'จุดข้อมูล'],
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/20',
    borderColor: 'border-chart-3',
  },
  C: {
    name: 'Player',
    nameTh: 'ผู้เล่น',
    tagline: 'You dive in and discover through action',
    taglineTh: 'คุณลงมือทำและค้นพบผ่านการกระทำ',
    description: 'You learn by doing. Your adventurous spirit turns every activity into an exciting challenge.',
    descriptionTh: 'คุณเรียนรู้โดยการลงมือทำ จิตวิญญาณผจญภัยของคุณเปลี่ยนทุกกิจกรรมให้กลายเป็นความท้าทายที่น่าตื่นเต้น',
    activities: ['Hoop the Can', 'Hidden Can Puzzle', 'Interactive Games'],
    activitiesTh: ['หวดกระป๋อง', 'ปริศนากระป๋องซ่อน', 'เกมโต้ตอบ'],
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/20',
    borderColor: 'border-chart-4',
  },
  D: {
    name: 'Explorer',
    nameTh: 'ผู้สำรวจ',
    tagline: 'You find beauty in unexpected places',
    taglineTh: 'คุณค้นพบความงามในที่ที่ไม่คาดคิด',
    description: 'You wander with curious eyes. Every corner holds potential for discovery and wonder.',
    descriptionTh: 'คุณเดินทางด้วยดวงตาที่อยากรู้ ทุกมุมมีศักยภาพสำหรับการค้นพบและความมหัศจรรย์',
    activities: ['Hidden Can Hunt', 'Social Media Trail', 'Discovery Walk'],
    activitiesTh: ['ล่ากระป๋องซ่อน', 'เส้นทางโซเชียลมีเดีย', 'เดินค้นพบ'],
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/20',
    borderColor: 'border-chart-2',
  },
  E: {
    name: 'Resetter',
    nameTh: 'ผู้ตั้งค่าใหม่',
    tagline: 'You restore balance and clarity',
    taglineTh: 'คุณฟื้นฟูความสมดุลและความชัดเจน',
    description: 'You simplify the complex. Your thoughtful approach brings order and meaning to chaos.',
    descriptionTh: 'คุณทำให้สิ่งซับซ้อนง่ายขึ้น แนวทางที่รอบคอบของคุณนำความเป็นระเบียบและความหมายมาสู่ความวุ่นวาย',
    activities: ['Note Loop', 'Message Exchange', 'Reflection Space'],
    activitiesTh: ['วงโน้ต', 'แลกเปลี่ยนข้อความ', 'พื้นที่สะท้อนคิด'],
    color: 'text-accent',
    bgColor: 'bg-accent/20',
    borderColor: 'border-accent',
  },
}

export default function QuizResultPage() {
  const searchParams = useSearchParams()
  const { lang } = useLanguage()
  const type = (searchParams.get('type') || 'A') as keyof typeof PERSONA_INFO
  const info = PERSONA_INFO[type] || PERSONA_INFO.A

  const t = {
    yourType: lang === 'th' ? 'ประเภทบุคลิกภาพของคุณ' : 'Your Personality Type',
    recommended: lang === 'th' ? 'กิจกรรมแนะนำ' : 'Recommended Activities',
    registerEvent: lang === 'th' ? 'ลงทะเบียนเข้าร่วมงาน' : 'Register for Event',
    backHome: lang === 'th' ? 'กลับสู่หน้าหลัก' : 'Back to Home',
  }

  return (
    <main className="relative min-h-dvh gradient-bg overflow-hidden">
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
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">{t.yourType}</span>
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
            {lang === 'th' ? info.nameTh : info.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-medium text-foreground/80"
          >
            {lang === 'th' ? info.taglineTh : info.tagline}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 mb-6 max-w-md mx-auto w-full"
        >
          <p className="text-center text-muted-foreground leading-relaxed">
            {lang === 'th' ? info.descriptionTh : info.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 mb-8 max-w-md mx-auto w-full"
        >
          <h3 className={`font-display font-bold ${info.color} mb-4 flex items-center gap-2`}>
            <MapPin className="h-5 w-5" />
            {t.recommended}
          </h3>
          <div className="space-y-2">
            {(lang === 'th' ? info.activitiesTh : info.activities).map((activity, idx) => (
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
            <span>{t.registerEvent}</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link
            href="/"
            className="flex h-12 items-center justify-center rounded-xl border border-border glass font-medium transition-all hover:bg-secondary/50"
          >
            {t.backHome}
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
