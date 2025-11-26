"use client"
import PermitPlansetForm from "@/components/permit-planset-form"

export default function FormsPage() {
  return (
    <main className="min-h-screen bg-slate-400 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-balance mb-2">Permit Planset Form</h1>
          <p className="text-muted-foreground text-lg">Complete your permit planset request</p>
        </div>

        {/* Form */}
        <PermitPlansetForm />
      </div>
    </main>
  )
}
