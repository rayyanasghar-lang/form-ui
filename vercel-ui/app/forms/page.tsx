"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import PermitPlansetForm from "@/components/permit-planset-form"

export default function FormsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/20">
      <Navbar
        title="Forms"
        backLink={{ label: "Dashboard", href: "/dashboard" }}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-6 md:mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard" className="md:hidden">
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
              planset. Data is automatically fetched from ASCE, Regrid, and Zillow.
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
  )
}
