import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      'SELECT id, question_en, question_th, options, display_order FROM quiz_questions WHERE is_active = true ORDER BY display_order'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch quiz questions:', error)
    return NextResponse.json([], { status: 500 })
  }
}
