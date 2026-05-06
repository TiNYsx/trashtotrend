import { NextRequest, NextResponse } from 'next/server'
import { query, getOne } from '@/lib/db'
import { createSession, generateQRToken } from '@/lib/auth'
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

    // Check if email already exists
    const existingUser = await getOne('SELECT id FROM customers WHERE email = $1', [email])
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const qrToken = generateQRToken()
    const regData = JSON.stringify({ name, age, gender, contact })

    const result = await query(
      `INSERT INTO customers (email, password_hash, qr_token, registration_data, pre_survey_completed) 
       VALUES ($1, $2, $3, $4, true) 
       RETURNING id`,
      [email, passwordHash, qrToken, regData]
    )

    const customerId = result.rows[0].id

    // Save survey answers if provided
    if (surveyAnswers && Array.isArray(surveyAnswers)) {
      for (const answer of surveyAnswers) {
        await query(
          'INSERT INTO pre_survey_responses (user_id, question_num, score) VALUES ($1, $2, $3)',
          [customerId, answer.questionNum, answer.score]
        )
      }
    }

    await createSession({
      id: customerId,
      role: 'customer',
      email
    })

    return NextResponse.json({ success: true, customerId })
  } catch (error) {
    console.error('Registration failed:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
