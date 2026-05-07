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
      quiz_type: string | null
    }>(`
      SELECT id, email, registration_data, created_at, pre_survey_completed, post_survey_completed, quiz_type
      FROM customers
      ORDER BY created_at DESC
    `)

    // 2. Get personality types for reference
    const personalityTypes = await getMany<{
      type_code: string
      name_en: string
      name_th: string
    }>("SELECT type_code, name_en, name_th FROM personality_types ORDER BY type_code")

    const personalityMap = new Map(personalityTypes.map(p => [p.type_code, `${p.name_en} (${p.name_th})`]))

    // 3. Get quiz responses for all customers
    const quizResponses = await getMany<{
      customer_id: number
      question_id: number
      answer: string
    }>(`
      SELECT customer_id, question_id, answer
      FROM quiz_responses
      WHERE customer_id IS NOT NULL
      ORDER BY customer_id, question_id
    `)

    // Calculate personality type for each customer
    const personalityResults = new Map<number, { type: string; label: string; scores: Record<string, number> }>()
    const customerQuizAnswers = new Map<number, Record<number, string>>()

    for (const response of quizResponses) {
      if (!customerQuizAnswers.has(response.customer_id)) {
        customerQuizAnswers.set(response.customer_id, {})
      }
      customerQuizAnswers.get(response.customer_id)![response.question_id] = response.answer

      if (!personalityResults.has(response.customer_id)) {
        personalityResults.set(response.customer_id, { type: "", label: "", scores: { A: 0, B: 0, C: 0, D: 0, E: 0 } })
      }
      const result = personalityResults.get(response.customer_id)!
      if (result.scores[response.answer] !== undefined) {
        result.scores[response.answer]++
      }
    }

    // Determine dominant type
    for (const [customerId, result] of personalityResults) {
      const entries = Object.entries(result.scores)
      if (entries.length > 0) {
        const dominant = entries.sort((a, b) => b[1] - a[1])[0]
        result.type = dominant[0]
        result.label = personalityMap.get(dominant[0]) || dominant[0]
      }
    }

    // 4. Get pre-survey responses
    const preSurveyQuestions = await getMany<{
      id: number
      question_en: string
      display_order: number
    }>("SELECT id, question_en, display_order FROM pre_survey_questions WHERE is_active = true ORDER BY display_order")

    const preSurveyResponses = await getMany<{
      user_id: number
      question_num: number
      score: number
    }>("SELECT user_id, question_num, score FROM pre_survey_responses ORDER BY user_id, question_num")

    const preSurveyMap = new Map<number, Record<number, number>>()
    for (const response of preSurveyResponses) {
      if (!preSurveyMap.has(response.user_id)) {
        preSurveyMap.set(response.user_id, {})
      }
      preSurveyMap.get(response.user_id)![response.question_num] = response.score
    }

    // 5. Get post-survey responses
    const postSurveyQuestions = await getMany<{
      id: number
      question_en: string
      display_order: number
    }>("SELECT id, question_en, display_order FROM post_survey_questions WHERE is_active = true ORDER BY display_order")

    const postSurveyResponses = await getMany<{
      user_id: number
      question_num: number
      score: number
    }>("SELECT user_id, question_num, score FROM post_survey_responses ORDER BY user_id, question_num")

    const postSurveyMap = new Map<number, Record<number, number>>()
    for (const response of postSurveyResponses) {
      if (!postSurveyMap.has(response.user_id)) {
        postSurveyMap.set(response.user_id, {})
      }
      postSurveyMap.get(response.user_id)![response.question_num] = response.score
    }

    // 6. Get booth stamps for each customer
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

    // Build Excel workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Customer Summary
    const customerSummaryData = customers.map(c => {
      const personality = personalityResults.get(c.id)
      const regData = c.registration_data || {}
      
      // Get personality from calculated results or fallback to customer record
      const personalityType = personality?.label || (c.quiz_type ? personalityMap.get(c.quiz_type) || c.quiz_type : "")
      const personalityCode = personality?.type || c.quiz_type || ""
      
      // Build comma-separated survey answers
      const preAnswers = preSurveyMap.get(c.id)
      const preSurveyAnswers = preAnswers 
        ? preSurveyQuestions.map(q => preAnswers[q.display_order] ?? "").join(", ")
        : ""
      
      const postAnswers = postSurveyMap.get(c.id)
      const postSurveyAnswers = postAnswers
        ? postSurveyQuestions.map(q => postAnswers[q.display_order] ?? "").join(", ")
        : ""
      
      return {
        "ID": c.id,
        "Email": c.email,
        "Name": regData.name || regData.full_name || "",
        "Age": regData.age || "",
        "Gender": regData.gender || "",
        "Contact": regData.contact || regData.phone || "",
        "Personality Type": personalityType,
        "Personality Code": personalityCode,
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

    // Sheet 2: Quiz Responses
    const quizData: Record<string, string | number>[] = []
    for (const customer of customers) {
      const answers = customerQuizAnswers.get(customer.id)
      const personality = personalityResults.get(customer.id)
      if (answers && Object.keys(answers).length > 0) {
        const personalityType = personality?.label || (customer.quiz_type ? personalityMap.get(customer.quiz_type) || customer.quiz_type : "")
        const personalityCode = personality?.type || customer.quiz_type || ""
        const row: Record<string, string | number> = {
          "Customer ID": customer.id,
          "Email": customer.email,
          "Personality Type": personalityType,
          "Personality Code": personalityCode,
        }
        for (const [questionId, answer] of Object.entries(answers)) {
          row[`Q${questionId}`] = answer
        }
        quizData.push(row)
      }
    }

    if (quizData.length > 0) {
      const quizSheet = XLSX.utils.json_to_sheet(quizData)
      XLSX.utils.book_append_sheet(workbook, quizSheet, "Quiz Responses")
    }

    // Sheet 3: Pre-Survey Responses
    const preSurveyData: Record<string, string | number>[] = []
    for (const customer of customers) {
      const answers = preSurveyMap.get(customer.id)
      if (answers && Object.keys(answers).length > 0) {
        const row: Record<string, string | number> = {
          "Customer ID": customer.id,
          "Email": customer.email,
        }
        for (const question of preSurveyQuestions) {
          row[`Q${question.display_order}: ${question.question_en}`] = answers[question.display_order] || ""
        }
        preSurveyData.push(row)
      }
    }

    if (preSurveyData.length > 0) {
      const preSheet = XLSX.utils.json_to_sheet(preSurveyData)
      XLSX.utils.book_append_sheet(workbook, preSheet, "Pre-Survey")
    }

    // Sheet 4: Post-Survey Responses
    const postSurveyData: Record<string, string | number>[] = []
    for (const customer of customers) {
      const answers = postSurveyMap.get(customer.id)
      if (answers && Object.keys(answers).length > 0) {
        const row: Record<string, string | number> = {
          "Customer ID": customer.id,
          "Email": customer.email,
        }
        for (const question of postSurveyQuestions) {
          row[`Q${question.display_order}: ${question.question_en}`] = answers[question.display_order] || ""
        }
        postSurveyData.push(row)
      }
    }

    if (postSurveyData.length > 0) {
      const postSheet = XLSX.utils.json_to_sheet(postSurveyData)
      XLSX.utils.book_append_sheet(workbook, postSheet, "Post-Survey")
    }

    // Sheet 5: Personality Distribution
    const personalityDist: Record<string, string | number>[] = []
    for (const [typeCode, label] of personalityMap) {
      const countFromResponses = Array.from(personalityResults.values()).filter(r => r.type === typeCode).length
      const countFromQuizType = customers.filter(c => c.quiz_type === typeCode && !personalityResults.has(c.id)).length
      personalityDist.push({
        "Type Code": typeCode,
        "Type Name": label,
        "Count": countFromResponses + countFromQuizType,
      })
    }

    if (personalityDist.length > 0) {
      const distSheet = XLSX.utils.json_to_sheet(personalityDist)
      XLSX.utils.book_append_sheet(workbook, distSheet, "Personality Distribution")
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
