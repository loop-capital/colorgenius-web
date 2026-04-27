import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/nav-sidebar"

export const metadata: Metadata = {
  title: "ColorGenius — Professional Hair Color Formulation",
  description: "AI-powered hair color analysis and professional formulation for stylists.",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ background: '#0A0A0F', color: '#F5F5F7' }}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64 pt-14 md:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}