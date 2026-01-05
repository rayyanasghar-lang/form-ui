"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

import { Component } from "./system-components-table"

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

  // Scraper & Weather Status
  const [scrapingStatus, setScrapingStatus] = useState<"idle" | "scraping" | "completed" | "error">("idle")
  const [weatherStations, setWeatherStations] = useState<any[]>([])
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* ---------------- Fetch Services ---------------- */
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true)
      const result = await fetchServicesAction()
      
      if ("error" in result) {
        console.error("Failed to fetch services:", result.error)
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

  const startScraping = async () => {
    if (!formData.projectAddress) {
      toast.error("Please enter an address first");
      return;
    }

    setScrapingStatus("scraping");
    setWeatherLoading(true);
    window.dispatchEvent(new CustomEvent("property-data-scraping-started"));

    try {
      const { geocodeAddress, fetchNearbyStations } = await import("@/app/actions/weather-service");
      const geoResult = await geocodeAddress(formData.projectAddress);
      
      if (geoResult.success && geoResult.lat && geoResult.lng) {
        const stationsResult = await fetchNearbyStations(geoResult.lat, geoResult.lng);
        if (stationsResult.success && stationsResult.data) {
          setWeatherStations(stationsResult.data);
        }

        try {
          const { data: solarData } = await axios.get('/api/solar', { params: { address: formData.projectAddress } });
          const { saveSolarData } = await import("@/lib/solar-store");
          saveSolarData({
            address: solarData.address || formData.projectAddress,
            lat: solarData.lat,
            lng: solarData.lng,
            solar: solarData.solar,
            layers: solarData.layers,
          });
        } catch (err) {
          console.error("Solar Analysis Error (Manual Trigger):", err);
        }
      }

      const { scrapeZillowAction, scrapeASCE716Action, scrapeASCE722Action, scrapeRegridAction } = await import("@/app/actions/scrape-service");
      const { savePropertyData, updatePropertyData } = await import("@/lib/property-store");

      savePropertyData({
        address: formData.projectAddress,
        lotSize: null,
        parcelNumber: null,
        owner: null,
        landUse: null,
        windSpeed: null,
        snowLoad: null,
        sources: {}
      });

      Promise.allSettled([
        scrapeZillowAction(formData.projectAddress).then(res => {
          if (res.success && res.data) {
            updatePropertyData({
              lotSize: res.data.lot_size,
              parcelNumber: res.data.parcel_number,
              interiorArea: res.data.interior_area,
              structureArea: res.data.structure_area,
              newConstruction: res.data.new_construction,
              yearBuilt: res.data.year_built,
              sources: {
                zillow: {
                  parcelNumber: res.data.parcel_number || null,
                  lotSize: res.data.lot_size || null,
                  interiorArea: res.data.interior_area || null,
                  structureArea: res.data.structure_area || null,
                  newConstruction: res.data.new_construction ?? null,
                  yearBuilt: res.data.year_built || null,
                }
              }
            });
          }
        }),
        scrapeASCE716Action(formData.projectAddress).then(res => {
          if (res.success && res.data) {
            updatePropertyData({
              windSpeed716: res.data.windSpeed || null,
              snowLoad716: res.data.snowLoad || null,
              sources: {
                asce716: {
                  windSpeed: res.data.windSpeed || null,
                  snowLoad: res.data.snowLoad || null
                }
              }
            });
          }
        }),
        scrapeASCE722Action(formData.projectAddress).then(res => {
          if (res.success && res.data) {
            updatePropertyData({
              windSpeed: res.data.windSpeed || null,
              snowLoad: res.data.snowLoad || null,
              sources: {
                asce: {
                  windSpeed: res.data.windSpeed || null,
                  snowLoad: res.data.snowLoad || null
                }
              }
            });
          }
        }),
        scrapeRegridAction(formData.projectAddress).then(res => {
          if (res.success && res.data) {
            updatePropertyData({
              lotSize: res.data.lot_size,
              parcelNumber: res.data.parcel_number,
              owner: res.data.owner,
              landUse: res.data.land_use,
              sources: {
                regrid: {
                  parcelNumber: res.data.parcel_number || null,
                  owner: res.data.owner || null,
                  lotSize: res.data.lot_size || null,
                  landUse: res.data.land_use || null
                }
              }
            });
          }
        })
      ]).finally(() => {
        setScrapingStatus("completed");
        setWeatherLoading(false);
        window.dispatchEvent(new CustomEvent("property-data-scraping-completed"));
      });
    } catch (err) {
      console.error("Scraping trigger error:", err);
      setScrapingStatus("error");
      setWeatherLoading(false);
    }
  };

  /* ---------------- Draft Autosave ---------------- */
  const saveDraft = useCallback(() => {
    localStorage.setItem(
      "permit-planset-draft",
      JSON.stringify({
        formData,
        submissionMode,
        components,
        currentStep,
      })
    )
    setLastSaved(new Date())
    setSaveStatus("saved")
  }, [formData, submissionMode, components, currentStep])

  useEffect(() => {
    setSaveStatus("saving")
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(saveDraft, 500)
  }, [formData, submissionMode, components, currentStep, saveDraft])

  const STEPS =
    submissionMode === "provide details" ? DETAILED_STEPS : QUICK_STEPS

  /* ---------------- Helpers ---------------- */
  const updateField = (field: string, value: any) => {
    if (field === "projectFiles" && Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      setFilesToUpload(value as File[])
      setFormData((prev) => ({ ...prev, [field]: (value as File[]).map((f) => f.name) }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
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

  const updateComponent = (id: string, field: keyof Component, value: any) => {
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
      if (!formData.projectName) newErrors.projectName = "Project name is required"
      if (!formData.projectAddress) newErrors.projectAddress = "Project address is required"
      if (!formData.projectType) newErrors.projectType = "Project type is required"
      if (formData.services.length === 0) newErrors.services = "Select at least one permit service"
    } else if (step === 1) {
      if (!formData.systemSize) newErrors.systemSize = "System size is required"
      if (!formData.systemType) newErrors.systemType = "System type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    
    // Upload files to Google Drive
    const uploadedFiles: { name: string; url: string }[] = []
    const uploadErrors: string[] = []

    if (filesToUpload.length > 0) {
      try {
        await Promise.all(
          filesToUpload.map(async (file) => {
            const uploadData = new FormData()
            uploadData.append("file", file)
            uploadData.append("projectName", formData.projectName || "Untitled Project")

            const result = await uploadWithRcloneAction(uploadData)
            if (result.error) {
              uploadErrors.push(`${file.name}: ${result.error}`)
            } else if (result.webViewLink) {
              uploadedFiles.push({ name: file.name, url: result.webViewLink })
            }
          }),
        )

        if (uploadErrors.length > 0 && uploadedFiles.length === 0) {
          toast.error("Upload Error", { description: "Failed to upload files." })
          setIsSubmitting(false)
          return
        }
      } catch (error) {
        toast.error("Upload Failed")
        setIsSubmitting(false)
        return
      }
    }

    const payload = {
      user_profile: {
        company_name: "Solar Solutions Inc.",
        contact_name: "John Doe",
        email: "john.doe@solarsolutions.com",
        phone: "+1 (555) 123-4567",
      },
      project: {
        name: formData.projectName,
        address: formData.projectAddress,
        type: formData.projectType,
        submission_type_name: submissionMode,
        general_notes: formData.generalNotes,
        status: "draft",
      },
      services: formData.services,
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
          mime_type: "application/pdf",
          size: 0,
        }
      }),
    }

    try {
      const result = await submitProjectAction(payload)
      if (result.success) {
        localStorage.removeItem("permit-planset-draft")
        toast.success("Success!", { description: "Project created successfully!" })
        router.push("/projects")
      } else {
        toast.error("Submission Failed", { description: result.error as any })
      }
    } catch (error) {
      toast.error("Submission Error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!formData.projectName) {
      toast.error("Project name required to save draft")
      return
    }

    setIsSubmitting(true)
    const payload = {
      user_profile: {
        company_name: "Solar Solutions Inc.",
        contact_name: "John Doe",
        email: "john.doe@solarsolutions.com",
        phone: "+1 (555) 123-4567",
      },
      project: {
        name: formData.projectName,
        address: formData.projectAddress,
        type: formData.projectType,
        submission_type_name: submissionMode,
        general_notes: formData.generalNotes,
        status: "draft",
      },
      status: "draft"
    }

    try {
      const result = await submitProjectAction(payload)
      if (result.success) {
        toast.success("Draft Saved!")
        localStorage.removeItem("permit-planset-draft")
        router.push("/projects")
      } else {
        toast.error("Failed to Save Draft")
      }
    } catch (error) {
      toast.error("Error")
    } finally {
      setIsSubmitting(false)
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((s) => s + 1)
      } else {
        submitForm()
      }
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
    <form className="space-y-6 pb-32 md:pb-0">
      
      {/* Sticky Stepper */}
      <div className="sticky top-[64px] z-30 bg-background/80 backdrop-blur border-b md:static md:border-none">
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
            onStartScraping={startScraping}
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
      <div className="fixed md:static bottom-0 left-0 right-0 z-40 bg-background border-t md:border-none px-4 py-3 md:p-0">
        <FormButtons
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === STEPS.length - 1}
          isLoading={isSubmitting}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          onSaveDraft={currentStep === 0 ? handleSaveDraft : undefined}
        />
      </div>
    </form>
  )
}
