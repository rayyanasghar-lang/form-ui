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
import { getContractorProfileAction } from "@/app/actions/auth-service"
import { 
  scrapeZillowAction, 
  scrapeASCE722Action, 
  scrapeRegridAction 
} from "@/app/actions/scrape-service"
import { fetchNearbyStations, geocodeAddress, reverseGeocode, WeatherStation } from "@/app/actions/weather-service"

import { Component } from "./system-components-table"

const PERSIST_KEY = "sunpermit_planset_draft"

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
    contactName: "", // Default empty, fill from profile
    email: "", // Default empty, fill from profile
    phone: "", // Default empty, fill from profile
    projectAddress: "",
    latitude: "",
    longitude: "",
    projectType: "",
    services: [] as string[],
    systemSize: "",
    systemType: "", // Ensure this is present
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

  /* ---------------- Fetch Services & Contractor ---------------- */
  useEffect(() => {
    // Restoration of draft from localStorage
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(PERSIST_KEY)
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft)
          setFormData(prev => ({ ...prev, ...parsed }))
        } catch (e) {
          console.error("Failed to parse form draft", e)
        }
      }
    }

    // Fetch Services
    fetchServicesAction().then((res) => {
      if ("data" in res && res.data) {
        setAvailableServices(res.data)
      }
      setServicesLoading(false)
    })

    // Fetch Contractor Profile for Auto-fill
    async function loadContractor() {
      const result = await getContractorProfileAction()
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          companyName: result.data.company_name || prev.companyName,
          contactName: result.data.name || prev.contactName,
          email: result.data.email || prev.email,
          phone: result.data.phone || prev.phone,
        }))
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem("contractor")
        if (stored) {
            try {
                const c = JSON.parse(stored)
                setFormData(prev => ({
                    ...prev,
                    companyName: c.company_name || prev.companyName,
                    contactName: c.name || prev.contactName,
                    email: c.email || prev.email,
                    phone: c.phone || prev.phone,
                }))
            } catch (e) {}
        }
      }
    }
    loadContractor()
  }, [])

  // 2. Auto-save to LocalStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(PERSIST_KEY, JSON.stringify(formData))
      }
    }, 1000) // Debounce 1s

    return () => clearTimeout(timeout)
  }, [formData])

  // 3. Immediate Reverse Geocoding for Coordinates
  useEffect(() => {
    const lat = parseFloat(formData.latitude)
    const lng = parseFloat(formData.longitude)

    if (!isNaN(lat) && !isNaN(lng)) {
      const timeout = setTimeout(async () => {
        const res = await reverseGeocode(lat, lng)
        if (res.success && res.address) {
          updateField("projectAddress", res.address)
        }
      }, 1500) // Debounce 1.5s

      return () => clearTimeout(timeout)
    }
  }, [formData.latitude, formData.longitude])

  // 4. Immediate Geocoding for Address (Sync Map Marker)
  useEffect(() => {
    if (formData.projectAddress && formData.projectAddress.length > 5) {
      const timeout = setTimeout(async () => {
        // Only geocode if the address changed and we're not currently reverse-geocoding
        const res = await geocodeAddress(formData.projectAddress)
        if (res.success && res.lat && res.lng) {
          setFormData(prev => {
            // Check if coordinates already match to avoid unnecessary state updates
            const currentLat = parseFloat(prev.latitude)
            const currentLng = parseFloat(prev.longitude)
            if (Math.abs(currentLat - res.lat!) < 0.0001 && Math.abs(currentLng - res.lng!) < 0.0001) {
              return prev
            }
            return {
              ...prev,
              latitude: res.lat!.toString(),
              longitude: res.lng!.toString()
            }
          })
        }
      }, 2000) // Debounce 2s

      return () => clearTimeout(timeout)
    }
  }, [formData.projectAddress])

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
      const projectId = res.data?.id || res.data?.result?.id || res.data?.result || (typeof res.data === 'number' || typeof res.data === 'string' ? res.data : undefined)

      if (res.success && projectId) {
        setLastSaved(new Date())
        setSaveStatus("saved")
        toast.success("Draft saved. Redirecting to details...")
        router.push(`/projects/${projectId}`)
      } else {
        setSaveStatus("idle")
        const errorMsg = res.error ? (typeof res.error === 'object' ? (res.error as any).message || (res.error as any).status : String(res.error)) : "Draft saved but ID missing";
        toast.error(errorMsg)
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
    // Get contractor_id from local storage
    const contractorStr = typeof window !== 'undefined' ? localStorage.getItem('contractor') : null
    let contractorId = null
    if (contractorStr) {
      try {
        const contractor = JSON.parse(contractorStr)
        contractorId = contractor.id
      } catch (e) {}
    }

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
        system_type: data.systemType, // Added system_type
        submission_type_name: submissionMode,
      },
      services: data.services,
      status: status,
      contractor_id: contractorId // Added contractor_id linkage
    }
  }

  const handleSubmit = async () => {
    // Initial submission validation
    if (!formData.projectName || !formData.projectAddress || !formData.companyName || !formData.projectType || !formData.systemType) {
      setErrors({
        projectName: !formData.projectName ? "Project name is required" : "",
        companyName: !formData.companyName ? "Company name is required" : "",
        projectAddress: !formData.projectAddress ? "Project address is required" : "",
        projectType: !formData.projectType ? "Project type is required" : "",
        systemType: !formData.systemType ? "System type is required" : "",
      })
      toast.error("Please fill in required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = prepareProjectPayload(formData, [], "draft")
      const res = await submitProjectAction(payload)
      // Check for project_id (from new backend format), id, or other variations
      const projectId = res.data?.project_id || res.data?.id || res.data?.result?.id || res.data?.result || (typeof res.data === 'number' || typeof res.data === 'string' ? res.data : undefined)

      if (res.success && projectId) {
        toast.success("Project created! Now provide more details.")
        if (typeof window !== "undefined") {
          localStorage.removeItem(PERSIST_KEY)
        }
        router.push(`/projects/${projectId}`)
      } else {
        // Handle specific duplicate address error
        const errorMsg = res.error ? (typeof res.error === 'object' ? (res.error as any).message || (res.error as any).status : String(res.error)) : "Project created but ID missing";
        
        if (errorMsg.toLowerCase().includes("address")) {
           toast.error("This address is already registered with another project. Please verify the address.")
           setErrors(prev => ({ ...prev, projectAddress: "Address already in use" }))
        } else {
           toast.error(errorMsg)
        }
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
      let effectiveLat: number | null = null;
      let effectiveLng: number | null = null;
      let effectiveAddress = formData.projectAddress;

      // Handle Coordinates search
      if (formData.latitude && formData.longitude) {
        effectiveLat = parseFloat(formData.latitude);
        effectiveLng = parseFloat(formData.longitude);

        if (isNaN(effectiveLat) || isNaN(effectiveLng)) {
          toast.error("Invalid latitude or longitude");
          setScrapingStatus("idle");
          setWeatherLoading(false);
          return;
        }

        // If we have coordinates but no address, perform reverse geocoding
        if (!effectiveAddress) {
          const rev = await reverseGeocode(effectiveLat, effectiveLng);
          if (rev.success && rev.address) {
            effectiveAddress = rev.address;
            updateField("projectAddress", rev.address);
          } else {
            console.error("[Scraper] Reverse geocoding failed:", rev.error);
          }
        }
      } else if (effectiveAddress) {
        // Geocode address if no coordinates provided
        const geo = await geocodeAddress(effectiveAddress);
        if (geo.success && geo.lat && geo.lng) {
          effectiveLat = geo.lat;
          effectiveLng = geo.lng;
        }
      }

      if (effectiveLat && effectiveLng) {
        fetchNearbyStations(effectiveLat, effectiveLng).then((stations) => {
          if (stations.success && stations.data) {
            setWeatherStations(stations.data)
          }
          setWeatherLoading(false)
        })
      } else {
        setWeatherLoading(false)
      }

      if (!effectiveAddress) {
          toast.error("An address or coordinates are required to gather property intelligence.");
          setScrapingStatus("idle");
          return;
      }

      // 2. Property Scraping
      const [zillow, asce, regrid] = await Promise.all([
        scrapeZillowAction(effectiveAddress),
        scrapeASCE722Action(effectiveAddress),
        scrapeRegridAction(effectiveAddress),
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
            nextLabel="Create"
          />
        </div>
      </div>
    </form>
  )
}
