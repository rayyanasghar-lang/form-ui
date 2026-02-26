"use client"

import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import PermitPlansetForm from "@/components/permit-planset-form"
import AuthGuard from "@/components/auth/auth-guard"

export default function FormsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormsPageContent />
    </Suspense>
  )
}

function FormsPageContent() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  // Currently we use these for pre-filling if needed
  const siteUuid = searchParams.get("siteUuid") || undefined
  const projectUuid = searchParams.get("projectUuid") || undefined

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col selection:bg-primary/20 relative overflow-hidden">
        <Navbar
          title="Forms"
          backLink={{ label: "Dashboard", href: "/projects" }}
        />


        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-6 md:mb-10">
              <div className="flex items-center gap-3 mb-2">
                <Link href="/projects" className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-zinc-500"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </Link>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
                  Permit Planset
                </h1>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl">
                Complete your project details to generate a professional permit
                planset.
              </p>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <PermitPlansetForm />
            </motion.div>
          </div>
        </main>

        {/* Footer (desktop only) */}
        <footer className="hidden md:block py-6 text-center text-muted-foreground/40 text-sm">
          &copy; {new Date().getFullYear()} SunPermit Portal
        </footer>
      </div>
    </AuthGuard>
  )
}
