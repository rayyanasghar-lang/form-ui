"use client"

import { useState } from "react"
import Stepper from "./stepper"
import FormCard from "./form-card"
import FormButtons from "./form-buttons"
import FileUploader from "./file-uploader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

const STEPS = ["Contact", "Services", "Submission", "System", "Uploads"]
const AVAILABLE_SERVICES = [
  { id: "permit", label: "Permit" },
  { id: "electrical", label: "Electrical" },
  { id: "engineering", label: "Engineering" },
  { id: "design", label: "Design" },
]

export default function PermitPlansetForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    yourCompanyName: "",
    yourEmail: "",
    projectManagerEmail: "",
    newProjectName: "",
    jobName: "",
    projectAddress: "",
    propertyCategory: "",
    services: [] as string[],
    batteryBackup: false,
    submissionType: "",
    generalNotes: "",
    projectInstructions: "",
    systemType: "",
    uploads: {
      proposedLayout: [] as string[],
      electricityBill: [] as string[],
      roofPictures: [] as string[],
      atticPictures: [] as string[],
      electricPictures: [] as string[],
      propertySketch: [] as string[],
    },
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const updateUploads = (field: string, files: string[]) => {
    setFormData((prev) => ({
      ...prev,
      uploads: { ...prev.uploads, [field]: files },
    }))
  }

  const toggleService = (serviceId: string) => {
    const current = formData.services
    if (current.includes(serviceId)) {
      updateField(
        "services",
        current.filter((id) => id !== serviceId),
      )
    } else {
      updateField("services", [...current, serviceId])
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      if (!formData.yourCompanyName) newErrors.yourCompanyName = "Company name is required"
      if (!formData.yourEmail) newErrors.yourEmail = "Email is required"
      if (!formData.newProjectName) newErrors.newProjectName = "Project name is required"
      if (!formData.projectAddress) newErrors.projectAddress = "Project address is required"
    } else if (step === 1) {
      if (!formData.propertyCategory) newErrors.propertyCategory = "Property category is required"
      if (formData.services.length === 0) newErrors.services = "Select at least one service"
    } else if (step === 2) {
      if (!formData.submissionType) newErrors.submissionType = "Submission type is required"
    } else if (step === 3) {
      if (!formData.systemType) newErrors.systemType = "System type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        console.log("Form submitted:", formData)
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

      {/* Step 1: Contact & Basic Details */}
      {currentStep === 0 && (
        <FormCard title="Contact Information">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yourCompanyName">Your Company Name *</Label>
              <Input
                id="yourCompanyName"
                placeholder="Company name"
                value={formData.yourCompanyName}
                onChange={(e) => updateField("yourCompanyName", e.target.value)}
              />
              {errors.yourCompanyName && <p className="text-sm text-destructive">{errors.yourCompanyName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yourEmail">Your Email Address *</Label>
              <Input
                id="yourEmail"
                placeholder="email@company.com"
                type="email"
                value={formData.yourEmail}
                onChange={(e) => updateField("yourEmail", e.target.value)}
              />
              {errors.yourEmail && <p className="text-sm text-destructive">{errors.yourEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectManagerEmail">Project Manager Email (Optional)</Label>
              <Input
                id="projectManagerEmail"
                placeholder="manager@company.com"
                type="email"
                value={formData.projectManagerEmail}
                onChange={(e) => updateField("projectManagerEmail", e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newProjectName">New Project Name *</Label>
              <Input
                id="newProjectName"
                placeholder="Project name"
                value={formData.newProjectName}
                onChange={(e) => updateField("newProjectName", e.target.value)}
              />
              {errors.newProjectName && <p className="text-sm text-destructive">{errors.newProjectName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobName">Job Name (Optional)</Label>
              <Input
                id="jobName"
                placeholder="Job identifier"
                value={formData.jobName}
                onChange={(e) => updateField("jobName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectAddress">Project Address *</Label>
              <Input
                id="projectAddress"
                placeholder="Full address"
                value={formData.projectAddress}
                onChange={(e) => updateField("projectAddress", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Auto-detect available (placeholder)</p>
              {errors.projectAddress && <p className="text-sm text-destructive">{errors.projectAddress}</p>}
            </div>
          </div>
        </FormCard>
      )}

      {/* Step 2: Services */}
      {currentStep === 1 && (
        <FormCard title="Project Services">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyCategory">Property Category *</Label>
              <Select value={formData.propertyCategory} onValueChange={(v) => updateField("propertyCategory", v)}>
                <SelectTrigger id="propertyCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              {errors.propertyCategory && <p className="text-sm text-destructive">{errors.propertyCategory}</p>}
            </div>

            <div className="space-y-2">
              <Label>Services Required *</Label>
              <div className="space-y-3">
                {AVAILABLE_SERVICES.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={service.id}
                      checked={formData.services.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <Label htmlFor={service.id} className="font-normal cursor-pointer">
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.services && <p className="text-sm text-destructive">{errors.services}</p>}
            </div>

            <Separator />

            <div className="flex items-center space-x-3">
              <Checkbox
                id="batteryBackup"
                checked={formData.batteryBackup}
                onCheckedChange={(checked) => updateField("batteryBackup", checked === true)}
              />
              <Label htmlFor="batteryBackup" className="font-normal cursor-pointer">
                Battery Backup
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">Battery backup adds a 3% fee to your service</p>
          </div>
        </FormCard>
      )}

      {/* Step 3: Submission Preference */}
      {currentStep === 2 && (
        <FormCard title="Submission Preference">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Submission Type *</Label>
              <RadioGroup value={formData.submissionType} onValueChange={(v) => updateField("submissionType", v)}>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="quick" id="submission-quick" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="submission-quick" className="cursor-pointer">
                      Quick Submission
                    </Label>
                    <p className="text-sm text-muted-foreground">Streamlined process with minimal uploads</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 mt-4">
                  <RadioGroupItem value="detailed" id="submission-detailed" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="submission-detailed" className="cursor-pointer">
                      Detailed Submission
                    </Label>
                    <p className="text-sm text-muted-foreground">Comprehensive review with all documentation</p>
                  </div>
                </div>
              </RadioGroup>
              {errors.submissionType && <p className="text-sm text-destructive">{errors.submissionType}</p>}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="generalNotes">General Notes (Optional)</Label>
              <Textarea
                id="generalNotes"
                placeholder="Any general notes about the project..."
                className="resize-none"
                rows={3}
                value={formData.generalNotes}
                onChange={(e) => updateField("generalNotes", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectInstructions">Project Instructions (Optional)</Label>
              <Textarea
                id="projectInstructions"
                placeholder="Special instructions for the project..."
                className="resize-none"
                rows={3}
                value={formData.projectInstructions}
                onChange={(e) => updateField("projectInstructions", e.target.value)}
              />
            </div>
          </div>
        </FormCard>
      )}

      {/* Step 4: System Type */}
      {currentStep === 3 && (
        <FormCard title="System Configuration">
          <div className="space-y-2">
            <Label htmlFor="systemType">System Type *</Label>
            <Select value={formData.systemType} onValueChange={(v) => updateField("systemType", v)}>
              <SelectTrigger id="systemType">
                <SelectValue placeholder="Select system type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roofmount">Roof Mount</SelectItem>
                <SelectItem value="groundmount">Ground Mount</SelectItem>
              </SelectContent>
            </Select>
            {errors.systemType && <p className="text-sm text-destructive">{errors.systemType}</p>}
          </div>
        </FormCard>
      )}

      {/* Step 5: Uploads */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <FormCard title="Project Documentation">
            <div className="space-y-6">
              <FileUploader
                label="Proposed Layout"
                description="Design drawings or sketches"
                onFilesSelected={(files) =>
                  updateUploads(
                    "proposedLayout",
                    files.map((f) => f.name),
                  )
                }
              />

              <Separator />

              <FileUploader
                label="Electric Utility Bill"
                description="Current electricity bill or invoice"
                onFilesSelected={(files) =>
                  updateUploads(
                    "electricityBill",
                    files.map((f) => f.name),
                  )
                }
              />

              <Separator />

              <FileUploader
                label="Roof Pictures"
                description="Photos of the roof area"
                onFilesSelected={(files) =>
                  updateUploads(
                    "roofPictures",
                    files.map((f) => f.name),
                  )
                }
              />

              <Separator />

              <FileUploader
                label="Attic Pictures"
                description="Photos of the attic space (if applicable)"
                onFilesSelected={(files) =>
                  updateUploads(
                    "atticPictures",
                    files.map((f) => f.name),
                  )
                }
              />

              <Separator />

              <FileUploader
                label="Electric Pictures"
                description="Photos of electrical panel and components"
                onFilesSelected={(files) =>
                  updateUploads(
                    "electricPictures",
                    files.map((f) => f.name),
                  )
                }
              />

              <Separator />

              <FileUploader
                label="Property Sketch"
                description="Property layout sketch or diagram"
                onFilesSelected={(files) =>
                  updateUploads(
                    "propertySketch",
                    files.map((f) => f.name),
                  )
                }
              />
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
