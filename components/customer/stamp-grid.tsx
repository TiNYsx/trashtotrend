"use client"

import { useLanguage } from "@/components/providers"
import { StampItem } from "@/components/customer/stamp-item"
import { motion } from "framer-motion"

type Booth = {
  id: number
  name_en: string
  name_th: string
  description_en: string | null
  description_th: string | null
  image_url: string | null
  display_order: number
}

type Props = {
  booths: Booth[]
  stampedBoothIds: number[]
  onBoothClick: (booth: Booth) => void
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

export function StampGrid({ booths, stampedBoothIds, onBoothClick }: Props) {
  const { lang, t } = useLanguage()

  if (booths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">{t("noBooths")}</p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {booths.map((booth) => (
        <motion.div key={booth.id} variants={itemVariants}>
          <StampItem
            name={lang === "th" ? booth.name_th : booth.name_en}
            isStamped={stampedBoothIds.includes(booth.id)}
            onClick={() => onBoothClick(booth)}
            index={booth.display_order}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
