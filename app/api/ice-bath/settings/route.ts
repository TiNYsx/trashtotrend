import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      "SELECT key, value FROM event_settings WHERE key IN ('ice_bath_capacity', 'ice_bath_open_date')"
    )
    const settings: Record<string, string> = {}
    result.rows.forEach(row => {
      settings[row.key] = row.value
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ ice_bath_capacity: '50', ice_bath_open_date: '2026-04-20' }, { status: 500 })
  }
}
