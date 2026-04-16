import Image from "next/image"
import { StaffLoginForm } from "@/components/staff/staff-login-form"

export default function StaffLoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gradient-bg px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{
          background: 'radial-gradient(circle, rgba(192, 192, 192, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }} />
      </div>

      <div className="relative z-10 animate-fade-in-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Staff Portal</p>
          <div className="relative w-20 h-20 mx-auto mt-4">
            <Image
              src="/images/Hoop 1.png"
              alt="HOOP"
              width={80}
              height={80}
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>
        <StaffLoginForm />
      </div>
    </main>
  )
}
