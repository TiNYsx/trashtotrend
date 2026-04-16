import { getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { ScannerClient } from "@/components/staff/scanner-client"

type Booth = {
  id: number
  name_en: string
  name_th: string
}

export default async function ScanPage() {
  await requireStaff()
  let booths: Booth[] = []

  try {
    booths = await getMany<Booth>(
      "SELECT id, name_en, name_th FROM booths WHERE is_active = true ORDER BY display_order ASC"
    )
  } catch {
    // DB not connected
  }

  return <ScannerClient booths={booths} />
}
