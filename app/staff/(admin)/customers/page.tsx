import { redirect } from "next/navigation"
import { getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { CustomersClient } from "@/components/staff/customers-client"

export const dynamic = "force-dynamic"

type Customer = {
  id: number
  email: string
  registration_data: Record<string, string>
  created_at: string
  stamp_count: string
  ice_bath_registered: boolean | null
  ice_bath_time: string | null
  pre_survey_completed: boolean | null
  post_survey_completed: boolean | null
}

type Booth = {
  id: number
  name_en: string
  name_th: string
}

export default async function CustomersPage() {
  const session = await requireStaff()
  
  if (!session) {
    redirect("/staff/login")
  }
  
  let customers: Customer[] = []
  let booths: Booth[] = []

  try {
    customers = await getMany<Customer>(`
      SELECT 
        c.id, c.email, c.registration_data, c.created_at,
        c.ice_bath_registered, c.ice_bath_time,
        c.pre_survey_completed, c.post_survey_completed,
        COALESCE((SELECT COUNT(*) FROM stamps WHERE customer_id = c.id), 0)::text as stamp_count
      FROM customers c
      ORDER BY c.created_at DESC
    `)
    
    booths = await getMany<Booth>(
      "SELECT id, name_en, name_th FROM booths WHERE is_active = true ORDER BY display_order ASC"
    )
  } catch {
    // DB not connected
  }

  return <CustomersClient customers={customers} booths={booths} />
}