"use client"

import { usePathname } from "next/navigation"

export function BackgroundGradient() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/projects") || pathname?.startsWith("/dashboard")

  // Reduced opacity for dashboard to improve readability
  const bottomOpacity = isDashboard ? 0.20 : 0.35
  const sideOpacity = isDashboard ? 0.15 : 0.30

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Bottom to Top Gradient */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[70vh]" 
          style={{ 
            background: 'linear-gradient(to top, var(--primary) 0%, transparent 100%)',
            opacity: bottomOpacity
          }} 
        />
        {/* Right to Left Gradient */}
        <div 
          className="absolute inset-y-0 right-0 w-[50vw]" 
          style={{ 
            background: 'linear-gradient(to left, var(--primary) 0%, transparent 100%)',
            opacity: sideOpacity
          }} 
        />

      </div>
  )
}
