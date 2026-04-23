import { redirect } from "next/navigation"
import { getOne } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import { DashboardStats } from "@/components/staff/dashboard-stats"

export const dynamic = "force-dynamic"

type Stats = {
  total_customers: string
  total_stamps: string
  total_quiz_responses: string
  total_booths: string
}

export default async function DashboardPage() {
  const session = await requireStaff()
  
  if (!session) {
    redirect("/staff/login")
  }

  let stats: Stats = {
    total_customers: "0",
    total_stamps: "0",
    total_quiz_responses: "0",
    total_booths: "0",
  }

  try {
    const customersCount = await getOne<{ count: string }>("SELECT COUNT(*) as count FROM customers")
    const stampsCount = await getOne<{ count: string }>("SELECT COUNT(*) as count FROM stamps")
    const quizCount = await getOne<{ count: string }>("SELECT COUNT(*) as count FROM quiz_responses")
    const boothsCount = await getOne<{ count: string }>("SELECT COUNT(*) as count FROM booths WHERE is_active = true")

    stats = {
      total_customers: customersCount?.count || "0",
      total_stamps: stampsCount?.count || "0",
      total_quiz_responses: quizCount?.count || "0",
      total_booths: boothsCount?.count || "0",
    }
  } catch {
    // DB not connected
  }

  return <DashboardStats stats={stats} />
}
