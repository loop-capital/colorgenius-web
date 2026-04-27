import type { Metadata } from "next"
import Link from "next/link"
import {
  LayoutDashboard,
  FlaskConical,
  Camera,
  BookOpen,
  Users,
  History,
  ClipboardList,
  Sparkles,
} from "lucide-react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ColorGenius — Professional Hair Color Formulation",
  description: "AI-powered hair color analysis and professional formulation for stylists.",
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/formulate", label: "Formulate", icon: FlaskConical },
  { href: "/analyze", label: "Analyze", icon: Camera },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/history", label: "History", icon: History },
  { href: "/questionnaire", label: "Consultation", icon: ClipboardList },
]

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0F0F0F] text-[#F5F5F5]">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-64 bg-[#121212] border-r border-[#2A2A2A] fixed h-screen z-40">
            <div className="p-5 border-b border-[#2A2A2A]">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#2DD4BF] flex items-center justify-center shadow-lg shadow-[#14B8A6]/10">
                  <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
                </div>
                <span className="font-bold text-lg tracking-tight group-hover:text-[#14B8A6] transition-colors">
                  ColorGenius
                </span>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-all duration-150 text-sm font-medium"
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-[#2A2A2A]">
              <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
                <p className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold mb-1">Pleij Salon</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-[#A3A3A3]">Connected</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile header */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#14B8A6] to-[#2DD4BF] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
                </div>
                <span className="font-bold text-sm">ColorGenius</span>
              </Link>
              <div className="flex items-center gap-3 overflow-x-auto">
                {navItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-2 rounded-lg text-[#A3A3A3] hover:text-[#14B8A6] hover:bg-[#1A1A1A] transition-colors"
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 md:ml-64 pt-14 md:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
