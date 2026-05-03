import { redirect } from "next/navigation"
import { requireStaff } from "@/lib/auth"
import { StaffSidebar } from "@/components/staff/staff-sidebar"

export const dynamic = "force-dynamic"

export default async function StaffAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireStaff()

  if (!session) {
    redirect("/staff/login")
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <StaffSidebar username={session.username || "Staff"} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-4 pt-14 pb-6 sm:px-6 sm:pt-16 sm:pb-8 lg:py-8">{children}</div>
      </main>
    </div>
  )
}
