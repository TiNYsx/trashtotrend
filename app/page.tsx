import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import HomeClient from "./page-client"

export default async function Home() {
  const session = await getSession()

  if (session?.role === "user" || session?.role === "customer") {
    redirect("/dashboard")
  }
  if (session?.role === "staff" || session?.role === "admin") {
    redirect("/staff/dashboard")
  }

  return <HomeClient />
}
