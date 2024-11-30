"use client"

import './globals.css'
import '../styles/theme.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AppProvider } from "@/lib/AppContext"
import { ThemeSwitcher } from "@/components/theme-switcher"
import BackgroundAnimation from "@/components/BackgroundAnimation"
import { SessionProvider } from "next-auth/react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <title>MyOutFood</title>
        <meta name="description" content="Kıyafetinize uygun yemek önerileri" />
      </head>
      <body className="min-h-screen">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange
            storageKey="myoutfood-theme"
          >
            <AppProvider>
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  <BackgroundAnimation />
                  <div className="fixed inset-0 bg-grid-small-black/[0.15] dark:bg-grid-small-white/[0.15] -z-10" />
                  <div className="fixed inset-0 bg-gradient-to-t from-background/80 via-background/50 to-background/30 -z-10" />                
                  <ThemeSwitcher />
                  {children}
                </div>
              </div>
              <Toaster />
            </AppProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
