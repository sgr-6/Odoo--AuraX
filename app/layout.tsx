// @ts-nocheck
// @ts-nocheck
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dayflow HRMS",
  description: "Modern Human Resources Management System",
}

import { GlobalStoreProvider } from "@/lib/store/GlobalStore"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalStoreProvider>
          {children}
        </GlobalStoreProvider>
      </body>
    </html>
  )
}
