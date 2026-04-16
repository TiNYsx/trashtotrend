import { getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { ScannerClient } from "@/components/staff/scanner-client"

type Checkpoint = {
  id: number
  slug: string
  name_en: string
  name_th: string
}

export default async function ScanPage() {
  await requireStaff()
  let checkpoints: Checkpoint[] = []

  try {
    checkpoints = await getMany<Checkpoint>(
      "SELECT id, slug, name_en, name_th FROM checkpoints WHERE is_active = true ORDER BY display_order ASC"
    )
  } catch {
    // DB not connected
  }

  return <ScannerClient checkpoints={checkpoints} />
}
