import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { name, contact } = await request.json()

    if (!name || !contact) {
      return NextResponse.json({ error: 'Name and contact are required' }, { status: 400 })
    }

    const capacityResult = await query(
      "SELECT value FROM event_settings WHERE key = 'ice_bath_capacity'"
    )
    const capacity = parseInt(capacityResult.rows[0]?.value || '50')

    const countResult = await query('SELECT COUNT(*) as count FROM ice_bath_registrations')
    const currentCount = parseInt(countResult.rows[0].count)

    if (currentCount >= capacity) {
      return NextResponse.json({ error: 'All spots are taken' }, { status: 400 })
    }

    await query(
      'INSERT INTO ice_bath_registrations (user_id, name, contact) VALUES ($1, $2, $3)',
      [session.id, name, contact]
    )

    await query(
      'UPDATE users SET ice_bath_registered = true WHERE id = $1',
      [session.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to register for ice bath:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
