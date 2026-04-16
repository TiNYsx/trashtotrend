import { requireStaff } from "@/lib/auth"
import { StaffSidebar } from "@/components/staff/staff-sidebar"

export default async function StaffAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireStaff()

  return (
    <div className="flex min-h-dvh bg-background">
      <StaffSidebar username={session.username || "Staff"} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-8 lg:py-8">{children}</div>
      </main>
    </div>
  )
}
