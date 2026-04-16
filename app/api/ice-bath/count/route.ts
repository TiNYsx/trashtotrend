import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query('SELECT COUNT(*) as count FROM ice_bath_registrations')
    return NextResponse.json({ count: parseInt(result.rows[0].count) })
  } catch (error) {
    console.error('Failed to get count:', error)
    return NextResponse.json({ count: 0 })
  }
}
