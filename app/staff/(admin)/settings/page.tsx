import { redirect } from "next/navigation"
import { requireStaff } from "@/lib/auth"
import SettingsClient from "./SettingsClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await requireStaff()
  
  if (!session) {
    redirect("/staff/login")
  }
  
  return <SettingsClient />
}
