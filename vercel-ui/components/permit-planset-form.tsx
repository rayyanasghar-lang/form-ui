"use client"

import { useState, useEffect } from "react"
import Stepper from "./stepper"
import FormCard from "./form-card"
import FormButtons from "./form-buttons"
import ProjectContactStep from "./permit-form/project-contact-step"
import SystemSummaryStep from "./permit-form/system-summary-step"
import UploadsStep from "./permit-form/uploads-step"
import GeneralNotesStep from "./permit-form/general-notes-step"
import SiteDetails from "./site-details"
import ElectricalDetails from "./electrical-details"
import UtilityDetails from "./utility-details"
import OptionalExtras from "./optional-extras"
import ProjectSummary from "./project-summary"
import { uploadWithRcloneAction } from "@/app/actions/upload-rclone"
import { submitProjectAction } from "@/app/actions/submit-project"
import { fetchServicesAction, Service } from "@/app/actions/fetch-services"

const QUICK_STEPS = ["Project & Contact", "System Summary", "Uploads", "Notes"]
const DETAILED_STEPS = [
  "Project & Contact",
  "System Summary",
  "Site & Electrical",
  "Jurisdiction & Extras",
  "Uploads",
  "Notes",
]
import { Component } from "./system-components-table"

export default function PermitPlansetForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submissionMode, setSubmissionMode] = useState<"quick" | "provide details">("quick")
  const [components, setComponents] = useState<Component[]>([])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)

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

  // Fetch services from API on mount
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true)
      const result = await fetchServicesAction()
      
      if ("error" in result) {
        console.error("Failed to fetch services:", result.error)
        // Optionally show error to user
      } else if (result.data) {
        setAvailableServices(result.data)
      }
      setServicesLoading(false)
    }
    
    loadServices()
  }, [])

  // Load draft from local storage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("permit-planset-draft")
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        if (parsed.formData) setFormData(parsed.formData)
        if (parsed.submissionMode) setSubmissionMode(parsed.submissionMode)
        if (parsed.components) setComponents(parsed.components)
        if (parsed.currentStep) setCurrentStep(parsed.currentStep)
      } catch (e) {
        console.error("Failed to load draft:", e)
      }
    }
  }, [])

  // Save draft to local storage on change
  useEffect(() => {
    const draft = {
      formData,
      submissionMode,
      components,
      currentStep,
    }
    localStorage.setItem("permit-planset-draft", JSON.stringify(draft))
  }, [formData, submissionMode, components, currentStep])

  const STEPS = submissionMode === "provide details" ? DETAILED_STEPS : QUICK_STEPS

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string | string[] | boolean | File[]) => {
    if (field === "projectFiles" && Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      setFilesToUpload(value as File[])
      setFormData((prev) => ({ ...prev, [field]: (value as File[]).map((f) => f.name) }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value as string | string[] | boolean }))
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const toggleService = (serviceName: string) => {
    const current = formData.services
    if (current.includes(serviceName)) {
      updateField(
        "services",
        current.filter((name) => name !== serviceName),
      )
    } else {
      updateField("services", [...current, serviceName])
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

  const submitForm = async () => {
    // Services are already stored as names from the API, so just use them directly
    const serviceNames = formData.services

    // Upload files to Google Drive
    const uploadedFiles: { name: string; url: string }[] = []
    const uploadErrors: string[] = []

    if (filesToUpload.length > 0) {
      console.log(`Starting upload of ${filesToUpload.length} file(s) to Google Drive...`)

      try {
        await Promise.all(
          filesToUpload.map(async (file) => {
            const uploadData = new FormData()
            uploadData.append("file", file)
            uploadData.append("projectName", formData.projectName || "Untitled Project")

            console.log(`Uploading: ${file.name}`)
            const result = await uploadWithRcloneAction(uploadData)

            // Check if upload was successful
            if (result.error) {
              console.error(`❌ Failed to upload ${file.name}:`, result.error)
              if (result.details) {
                console.error(`   Details:`, result.details)
              }
              uploadErrors.push(`${file.name}: ${result.error}`)
            } else if (result.webViewLink) {
              console.log(`✓ Successfully uploaded ${file.name}`)
              uploadedFiles.push({ name: file.name, url: result.webViewLink })
            } else {
              console.error(`❌ Unexpected response for ${file.name}:`, result)
              uploadErrors.push(`${file.name}: Unexpected response from server`)
            }
          }),
        )

        // Report results
        if (uploadErrors.length > 0) {
          console.error(`\n❌ Upload Summary: ${uploadErrors.length} file(s) failed, ${uploadedFiles.length} succeeded`)
          const errorMessage = `Failed to upload ${uploadErrors.length} file(s) to Google Drive:\n\n${uploadErrors.join('\n')}\n\nPlease check the browser console and terminal for details.`
          alert(errorMessage)

          // Don't proceed if all uploads failed
          if (uploadedFiles.length === 0) {
            return
          }
        } else {
          console.log(`✓ Upload Summary: All ${uploadedFiles.length} file(s) uploaded successfully!`)
        }
      } catch (error) {
        console.error("❌ Unexpected error during file upload:", error)
        alert("An unexpected error occurred while uploading files to Google Drive. Check console for details.")
        return
      }
    }

    // Construct payload to match API expectations
    const payload = {
      user_profile: {
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone,
      },
      project: {
        name: formData.projectName,
        address: formData.projectAddress,
        type: formData.projectType,
        submission_type_name: submissionMode, // Changed from submission_type_id to submission_type_name
        general_notes: formData.generalNotes,
      },
      services: serviceNames, // Changed from serviceIds to serviceNames array
      system_summary: {
        system_size: parseFloat(formData.systemSize) || 0,
        system_type: formData.systemType,
        pv_modules: parseInt(formData.pvModules) || 0,
        inverters: parseInt(formData.inverters) || 0,
      },
      battery_info: formData.batteryBackup
        ? {
          qty: parseInt(formData.batteryQty) || 0,
          model: formData.batteryModel,
          image: formData.batteryImage,
        }
        : {
          qty: 0,
          model: "",
          image: [],
        },
      site_details: {
        roof_material: formData.roofMaterial || "",
        roof_pitch: formData.roofPitch || "",
        number_of_arrays: parseInt(formData.numberOfArrays) || 0,
        utility_provider: formData.utilityProvider || "",
        jurisdiction: formData.jurisdiction || "",
      },
      electrical_details: {
        main_panel_size: formData.mainPanelSize || "",
        bus_rating: formData.busRating || "",
        main_breaker: formData.mainBreaker || "",
        pv_breaker_location: formData.pvBreakerLocation || "",
        one_line_diagram: formData.oneLineDiagram || [],
      },
      advanced_electrical_details: {
        meter_location: formData.meterLocation || "",
        service_entrance_type: formData.serviceEntranceType || "",
        subpanel_details: formData.subpanelDetails || "",
      },
      optional_extra_details: {
        miracle_watt_required: formData.miracleWattRequired || false,
        der_rlc_required: formData.derRlcRequired || false,
        der_rlc_notes: formData.derRlcNotes || "",
        setback_constraints: formData.setbackConstraints || false,
        site_access_restrictions: formData.siteAccessRestrictions || false,
        inspection_notes: formData.inspectionNotes || false,
        inspection_notes_text: formData.inspectionNotesText || "",
        battery_sld_requested: formData.batterySldRequested || false,
      },
      system_components: components.map((c) => ({
        type: c.type,
        make_model: c.makeModel,
        qty: parseInt(c.qty) || 0,
        attachment: c.attachment,
        notes: c.notes,
      })),
      uploads: formData.projectFiles.map((f) => {
        const uploaded = uploadedFiles.find((u) => u.name === f)
        return {
          url: uploaded?.url || "",
          name: f,
          category: "Plan",
          mime_type: "application/pdf", // Default to PDF, could be improved
          size: 0,
        }
      }),
    }

    try {
      const result = await submitProjectAction(payload)

      if (result.success) {
        console.log("Form submitted successfully:", result.data)
        localStorage.removeItem("permit-planset-draft")
        alert("Project created successfully!")
        // Reset form or redirect
      } else {
        console.error("Submission failed:", result)
        alert(`Failed to submit project: ${JSON.stringify(result.error)} (Status: ${result.status})`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error submitting form. Check console for details.")
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        submitForm()
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
        <ProjectContactStep
          formData={formData}
          updateField={updateField}
          errors={errors}
          submissionMode={submissionMode}
          setSubmissionMode={setSubmissionMode}
          toggleService={toggleService}
          availableServices={availableServices}
          servicesLoading={servicesLoading}
        />
      )}

      {/* STEP 2 — System Summary */}
      {currentStep === 1 && (
        <SystemSummaryStep
          formData={formData}
          updateField={updateField}
          errors={errors}
          submissionMode={submissionMode}
          components={components}
          addComponent={addComponent}
          updateComponent={updateComponent}
          removeComponent={removeComponent}
        />
      )}

      {/* DETAILED STEP 2 — Site & Electrical Details */}
      {currentStep === 2 && submissionMode === "provide details" && (
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
      {currentStep === 3 && submissionMode === "provide details" && (
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
      {((submissionMode === "quick" && currentStep === 2) || (submissionMode === "provide details" && currentStep === 4)) && (
        <UploadsStep formData={formData} updateField={updateField} />
      )}

      {/* NOTES STEP (Index 3 for Quick, Index 5 for Detailed) */}
      {((submissionMode === "quick" && currentStep === 3) || (submissionMode === "provide details" && currentStep === 5)) && (
        <GeneralNotesStep formData={formData} updateField={updateField} />
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
