"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Plus, Trash2, Settings2, Sun, Zap, Power, Battery, FileCode, Paperclip, Search, Eye, 
  ExternalLink, Calendar, MapPin, User, Mail, CreditCard, ChevronRight, LayoutDashboard, 
  FileText, CheckCircle2, AlertCircle, Clock, MoreHorizontal, Download, History, 
  MessageSquare, Send, ArrowRight, Loader2, Sparkles, Building2, PanelTop, Compass, 
  ThermometerSun, ShieldCheck, Map, Layers, Maximize2, Minimize2, Check,
  X, Menu, PanelLeft, ChevronLeft, Briefcase, Save, Home, Box, Phone, Circle, Map as MapIcon,
  ChevronDown, Phone as PhoneIcon, Info
} from "lucide-react"
import { EquipmentSearchSelector } from "@/components/equipment-search-selector"


import { signoutAction } from "@/app/actions/auth-service"

import { cn } from "@/lib/utils"
import Sidebar from "@/components/layout/sidebar"
import { AnimatePresence, motion } from "framer-motion"

import UploadsStep from "@/components/permit-form/uploads-step"
import SiteDetails from "@/components/site-details"
import ElectricalDetails from "@/components/electrical-details"
import UtilityDetails from "@/components/utility-details"
import OptionalExtras from "@/components/optional-extras"
import FormCard from "@/components/form-card"
import SystemComponentsSections, { EquipmentItem } from "@/components/system-components-sections"
import { ServicesSelector } from "@/components/services-selector"



import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ProjectChat } from "@/components/projects/project-chat"
import { Project, ProjectStatus } from "@/types/project"
import { fetchProjectByIdAction, updateProjectAction } from "@/app/actions/project-service"
import { toast } from "sonner"
import { CalculateProjectProgress } from "@/lib/calculate-progress"
import { useProjectUpdates } from "@/hooks/use-project-updates"
import { ProjectStatusBar } from "@/components/projects/project-status-bar"

