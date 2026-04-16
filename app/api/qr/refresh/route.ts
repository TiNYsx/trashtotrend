import { NextResponse } from "next/server"
import { getSession, generateQRToken } from "@/lib/auth"
import { query, getOne } from "@/lib/db"

export async function POST() {
  const session = await getSession()
  if (!session || session.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const newToken = generateQRToken()

  try {
    await query("UPDATE customers SET qr_token = $1 WHERE id = $2", [newToken, session.id])
    return NextResponse.json({ token: newToken })
  } catch {
    return NextResponse.json({ token: "", error: "Failed to refresh" }, { status: 500 })
  }
}
