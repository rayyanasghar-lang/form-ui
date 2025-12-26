"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
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
import { fetchNearbyStations, geocodeAddress } from "@/app/actions/weather-service"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "idle">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [scrapingStatus, setScrapingStatus] = useState<"idle" | "scraping" | "completed" | "error">("idle")
  const [weatherStations, setWeatherStations] = useState<any[]>([])
  const [weatherLoading, setWeatherLoading] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [formData, setFormData] = useState({
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

    // Scraped Data
    lotSize: "",
    parcelNumber: "",
    owner: "",
    landUse: "",
    windSpeed: "",
    snowLoad: "",
    windSpeed716: "",
    snowLoad716: "",
    interiorArea: "",
    structureArea: "",
    newConstruction: null as boolean | null,
    yearBuilt: "",
    
    // Scraper Sources (Nested)
    sources: {} as any, // Using 'any' briefly to map to SourceData
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

  // Listen for scraped property data
  useEffect(() => {
    const handlePropertyUpdate = (event: any) => {
      const { lotSize, parcelNumber, owner, landUse, windSpeed, snowLoad, sources } = event.detail;
      setFormData(prev => ({
        ...prev,
        lotSize: lotSize || prev.lotSize,
        parcelNumber: parcelNumber || prev.parcelNumber,
        owner: owner || prev.owner,
        landUse: landUse || prev.landUse,
        windSpeed: windSpeed || prev.windSpeed,
        snowLoad: snowLoad || prev.snowLoad,
        windSpeed716: event.detail.windSpeed716 || prev.windSpeed716,
        snowLoad716: event.detail.snowLoad716 || prev.snowLoad716,
        interiorArea: event.detail.interiorArea || prev.interiorArea,
        structureArea: event.detail.structureArea || prev.structureArea,
        newConstruction: event.detail.newConstruction ?? prev.newConstruction,
        yearBuilt: event.detail.yearBuilt || prev.yearBuilt,
        sources: sources || prev.sources
      }));
    };

    const handleScrapingCompleted = () => {
      setScrapingStatus("completed");
      toast.success("Property data updated", {
        description: "Data from Regrid, Zillow and ASCE fetched successfully."
      });
    };

    const handleScrapingStarted = () => {
      setScrapingStatus("scraping");
      // Clear previous data
      setFormData(prev => ({
        ...prev,
        lotSize: "",
        parcelNumber: "",
        owner: "",
        landUse: "",
        windSpeed: "",
        snowLoad: "",
        interiorArea: "",
        structureArea: "",
        newConstruction: null,
        yearBuilt: "",
        sources: {},
      }));
      setWeatherStations([]);
      toast.info("Fetching property data...", {
        description: "Getting data from Regrid, Zillow and ASCE Hazard Tool."
      });
    };

    window.addEventListener("property-data-updated", handlePropertyUpdate);
    window.addEventListener("property-data-scraping-started", handleScrapingStarted);
    window.addEventListener("property-data-scraping-completed", handleScrapingCompleted);
    
    return () => {
      window.removeEventListener("property-data-updated", handlePropertyUpdate);
      window.removeEventListener("property-data-scraping-started", handleScrapingStarted);
      window.removeEventListener("property-data-scraping-completed", handleScrapingCompleted);
    };
  }, []);

  // Fetch weather stations when address changes
  useEffect(() => {
    if (!formData.projectAddress || formData.projectAddress.length < 5) return;

    const timer = setTimeout(async () => {
      setWeatherLoading(true);
      try {
        const geoResult = await geocodeAddress(formData.projectAddress);
        if (geoResult.success && geoResult.lat && geoResult.lng) {
          const stationsResult = await fetchNearbyStations(geoResult.lat, geoResult.lng);
          if (stationsResult.success && stationsResult.data) {
            setWeatherStations(stationsResult.data);
          }
        }
      } catch (err) {
        console.error("Error fetching weather stations:", err);
      } finally {
        setWeatherLoading(false);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [formData.projectAddress]);

  // Debounced auto-save to local storage
  const saveDraft = useCallback(() => {
    const draft = {
      formData,
      submissionMode,
      components,
      currentStep,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem("permit-planset-draft", JSON.stringify(draft))
    setLastSaved(new Date())
    setSaveStatus("saved")
  }, [formData, submissionMode, components, currentStep])

  // Save draft to local storage on change with debounce
  useEffect(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Show saving indicator
    setSaveStatus("saving")

    // Debounce the save by 500ms
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft()
    }, 500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, submissionMode, components, currentStep, saveDraft])

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
    setIsSubmitting(true)
    console.log("[Frontend] submitForm called. Files to upload:", filesToUpload.length)

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

            console.log(`[Frontend] calling uploadWithRcloneAction for: ${file.name}`)
            const result = await uploadWithRcloneAction(uploadData)
            console.log(`[Frontend] upload result:`, result)

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
          toast.error(`Upload Error`, {
            description: `Failed to upload ${uploadErrors.length} file(s). Check console for details.`,
          })

          // Don't proceed if all uploads failed
          if (uploadedFiles.length === 0) {
            setIsSubmitting(false)
            return
          }
        } else {
          console.log(`✓ Upload Summary: All ${uploadedFiles.length} file(s) uploaded successfully!`)
        }
      } catch (error) {
        console.error("❌ Unexpected error during file upload:", error)
        toast.error("Upload Failed", {
          description: "An unexpected error occurred while uploading files.",
        })
        setIsSubmitting(false)
        return
      }
    }

    // Construct payload to match API expectations
    const payload = {
      user_profile: {
        company_name: "Solar Solutions Inc.", // This would ideally come from a global state/context
        contact_name: "John Doe",
        email: "john.doe@solarsolutions.com",
        phone: "+1 (555) 123-4567",
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
        toast.success("Success!", {
          description: "Project created successfully!",
        })
        // Reset form or redirect
      } else {
        console.error("Submission failed:", result)
        toast.error("Submission Failed", {
          description: `Failed to submit project: ${result.error}`,
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Submission Error", {
        description: "An unexpected error occurred. Check console for details.",
      })
    } finally {
      setIsSubmitting(false)
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

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

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
          scrapingStatus={scrapingStatus}
          weatherStations={weatherStations}
          weatherLoading={weatherLoading}
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
        <UploadsStep formData={formData} updateField={updateField} setFilesToUpload={setFilesToUpload} />
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
        isLoading={isSubmitting}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
      />
    </form>
  )
}
