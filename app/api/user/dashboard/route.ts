import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireCustomer } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireCustomer()
    
    const userResult = await query(
      `SELECT name, email, qr_token, quiz_type, pre_survey_completed, post_survey_completed, reward_claimed 
       FROM users WHERE id = $1`,
      [session.id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    const checkpointsResult = await query(
      `SELECT c.id, c.slug, c.name_en, c.name_th, c.type, 
              CASE WHEN cc.id IS NOT NULL THEN true ELSE false END as completed
       FROM checkpoints c
       LEFT JOIN checkpoint_completions cc ON c.id = cc.checkpoint_id AND cc.user_id = $1
       WHERE c.is_active = true
       ORDER BY c.display_order`,
      [session.id]
    )

    const completedCount = checkpointsResult.rows.filter(c => c.completed).length

    return NextResponse.json({
      name: user.name,
      email: user.email,
      qr_token: user.qr_token,
      quiz_type: user.quiz_type,
      pre_survey_completed: user.pre_survey_completed,
      post_survey_completed: user.post_survey_completed,
      reward_claimed: user.reward_claimed,
      checkpoints: checkpointsResult.rows,
      checkpoint_count: completedCount,
      total_checkpoints: checkpointsResult.rows.length
    })
  } catch (error) {
    console.error('Failed to fetch dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
