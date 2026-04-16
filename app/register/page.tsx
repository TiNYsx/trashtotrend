import { getMany } from "@/lib/db"
import { RegisterForm } from "@/components/customer/register-form"

type RegistrationField = {
  id: number
  field_key: string
  label_en: string
  label_th: string
  field_type: string
  options: string[] | null
  is_required: boolean
  display_order: number
}

export default async function RegisterPage() {
  let fields: RegistrationField[] = []
  try {
    fields = await getMany<RegistrationField>(
      "SELECT * FROM registration_fields WHERE is_active = true ORDER BY display_order ASC"
    )
  } catch {
    // DB not connected yet — show form with no dynamic fields
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-8">
      <div className="animate-fade-in-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Join the event</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
            FROM TRASH
          </h1>
          <p className="font-serif text-2xl italic text-accent">To Trend</p>
        </div>
        <RegisterForm fields={fields} />
      </div>
    </main>
  )
}
