import { StaffLoginForm } from "@/components/staff/staff-login-form"

export default function StaffLoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="animate-fade-in-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Staff Portal</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
            FROM TRASH
          </h1>
          <p className="font-serif text-2xl italic text-accent">To Trend</p>
        </div>
        <StaffLoginForm />
      </div>
    </main>
  )
}
