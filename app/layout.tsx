import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { SensorProvider } from "@/context/sensor-context"
import { AlertProvider } from "@/context/alert-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgriLink - Plateforme IoT pour l'Agriculture",
  description: "Connectez vos cultures avec la technologie IoT pour une agriculture intelligente et durable.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SensorProvider>
              <AlertProvider>
                {children}
                <Toaster />
              </AlertProvider>
            </SensorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
