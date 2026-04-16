import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireStaff } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaff()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    let { qrToken, checkpointSlug } = await request.json()

    if (!qrToken || !checkpointSlug) {
      return NextResponse.json({ error: 'QR token and checkpoint required' }, { status: 400 })
    }

    // Extract token from URL path if needed (e.g., /scan/hoop_xxx -> hoop_xxx)
    const match = qrToken.match(/\/scan\/([^/]+)$/)
    if (match) {
      qrToken = match[1]
    }

    const userResult = await query(
      'SELECT id, name FROM users WHERE qr_token = $1',
      [qrToken]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    const checkpointResult = await query(
      'SELECT id, name_en FROM checkpoints WHERE slug = $1 AND is_active = true',
      [checkpointSlug]
    )

    if (checkpointResult.rows.length === 0) {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 })
    }

    const checkpoint = checkpointResult.rows[0]

    const existingResult = await query(
      'SELECT id FROM checkpoint_completions WHERE user_id = $1 AND checkpoint_id = $2',
      [user.id, checkpoint.id]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ 
        error: 'Already completed', 
        user: user.name,
        checkpoint: checkpoint.name_en
      }, { status: 400 })
    }

    await query(
      'INSERT INTO checkpoint_completions (user_id, checkpoint_id) VALUES ($1, $2)',
      [user.id, checkpoint.id]
    )

    await query(
      'INSERT INTO scan_events (user_id, staff_id, checkpoint_slug) VALUES ($1, $2, $3)',
      [user.id, session.id, checkpointSlug]
    )

    const totalCheckpoints = await query('SELECT COUNT(*) as count FROM checkpoints WHERE is_active = true')
    const completedCheckpoints = await query(
      'SELECT COUNT(*) as count FROM checkpoint_completions WHERE user_id = $1',
      [user.id]
    )

    return NextResponse.json({
      success: true,
      user: user.name,
      checkpoint: checkpoint.name_en,
      progress: {
        completed: parseInt(completedCheckpoints.rows[0].count),
        total: parseInt(totalCheckpoints.rows[0].count)
      }
    })
  } catch (error) {
    console.error('Scan failed:', error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
