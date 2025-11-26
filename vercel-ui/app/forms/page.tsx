"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SalesProposalForm from "@/components/sales-proposal-form"
import PermitPlansetForm from "@/components/permit-planset-form"
import PaymentForm from "@/components/payment-form"

export default function FormsPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-balance mb-2">Form Portal</h1>
          <p className="text-muted-foreground text-lg">Complete your request through our multi-step forms</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="sales">Sales Proposal</TabsTrigger>
            <TabsTrigger value="permit">Permit Planset</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <SalesProposalForm />
          </TabsContent>

          <TabsContent value="permit">
            <PermitPlansetForm />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
