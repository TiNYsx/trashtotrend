import { getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { CustomersTable } from "@/components/staff/customers-table"

type Customer = {
  id: number
  email: string
  registration_data: Record<string, string>
  created_at: string
  stamp_count: string
  quiz_count: string
}

export default async function CustomersPage() {
  await requireStaff()
  let customers: Customer[] = []

  try {
    customers = await getMany<Customer>(`
      SELECT 
        c.id, c.email, c.registration_data, c.created_at,
        COALESCE((SELECT COUNT(*) FROM stamps WHERE customer_id = c.id), 0)::text as stamp_count,
        COALESCE((SELECT COUNT(*) FROM quiz_responses WHERE customer_id = c.id), 0)::text as quiz_count
      FROM customers c
      ORDER BY c.created_at DESC
    `)
  } catch {
    // DB not connected
  }

  return <CustomersTable customers={customers} />
}
