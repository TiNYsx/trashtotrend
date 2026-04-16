export type Language = "en" | "th"

export const dict = {
  // Common
  appName: { en: "From Trash to Trend", th: "From Trash to Trend" },
  appTagline: {
    en: "When something once seen as worthless gets transformed into something valuable",
    th: "เมื่อสิ่งที่เคยไร้ค่า ถูกเปลี่ยนเป็นสิ่งที่มีคุณค่า",
  },
  login: { en: "Login", th: "เข้าสู่ระบบ" },
  register: { en: "Register", th: "ลงทะเบียน" },
  logout: { en: "Logout", th: "ออกจากระบบ" },
  email: { en: "Email", th: "อีเมล" },
  password: { en: "Password", th: "รหัสผ่าน" },
  confirmPassword: { en: "Confirm Password", th: "ยืนยันรหัสผ่าน" },
  submit: { en: "Submit", th: "ส่ง" },
  cancel: { en: "Cancel", th: "ยกเลิก" },
  save: { en: "Save", th: "บันทึก" },
  edit: { en: "Edit", th: "แก้ไข" },
  delete: { en: "Delete", th: "ลบ" },
  add: { en: "Add", th: "เพิ่ม" },
  back: { en: "Back", th: "กลับ" },
  loading: { en: "Loading...", th: "กำลังโหลด..." },
  noAccount: { en: "Don't have an account?", th: "ยังไม่มีบัญชี?" },
  hasAccount: { en: "Already have an account?", th: "มีบัญชีอยู่แล้ว?" },

  // Customer
  myStamps: { en: "My Stamps", th: "แสตมป์ของฉัน" },
  showQR: { en: "Show QR Code", th: "แสดง QR Code" },
  scanToCollect: {
    en: "Show this QR code to booth staff to collect your stamp",
    th: "แสดง QR Code นี้ให้เจ้าหน้าที่ที่บูธเพื่อสะสมแสตมป์",
  },
  stampsCollected: { en: "stamps collected", th: "แสตมป์ที่สะสมได้" },
  boothInfo: { en: "Booth Information", th: "ข้อมูลบูธ" },
  notVisited: { en: "Not yet visited", th: "ยังไม่ได้เข้าชม" },
  visited: { en: "Visited!", th: "เข้าชมแล้ว!" },
  tapToView: { en: "Tap to view details", th: "แตะเพื่อดูรายละเอียด" },

  // Quiz
  quizTitle: { en: "Quick Quiz", th: "แบบทดสอบสั้น" },
  quizIntro: {
    en: "Answer a few questions about this booth!",
    th: "ตอบคำถามเกี่ยวกับบูธนี้!",
  },
  quizComplete: { en: "Quiz Complete!", th: "ทำแบบทดสอบเสร็จแล้ว!" },
  quizScore: { en: "Your score", th: "คะแนนของคุณ" },
  quizThankYou: {
    en: "Thank you for participating! Your stamp has been collected.",
    th: "ขอบคุณที่ร่วมกิจกรรม! แสตมป์ของคุณถูกสะสมแล้ว",
  },
  next: { en: "Next", th: "ถัดไป" },
  finish: { en: "Finish", th: "เสร็จสิ้น" },
  backToStamps: { en: "Back to Stamps", th: "กลับไปหน้าแสตมป์" },
  typeAnswer: { en: "Type your answer...", th: "พิมพ์คำตอบของคุณ..." },

  // Staff
  staffLogin: { en: "Staff Login", th: "เข้าสู่ระบบเจ้าหน้าที่" },
  dashboard: { en: "Dashboard", th: "แดชบอร์ด" },
  booths: { en: "Booths", th: "บูธ" },
  quizQuestions: { en: "Quiz Questions", th: "คำถามแบบทดสอบ" },
  registrationFields: { en: "Registration Fields", th: "ฟิลด์ลงทะเบียน" },
  customers: { en: "Customers", th: "ลูกค้า" },
  scanQR: { en: "Scan QR", th: "สแกน QR" },
  totalCustomers: { en: "Total Customers", th: "จำนวนลูกค้าทั้งหมด" },
  totalStamps: { en: "Total Stamps", th: "จำนวนแสตมป์ทั้งหมด" },
  totalQuizResponses: { en: "Quiz Responses", th: "การตอบแบบทดสอบ" },
  username: { en: "Username", th: "ชื่อผู้ใช้" },
  boothName: { en: "Booth Name", th: "ชื่อบูธ" },
  description: { en: "Description", th: "คำอธิบาย" },
  question: { en: "Question", th: "คำถาม" },
  questionType: { en: "Question Type", th: "ประเภทคำถาม" },
  multipleChoice: { en: "Multiple Choice", th: "ตัวเลือก" },
  shortText: { en: "Short Text", th: "ข้อความสั้น" },
  options: { en: "Options", th: "ตัวเลือก" },
  correctAnswer: { en: "Correct Answer", th: "คำตอบที่ถูก" },
  fieldKey: { en: "Field Key", th: "คีย์ฟิลด์" },
  fieldType: { en: "Field Type", th: "ประเภทฟิลด์" },
  required: { en: "Required", th: "จำเป็น" },
  active: { en: "Active", th: "เปิดใช้งาน" },
  order: { en: "Order", th: "ลำดับ" },
  actions: { en: "Actions", th: "การดำเนินการ" },
  scanSuccess: { en: "Stamp collected successfully!", th: "สะสมแสตมป์สำเร็จ!" },
  scanError: { en: "Invalid QR code", th: "QR Code ไม่ถูกต้อง" },
  selectBooth: { en: "Select Booth", th: "เลือกบูธ" },
  english: { en: "EN", th: "EN" },
  thai: { en: "TH", th: "TH" },
  imageUrl: { en: "Image URL", th: "URL รูปภาพ" },
  addOption: { en: "Add Option", th: "เพิ่มตัวเลือก" },
  removeOption: { en: "Remove", th: "ลบ" },
  isCorrect: { en: "Correct", th: "ถูกต้อง" },
  manageQuiz: { en: "Manage Quiz", th: "จัดการแบบทดสอบ" },
  noQuestions: { en: "No questions yet", th: "ยังไม่มีคำถาม" },
  noBooths: { en: "No booths yet", th: "ยังไม่มีบูธ" },
  noCustomers: { en: "No customers yet", th: "ยังไม่มีลูกค้า" },
  confirmDelete: { en: "Are you sure?", th: "คุณแน่ใจหรือไม่?" },
  stampCount: { en: "Stamps", th: "แสตมป์" },
  quizCount: { en: "Quizzes", th: "แบบทดสอบ" },
  registeredAt: { en: "Registered", th: "ลงทะเบียนเมื่อ" },
  alreadyStamped: { en: "Already stamped at this booth", th: "ประทับตราที่บูธนี้แล้ว" },
  settings: { en: "Settings", th: "ตั้งค่า" },
} as const

export type DictKey = keyof typeof dict

export function t(key: DictKey, lang: Language): string {
  return dict[key]?.[lang] ?? key
}
