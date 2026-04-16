import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const table = role === 'staff' ? 'staff' : 'users'
    const result = await query(
      `SELECT id, email, password_hash, '${role}' as role FROM ${table} WHERE email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = result.rows[0]
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await createSession({
      id: user.id,
      role: role === 'staff' ? 'staff' : 'user',
      email: user.email
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login failed:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
