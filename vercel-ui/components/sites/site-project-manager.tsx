"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { SiteCreationDialog } from "./site-creation-dialog"
import { ServiceSelectionView } from "../services/service-selection-view"
import { DynamicFormEngine } from "../forms/dynamic-form-engine"
import { TechnicalDashboard } from "./technical-dashboard"
import { useSaveAnswers, useSite, useServiceQuestionsUnion, useProject } from "@/hooks/use-site-queries"
import { addServicesToProject } from "@/app/actions/service-api"
import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard, ChevronLeft, AlertCircle, FileText } from "lucide-react"
import { toast } from "sonner"
import PermitPlansetDynamicForm from "../permit-form/permit-planset-dynamic-form"

type WorkflowStep = "initial" | "service_selection" | "questions" | "dashboard"

interface SiteProjectManagerProps {
  initialSiteUuid?: string
}

export function SiteProjectManager({ initialSiteUuid }: SiteProjectManagerProps = {}) {
  const [step, setStep] = useState<WorkflowStep>(initialSiteUuid ? "dashboard" : "initial")
  const [siteUuid, setSiteUuid] = useState<string | null>(initialSiteUuid || null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false)
  const [isPersistingServices, setIsPersistingServices] = useState(false)
  const searchParams = useSearchParams()
  const urlServiceId = searchParams.get("serviceId")

  // Handle initial site loading or URL changes
  useEffect(() => {
    if (initialSiteUuid) {
        setSiteUuid(initialSiteUuid)
    }
  }, [initialSiteUuid])

  useEffect(() => {
    if (urlServiceId) {
      setSelectedServiceIds([urlServiceId])
      if (siteUuid) setStep("questions")
    }
  }, [urlServiceId, siteUuid])

  // Fetch project data to check for services (using /api/projects/)
  const { data: projectData, isLoading: projectLoading, refetch: refetchProject } = useProject(siteUuid)
  const { data: siteData } = useSite(siteUuid) // Keep siteData for the form's defaultValues

  // Sync siteUuid to actual UUID if we started with a numeric ID
  useEffect(() => {
    if (projectData?.id && projectData.id !== siteUuid) {
      console.log("Syncing siteUuid to project UUID:", projectData.id)
      setSiteUuid(projectData.id)
    }
  }, [projectData?.id, siteUuid])

  // Auto-redirect if project has no services
  useEffect(() => {
    if (projectData && step === "dashboard") {
        const hasServices = (projectData.services && projectData.services.length > 0)
        if (!hasServices) {
            setStep("service_selection")
        }
    }
  }, [projectData, step])

  // Use Union API if multiple services selected, or fallback to single
  const { 
    data: questions, 
    isLoading: questionsLoading, 
    error: questionsError 
  } = useServiceQuestionsUnion(selectedServiceIds)
  
  const saveAnswersMutation = useSaveAnswers(siteUuid || "")

  const handleSiteCreated = (uuid: string) => {
    setSiteUuid(uuid)
    setStep("questions")
  }

  const handleServicesSelected = async (ids: string[]) => {
    if (ids.length > 0) {
      setSelectedServiceIds(ids)
      
      // If we don't have a siteUuid yet, we need to create one first
      if (!siteUuid) {
        setIsSiteDialogOpen(true)
        return
      }

      // If we have a siteUuid, persist these services to the project
      setIsPersistingServices(true)
      try {
        const res = await addServicesToProject(siteUuid, ids)
        if (res.status === "success") {
          await refetchProject() // Refresh project data to reflect new services
        } else {
          toast.error(res.message || "Failed to add services to project")
        }
      } catch (e: any) {
        toast.error("Cloud sync failed", { description: e.message || "Connection error" })
      } finally {
        setIsPersistingServices(false)
      }
      
      setStep("questions")
    }
  }

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      const result = await saveAnswersMutation.mutateAsync(data)
      if (result.status === "success") {
        toast.success("Data synced to Odoo core models!")
        setStep("dashboard")
      } else {
        toast.error("Failed to save", { description: result.message || "Validation error" })
      }
    } catch (error: any) {
      toast.error("Save failed", { description: error.message || "Please check connection." })
    }
  }

  if (projectLoading || isPersistingServices) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="font-bold text-zinc-400 uppercase tracking-widest text-xs">
            {isPersistingServices ? "Initializing Workflow..." : "Syncing Project..."}
          </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/20">
      <AnimatePresence mode="wait">
        {step === "initial" && (
          <motion.div 
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center min-h-[80vh] px-4"
          >
            <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center mb-8 rotate-3 shadow-xl shadow-primary/5">
                <Plus className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-6xl font-black text-zinc-900 mb-6 tracking-tighter">Sun<span className="text-primary italic">Permit</span></h1>
            <p className="text-xl text-zinc-500 max-w-lg text-center mb-10 leading-relaxed">
              Start by creating a new site or selecting an existing location to begin the engineering workflow.
            </p>
            <Button 
               size="lg" 
               onClick={() => setStep("service_selection")}
               className="h-16 px-12 rounded-full text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              Configure New Site
            </Button>
          </motion.div>
        )}

        {step === "service_selection" && (
          <motion.div 
            key="services"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ServiceSelectionView 
              projectId={siteUuid || "new-site-flow"} 
              onServicesSelected={handleServicesSelected} 
            />
          </motion.div>
        )}

        {step === "questions" && (
          <motion.div 
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full px-8 md:px-12 py-8"
          >
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-zinc-900 mb-2 tracking-tight">Engineering Inputs</h2>
                    <p className="text-zinc-500 font-medium">Please provide the technical details required for {selectedServiceIds.length > 1 ? "these services" : "this service"}.</p>
                </div>
                <Button variant="ghost" onClick={() => setStep("dashboard")} className="text-zinc-400 hover:text-primary font-bold">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back
                </Button>
            </div>
            
            <div className="w-full">
                {questionsLoading ? (
                    <div className="flex flex-col items-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Loading Union Schema</span>
                    </div>
                ) : questionsError ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">Error Loading Questions</h3>
                        <p className="text-zinc-500 mb-6">{(questionsError as Error).message}</p>
                        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
                    </div>
                ) : (
                    <div className="w-full">
                        {selectedServiceIds.includes("1") || selectedServiceIds.includes("permit-planset") ? (
                            <PermitPlansetDynamicForm 
                                siteUuid={siteUuid || undefined}
                                projectUuid={siteUuid || undefined}
                            />
                        ) : (
                            <DynamicFormEngine 
                                questions={questions || []} 
                                onSubmit={handleFormSubmit}
                                isSubmitting={saveAnswersMutation.isPending}
                                defaultValues={{
                                    ...siteData?.answers,
                                    // Pre-populate from project/user context
                                    project_name: projectData?.name,
                                    address: projectData?.address || siteData?.address,
                                    project_type: projectData?.type || siteData?.projectType,
                                    company_name: projectData?.user_profile?.company_name,
                                    email: projectData?.user_profile?.email,
                                    contact_name: projectData?.user_profile?.contact_name,
                                    phone: projectData?.user_profile?.phone,
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
          </motion.div>
        )}

        {step === "dashboard" && siteUuid && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="fixed top-6 right-6 z-50 flex gap-2">
                <Button 
                    onClick={() => setStep("service_selection")} 
                    variant="outline" 
                    className="rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 shadow-xl font-bold gap-2 hover:bg-white transition-all"
                >
                    <Plus className="w-4 h-4 text-primary" />
                    Add Service
                </Button>
                {!initialSiteUuid && (
                    <Button 
                        onClick={() => setStep("initial")} 
                        variant="outline" 
                        className="rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 shadow-xl font-bold gap-2 hover:bg-white transition-all"
                    >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        New Project
                    </Button>
                )}
            </div>
            <TechnicalDashboard siteUuid={siteUuid} />
          </motion.div>
        )}
      </AnimatePresence>

      <SiteCreationDialog 
        isOpen={isSiteDialogOpen} 
        onClose={() => setIsSiteDialogOpen(false)}
        onCreated={handleSiteCreated}
      />
    </div>
  )
}
