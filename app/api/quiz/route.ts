import { NextRequest, NextResponse } from 'next/server'
import { query, getOne } from '@/lib/db'

type Setting = { key: string; value: string }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'journey'
  
  try {
    const settings = await getOne<Setting>(
      "SELECT key, value FROM event_settings WHERE key = 'start_journey_quiz_enabled'"
    )
    
    if (category === 'journey' && settings?.value === 'false') {
      return NextResponse.json([])
    }
    
    const result = await query(
      `SELECT id, question_en, question_th, options, display_order, quiz_category, booth_id 
       FROM quiz_questions 
       WHERE is_active = true AND (quiz_category = $1 OR booth_id IS NULL)
       ORDER BY display_order`,
      [category]
    )
    
    const questions = result.rows.map(row => ({
      ...row,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options
    }))
    
    return NextResponse.json(questions)
  } catch (error) {
    console.error('Failed to fetch quiz questions:', error)
    return NextResponse.json([], { status: 500 })
  }
}
