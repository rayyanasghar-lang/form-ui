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
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10 transition-opacity duration-500">
        {/* Light Mode Background */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${mounted && theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: "url('/bg-solar.jpg')" }}
        />
        {/* Dark Mode Background */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${mounted && theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: "url('/bg-solar-dark.jpg')" }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
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
              <h1 className="text-2xl sm:text-3xl font-semibold text-balance text-white drop-shadow-md">Permit Planset Form</h1>
              <p className="text-white/80 text-sm sm:text-base drop-shadow-md">Complete your permit planset request</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Form */}
        <PermitPlansetForm />
      </div>
    </main>
  )
}
