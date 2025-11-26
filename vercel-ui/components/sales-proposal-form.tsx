"use client"

import { useState } from "react"
import Stepper from "./stepper"
import FormCard from "./form-card"
import FormButtons from "./form-buttons"
import FileUploader from "./file-uploader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

const STEPS = ["Basic Info", "Electrical", "Preferences", "Equipment", "Resources"]

export default function SalesProposalForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    projectType: "",
    projectName: "",
    projectAddress: "",
    isNewConstruction: "",
    systemSizing: "",
    fireOffset: "",
    electricityBillAvailable: "",
    annualConsumption: "",
    purchasePreference: "",
    projectNotes: "",
    pricePerWatt: "",
    moduleManufacturer: "",
    moduleWattage: "",
    inverterType: "",
    projectManagerEmail: "",
    companyName: "",
    projectResources: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // const validateStep = (step: number): boolean => {
  //   const newErrors: Record<string, string> = {}

  //   if (step === 0) {
  //     if (!formData.projectType) newErrors.projectType = "Project type is required"
  //     if (!formData.projectName) newErrors.projectName = "Project name is required"
  //     if (!formData.projectAddress) newErrors.projectAddress = "Project address is required"
  //     if (!formData.isNewConstruction) newErrors.isNewConstruction = "This field is required"
  //   } else if (step === 1) {
  //     if (!formData.systemSizing) newErrors.systemSizing = "System sizing is required"
  //     if (!formData.fireOffset) newErrors.fireOffset = "Fire offset is required"
  //     if (!formData.electricityBillAvailable) newErrors.electricityBillAvailable = "This field is required"
  //     if (!formData.annualConsumption) newErrors.annualConsumption = "Annual consumption is required"
  //   } else if (step === 2) {
  //     if (!formData.purchasePreference) newErrors.purchasePreference = "Purchase preference is required"
  //   } else if (step === 3) {
  //     if (!formData.pricePerWatt) newErrors.pricePerWatt = "Price per watt is required"
  //     if (!formData.moduleManufacturer) newErrors.moduleManufacturer = "Module manufacturer is required"
  //     if (!formData.moduleWattage) newErrors.moduleWattage = "Module wattage is required"
  //     if (!formData.inverterType) newErrors.inverterType = "Inverter type is required"
  //   } else if (step === 4) {
  //     if (!formData.companyName) newErrors.companyName = "Company name is required"
  //     if (!formData.projectManagerEmail) newErrors.projectManagerEmail = "Email is required"
  //   }

  //   setErrors(newErrors)
  //   return Object.keys(newErrors).length === 0
  // }

  const handleNext = () => {
    //if (validateStep(currentStep)) {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      console.log("Form submitted:", formData)
    }
    //}
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <form className="space-y-6">
      <Stepper steps={STEPS} currentStep={currentStep} />

      {/* Step 1: Basic Project Info */}
      {currentStep === 0 && (
        <FormCard title="Basic Project Information" description="Tell us about your project">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type *</Label>
              <Select value={formData.projectType} onValueChange={(v) => updateField("projectType", v)}>
                <SelectTrigger id="projectType">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
              {errors.projectType && <p className="text-sm text-destructive">{errors.projectType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                placeholder="e.g., Downtown Solar Complex"
                value={formData.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
              />
              {errors.projectName && <p className="text-sm text-destructive">{errors.projectName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectAddress">Project Address *</Label>
              <Input
                id="projectAddress"
                placeholder="Enter full address"
                value={formData.projectAddress}
                onChange={(e) => updateField("projectAddress", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Auto-detect available (placeholder)</p>
              {errors.projectAddress && <p className="text-sm text-destructive">{errors.projectAddress}</p>}
            </div>

            <div className="space-y-3">
              <Label>Is this a new construction? *</Label>
              <RadioGroup value={formData.isNewConstruction} onValueChange={(v) => updateField("isNewConstruction", v)}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="yes" id="newConstruction-yes" />
                  <Label htmlFor="newConstruction-yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="no" id="newConstruction-no" />
                  <Label htmlFor="newConstruction-no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {errors.isNewConstruction && <p className="text-sm text-destructive">{errors.isNewConstruction}</p>}
            </div>
          </div>
        </FormCard>
      )}

      {/* Step 2: Electrical & Sizing */}
      {currentStep === 1 && (
        <FormCard title="Electrical & System Sizing">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemSizing">System Sizing Strategy *</Label>
              <Select value={formData.systemSizing} onValueChange={(v) => updateField("systemSizing", v)}>
                <SelectTrigger id="systemSizing">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumption">Based on consumption</SelectItem>
                  <SelectItem value="space">Based on available space</SelectItem>
                  <SelectItem value="budget">Based on budget</SelectItem>
                </SelectContent>
              </Select>
              {errors.systemSizing && <p className="text-sm text-destructive">{errors.systemSizing}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fireOffset">Minimum Fire Offset *</Label>
              <Select value={formData.fireOffset} onValueChange={(v) => updateField("fireOffset", v)}>
                <SelectTrigger id="fireOffset">
                  <SelectValue placeholder="Select offset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3ft">3 ft</SelectItem>
                  <SelectItem value="6ft">6 ft</SelectItem>
                  <SelectItem value="10ft">10 ft</SelectItem>
                </SelectContent>
              </Select>
              {errors.fireOffset && <p className="text-sm text-destructive">{errors.fireOffset}</p>}
            </div>

            <div className="space-y-3">
              <Label>Do you have your electricity bill? *</Label>
              <RadioGroup
                value={formData.electricityBillAvailable}
                onValueChange={(v) => updateField("electricityBillAvailable", v)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="yes" id="electricityBill-yes" />
                  <Label htmlFor="electricityBill-yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="no" id="electricityBill-no" />
                  <Label htmlFor="electricityBill-no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {errors.electricityBillAvailable && (
                <p className="text-sm text-destructive">{errors.electricityBillAvailable}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualConsumption">Annual Electricity Consumption (kWh) *</Label>
              <Input
                id="annualConsumption"
                placeholder="e.g., 12000"
                type="number"
                value={formData.annualConsumption}
                onChange={(e) => updateField("annualConsumption", e.target.value)}
              />
              {errors.annualConsumption && <p className="text-sm text-destructive">{errors.annualConsumption}</p>}
            </div>
          </div>
        </FormCard>
      )}

      {/* Step 3: Preferences */}
      {currentStep === 2 && (
        <FormCard title="Customer Preferences">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Purchase Preference *</Label>
              <RadioGroup
                value={formData.purchasePreference}
                onValueChange={(v) => updateField("purchasePreference", v)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="cash" id="purchase-cash" />
                  <Label htmlFor="purchase-cash" className="font-normal cursor-pointer">
                    Cash
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="loan" id="purchase-loan" />
                  <Label htmlFor="purchase-loan" className="font-normal cursor-pointer">
                    Loan
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="both" id="purchase-both" />
                  <Label htmlFor="purchase-both" className="font-normal cursor-pointer">
                    Both
                  </Label>
                </div>
              </RadioGroup>
              {errors.purchasePreference && <p className="text-sm text-destructive">{errors.purchasePreference}</p>}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="projectNotes">Project Notes & Special Requirements</Label>
              <Textarea
                id="projectNotes"
                placeholder="Add any special requirements or notes..."
                className="resize-none"
                rows={4}
                value={formData.projectNotes}
                onChange={(e) => updateField("projectNotes", e.target.value)}
              />
            </div>
          </div>
        </FormCard>
      )}

      {/* Step 4: Equipment Details */}
      {currentStep === 3 && (
        <FormCard title="Equipment Details">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerWatt">$ per Watt Offered *</Label>
                <Input
                  id="pricePerWatt"
                  placeholder="e.g., 2.50"
                  type="number"
                  step="0.01"
                  value={formData.pricePerWatt}
                  onChange={(e) => updateField("pricePerWatt", e.target.value)}
                />
                {errors.pricePerWatt && <p className="text-sm text-destructive">{errors.pricePerWatt}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="moduleWattage">Module Wattage *</Label>
                <Input
                  id="moduleWattage"
                  placeholder="e.g., 400"
                  type="number"
                  value={formData.moduleWattage}
                  onChange={(e) => updateField("moduleWattage", e.target.value)}
                />
                {errors.moduleWattage && <p className="text-sm text-destructive">{errors.moduleWattage}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moduleManufacturer">Module Manufacturer *</Label>
              <Select value={formData.moduleManufacturer} onValueChange={(v) => updateField("moduleManufacturer", v)}>
                <SelectTrigger id="moduleManufacturer">
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunpower">SunPower</SelectItem>
                  <SelectItem value="lg">LG Electronics</SelectItem>
                  <SelectItem value="panasonic">Panasonic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.moduleManufacturer && <p className="text-sm text-destructive">{errors.moduleManufacturer}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inverterType">Inverter Type *</Label>
              <Select value={formData.inverterType} onValueChange={(v) => updateField("inverterType", v)}>
                <SelectTrigger id="inverterType">
                  <SelectValue placeholder="Select inverter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="microinverter">Microinverter</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              {errors.inverterType && <p className="text-sm text-destructive">{errors.inverterType}</p>}
            </div>
          </div>
        </FormCard>
      )}

      {/* Step 5: Resources Upload */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <FormCard title="Project Resources">
            <FileUploader
              label="Upload Project Resources"
              description="PDF, images, or documents related to the project"
              onFilesSelected={(files) => {
                updateField(
                  "projectResources",
                  files.map((f) => f.name),
                )
              }}
            />
          </FormCard>

          <FormCard title="Contact Information">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Your company name"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                />
                {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectManagerEmail">Project Manager Email *</Label>
                <Input
                  id="projectManagerEmail"
                  placeholder="manager@company.com"
                  type="email"
                  value={formData.projectManagerEmail}
                  onChange={(e) => updateField("projectManagerEmail", e.target.value)}
                />
                {errors.projectManagerEmail && <p className="text-sm text-destructive">{errors.projectManagerEmail}</p>}
              </div>
            </div>
          </FormCard>
        </div>
      )}

      <FormButtons
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === STEPS.length - 1}
      />
    </form>
  )
}
