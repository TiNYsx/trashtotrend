import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HOOP - From Trash to Trend",
  description: "Experience the transformation of aluminium from waste to worth. Join our circular economy journey.",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
