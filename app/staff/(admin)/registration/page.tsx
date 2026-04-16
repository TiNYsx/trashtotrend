import { getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { RegistrationManager } from "@/components/staff/registration-manager"

type Field = {
  id: number
  field_key: string
  label_en: string
  label_th: string
  field_type: string
  options: string[] | null
  is_required: boolean
  display_order: number
  is_active: boolean
}

export default async function RegistrationPage() {
  await requireStaff()
  let fields: Field[] = []
  try {
    fields = await getMany<Field>("SELECT * FROM registration_fields ORDER BY display_order ASC")
  } catch {
    // DB not connected
  }

  return <RegistrationManager initialFields={fields} />
}
