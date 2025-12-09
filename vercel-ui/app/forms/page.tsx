"use client"
import Image from "next/image"
import PermitPlansetForm from "@/components/permit-planset-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function FormsPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Professional gradient background - lighter and shinier */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl" />
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
              <h1 className="text-2xl sm:text-3xl font-semibold text-balance text-foreground">Permit Planset Form</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Complete your permit planset request</p>
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
