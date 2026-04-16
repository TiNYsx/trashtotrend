import { NextResponse } from "next/server"
import { createSession } from "@/lib/auth"

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
  }

  const url = new URL(req.url)
  if (url.searchParams.get("staff") === "1") {
    // create a dummy staff session (id=1) – adjust as needed
    await createSession({ id: 1, role: "staff" })
    // redirect to scan page after login
    return NextResponse.redirect(new URL("/staff/scan", url))
  }

  return NextResponse.json({ error: "missing staff parameter" }, { status: 400 })
}
