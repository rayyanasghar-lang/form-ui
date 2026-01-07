"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/layout/sidebar"
import PermitPlansetForm from "@/components/permit-planset-form"

export default function FormsPage() {
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-background">
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
                   <X className="h-5 w-5 text-zinc-500" />
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
        <div className="border-b border-border bg-sidebar sticky top-0 z-30">
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
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 rounded-lg hover:bg-black/5 transition-colors text-zinc-500 hover:text-zinc-900 -ml-2"
                  title="Show sidebar"
                >
                  <PanelLeft className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-xl lg:text-2xl font-bold text-zinc-900">Permit Planset</h1>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-5 lg:space-y-6">
          {/* Header */}
          <div className="mb-2">
            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl">
              Complete your project details to generate a professional permit
              planset. Data is automatically fetched from ASCE, Regrid, and Zillow.
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="pb-20"
          >
            <PermitPlansetForm />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
