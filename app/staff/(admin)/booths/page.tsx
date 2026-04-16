import { redirect } from "next/navigation"
import { getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { BoothsManager } from "@/components/staff/booths-manager"

type Booth = {
  id: number
  name_en: string
  name_th: string
  description_en: string | null
  description_th: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

export default async function BoothsPage() {
  const session = await requireStaff()
  
  if (!session) {
    redirect("/staff/login")
  }
  
  let booths: Booth[] = []
  try {
    booths = await getMany<Booth>("SELECT * FROM booths ORDER BY display_order ASC")
  } catch {
    // DB not connected
  }

  return <BoothsManager initialBooths={booths} />
}
