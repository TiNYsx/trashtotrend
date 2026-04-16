import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireStaff } from '@/lib/auth'

export async function GET() {
  try {
    await requireStaff()
    
    const result = await query('SELECT key, value FROM event_settings')
    const settings: Record<string, string> = {}
    result.rows.forEach(row => {
      settings[row.key] = row.value
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaff()
    const settings = await request.json()
    
    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO event_settings (key, value, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value as string]
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
