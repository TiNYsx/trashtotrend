import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { answers } = await request.json()

    if (!answers || Object.keys(answers).length !== 8) {
      return NextResponse.json({ error: 'All questions must be answered' }, { status: 400 })
    }

    for (const [questionNum, score] of Object.entries(answers)) {
      await query(
        `INSERT INTO post_survey_responses (user_id, question_num, score) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, question_num) DO UPDATE SET score = $3`,
        [session.id, parseInt(questionNum) + 1, score]
      )
    }

    await query(
      'UPDATE users SET post_survey_completed = true WHERE id = $1',
      [session.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to submit post-survey:', error)
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 })
  }
}
