"use client"

import { useState, useMemo } from "react"
import Stepper from "./stepper"
import FormCard from "./form-card"
import FormButtons from "./form-buttons"
import FileUploader from "./file-uploader"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const STEPS = ["Billing", "Payment", "Review"]

export default function PaymentForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    streetAddress: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
    amount: "",
    paymentReference: "",
    paymentMethod: "",
    checkUpload: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const cardFee = useMemo(() => {
    if (formData.paymentMethod === "card" && formData.amount) {
      const fee = Number.parseFloat(formData.amount) * 0.03
      return Math.round(fee * 100) / 100
    }
    return 0
  }, [formData.paymentMethod, formData.amount])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      if (!formData.companyName) newErrors.companyName = "Company name is required"
      if (!formData.email) newErrors.email = "Email is required"
      if (!formData.streetAddress) newErrors.streetAddress = "Street address is required"
      if (!formData.city) newErrors.city = "City is required"
      if (!formData.state) newErrors.state = "State is required"
      if (!formData.zip) newErrors.zip = "ZIP code is required"
    } else if (step === 1) {
      if (!formData.amount) newErrors.amount = "Amount is required"
      if (!formData.paymentMethod) newErrors.paymentMethod = "Payment method is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        console.log("Payment submitted:", formData)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <form className="space-y-6">
      <Stepper steps={STEPS} currentStep={currentStep} />

      {/* Step 1: Billing Details */}
      {currentStep === 0 && (
        <FormCard title="Billing Information">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Company name"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
              />
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                placeholder="billing@company.com"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Input
                id="streetAddress"
                placeholder="123 Main St"
                value={formData.streetAddress}
                onChange={(e) => updateField("streetAddress", e.target.value)}
              />
              {errors.streetAddress && <p className="text-sm text-destructive">{errors.streetAddress}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apt">Apt/Suite (Optional)</Label>
                <Input
                  id="apt"
                  placeholder="Apt 123"
                  value={formData.apt}
                  onChange={(e) => updateField("apt", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="CA"
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  placeholder="94105"
                  value={formData.zip}
                  onChange={(e) => updateField("zip", e.target.value)}
                />
                {errors.zip && <p className="text-sm text-destructive">{errors.zip}</p>}
              </div>
            </div>
          </div>
        </FormCard>
      )}

      {/* Step 2: Payment Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <FormCard title="Payment Information">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD) *</Label>
                <Input
                  id="amount"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentReference">Payment Reference (Optional)</Label>
                <Input
                  id="paymentReference"
                  placeholder="Invoice or memo"
                  value={formData.paymentReference}
                  onChange={(e) => updateField("paymentReference", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Invoice number or payment memo</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <Label>Payment Method *</Label>
                <RadioGroup value={formData.paymentMethod} onValueChange={(v) => updateField("paymentMethod", v)}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="check" id="payment-check" />
                    <Label htmlFor="payment-check" className="font-normal cursor-pointer">
                      Check – Mobile Deposit
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="card" id="payment-card" />
                    <Label htmlFor="payment-card" className="font-normal cursor-pointer">
                      Debit/Credit (3% fee)
                    </Label>
                  </div>
                </RadioGroup>
                {errors.paymentMethod && <p className="text-sm text-destructive">{errors.paymentMethod}</p>}
              </div>

              {formData.paymentMethod === "check" && (
                <FileUploader
                  label="Upload Check Photo"
                  description="Front and back photos for mobile deposit"
                  onFilesSelected={(files) => {
                    updateField(
                      "checkUpload",
                      files.map((f) => f.name),
                    )
                  }}
                />
              )}
            </div>
          </FormCard>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Review before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Amount</span>
                  <span className="text-lg font-semibold">
                    ${formData.amount ? Number.parseFloat(formData.amount).toFixed(2) : "0.00"}
                  </span>
                </div>

                {cardFee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Processing Fee (3%)</span>
                    <span className="text-muted-foreground">+${cardFee.toFixed(2)}</span>
                  </div>
                )}

                {cardFee > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Due</span>
                      <span className="text-lg font-bold">
                        ${(Number.parseFloat(formData.amount || "0") + cardFee).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">
                    {formData.paymentMethod === "check" ? "Check Deposit" : "Debit/Credit Card"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Address</span>
                  <span className="font-medium">
                    {formData.city}, {formData.state}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground">
                Click "Complete Payment" to submit. You will receive a confirmation email at{" "}
                <span className="font-medium">{formData.email}</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <FormButtons
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === STEPS.length - 1}
        nextLabel={currentStep === STEPS.length - 1 ? "Complete Payment" : "Next"}
      />
    </form>
  )
}
