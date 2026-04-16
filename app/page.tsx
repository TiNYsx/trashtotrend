import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const session = await getSession()

  if (session?.role === "customer") {
    redirect("/stamps")
  }
  if (session?.role === "staff" || session?.role === "admin") {
    redirect("/staff/dashboard")
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="animate-fade-in-up flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Thesis Exhibition</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
            FROM TRASH
          </h1>
          <p className="font-serif text-3xl italic text-accent">To Trend</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            when something that was once seen as worthless gets transformed into something valuable
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-secondary"
          >
            Register
          </Link>
        </div>

        <Link
          href="/staff/login"
          className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Staff Portal
        </Link>
      </div>
    </main>
  )
}
