"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/nav-sidebar";
import { VoiceAssistantWrapper } from "@/components/voice-assistant-wrapper";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/c" || pathname === "/beta";

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        {children}
      </main>
      <VoiceAssistantWrapper />
    </div>
  );
}
