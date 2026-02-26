"use client"

import AuthGuard from "@/components/auth/auth-guard"
import Sidebar from "@/components/layout/sidebar"
import { SiteProjectManager } from "@/components/sites/site-project-manager"
import { useState } from "react"
import { Menu } from "lucide-react"

export default function TechnicalPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background relative overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-screen sticky top-0 z-40">
          <Sidebar 
            variant="dashboard"
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto relative">
           {/* Mobile Menu Trigger */}
           <div className="lg:hidden absolute top-4 left-4 z-50">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 rounded-lg bg-white shadow-md text-zinc-600 border border-zinc-100"
                >
                    <Menu className="h-6 w-6" />
                </button>
           </div>

           <SiteProjectManager />
        </main>
      </div>
    </AuthGuard>
  )
}
