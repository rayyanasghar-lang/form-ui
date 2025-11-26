"use client"

import { useState } from "react"
import Stepper from "./stepper"
import FormCard from "./form-card"
import FormButtons from "./form-buttons"
import FileUploader from "./file-uploader"
import SystemComponentsTable, { Component } from "./system-components-table"
import SiteDetails from "./site-details"
import ElectricalDetails from "./electrical-details"
import UtilityDetails from "./utility-details"
import OptionalExtras from "./optional-extras"
import ProjectSummary from "./project-summary"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Info } from "lucide-react"

const QUICK_STEPS = ["Project & Contact", "System Summary", "Uploads", "Notes"]
const DETAILED_STEPS = [
  "Project & Contact",
  "System Summary",
  "Site & Electrical",
  "Jurisdiction & Extras",
  "Uploads",
  "Notes",
]

const PERMIT_SERVICES = [
  { id: "planset", label: "Planset" },
  { id: "electrical", label: "Electrical Engineering" },
  { id: "rlc", label: "RLC Report" },
  { id: "technical", label: "Technical Review" },
  { id: "fullPackage", label: "Full Project Package" },
]

export default function PermitPlansetForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submissionMode, setSubmissionMode] = useState<"quick" | "detailed">("quick")
  const [components, setComponents] = useState<Component[]>([])

  const STEPS = submissionMode === "detailed" ? DETAILED_STEPS : QUICK_STEPS

  const [formData, setFormData] = useState({
    // Company Profile (auto-filled simulation)
    companyName: "Solar Solutions Inc.",
    contactName: "John Doe",
    email: "john.doe@solarsolutions.com",
    phone: "+1 (555) 123-4567",

    // Project Information
    projectName: "",
    projectAddress: "",
    projectType: "",

    // Permit Services
    services: [] as string[],

    // System Summary
    systemSize: "",
    systemType: "",
    pvModules: "",
    inverters: "",
    batteryBackup: false,
    batteryQty: "",
    batteryModel: "",
    batteryImage: [] as string[],

    // Uploads
    projectFiles: [] as string[],

    // General Notes
    generalNotes: "",

    // Full Details Mode - Site Details (Roof Mount)
    roofMaterial: "",
    roofPitch: "",
    numberOfArrays: "",
    arrayLayout: [] as string[],
    useRoofImages: false,

    // Full Details Mode - Site Details (Ground Mount)
    groundMountType: "",
    rowCount: "",
    moduleCountPerRow: "",
    foundationType: "",
    structuralNotes: "",
    structuralSketch: [] as string[],

    // Full Details Mode - Electrical Details
    mainPanelSize: "",
    busRating: "",
    mainBreaker: "",
    pvBreakerLocation: "",
    oneLineDiagram: [] as string[],
    designForMe: false,

    // Advanced Electrical
    meterLocation: "",
    serviceEntranceType: "",
    subpanelDetails: "",

    // Full Details Mode - Utility & AHJ
    utilityProvider: "",
    jurisdiction: "",
    useLastProjectValues: false,

    // Full Details Mode - Optional Extras
    miracleWattRequired: false,
    miracleWattNotes: "",
    derRlcRequired: false,
    derRlcNotes: "",
    setbackConstraints: false,
    setbackNotes: "",
    siteAccessRestrictions: false,
    siteAccessNotes: "",
    inspectionNotes: false,
    inspectionNotesText: "",
    batterySldRequested: false,
    batterySldNotes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
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

  const addComponent = () => {
    const newComponent: Component = {
      id: Date.now().toString(),
      type: "",
      makeModel: "",
      qty: "",
      attachment: [],
      notes: "",
    }
    setComponents([...components, newComponent])
  }

  const updateComponent = (id: string, field: keyof Component, value: string | string[]) => {
    setComponents(components.map(comp =>
      comp.id === id ? { ...comp, [field]: value } : comp
    ))
  }

  const removeComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id))
  }


  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      // Step 1: Project & Contact
      if (!formData.projectName) newErrors.projectName = "Project name is required"
      if (!formData.projectAddress) newErrors.projectAddress = "Project address is required"
      if (!formData.projectType) newErrors.projectType = "Project type is required"
      if (formData.services.length === 0) newErrors.services = "Select at least one permit service"
    } else if (step === 1) {
      // Step 2: System Summary
      if (!formData.systemSize) newErrors.systemSize = "System size is required"
      if (!formData.systemType) newErrors.systemType = "System type is required"
    }
    // Steps 3 and 4 (Uploads and Notes) are optional

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        console.log("Form submitted:", formData)
        // Handle form submission
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

      {/* STEP 1 — Project & Contact */}
      {currentStep === 0 && (
        <FormCard title="Project & Contact Information">
          <div className="space-y-6">
            {/* Company Profile */}
            <div>
              <h3 className="text-sm font-medium mb-4">Company Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => updateField("contactName", e.target.value)}
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Information */}
            <div>
              <h3 className="text-sm font-medium mb-4">Project Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="Enter project name"
                    value={formData.projectName}
                    onChange={(e) => updateField("projectName", e.target.value)}
                  />
                  {errors.projectName && <p className="text-sm text-destructive">{errors.projectName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectAddress">Project Address *</Label>
                  <Input
                    id="projectAddress"
                    placeholder="Start typing address... (Google Places autocomplete)"
                    value={formData.projectAddress}
                    onChange={(e) => updateField("projectAddress", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">📍 Map pin will appear here</p>
                  {errors.projectAddress && <p className="text-sm text-destructive">{errors.projectAddress}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select value={formData.projectType} onValueChange={(v) => updateField("projectType", v)}>
                    <SelectTrigger id="projectType">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectType && <p className="text-sm text-destructive">{errors.projectType}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Permit Services Requested */}
            <div>
              <h3 className="text-sm font-medium mb-4">Permit Services Requested *</h3>
              <div className="space-y-3">
                {PERMIT_SERVICES.map((service) => (
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
              {errors.services && <p className="text-sm text-destructive mt-2">{errors.services}</p>}
            </div>

            <Separator />

            {/* Submission Type */}
            <div>
              <h3 className="text-sm font-medium mb-4">Submission Type</h3>
              <Tabs value={submissionMode} onValueChange={(v) => setSubmissionMode(v as "quick" | "detailed")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="quick">⚡ Quick Upload (Recommended)</TabsTrigger>
                  <TabsTrigger value="detailed">📘 Provide Full Details</TabsTrigger>
                </TabsList>

                <TabsContent value="quick" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Upload your files and we'll handle the rest. Perfect for most projects.
                  </p>
                </TabsContent>

                <TabsContent value="detailed" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Provide comprehensive project details for complex installations.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </FormCard>
      )}

      {/* STEP 2 — System Summary */}
      {currentStep === 1 && (
        <>
          <FormCard title="System Summary">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemSize">System Size (kW DC) *</Label>
                  <Input
                    id="systemSize"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 10.5"
                    value={formData.systemSize}
                    onChange={(e) => updateField("systemSize", e.target.value)}
                  />
                  {errors.systemSize && <p className="text-sm text-destructive">{errors.systemSize}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemType">System Type *</Label>
                  <Select value={formData.systemType} onValueChange={(v) => updateField("systemType", v)}>
                    <SelectTrigger id="systemType">
                      <SelectValue placeholder="Select system type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roofmount">Roof Mount</SelectItem>
                      <SelectItem value="groundmount">Ground Mount</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.systemType && <p className="text-sm text-destructive">{errors.systemType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pvModules">Number of PV Modules (optional)</Label>
                  <Input
                    id="pvModules"
                    type="number"
                    placeholder="e.g., 24"
                    value={formData.pvModules}
                    onChange={(e) => updateField("pvModules", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inverters">Number of Inverters (optional)</Label>
                  <Input
                    id="inverters"
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.inverters}
                    onChange={(e) => updateField("inverters", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Battery Backup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="batteryBackup" className="text-base">Battery Backup?</Label>
                    <p className="text-sm text-muted-foreground">Enable if project includes battery storage</p>
                  </div>
                  <Switch
                    id="batteryBackup"
                    checked={formData.batteryBackup}
                    onCheckedChange={(checked) => updateField("batteryBackup", checked)}
                  />
                </div>

                {formData.batteryBackup && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Battery engineering add-on ($100) required.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="batteryQty">Battery Quantity</Label>
                        <Input
                          id="batteryQty"
                          type="number"
                          placeholder="e.g., 2"
                          value={formData.batteryQty}
                          onChange={(e) => updateField("batteryQty", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="batteryModel">Battery Make/Model (optional)</Label>
                        <Input
                          id="batteryModel"
                          placeholder="e.g., Tesla Powerwall 2"
                          value={formData.batteryModel}
                          onChange={(e) => updateField("batteryModel", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Battery Closeup Image (optional)</Label>
                      <FileUploader
                        label=""
                        description="Upload battery image"
                        onFilesSelected={(files) =>
                          updateField(
                            "batteryImage",
                            files.map((f) => f.name),
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormCard>

          {submissionMode === "detailed" && (
            <FormCard title="System Components">
              <SystemComponentsTable
                components={components}
                onAddComponent={addComponent}
                onUpdateComponent={updateComponent}
                onRemoveComponent={removeComponent}
              />
            </FormCard>
          )}
        </>
      )}

      {/* DETAILED STEP 2 — Site & Electrical Details */}
      {currentStep === 2 && submissionMode === "detailed" && (
        <>
          <FormCard title="Site Details">
            <SiteDetails
              systemType={formData.systemType}
              formData={formData}
              onUpdateField={updateField}
              onFileUpload={updateField}
            />
          </FormCard>

          <FormCard title="Electrical Details">
            <ElectricalDetails
              formData={formData}
              onUpdateField={updateField}
              onFileUpload={updateField}
            />
          </FormCard>
        </>
      )}

      {/* DETAILED STEP 3 — Jurisdiction & Extras */}
      {currentStep === 3 && submissionMode === "detailed" && (
        <>
          <FormCard title="Utility & Jurisdiction">
            <UtilityDetails
              formData={formData}
              onUpdateField={updateField}
            />
          </FormCard>

          <FormCard title="Optional Extra Details">
            <OptionalExtras
              formData={formData}
              onUpdateField={updateField}
            />
          </FormCard>

          <FormCard title="Project Summary">
            <ProjectSummary
              formData={formData}
              componentsCount={components.length}
            />
          </FormCard>
        </>
      )}


      {/* STEP 3 — Required Uploads */}
      {/* UPLOADS STEP (Index 2 for Quick, Index 4 for Detailed) */}
      {((submissionMode === "quick" && currentStep === 2) || (submissionMode === "detailed" && currentStep === 4)) && (
        <FormCard title="Required Uploads">
          <div className="space-y-6">
            {/* Upload Checklist */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Upload Checklist</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">1.</span>
                  <span>Proposed Layout</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">2.</span>
                  <span>Electric Utility Bill</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">3.</span>
                  <span>Roof Pictures</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">4.</span>
                  <span>Attic Pictures</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">5.</span>
                  <span>Electric Pictures</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">6.</span>
                  <span>Property Sketch <span className="text-muted-foreground">(mentioning location of MSP, meter, roof vent, chimney)</span></span>
                </div>
              </div>
            </div>

            <Separator />

            <FileUploader
              label="Upload all project files here"
              description="We automatically categorize your files. Accepted: images, PDFs, ZIPs, CSV, DOCX, etc."
              onFilesSelected={(files) =>
                updateField(
                  "projectFiles",
                  files.map((f) => f.name),
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: You can drag and drop multiple files at once
            </p>
          </div>
        </FormCard>
      )}

      {/* NOTES STEP (Index 3 for Quick, Index 5 for Detailed) */}
      {((submissionMode === "quick" && currentStep === 3) || (submissionMode === "detailed" && currentStep === 5)) && (
        <FormCard title="General Notes">
          <div className="space-y-2">
            <Label htmlFor="generalNotes">Anything we should know?</Label>
            <Textarea
              id="generalNotes"
              placeholder="Site access, special requirements, HOA concerns, microinverters required, setback requirements, equipment preferences, etc."
              className="resize-none min-h-[120px]"
              value={formData.generalNotes}
              onChange={(e) => updateField("generalNotes", e.target.value)}
            />
          </div>
        </FormCard>
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
