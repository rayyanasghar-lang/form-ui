"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"

import Stepper from "./stepper"
import FormCard from "./form-card"
import FormButtons from "./form-buttons"

import ProjectContactStep from "@/components/permit-form/project-contact-step"
import SystemSummaryStep from "@/components/permit-form/system-summary-step"
import UploadsStep from "@/components/permit-form/uploads-step"
import GeneralNotesStep from "@/components/permit-form/general-notes-step"
import SiteDetails from "./site-details"
import ElectricalDetails from "./electrical-details"
import UtilityDetails from "./utility-details"
import OptionalExtras from "./optional-extras"
import ProjectSummary from "./project-summary"

import { uploadWithRcloneAction } from "@/app/actions/upload-rclone"
import { submitProjectAction } from "@/app/actions/submit-project"
import { fetchServicesAction, Service } from "@/app/actions/fetch-services"
import { 
  scrapeZillowAction, 
  scrapeASCE722Action, 
  scrapeRegridAction 
} from "@/app/actions/scrape-service"
import { fetchNearbyStations, geocodeAddress, WeatherStation } from "@/app/actions/weather-service"

import { Component } from "./system-components-table"
import { BackgroundGradient } from "@/components/ui/background-gradient"

const QUICK_STEPS = ["Project & Contact", "System Summary", "Uploads", "Notes"]
const DETAILED_STEPS = [
  "Project & Contact",
  "System Summary",
  "Site & Electrical",
  "Jurisdiction & Extras",
  "Uploads",
  "Notes",
]

