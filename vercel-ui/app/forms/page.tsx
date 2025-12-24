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
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Gradient - Option 4: Vertical Fade (Subtle) */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#FAA93E]/5 via-[#EBE5DA] to-[#E76549]/10" />

      <div className="max-w-6xl mx-auto relative">
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

        {/* Illustrations on sides (visible only on very large screens) */}
        {/* <div className="hidden 2xl:block absolute -left-110 top-30 pointer-events-none animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Image
            src="/images/new2.png"
            alt="Solar Illustration Left"
            width={450}
            height={450}
            className="opacity-80 drop-shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
          />
        </div>
        <div className="hidden 2xl:block absolute -right-120 bottom-30 pointer-events-none animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <Image
            src="/images/left-illustration.png"
            alt="Solar Illustration Right"
            width={500}
            height={500}
            className="opacity-80 drop-shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
          />
        </div> */}

        {/* Form */}
        <PermitPlansetForm />
      </div>
    </main>
  )
}
