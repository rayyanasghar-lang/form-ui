"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"

import Stepper from "./stepper"
import FormCard from "./form-card"
import FormButtons from "./form-buttons"

import ProjectContactStep from "@/components/permit-form/project-contact-step"
// Migration: Other steps moved to Project Details Page

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

const FORM_STEPS = ["Project & Contact"]

export default function PermitPlansetForm() {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(0)
  const [submissionMode, setSubmissionMode] =
    useState<"quick" | "provide details">("quick")

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
    try {
      const payload = prepareProjectPayload(formData, [], "draft")
      const res = await submitProjectAction(payload)
      if (res.success && res.data?.id) {
        setLastSaved(new Date())
        setSaveStatus("saved")
        toast.success("Draft saved. Redirecting to details...")
        router.push(`/projects/${res.data.id}`)
      } else {
        setSaveStatus("idle")
        const errorMsg = typeof res.error === 'object' ? (res.error as any).message || (res.error as any).status : res.error;
        toast.error(errorMsg || "Failed to save draft")
      }
    } catch (error) {
      setSaveStatus("idle")
      toast.error("Error saving draft")
    }
  }

  const STEPS = FORM_STEPS

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

  const prepareProjectPayload = (data: typeof formData, _components: any[], status: string) => {
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
        submission_type_name: submissionMode,
      },
      services: data.services,
      status: status
    }
  }

  const handleSubmit = async () => {
    // Initial submission validation
    if (!formData.projectName || !formData.projectAddress || !formData.companyName) {
      setErrors({
        projectName: !formData.projectName ? "Project name is required" : "",
        companyName: !formData.companyName ? "Company name is required" : "",
        projectAddress: !formData.projectAddress ? "Project address is required" : "",
      })
      toast.error("Please fill in required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = prepareProjectPayload(formData, [], "draft")
      const res = await submitProjectAction(payload)
      if (res.success && res.data?.id) {
        toast.success("Project created! Now provide more details.")
        router.push(`/projects/${res.data.id}`)
      } else {
        const errorMsg = typeof res.error === 'object' ? (res.error as any).message || (res.error as any).status : res.error;
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
    handleSubmit()
  }

  const handleBack = () => {
    router.back()
  }

  /* ---------------- Render ---------------- */
  return (
    <form className="space-y-6 pb-32 md:pb-0 relative">
      <BackgroundGradient />
      
      <div className="sticky top-[64px] z-30 bg-transparent md:static">
        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
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
      </div>

      {/* Sticky Mobile Buttons */}
      <div className="fixed md:static bottom-0 left-0 right-0 z-40 bg-background md:bg-transparent border-t md:border-none px-4 py-3 md:pt-4 md:pb-0">
        <div className="max-w-3xl mx-auto">
          <FormButtons
            onNext={handleNext}
            onBack={handleBack}
            isFirstStep={true}
            isLastStep={true}
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
