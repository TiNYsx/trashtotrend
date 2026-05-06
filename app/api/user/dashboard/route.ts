import { NextResponse } from 'next/server'
import { query, getMany } from '@/lib/db'
import { requireCustomer } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireCustomer()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userResult = await query(
      `SELECT id, email, qr_token, registration_data, pre_survey_completed, post_survey_completed
       FROM customers WHERE id = $1`,
      [session.id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    const boothsResult = await getMany<{
      id: number
      name_en: string
      name_th: string
      description_en: string
      description_th: string
      image_url: string
      display_order: number
      completed: boolean
    }>(
      `SELECT b.id, b.name_en, b.name_th, b.description_en, b.description_th, b.image_url, b.display_order,
              CASE WHEN s.id IS NOT NULL THEN true ELSE false END as completed
       FROM booths b
       LEFT JOIN stamps s ON b.id = s.booth_id AND s.customer_id = $1
       WHERE b.is_active = true
       ORDER BY b.display_order`,
      [session.id]
    )

    const completedCount = boothsResult.filter(b => b.completed).length

    return NextResponse.json({
      name: user.email,
      email: user.email,
      qr_token: user.qr_token,
      quiz_type: null,
      pre_survey_completed: user.pre_survey_completed,
      post_survey_completed: user.post_survey_completed,
      reward_claimed: false,
      checkpoints: boothsResult,
      checkpoint_count: completedCount,
      total_checkpoints: boothsResult.length
    })
  } catch (error) {
    console.error('Failed to fetch dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
