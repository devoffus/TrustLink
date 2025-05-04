import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UPAuthProvider } from "@/components/up-profile/up-auth-provider"
import { Toaster } from "sonner"

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TrustLink - Decentralized Freelance Platform",
  description: "Connect, collaborate, and transact securely with LUKSO Universal Profiles",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${ibmPlexSans.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UPAuthProvider>
            <Toaster position="top-right" />
            {children}
          </UPAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
