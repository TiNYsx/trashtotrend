import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, age, gender, contact, email, password, surveyAnswers } = await request.json()

    if (!name || !age || !gender || !contact || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (surveyAnswers.length !== 8) {
      return NextResponse.json({ error: 'Survey must be completed' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const qrToken = generateQRToken()

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO users (email, password_hash, name, age, gender, contact, qr_token, registration_data, pre_survey_completed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) 
       RETURNING id`,
      [email, passwordHash, name, age, gender, contact, qrToken, JSON.stringify({ name, age, gender, contact })]
    )

    const userId = result.rows[0].id

    for (const answer of surveyAnswers) {
      await query(
        'INSERT INTO pre_survey_responses (user_id, question_num, score) VALUES ($1, $2, $3)',
        [userId, answer.questionNum, answer.score]
      )
    }

    await createSession({
      id: userId,
      role: 'user',
      email
    })

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error('Registration failed:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}

function generateQRToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const timestamp = Date.now().toString(36)
  let random = ''
  for (let i = 0; i < 24; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `hoop_${timestamp}_${random}`
}
