import { Suspense } from "react"
import QuizResultContent from "./QuizResultContent"

export default function QuizResultPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-dvh gradient-bg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    }>
      <QuizResultContent />
    </Suspense>
  )
}
