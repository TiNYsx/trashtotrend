import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "./globals.css"

const dbHelvethaica = localFont({
  src: "../fonts/DB Helvethaica X Li v3.2.ttf",
  variable: "--font-sans",
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
      <body className={`${dbHelvethaica.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
