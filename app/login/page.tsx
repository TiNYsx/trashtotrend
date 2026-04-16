'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers'

export default function LoginPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const t = {
    staffLogin: lang === 'th' ? 'เจ้าหน้าที่เข้าสู่ระบบ' : 'Staff Login',
    welcomeBack: lang === 'th' ? 'ยินดีต้อนรับกลับ' : 'Welcome Back',
    signInCont: lang === 'th' ? 'เข้าสู่ระบบเพื่อดำเนินการต่อ' : 'Sign in to continue your journey',
    email: lang === 'th' ? 'อีเมล' : 'Email',
    yourEmail: lang === 'th' ? 'อีเมลของคุณ' : 'your@email.com',
    password: lang === 'th' ? 'รหัสผ่าน' : 'Password',
    yourPassword: lang === 'th' ? 'รหัสผ่านของคุณ' : 'Your password',
    signIn: lang === 'th' ? 'เข้าสู่ระบบ' : 'Sign In',
    loginFailed: lang === 'th' ? 'เข้าสู่ระบบล้มเหลว' : 'Login failed',
    somethingWrong: lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง' : 'Something went wrong. Please try again.',
    noAccount: lang === 'th' ? 'ยังไม่มีบัญชี?' : "Don't have an account?",
    register: lang === 'th' ? 'ลงทะเบียน' : 'Register',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'user' })
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || t.loginFailed)
      }
    } catch (err) {
      setError(t.somethingWrong)
    }
    setIsLoading(false)
  }

  return (
    <main className="relative min-h-dvh gradient-bg overflow-hidden">
      {/* Chrome Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{
          background: 'radial-gradient(circle, rgba(192, 192, 192, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }} />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/images/Hoop 1.png"
                alt="HOOP"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="font-display text-xl font-bold chrome-text">HOOP</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link
              href="/staff/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t.staffLogin}
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <div className="relative w-24 h-24">
              <Image
                src="/images/Hoop 1.png"
                alt="HOOP"
                width={96}
                height={96}
                className="object-contain drop-shadow-xl"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl font-bold chrome-text mb-2">{t.welcomeBack}</h1>
            <p className="text-muted-foreground">{t.signInCont}</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="w-full space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">{t.email}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                placeholder={t.yourEmail}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">{t.password}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                placeholder={t.yourPassword}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full h-14 flex items-center justify-center gap-2 rounded-xl chrome-button font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 mt-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="chrome-text">{t.signIn}</span>
                  <ArrowRight className="h-5 w-5 chrome-text-subtle transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            {t.noAccount}{' '}
            <Link href="/event/register" className="text-primary hover:underline">
              {t.register}
            </Link>
          </motion.p>
        </div>
      </div>
    </main>
  )
}
