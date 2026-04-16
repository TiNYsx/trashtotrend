import Link from 'next/link'
import { ArrowLeft, Recycle, Leaf, Users, Globe, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="relative min-h-dvh gradient-bg">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-accent/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="relative z-10 min-h-dvh px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="font-display font-bold">HOOP</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </Link>
        </div>

        <div className="max-w-lg mx-auto space-y-12">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="font-display text-4xl font-bold">About HOOP</h1>
            <p className="text-xl text-accent italic">From Trash to Trend</p>
          </div>

          {/* Mission */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              HOOP is a creative exhibition exploring the transformation of aluminium from waste to worth. 
              We believe that what society discards can become something valuable through innovation, 
              creativity, and conscious consumption.
            </p>
          </div>

          {/* Circular Economy */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Recycle className="h-5 w-5 text-accent" />
              </div>
              <h2 className="font-display text-xl font-bold">Circular Economy</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The aluminium loop represents one of the most efficient recycling systems on Earth. 
              Did you know that aluminium can be recycled infinitely without losing quality? 
              Every can you bring becomes part of this endless cycle of renewal.
            </p>
          </div>

          {/* Impact */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-2/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-chart-2" />
              </div>
              <h2 className="font-display text-xl font-bold">Environmental Impact</h2>
            </div>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                By participating, you help:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Reduce landfill waste
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Save 95% energy compared to new aluminium production
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Support local recycling initiatives
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Create awareness for sustainable practices
                </li>
              </ul>
            </div>
          </div>

          {/* Partners */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-chart-3" />
              </div>
              <h2 className="font-display text-xl font-bold">Partners & Sponsors</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              This exhibition is made possible through partnerships with environmental organizations, 
              local businesses, and creative communities committed to sustainability.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-2 h-14 px-8 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:scale-[1.02] glow-primary"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
