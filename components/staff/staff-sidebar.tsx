"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/components/providers"
import { LanguageToggle } from "@/components/language-toggle"
import { logout } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Store,
  ScanLine,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  BrainCircuit,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/staff/dashboard", icon: LayoutDashboard, labelKey: "dashboard" as const },
  { href: "/staff/scan", icon: ScanLine, labelKey: "scanQR" as const },
  { href: "/staff/booths", icon: Store, labelKey: "booths" as const },
  { href: "/staff/registration", icon: ClipboardList, labelKey: "registrationFields" as const },
  { href: "/staff/quiz", icon: BrainCircuit, labelKey: "quizQuestions" as const },
  { href: "/staff/customers", icon: Users, labelKey: "customers" as const },
  { href: "/staff/settings", icon: Settings, labelKey: "settings" as const },
]

export function StaffSidebar({ username }: { username: string }) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          borderImage: 'linear-gradient(180deg, rgba(192, 192, 192, 0.3) 0%, rgba(192, 192, 192, 0.1) 100%) 1'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-5" style={{
          borderImage: 'linear-gradient(90deg, rgba(192, 192, 192, 0.2) 0%, transparent 100%) 1'
        }}>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/images/Hoop 1.png"
                alt="HOOP"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xs chrome-text-subtle">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-white/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t px-3 py-4" style={{
          borderImage: 'linear-gradient(90deg, rgba(192, 192, 192, 0.2) 0%, transparent 100%) 1'
        }}>
          <div className="mb-3 flex items-center justify-between px-3">
            <span className="text-xs text-muted-foreground">{username}</span>
            <LanguageToggle />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
