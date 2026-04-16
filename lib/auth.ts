import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "fallback-secret-change-me-in-production-32chars"
)

const COOKIE_NAME = "ftt_session"

export type SessionPayload = {
  id: number
  role: "customer" | "staff" | "admin"
  email?: string
  username?: string
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(SESSION_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })

  return token
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function requireCustomer(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session || session.role === "staff" || session.role === "admin") {
    redirect("/login")
  }
  return session
}

export async function requireStaff(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    redirect("/staff/login")
  }
  return session
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export function generateQRToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const timestamp = Date.now().toString(36)
  let random = ""
  for (let i = 0; i < 24; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `ftt_${timestamp}_${random}`
}
