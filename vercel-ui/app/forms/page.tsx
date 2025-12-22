"use client"
import Image from "next/image"
import PermitPlansetForm from "@/components/permit-planset-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function FormsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-primary/40 via-secondary/20 to-transparent" />
        <div className="absolute -bottom-64 -left-64 w-[800px] h-[800px] bg-secondary/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute -bottom-64 -right-64 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header with Logo */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <Image
                src="/logo.png"
                alt="SunPermit Logo"
                width={120}
                height={60}
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-balance text-primary drop-shadow-sm tracking-tight">Permit Planset Form</h1>
              <p className="text-foreground/70 font-medium text-sm sm:text-base">Complete your permit planset request</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Form */}
        <PermitPlansetForm />
      </div>

      {/* Gradient overlay from bottom */}
      <div className="gradient-overlay" />
    </main>
  )
}
