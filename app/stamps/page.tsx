import { requireCustomer } from "@/lib/auth"
import { getMany, getOne } from "@/lib/db"
import { StampPageClient } from "@/components/customer/stamp-page-client"

type Booth = {
  id: number
  name_en: string
  name_th: string
  description_en: string | null
  description_th: string | null
  image_url: string | null
  display_order: number
}

type Stamp = {
  booth_id: number
  scanned_at: string
}

export default async function StampsPage() {
  const session = await requireCustomer()

  let booths: Booth[] = []
  let stamps: Stamp[] = []
  let qrToken = ""

  try {
    booths = await getMany<Booth>(
      "SELECT id, name_en, name_th, description_en, description_th, image_url, display_order FROM booths WHERE is_active = true ORDER BY display_order ASC"
    )
    stamps = await getMany<Stamp>(
      "SELECT booth_id, scanned_at FROM stamps WHERE customer_id = $1",
      [session.id]
    )
    const customer = await getOne<{ qr_token: string }>(
      "SELECT qr_token FROM customers WHERE id = $1",
      [session.id]
    )
    qrToken = customer?.qr_token || ""
  } catch {
    // DB not connected
  }

  const stampedBoothIds = new Set(stamps.map((s) => s.booth_id))

  return (
    <StampPageClient
      booths={booths}
      stampedBoothIds={Array.from(stampedBoothIds)}
      totalBooths={booths.length}
      totalStamped={stampedBoothIds.size}
      qrToken={qrToken}
      customerEmail={session.email || ""}
    />
  )
}