import AuthGuard from "@/components/auth/auth-guard"

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("services")
  const [, setFilesToUpload] = useState<File[]>([])

  // Adapter for form step components
  const updateField = (name: string, value: any) => {
    const fieldToPathMap: Record<string, string> = {
      systemSize: 'system_summary.system_size',
      systemType: 'system_summary.system_type',
      pvModules: 'system_summary.pv_modules',
      inverters: 'system_summary.inverters',
      batteryQty: 'system_summary.battery_info.qty',
      batteryModel: 'system_summary.battery_info.model',
      batteryId: 'system_summary.battery_info.equipment_id',
      batteryImage: 'system_summary.battery_info.image',
      projectFiles: 'projectFiles', 
      generalNotes: 'general_notes',
      // Site
      roofMaterial: 'site_details.roof_material',
      roofPitch: 'site_details.roof_pitch',
      numberOfArrays: 'site_details.number_of_arrays',
      groundMountType: 'site_details.ground_mount_type',
      foundationType: 'site_details.foundation_type',
      lotSize: 'site_details.lot_size',
      parcelNumber: 'site_details.parcel_number',
      windSpeed: 'site_details.wind_speed',
      snowLoad: 'site_details.snow_load',
      // Electrical
      mainPanelSize: 'electrical_details.main_panel_size',
      busRating: 'electrical_details.bus_rating',
      mainBreaker: 'electrical_details.main_breaker',
      pvBreakerLocation: 'electrical_details.pv_breaker_location',
      // Advanced Electrical
      meterLocation: 'advanced_electrical_details.meter_location',
      serviceEntranceType: 'advanced_electrical_details.service_entrance_type',
      subpanelDetails: 'advanced_electrical_details.subpanel_details',
      // Optional Extras
      miracleWattRequired: 'optional_extra_details.miracle_watt_required',
      miracleWattNotes: 'optional_extra_details.miracle_watt_notes',
      derRlcRequired: 'optional_extra_details.der_rlc_required',
      derRlcNotes: 'optional_extra_details.der_rlc_notes',
      setbackConstraints: 'optional_extra_details.setback_constraints',
      setbackNotes: 'optional_extra_details.setback_notes',
      siteAccessRestrictions: 'optional_extra_details.site_access_restrictions',
      siteAccessNotes: 'optional_extra_details.site_access_notes',
      inspectionNotes: 'optional_extra_details.inspection_notes',
      inspectionNotesText: 'optional_extra_details.inspection_notes_text',
      batterySldRequested: 'optional_extra_details.battery_sld_requested',
      batterySldNotes: 'optional_extra_details.battery_sld_notes',
      // Utility & Jurisdiction
      utilityProvider: 'site_details.utility_provider',
      jurisdiction: 'site_details.jurisdiction',
      // Battery toggle
      batteryBackup: 'system_summary.battery_backup',
    }

    const path = fieldToPathMap[name] || name
    handleUpdateField(path, value)
  }

  const addComponent = (type: string = "solar") => {
    const newId = Math.random().toString(36).substr(2, 9)
    // Use snake_case to match backend
    const newComponent: any = { id: newId, type: type, make_model: "", qty: "1", attachment: [], notes: "" }
    handleUpdateField('system_components', [...(project?.system_components || []), newComponent])
  }

  const updateComponent = (id: string, updates: Partial<Record<keyof EquipmentItem | string, any>>) => {
    // Map camelCase from UI back to snake_case for state/backend
    const fieldMap: any = {
      makeModel: 'make_model',
      equipment_id: 'equipment_id'
    }

    setProject(prev => {
      if (!prev) return null
      const nextComponents = (prev.system_components || []).map((c: any) => {
        if (c.id === id) {
          const updatedComp = { ...c }
          Object.entries(updates).forEach(([field, value]) => {
            const targetField = fieldMap[field] || field
            updatedComp[targetField] = value
          })
          return updatedComp
        }
        return c
      })
      return { ...prev, system_components: nextComponents }
    })
  }

  const removeComponent = (id: string) => {
    setProject(prev => {
      if (!prev) return null
      const nextComponents = (prev.system_components || []).filter((c: any) => c.id !== id)
      return { ...prev, system_components: nextComponents }
    })
  }

  // Convert project components and data to form step expected formats
  const formattedComponents: EquipmentItem[] = (project?.system_components || []).map((c: any) => ({
    id: c.id || Math.random().toString(36).substr(2, 9),
    type: c.type || "solar",
    makeModel: c.make_model || c.makeModel || "", // Robust check
    qty: (c.qty || 1).toString(),
    attachment: c.attachment || [],
    notes: c.notes || "",
    equipment_id: c.equipment_id || undefined, // UUID from equipment search
  }))

  const formCompatibleData: any = project ? {
    ...project,
    ...project.system_summary,
    ...project.site_details,
    ...project.electrical_details,
    ...project.advanced_electrical_details,
    ...project.optional_extra_details,
    companyName: project.user_profile?.company_name,
    projectName: project.name,
    contactName: project.user_profile?.contact_name,
    email: project.user_profile?.email,
    phone: project.user_profile?.phone,
    projectAddress: project.address,
    projectType: project.type,
    systemType: project.system_summary?.system_type || "roof_mount",
    systemSize: project.system_summary?.system_size || "",
    pvModules: project.system_summary?.pv_modules || "",
    inverters: project.system_summary?.inverters || "",
    batteryBackup: project.system_summary?.battery_backup || false,
    generalNotes: project.general_notes,
    projectFiles: project.uploads?.map(u => u.url) || [],
    batteryQty: project.system_summary?.battery_info?.qty,
    batteryModel: project.system_summary?.battery_info?.model,
    batteryId: project.system_summary?.battery_info?.equipment_id,
    batteryImage: project.system_summary?.battery_info?.image || [],
    // Map snake_case from API to camelCase for components
    utilityProvider: project.site_details?.utility_provider || "",
    jurisdiction: project.site_details?.jurisdiction || "",
    roofMaterial: project.site_details?.roof_material || "",
    roofPitch: project.site_details?.roof_pitch || "",
    numberOfArrays: project.site_details?.number_of_arrays || 0,
    groundMountType: project.site_details?.ground_mount_type || "",
    foundationType: project.site_details?.foundation_type || "",
    mainPanelSize: project.electrical_details?.main_panel_size || "",
    busRating: project.electrical_details?.bus_rating || "",
    mainBreaker: project.electrical_details?.main_breaker || "",
    pvBreakerLocation: project.electrical_details?.pv_breaker_location || "",
    meterLocation: project.advanced_electrical_details?.meter_location || "",
    serviceEntranceType: project.advanced_electrical_details?.service_entrance_type || "",
    subpanelDetails: project.advanced_electrical_details?.subpanel_details || "",
    // Optional Extra Details
    miracleWattRequired: project.optional_extra_details?.miracle_watt_required || false,
    miracleWattNotes: project.optional_extra_details?.miracle_watt_notes || "",
    derRlcRequired: project.optional_extra_details?.der_rlc_required || false,
    derRlcNotes: project.optional_extra_details?.der_rlc_notes || "",
    setbackConstraints: project.optional_extra_details?.setback_constraints || false,
    setbackNotes: project.optional_extra_details?.setback_notes || "",
    siteAccessRestrictions: project.optional_extra_details?.site_access_restrictions || false,
    siteAccessNotes: project.optional_extra_details?.site_access_notes || "",
    inspectionNotes: project.optional_extra_details?.inspection_notes || false,
    inspectionNotesText: project.optional_extra_details?.inspection_notes_text || "",
    batterySldRequested: project.optional_extra_details?.battery_sld_requested || false,
    batterySldNotes: project.optional_extra_details?.battery_sld_notes || "",
  } : {}






  /* Real-time updates hook */
  const { data: realtimeData } = useProjectUpdates(id)

  // Use real-time data if available, otherwise fallback to static CalculateProjectProgress
  const progress = realtimeData ? realtimeData.completion_percentage : CalculateProjectProgress(project)
  
  // Use real-time status if available, fallback to project.status
  const currentStatus = realtimeData?.status || project?.status
  
  // Subtasks from real-time data
  const subtasks = realtimeData?.subtasks || []

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true)
      const result = await fetchProjectByIdAction(id)
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setProject(result.data)
      }
      setIsLoading(false)
    }
    loadProject()
  }, [id])

  const handleUpdateField = (path: string, value: any) => {
    setProject(prev => {
      if (!prev) return null
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let current: any = next
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleUpdateFields = (updates: Record<string, any>) => {
    setProject(prev => {
      if (!prev) return null
      const next = JSON.parse(JSON.stringify(prev))
      Object.entries(updates).forEach(([path, value]) => {
        const keys = path.split('.')
        let current: any = next
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {}
          current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
      })
      return next
    })
  }

  const handleSave = async (newStatus?: ProjectStatus) => {
    if (!project) return
    setIsSaving(true)
    
    // Construct payload for update API
    // Cleaning payload to match simple nested JSON structure as requested
    const cleanPayload = {
      name: project.name,
      address: project.address,
      type: project.type,
      status: newStatus || project.status,
      submission_type_id: project.submission_type?.id,
      services: project.services?.map(s => s.id),
      
      // Send nested objects directly as requested
      system_summary: project.system_summary,
      site_details: project.site_details,
      electrical_details: project.electrical_details,
      advanced_electrical_details: project.advanced_electrical_details,
      optional_extra_details: project.optional_extra_details,
      system_components: project.system_components,
      
      general_notes: project.general_notes,
    }

    const result = await updateProjectAction(id, cleanPayload)
    if (result.success) {
      toast.success(newStatus === 'pending' ? "Project submitted for review" : "Project updated successfully")
      if (newStatus) {
        setProject(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } else {
      toast.error("Failed to update project", {
        description: result.error
      })
    }
    setIsSaving(false)
  }


  const getStatusBadgeConfig = (status: ProjectStatus | string): { status: "done" | "in-process" | "rejected" | "draft"; label: string } => {
    // Check if status matches one of the known ProjectStatus values first if needed, 
    // but our new StatusBadge handles strings intelligently, so we can just pass it through 
    // with a best-effort mapping for the "status" variant key.
    
    // Simple mapper for the config object required by page (though StatusBadge component takes string now, 
    // the page might be using this config for other things or just passing it to StatusBadge)
    const normalized = (status || "").toLowerCase()
    
    let variant: "done" | "in-process" | "rejected" | "draft" = "in-process"
    if (normalized.includes("done") || normalized.includes("approved") || normalized.includes("submitted")) variant = "done"
    else if (normalized.includes("rejected") || normalized.includes("hold") || normalized.includes("challenge")) variant = "rejected"
    else if (normalized.includes("draft")) variant = "draft"
    
    return { status: variant, label: status as string }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-zinc-500 font-bold">Initialising Project Data Stream...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !project) {
    return (
      <AuthGuard>
        <div className="flex h-screen items-center justify-center bg-background p-6">
          <Card className="max-w-md w-full border-border rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="bg-white pb-6">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="h-6 w-6" />
                <CardTitle className="text-xl font-bold">Data Link Failed</CardTitle>
              </div>
              <CardDescription className="font-medium">{error || "Project signature not found in central registry."}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button onClick={() => router.push("/projects")} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-primary/20">
                Return to Command Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-xl lg:hidden"
              >
                <div className="absolute top-4 right-4 z-50">
                   <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                     <X className="h-5 w-5 text-zinc-500" />
                   </Button>
                </div>
                <Sidebar className="h-full border-none" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="hidden lg:flex h-screen sticky top-0 z-40">
          <Sidebar 
            variant="dashboard"
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto relative min-w-0">
          <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex items-center gap-3 lg:gap-4">
                 {/* Mobile Menu Trigger */}
                 <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 text-zinc-600"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {sidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="hidden lg:flex p-2 rounded-lg hover:bg-black/5 transition-colors text-zinc-500 hover:text-zinc-900 -ml-2"
                    title="Show sidebar"
                  >
                    <PanelLeft className="h-5 w-5" />
                  </button>
                )}

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push("/projects")}
                  className="hover:bg-black/5 rounded-xl h-10 w-10 text-zinc-500"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-black tracking-tight text-zinc-900 leading-none">{realtimeData?.project_name || project.name}</h1>
                  </div>
                  <div className="flex flex-col gap-1 mt-1.5">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wider leading-none">
                      <MapPin className="h-3 w-3" />
                      {project.address}
                    </div>
                    {(project.submission_type || (project.services && project.services.length > 0)) && (
                       <div className="flex items-center gap-3 mt-1">
                          {project.submission_type && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[10px] font-black uppercase tracking-wider">
                              <Zap className="h-3 w-3" />
                              {project.submission_type.name}
                            </div>
                          )}
                          {project.services && project.services.map(service => (
                            <div key={service.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-wider border border-zinc-200">
                               <Briefcase className="h-3 w-3" />
                               {service.name}
                            </div>
                          ))}
                       </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Circular Progress Indicator */}
                <div className="hidden sm:flex items-center gap-2" title={`${progress}% complete`}>
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <circle 
                        cx="18" cy="18" r="15.9155" 
                        fill="none" 
                        stroke="var(--primary)" 
                        strokeWidth="3"
                        strokeDasharray={`${progress}, 100`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-zinc-700">{progress}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden lg:block">Complete</span>
                </div>

                {/* Desktop Chat Toggle */}
                <Button 
                  variant="outline" 
                  size="icon"
                  className="hidden xl:flex bg-background hover:bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 h-10 w-10 rounded-xl shadow-sm"
                  onClick={() => setChatCollapsed(prev => !prev)}
                  title="Toggle Project Chat"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>

                {/* Mobile Chat Toggle */}
                <Button 
                  variant="outline" 
                  size="icon"
                  className="flex xl:hidden bg-background hover:bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 h-10 w-10 rounded-xl shadow-sm"
                  onClick={() => setMobileChatOpen(true)}
                  title="Open Project Chat"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>



                {project.status === 'draft' && (
                  <Button 
                    onClick={() => handleSave('pending')} 
                    disabled={isSaving}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5 font-black h-10 md:h-12 px-4 md:px-8 rounded-xl md:rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-2 md:gap-3 text-xs md:text-sm uppercase tracking-widest"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                    <span className="hidden sm:inline">Submit for Review</span>
                    <span className="sm:hidden">Submit</span>
                  </Button>
                )}

                <Button 
                  onClick={() => handleSave()} 
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-black h-10 md:h-12 px-4 md:px-8 rounded-xl md:rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-2 md:gap-3 text-xs md:text-sm uppercase tracking-widest"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                  <span className="hidden sm:inline">Save Configuration</span>
                  <span className="sm:hidden">Save</span>
                </Button>

              </div>
            </div>

          </div>

          <div className="bg-white mt-3">
             <ProjectStatusBar currentStatus={currentStatus as ProjectStatus} className="w-full" />
          </div>


          <div className="p-4 md:p-8 max-w-6xl mx-auto pb-28 md:pb-24">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
              {/* Desktop Stepper */}
              <div className="hidden md:block">
                <div className="relative flex justify-between items-center w-full max-w-5xl mx-auto mb-12">
                  {/* Progress Line Background */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2" />
                  
                  {/* Animated Progress Line */}
                  <motion.div 
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: activeTab === 'services' ? "0%" : 
                             activeTab === 'overview' ? "25%" : 
                             activeTab === 'site' ? "50%" : 
                             activeTab === 'components' ? "75%" : "100%" 
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  />

                  {[
                    { id: 'services', label: 'Services', icon: Briefcase },
                    { id: 'overview', label: 'Summary', icon: Zap },
                    { id: 'site', label: 'Site', icon: MapPin },
                    { id: 'components', label: 'Equipment', icon: Box },
                    { id: 'uploads', label: 'Uploads', icon: Plus },
                  ].map((step, idx) => {
                    const isActive = activeTab === step.id
                    const isPast = ['services', 'overview', 'site', 'components', 'uploads'].indexOf(activeTab) > idx

                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveTab(step.id)}
                        className="relative z-10 flex flex-col items-center group"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300",
                          isActive ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : 
                          isPast ? "bg-white border-primary text-primary" : "bg-white border-zinc-200 text-zinc-400 group-hover:border-zinc-300"
                        )}>
                          {isPast ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                        </div>
                        <div className="absolute top-16 whitespace-nowrap text-center">
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isActive ? "text-primary" : "text-zinc-500"
                          )}>
                            {step.label}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <TabsContent value="overview" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8">
                  <Card className="rounded-3xl border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-black tracking-tight text-zinc-900">System Summary</CardTitle>
                            <CardDescription className="text-sm text-zinc-500">Capture the core specs for engineering</CardDescription>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-zinc-500">
                          <span className="rounded-full bg-zinc-100 px-3 py-1 border border-border uppercase tracking-wider">Quick</span>
                          <span className="rounded-full bg-primary/10 text-primary px-3 py-1 border border-primary/20 uppercase tracking-wider">{progress}% complete</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            System Size (kW DC)
                          </Label>
                          <Input
                            type="number"
                            value={formCompatibleData.systemSize || ""}
                            onChange={(e) => updateField("systemSize", Number(e.target.value))}
                            placeholder="0.00"
                            className="h-12 rounded-xl border-zinc-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Home className="h-3 w-3" />
                            System Type
                          </Label>
                          <Select
                            value={formCompatibleData.systemType || "roof_mount"}
                            onValueChange={(val) => updateField("systemType", val)}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="roof_mount">Roof Mount</SelectItem>
                              <SelectItem value="ground_mount">Ground Mount</SelectItem>
                              <SelectItem value="car_pool">Car Pool</SelectItem>
                              <SelectItem value="both">Both Roof and Ground</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Box className="h-3 w-3" />
                            Number of PV Modules (optional)
                          </Label>
                          <Input
                            type="number"
                            value={formCompatibleData.pvModules || ""}
                            onChange={(e) => updateField("pvModules", Number(e.target.value))}
                            placeholder="0"
                            className="h-12 rounded-xl border-zinc-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            Number of Inverters (optional)
                          </Label>
                          <Input
                            type="number"
                            value={formCompatibleData.inverters || ""}
                            onChange={(e) => updateField("inverters", Number(e.target.value))}
                            placeholder="0"
                            className="h-12 rounded-xl border-zinc-200"
                          />
                        </div>
                      </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between rounded-2xl border border-dashed border-zinc-200 px-4 py-3 bg-zinc-50">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-zinc-900">Battery Backup?</p>
                              <p className="text-xs text-muted-foreground">Enable if project includes battery storage</p>
                            </div>
                            <Switch
                              checked={!!formCompatibleData.batteryBackup}
                              onCheckedChange={(checked) => updateField("batteryBackup", checked)}
                            />
                          </div>

                          {formCompatibleData.batteryBackup && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                              <div className="space-y-2">
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                  <Battery className="h-3 w-3" />
                                  Battery Quantity
                                </Label>
                                <Input
                                  type="number"
                                  value={formCompatibleData.batteryQty || ""}
                                  onChange={(e) => updateField("batteryQty", Number(e.target.value))}
                                  placeholder="0"
                                  className="h-12 rounded-xl border-zinc-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                  <Search className="h-3 w-3" />
                                  Battery Make/Model
                                </Label>
                                <EquipmentSearchSelector 
                                  value={formCompatibleData.batteryModel || ""}
                                  equipmentId={formCompatibleData.batteryId}
                                  apiType="battery"
                                  onSelect={(makeModel: string, equipmentId?: string) => {
                                    handleUpdateFields({
                                      'system_summary.battery_info.model': makeModel,
                                      'system_summary.battery_info.equipment_id': equipmentId || ""
                                    })
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden self-start">
                    <CardHeader className="bg-white pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-black tracking-tight text-zinc-900">Customer Profile</CardTitle>
                          <CardDescription className="text-sm text-zinc-500">Contact details for coordination</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-2 space-y-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="contactName" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <User className="h-3 w-3" /> Contact Principal
                        </Label>
                        <Input
                          id="contactName"
                          className="h-12 rounded-xl border-zinc-200 font-semibold"
                          value={project.user_profile?.contact_name || ""}
                          onChange={(e) => handleUpdateField("user_profile.contact_name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="companyName" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Building2 className="h-3 w-3" /> Entity Name
                        </Label>
                        <Input
                          id="companyName"
                          className="h-12 rounded-xl border-zinc-200 font-semibold"
                          value={project.user_profile?.company_name || ""}
                          onChange={(e) => handleUpdateField("user_profile.company_name", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" /> Digital Axis
                          </Label>
                          <Input
                            id="email"
                            className="h-12 rounded-xl border-zinc-200 font-semibold"
                            value={project.user_profile?.email || ""}
                            onChange={(e) => handleUpdateField("user_profile.email", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="phone" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Phone className="h-3 w-3" /> Comms Link
                          </Label>
                          <Input
                            id="phone"
                            className="h-12 rounded-xl border-zinc-200 font-semibold"
                            value={project.user_profile?.phone || ""}
                            onChange={(e) => handleUpdateField("user_profile.phone", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border bg-card rounded-3xl shadow-sm overflow-hidden">
                  <CardHeader className="bg-white border-b border-border/60 flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Sub Tasks</CardTitle>
                        <CardDescription className="text-xs text-zinc-500">Track review items tied to this project</CardDescription>
                      </div>
                    </div>
                    {realtimeData?.subtasks_summary && (
                      <div className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                        {realtimeData.subtasks_summary}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    {subtasks.length > 0 ? (
                      <div className="divide-y divide-zinc-100">
                        {subtasks.map((task) => (
                          <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-zinc-50/60 transition-colors">
                            <div
                              className={cn(
                                "h-6 w-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors",
                                task.is_closed
                                  ? "bg-success/10 border-success text-success"
                                  : "border-zinc-200 text-zinc-300"
                              )}
                            >
                              {task.is_closed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-semibold truncate",
                                  task.is_closed ? "text-zinc-500 line-through" : "text-zinc-900"
                                )}
                              >
                                {task.stage}: {task.name}
                              </p>
                            </div>
                            {task.deadline && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">
                                <Clock className="h-3 w-3" />
                                {task.deadline}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-6 py-5">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">No subtasks yet</p>
                          <p className="text-xs text-muted-foreground">Actions will appear as reviewers add requests.</p>
                        </div>
                        <div className="h-2 w-24 rounded-full bg-zinc-100 overflow-hidden">
                          <div className="h-full w-1/3 bg-primary" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card rounded-3xl shadow-sm overflow-hidden">
                  <CardHeader className="bg-white border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Settings2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Equipment Registry</CardTitle>
                        <CardDescription className="text-xs text-zinc-500">Summary of selected and verified components</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {formattedComponents.length > 0 ? (
                      <div className="divide-y divide-zinc-100">
                        {formattedComponents.map((comp) => (
                          <div key={comp.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/60 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-500">
                                {comp.type === 'solar' && <Sun className="h-3.5 w-3.5" />}
                                {comp.type === 'inverter' && <Zap className="h-3.5 w-3.5" />}
                                {comp.type === 'battery' && <Battery className="h-3.5 w-3.5" />}
                                {comp.type === 'optimizer' && <Settings2 className="h-3.5 w-3.5" />}
                                {comp.type === 'disconnect' && <Power className="h-3.5 w-3.5" />}
                                {comp.type !== 'solar' && comp.type !== 'inverter' && comp.type !== 'battery' && comp.type !== 'optimizer' && comp.type !== 'disconnect' && <Box className="h-3.5 w-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-900 truncate flex items-center gap-2">
                                  {comp.makeModel || "Unnamed Component"}
                                  {comp.equipment_id && (
                                    <span className="shrink-0 flex items-center gap-0.5 bg-green-50 text-green-600 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-green-100">
                                      <CheckCircle2 className="h-2.5 w-2.5" />
                                      VERIFIED
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{comp.type}</p>
                              </div>
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-zinc-100 text-[11px] font-black text-zinc-600">
                              QTY: {comp.qty}
                            </div>
                          </div>
                        ))}
                        {formCompatibleData.batteryBackup && formCompatibleData.batteryModel && (
                            <div className="p-4 flex items-center justify-between bg-blue-50/30">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                                  <Battery className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-zinc-900 truncate flex items-center gap-2">
                                    {formCompatibleData.batteryModel}
                                    {formCompatibleData.batteryId && (
                                      <span className="shrink-0 flex items-center gap-0.5 bg-green-50 text-green-600 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-green-100">
                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                        VERIFIED
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Backup Battery</p>
                                </div>
                              </div>
                              <div className="px-3 py-1 rounded-lg bg-blue-100 text-[11px] font-black text-blue-600">
                                QTY: {formCompatibleData.batteryQty || 1}
                              </div>
                            </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-zinc-500">
                        <p className="text-sm font-semibold">No equipment documented</p>
                        <p className="text-xs mt-1">Add components in the Equipment tab.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card rounded-3xl shadow-sm">
                  <CardHeader className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">General Notes</CardTitle>
                        <CardDescription className="text-xs text-zinc-500">Site access, HOA, equipment preferences, etc.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formCompatibleData.generalNotes || ""}
                      onChange={(e) => updateField("generalNotes", e.target.value)}
                      placeholder="Site access, special requirements, HOA concerns, microinverters required, setback requirements, equipment preferences, etc."
                      className="min-h-[120px] rounded-2xl border-zinc-200"
                    />
                  </CardContent>
                </Card>
              </TabsContent>


              <TabsContent value="site" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormCard title="Site Details">
                    <SiteDetails
                      systemType={formCompatibleData.systemType}
                      formData={formCompatibleData}
                      onUpdateField={updateField}
                      onFileUpload={updateField}
                    />
                  </FormCard>

                  <FormCard title="Electrical Details">
                    <ElectricalDetails
                      formData={formCompatibleData}
                      onUpdateField={updateField}
                      onFileUpload={updateField}
                    />
                  </FormCard>

                  <div className="col-span-1 lg:col-span-2 space-y-8">
                    <FormCard title="Utility & Jurisdiction">
                      <UtilityDetails
                        formData={formCompatibleData}
                        onUpdateField={updateField}
                      />
                    </FormCard>

                    <FormCard title="Optional Extras">
                      <OptionalExtras
                        formData={formCompatibleData}
                        onUpdateField={updateField}
                      />
                    </FormCard>
                  </div>
                </div>
              </TabsContent>

              {/* Equipment Tab - System Components */}
              <TabsContent value="components" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FormCard title="System Equipment">
                  <SystemComponentsSections
                    components={formattedComponents}
                    onAddComponent={addComponent}
                    onUpdateComponent={updateComponent}
                    onRemoveComponent={removeComponent}
                  />
                </FormCard>
              </TabsContent>

              <TabsContent value="uploads" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <UploadsStep
                   formData={formCompatibleData}
                   updateField={updateField}
                   setFilesToUpload={setFilesToUpload}
                 />
              </TabsContent>

              <TabsContent value="services" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FormCard title="Project Services">
                  <ServicesSelector
                    selectedServices={project?.services || []}
                    onServicesChange={(services) => handleUpdateField('services', services)}
                  />
                </FormCard>
              </TabsContent>


              {/* Mobile Bottom Tabs */}
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 md:hidden shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] pb-safe">
                <TabsList className="grid grid-cols-5 h-16 bg-transparent border-0 p-1 gap-1">
                    <TabsTrigger
                      value="services"
                      className="flex flex-col items-center justify-center gap-1 h-full rounded-xl data-[state=active]:bg-primary! data-[state=active]:text-white! data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-zinc-950! font-black text-[9px] uppercase tracking-wider transition-all duration-300"
                    >
                      <Briefcase className="w-4 h-4 text-zinc-900 data-[state=active]:text-white" />
                      Services
                    </TabsTrigger>
                    <TabsTrigger
                      value="overview"
                      className="flex flex-col items-center justify-center gap-1 h-full rounded-xl data-[state=active]:bg-primary! data-[state=active]:text-white! data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-zinc-950! font-black text-[9px] uppercase tracking-wider transition-all duration-300"
                    >
                      <LayoutDashboard className="w-4 h-4 text-zinc-900 data-[state=active]:text-white" />
                      Summary
                    </TabsTrigger>
                    <TabsTrigger
                      value="site"
                      className="flex flex-col items-center justify-center gap-1 h-full rounded-xl data-[state=active]:bg-primary! data-[state=active]:text-white! data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-zinc-950! font-black text-[9px] uppercase tracking-wider transition-all duration-300"
                    >
                      <MapIcon className="w-4 h-4 text-zinc-900 data-[state=active]:text-white" />
                      Site
                    </TabsTrigger>
                    <TabsTrigger
                      value="components"
                      className="flex flex-col items-center justify-center gap-1 h-full rounded-xl data-[state=active]:bg-primary! data-[state=active]:text-white! data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-zinc-950! font-black text-[9px] uppercase tracking-wider transition-all duration-300"
                    >
                      <Box className="w-4 h-4 text-zinc-900 data-[state=active]:text-white" />
                      Equip
                    </TabsTrigger>
                    <TabsTrigger
                      value="uploads"
                      className="flex flex-col items-center justify-center gap-1 h-full rounded-xl data-[state=active]:bg-primary! data-[state=active]:text-white! data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-zinc-950! font-black text-[9px] uppercase tracking-wider transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 text-zinc-900 data-[state=active]:text-white" />
                      Files
                    </TabsTrigger>

                </TabsList>
              </div>
            </Tabs>
          </div>
        </main>
        <ProjectChat 
          projectId={id} 
          projectName={realtimeData?.project_name || project?.name || "Project"} 
          initialMessages={realtimeData?.chat_logs || []}
          chatLogs={realtimeData?.chat_logs || []} 
          className={cn(
            "shrink-0 z-40 shadow-[-5px_0_30px_-5px_rgba(0,0,0,0.05)]",
            // Desktop styles
            "hidden xl:flex",
          )}
          collapsed={chatCollapsed}
          onCollapsedChange={setChatCollapsed}
        />


         {/* Mobile Chat Overlay */}
         {mobileChatOpen && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileChatOpen(false)} />
            <div className="absolute inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl animate-in slide-in-from-right duration-300">
              <ProjectChat 
                projectId={id} 
                projectName={realtimeData?.project_name || project?.name || "Project"} 
                initialMessages={realtimeData?.chat_logs || []}
                chatLogs={realtimeData?.chat_logs || []}
                className="w-full h-full border-none"
                collapsed={false}
                onCollapsedChange={(collapsed) => {
                   if (collapsed) setMobileChatOpen(false)
                }}
              />
            </div>
          </div>
         )}
        </div>
      </div>
    </AuthGuard>
  )
}
