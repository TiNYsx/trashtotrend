"use server"

import bcrypt from "bcryptjs"
import { query, getOne } from "@/lib/db"
import { createSession, destroySession, generateQRToken } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginCustomer(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const customer = await getOne<{
    id: number
    email: string
    password_hash: string
  }>("SELECT id, email, password_hash FROM customers WHERE email = $1", [email])

  if (!customer) {
    return { error: "Invalid email or password" }
  }

  const valid = await bcrypt.compare(password, customer.password_hash)
  if (!valid) {
    return { error: "Invalid email or password" }
  }

  await createSession({ id: customer.id, role: "customer", email: customer.email })
  redirect("/stamps")
}

export async function registerCustomer(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  // Check if email already exists
  const existing = await getOne("SELECT id FROM customers WHERE email = $1", [email])
  if (existing) {
    return { error: "Email already registered" }
  }

  // Gather dynamic registration data
  const registrationData: Record<string, string> = {}
  const entries = Array.from(formData.entries())
  for (const [key, value] of entries) {
    if (key.startsWith("field_")) {
      registrationData[key.replace("field_", "")] = value as string
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const qrToken = generateQRToken()

  try {
    await query(
      "INSERT INTO customers (email, password_hash, qr_token, registration_data) VALUES ($1, $2, $3, $4)",
      [email, passwordHash, qrToken, JSON.stringify(registrationData)]
    )
  } catch {
    return { error: "Registration failed. Please try again." }
  }

  // Auto-login after register
  const customer = await getOne<{ id: number; email: string }>(
    "SELECT id, email FROM customers WHERE email = $1",
    [email]
  )

  if (customer) {
    await createSession({ id: customer.id, role: "customer", email: customer.email })
  }

  redirect("/stamps")
}

export async function loginStaff(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  const staff = await getOne<{
    id: number
    username: string
    password_hash: string
    role: string
  }>("SELECT id, username, password_hash, role FROM staff WHERE username = $1", [username])

  if (!staff) {
    return { error: "Invalid username or password" }
  }

  const valid = await bcrypt.compare(password, staff.password_hash)
  if (!valid) {
    return { error: "Invalid username or password" }
  }

  await createSession({
    id: staff.id,
    role: staff.role as "staff" | "admin",
    username: staff.username,
  })
  redirect("/staff/dashboard")
}

export async function logout() {
  await destroySession()
  redirect("/")
}
