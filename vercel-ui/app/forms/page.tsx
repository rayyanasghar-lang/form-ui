"use client"

import { motion } from "framer-motion"
import Image from "next/image"
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
    <div className="min-h-screen relative selection:bg-primary/20">
      <Navbar title="Forms" backLink={{ label: "Dashboard", href: "/dashboard" }} />

      <main className="py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          {/* Page Title Section */}
          <div className="mb-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <Link href="/dashboard" className="md:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </Link>
              <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
                Permit Planset Form
              </h1>
            </div>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl px-4 md:px-0">
              Complete your project details below to generate a professional permit planset. 
              Our system will cross-reference data from ASCE, Regrid, and Zillow automatically.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PermitPlansetForm />
          </motion.div>
        </div>
      </main>

      <footer className="py-12 text-center text-muted-foreground/40 text-sm">
        <p>&copy; {new Date().getFullYear()} SunPermit Portal. All systems operational.</p>
      </footer>
    </div>
  )
}
