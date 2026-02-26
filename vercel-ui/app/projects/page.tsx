"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  PanelLeft,
  X,
  Search,
  Bell,
  LogOut
} from "lucide-react"
import { useRouter } from "next/navigation"
import { signoutAction } from "@/app/actions/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar, { SidebarToggle } from "@/components/layout/sidebar"
import { useProjectsList } from "@/hooks/use-projects-list"
import { ProjectsTable } from "@/components/projects/projects-table"
import AuthGuard from "@/components/auth/auth-guard"

export default function ProjectsPage() {
  /* State */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Use the real-time hook
  const { projects, isLoading, error } = useProjectsList()

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    
    return (
      project.name?.toLowerCase().includes(query) ||
      project.address?.toLowerCase().includes(query) ||
      project.status?.toLowerCase().includes(query)
    )
  })
  
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background relative overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-xl lg:hidden"
              >
                <div className="absolute top-4 right-4 z-50">
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5 text-sidebar-foreground/50 hover:text-sidebar-foreground" />
                  </Button>
                </div>
                <Sidebar className="h-full border-none" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-screen sticky top-0 z-40">
          <Sidebar 
            variant="dashboard"
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Top Header Bar */}
          <div className="sticky top-0 z-10 border-b border-border bg-background/80 supports-backdrop-filter:bg-background/60 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Mobile Menu Trigger */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 text-zinc-600"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {sidebarCollapsed && (
                  <SidebarToggle onClick={() => setSidebarCollapsed(false)} />
                )}
                <h1 className="text-xl lg:text-2xl font-bold text-zinc-900">
                  Projects
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="Search projects by anything..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 h-9 pl-10 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white text-sm transition-all focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-zinc-500 hover:text-zinc-900 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Sign Out"
                  className="h-9 w-9 rounded-full text-zinc-500 hover:text-destructive transition-colors ml-1"
                  onClick={async () => {
                    await signoutAction()
                    localStorage.removeItem("contractor")
                    window.location.href = "/"
                  }}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6 space-y-5 lg:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="pb-20"
            >
              <ProjectsTable 
                projects={filteredProjects} 
                isLoading={isLoading} 
                error={error} 
              />
            </motion.div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