export default function PermitPlansetForm() {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(0)
  const [submissionMode, setSubmissionMode] =
    useState<"quick" | "provide details">("quick")

  const [components, setComponents] = useState<Component[]>([])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])

  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] =
    useState<"saving" | "saved" | "idle">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [scrapingStatus, setScrapingStatus] = useState<"idle" | "scraping" | "completed" | "error">("idle")
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherStations, setWeatherStations] = useState<WeatherStation[]>([])

  const [formData, setFormData] = useState({
    companyName: "",
    projectName: "",
    contactName: "Solar Professional",
    email: "solar@example.com",
    phone: "555-0199",
    projectAddress: "",
    projectType: "",
    services: [] as string[],
    systemSize: "",
    systemType: "",
    pvModules: "",
    inverters: "",
    batteryBackup: false,
    batteryQty: "",
    batteryModel: "",
    batteryImage: [] as string[],
    projectFiles: [] as string[],
    generalNotes: "",
    sources: {} as any,
    // Site Details
    roofMaterial: "",
    roofPitch: "",
    numberOfArrays: "",
    useRoofImages: false,
    groundMountType: "",
    foundationType: "",
    rowCount: "",
    moduleCountPerRow: "",
    structuralNotes: "",
    lotSize: "",
    parcelNumber: "",
    windSpeed: "",
    snowLoad: "",
    // Electrical Details
    mainPanelSize: "",
    busRating: "",
    mainBreaker: "",
    pvBreakerLocation: "",
    designForMe: false,
    meterLocation: "",
    serviceEntranceType: "",
    subpanelDetails: "",
    // Utility & Jurisdiction
    utilityProvider: "",
    jurisdiction: "",
    useLastProjectValues: false,
    // Optional Extras
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

  /* ---------------- Fetch Services ---------------- */
  useEffect(() => {
    fetchServicesAction().then((res) => {
      if ("data" in res && res.data) {
        setAvailableServices(res.data)
      }
      setServicesLoading(false)
    })
  }, [])

  /* ---------------- Save Draft ---------------- */
  const handleSaveDraft = async () => {
    // Basic validation for Step 1
    if (!formData.projectName || !formData.projectAddress || !formData.companyName) {
      setErrors({
        projectName: !formData.projectName ? "Project name is required" : "",
        companyName: !formData.companyName ? "Company name is required" : "",
        projectAddress: !formData.projectAddress ? "Project address is required" : "",
      })
      toast.error("Please fill in the required fields to save a draft")
      return
    }

    setSaveStatus("saving")
    console.log("Saving draft. Current projectFiles:", formData.projectFiles)
    console.log("New files pending upload (will not be saved in draft):", filesToUpload.length)
    try {
      // Filter out temporary filenames, only save real URLs
      const finalFormData = {
        ...formData,
        projectFiles: formData.projectFiles.filter((f) => f.startsWith("http")),
      }
      
      const payload = prepareProjectPayload(finalFormData, components, "draft")
      const res = await submitProjectAction(payload)
      if (res.success) {
        setLastSaved(new Date())
        setSaveStatus("saved")
        toast.success("Draft saved to server")
      } else {
        setSaveStatus("idle")
        const errorMsg = typeof res.error === 'object' ? res.error.message || res.error.status : res.error;
        toast.error(errorMsg || "Failed to save draft")
      }
    } catch (error) {
      setSaveStatus("idle")
      toast.error("Error saving draft")
    }
  }

  const STEPS =
    submissionMode === "provide details" ? DETAILED_STEPS : QUICK_STEPS

  /* ---------------- Helpers ---------------- */
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const toggleService = (name: string) => {
    updateField(
      "services",
      formData.services.includes(name)
        ? formData.services.filter((s) => s !== name)
        : [...formData.services, name]
    )
  }

  const addComponent = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    setComponents((prev) => [
      ...prev,
      { id: newId, type: "module", makeModel: "", qty: "1", attachment: [], notes: "" },
    ])
  }

  const updateComponent = (id: string, field: keyof Component, value: any) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id))
  }

  const prepareProjectPayload = (data: typeof formData, components: Component[], status: string) => {
    // Map project files ensuring we have both url and name
    const uploads = data.projectFiles.map(item => {
      if (typeof item === 'string') {
        const url = item;
        return {
          url: url,
          name: url.split('/').pop()?.split('?')[0] || 'file',
          category: 'General'
        };
      } else {
        return {
          url: (item as any).url,
          name: (item as any).name,
          category: 'General'
        };
      }
    });

    return {
      user_profile: {
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
      },
      project: {
        name: data.projectName,
        address: data.projectAddress,
        type: data.projectType,
        general_notes: data.generalNotes,
        submission_type_id: submissionMode === "quick" ? "7506fa4e-e2a5-4dcb-b14c-847b3aed1b48" : "755bbe68-75ec-4487-861f-b95de7fde5b6",
        submission_type_name: submissionMode === "quick" ? "quick" : "provide details",
      },
      services: data.services,
      system_summary: {
        system_size: data.systemSize,
        system_type: data.systemType,
        pv_modules: data.pvModules,
        inverters: data.inverters,
      },
      battery_info: {
        qty: data.batteryQty,
        model: data.batteryModel,
        image: data.batteryImage,
      },
      site_details: {
        roof_material: data.roofMaterial,
        roof_pitch: data.roofPitch,
        number_of_arrays: data.numberOfArrays,
        ground_mount_type: data.groundMountType,
        foundation_type: data.foundationType,
        main_panel_size: data.mainPanelSize,
        utility_provider: data.utilityProvider,
        jurisdiction: data.jurisdiction,
        lot_size: data.lotSize,
        parcel_number: data.parcelNumber,
        wind_speed: data.windSpeed,
        snow_load: data.snowLoad,
      },
      electrical_details: {
        main_panel_size: data.mainPanelSize,
        bus_rating: data.busRating,
        main_breaker: data.mainBreaker,
        pv_breaker_location: data.pvBreakerLocation,
      },
      advanced_electrical_details: {
        meter_location: data.meterLocation,
        service_entrance_type: data.serviceEntranceType,
        subpanel_details: data.subpanelDetails,
      },
      optional_extra_details: {
        miracle_watt_required: data.miracleWattRequired,
        miracle_watt_notes: data.miracleWattNotes,
        der_rlc_required: data.derRlcRequired,
        der_rlc_notes: data.derRlcNotes,
        setback_constraints: data.setbackConstraints,
        setback_notes: data.setbackNotes,
        site_access_restrictions: data.siteAccessRestrictions,
        site_access_notes: data.siteAccessNotes,
        inspection_notes: data.inspectionNotes,
        inspection_notes_text: data.inspectionNotesText,
        battery_sld_requested: data.batterySldRequested,
        battery_sld_notes: data.batterySldNotes,
      },
      system_components: components.map(c => ({
        type: c.type,
        make_model: c.makeModel,
        qty: c.qty,
        attachment: c.attachment,
        notes: c.notes
      })),
      uploads: uploads,
      status: status
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    console.log("Starting submission. filesToUpload:", filesToUpload)
    try {
      // 1. Upload files if any
      let uploadedFiles: Array<{ url: string, name: string }> = []
      if (filesToUpload.length > 0) {
        console.log(`Uploading ${filesToUpload.length} files...`)
        // Upload sequentially to avoid network congestion/timeouts
        for (const file of filesToUpload) {
          console.log(`Uploading file: ${file.name} (${file.size} bytes)`)
          const fd = new FormData()
          fd.append("file", file)
          fd.append("projectName", formData.projectName || "Default Project")
          
          const result = await uploadWithRcloneAction(fd)
          if (!result.success) {
            toast.error(`Failed to upload ${file.name}: ${result.error || "Unknown error"}`)
            setIsSubmitting(false)
            return
          }
          if (result.webViewLink) {
            uploadedFiles.push({
              url: result.webViewLink,
              name: file.name
            })
          }
        }
      }

      // 2. Submit project data
      // Filter out any non-URL strings (like filenames that might have leaked into state)
      // and map existing URLs to objects
      const existingUrls = formData.projectFiles
        .filter(f => typeof f === 'string' && f.startsWith('http'))
        .map(url => ({ url, name: (url as string).split('/').pop()?.split('?')[0] || 'file' }))
      
      const finalFormData = {
        ...formData,
        projectFiles: [...existingUrls, ...uploadedFiles] as any,
      }
      
      const payload = prepareProjectPayload(finalFormData, components, "submitted")

      const res = await submitProjectAction(payload)
      if (res.success) {
        toast.success("Project submitted successfully!")
        localStorage.removeItem("permit-planset-draft")
        router.push("/projects")
      } else {
        const errorMsg = typeof res.error === 'object' ? res.error.message || res.error.status : res.error;
        toast.error(errorMsg || "Submission failed")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartScraping = async () => {
    if (!formData.projectAddress) {
      toast.error("Please enter an address first")
      return
    }

    setScrapingStatus("scraping")
    setWeatherLoading(true)

    try {
      // 1. Weather & Geocoding
      geocodeAddress(formData.projectAddress).then((geo) => {
        if (geo.success && geo.lat && geo.lng) {
          fetchNearbyStations(geo.lat, geo.lng).then((stations) => {
            if (stations.success && stations.data) {
              setWeatherStations(stations.data)
            }
            setWeatherLoading(false)
          })
        } else {
          setWeatherLoading(false)
        }
      })

      // 2. Property Scraping
      const [zillow, asce, regrid] = await Promise.all([
        scrapeZillowAction(formData.projectAddress),
        scrapeASCE722Action(formData.projectAddress),
        scrapeRegridAction(formData.projectAddress),
      ])

      const sources: any = {}
      if (zillow.success) sources.zillow = zillow.data
      if (asce.success) sources.asce = asce.data
      if (regrid.success) sources.regrid = regrid.data

      setFormData((prev) => ({
        ...prev,
        sources,
        // Auto-fill some fields if found
        lotSize: regrid.data?.lot_size || zillow.data?.lot_size || prev.lotSize,
        parcelNumber:
          regrid.data?.parcel_number ||
          zillow.data?.parcel_number ||
          prev.parcelNumber,
        windSpeed: asce.data?.windSpeed || prev.windSpeed,
        snowLoad: asce.data?.snowLoad || prev.snowLoad,
      }))

      setScrapingStatus("completed")
      toast.success("Property intelligence gathered!")
    } catch (error) {
      console.error("Scraping error:", error)
      setScrapingStatus("error")
      toast.error("Failed to gather property records")
    }
  }

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      handleSubmit()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

  /* ---------------- Render ---------------- */
  return (
    <form className="space-y-6 pb-32 md:pb-0 relative">
      <BackgroundGradient />
      
      {/* Sticky Stepper */}
      <div className="sticky top-[64px] z-30 bg-transparent md:static">
        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
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
            onStartScraping={handleStartScraping}
            weatherStations={weatherStations}
            weatherLoading={weatherLoading}
          />
        )}

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

        {submissionMode === "provide details" && currentStep === 2 && (
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

        {submissionMode === "provide details" && currentStep === 3 && (
          <>
            <FormCard title="Utility & Jurisdiction">
              <UtilityDetails
                formData={formData}
                onUpdateField={updateField}
              />
            </FormCard>

            <FormCard title="Optional Extras">
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

        {(submissionMode === "quick" && currentStep === 2) ||
        (submissionMode === "provide details" && currentStep === 4) ? (
          <UploadsStep
            formData={formData}
            updateField={updateField}
            setFilesToUpload={setFilesToUpload}
          />
        ) : null}

        {(submissionMode === "quick" && currentStep === 3) ||
        (submissionMode === "provide details" && currentStep === 5) ? (
          <GeneralNotesStep
            formData={formData}
            updateField={updateField}
          />
        ) : null}
      </div>

      {/* Sticky Mobile Buttons */}
      <div className="fixed md:static bottom-0 left-0 right-0 z-40 bg-background md:bg-transparent border-t md:border-none px-4 py-3 md:pt-4 md:pb-0">
        <div className="max-w-3xl mx-auto">
          <FormButtons
            onNext={handleNext}
            onBack={handleBack}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === STEPS.length - 1}
            isLoading={isSubmitting}
            saveStatus={saveStatus}
            lastSaved={lastSaved}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      </div>
    </form>
  )
}
