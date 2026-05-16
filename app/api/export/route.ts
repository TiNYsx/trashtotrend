import { NextResponse } from "next/server"
import { query, getMany } from "@/lib/db"
import { requireStaff } from "@/lib/auth"
import * as XLSX from "xlsx"

export async function GET() {
  const session = await requireStaff()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. Get all customers
    const customers = await getMany<{
      id: number
      email: string
      registration_data: Record<string, string>
      created_at: string
      pre_survey_completed: boolean
      post_survey_completed: boolean
    }>(`
      SELECT id, email, registration_data, created_at, pre_survey_completed, post_survey_completed
      FROM customers
      ORDER BY created_at DESC
    `)

    // 2. Get pre-survey responses
    const preSurveyQuestions = await getMany<{
      id: number
      question_en: string
      question_type: string
      display_order: number
    }>("SELECT id, question_en, question_type, display_order FROM pre_survey_questions WHERE is_active = true ORDER BY display_order")

    const preSurveyResponses = await getMany<{
      user_id: number
      question_num: number
      score: number
      answer: string | null
    }>("SELECT user_id, question_num, score, answer FROM pre_survey_responses ORDER BY user_id, question_num")

    const preSurveyMap = new Map<number, Record<number, { score: number; answer: string }>>()
    for (const response of preSurveyResponses) {
      if (!preSurveyMap.has(response.user_id)) {
        preSurveyMap.set(response.user_id, {})
      }
      preSurveyMap.get(response.user_id)![response.question_num] = {
        score: response.score,
        answer: response.answer || ""
      }
    }

    // 3. Get post-survey responses
    const postSurveyQuestions = await getMany<{
      id: number
      question_en: string
      question_type: string
      display_order: number
    }>("SELECT id, question_en, question_type, display_order FROM post_survey_questions WHERE is_active = true ORDER BY display_order")

    const postSurveyResponses = await getMany<{
      user_id: number
      question_num: number
      score: number
      answer: string | null
    }>("SELECT user_id, question_num, score, answer FROM post_survey_responses ORDER BY user_id, question_num")

    const postSurveyMap = new Map<number, Record<number, { score: number; answer: string }>>()
    for (const response of postSurveyResponses) {
      if (!postSurveyMap.has(response.user_id)) {
        postSurveyMap.set(response.user_id, {})
      }
      postSurveyMap.get(response.user_id)![response.question_num] = {
        score: response.score,
        answer: response.answer || ""
      }
    }

    // 4. Get booth stamps for each customer
    const stamps = await getMany<{
      customer_id: number
      booth_name: string
    }>(`
      SELECT s.customer_id, b.name_en as booth_name
      FROM stamps s
      JOIN booths b ON s.booth_id = b.id
      ORDER BY s.customer_id, b.display_order
    `)

    const stampsMap = new Map<number, string[]>()
    for (const stamp of stamps) {
      if (!stampsMap.has(stamp.customer_id)) {
        stampsMap.set(stamp.customer_id, [])
      }
      stampsMap.get(stamp.customer_id)!.push(stamp.booth_name)
    }

    // Helper to format answer for display
    const formatAnswer = (answerData: { score: number; answer: string } | undefined, questionType: string): string => {
      if (!answerData) return ""
      // Use answer text if available, otherwise fallback to score
      if (answerData.answer) return answerData.answer
      return String(answerData.score)
    }

    // Build Excel workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Customer Summary
    const customerSummaryData = customers.map(c => {
      const regData = c.registration_data || {}

      // Build comma-separated survey answers
      const preAnswers = preSurveyMap.get(c.id)
      const preSurveyAnswers = preAnswers
        ? preSurveyQuestions.map((q, idx) => formatAnswer(preAnswers[idx + 1], q.question_type)).join(", ")
        : ""

      const postAnswers = postSurveyMap.get(c.id)
      const postSurveyAnswers = postAnswers
        ? postSurveyQuestions.map((q, idx) => formatAnswer(postAnswers[idx + 1], q.question_type)).join(", ")
        : ""

      return {
        "ID": c.id,
        "Email": c.email,
        "Name": regData.name || regData.full_name || "",
        "Age": regData.age || "",
        "Gender": regData.gender || "",
        "Contact": regData.contact || regData.phone || "",
        "Pre-Survey Status": c.pre_survey_completed ? "Yes" : "No",
        "Pre-Survey Answers": preSurveyAnswers,
        "Post-Survey Status": c.post_survey_completed ? "Yes" : "No",
        "Post-Survey Answers": postSurveyAnswers,
        "Stamps Collected": (stampsMap.get(c.id)?.length || 0),
        "Stamp Booths": (stampsMap.get(c.id)?.join(", ") || ""),
        "Registered At": c.created_at ? new Date(c.created_at).toLocaleString() : "",
      }
    })

    const summarySheet = XLSX.utils.json_to_sheet(customerSummaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Customer Summary")

    // Sheet 2: Pre-Survey Responses
    const preSurveyData: Record<string, string | number>[] = []
    for (const customer of customers) {
      const answers = preSurveyMap.get(customer.id)
      if (answers && Object.keys(answers).length > 0) {
        const row: Record<string, string | number> = {
          "Customer ID": customer.id,
          "Email": customer.email,
        }
        preSurveyQuestions.forEach((question, idx) => {
          const answerData = answers[idx + 1]
          row[`Q${question.display_order}: ${question.question_en}`] = formatAnswer(answerData, question.question_type)
        })
        preSurveyData.push(row)
      }
    }

    if (preSurveyData.length > 0) {
      const preSheet = XLSX.utils.json_to_sheet(preSurveyData)
      XLSX.utils.book_append_sheet(workbook, preSheet, "Pre-Survey")
    }

    // Sheet 3: Post-Survey Responses
    const postSurveyData: Record<string, string | number>[] = []
    for (const customer of customers) {
      const answers = postSurveyMap.get(customer.id)
      if (answers && Object.keys(answers).length > 0) {
        const row: Record<string, string | number> = {
          "Customer ID": customer.id,
          "Email": customer.email,
        }
        postSurveyQuestions.forEach((question, idx) => {
          const answerData = answers[idx + 1]
          row[`Q${question.display_order}: ${question.question_en}`] = formatAnswer(answerData, question.question_type)
        })
        postSurveyData.push(row)
      }
    }

    if (postSurveyData.length > 0) {
      const postSheet = XLSX.utils.json_to_sheet(postSurveyData)
      XLSX.utils.book_append_sheet(workbook, postSheet, "Post-Survey")
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="customer-data-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Export failed:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
