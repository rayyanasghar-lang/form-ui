"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Save, 
  MapPin, 
  Zap, 
  User, 
  Home, 
  Box, 
  AlertCircle,
  ClipboardList,
  Loader2,
  FileText,
  Briefcase,
  Building2,
  Mail,
  MessageSquare,
  Phone,
  ExternalLink,
  Menu,
  PanelLeft,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import Sidebar from "@/components/layout/sidebar"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/projects/status-badge"
import { ProjectChat } from "@/components/projects/project-chat"
import { Project, ProjectStatus } from "@/types/project"
import { fetchProjectByIdAction, updateProjectAction } from "@/app/actions/project-service"
import { toast } from "sonner"

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
  const [activeTab, setActiveTab] = useState("overview")

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
    if (!project) return
    
    setProject(prev => {
      if (!prev) return null
      const next = { ...prev }
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

  const handleSave = async () => {
    if (!project) return
    setIsSaving(true)
    
    // Construct payload for update API
    const payload = {
      name: project.name,
      address: project.address,
      type: project.systemType,
      system_summary: project.system_summary,
      site_details: project.site_details,
      electrical_details: project.electrical_details,
      advanced_electrical_details: project.advanced_electrical_details,
      optional_extra_details: project.optional_extra_details,
      general_notes: project.general_notes,
    }

    const result = await updateProjectAction(id, payload)
    if (result.success) {
      toast.success("Project updated successfully")
    } else {
      toast.error("Failed to update project", {
        description: result.error
      })
    }
    setIsSaving(false)
  }

  const getStatusBadgeConfig = (status: ProjectStatus): { status: "done" | "in-process" | "rejected" | "draft"; label: string } => {
    switch (status) {
      case "approved": return { status: "done", label: "Approved" }
      case "rejected": return { status: "rejected", label: "Rejected" }
      case "draft": return { status: "draft", label: "Draft" }
      case "pending": return { status: "in-process", label: "Pending" }
      case "in_review": return { status: "in-process", label: "In Review" }
      default: return { status: "draft", label: status }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-zinc-500 font-bold">Initialising Project Data Stream...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F0E8] p-6">
        <Card className="max-w-md w-full border-[#E8E0D5] rounded-3xl overflow-hidden shadow-xl">
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
    )
  }

  return (
    <div className="flex h-screen bg-[#F5F0E8] overflow-hidden">
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
              className="fixed inset-y-0 left-0 z-50 w-64 bg-[#F5F0E8] shadow-xl lg:hidden"
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
        <div className="sticky top-0 z-10 border-b border-[#E8E0D5] bg-[#F5F0E8]/80 backdrop-blur-md">
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
                  <h1 className="text-xl font-black tracking-tight text-zinc-900 leading-none">{project.name}</h1>
                  <div className="hidden md:block">
                    <StatusBadge {...getStatusBadgeConfig(project.status)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wider leading-none">
                    <MapPin className="h-3 w-3" />
                    {project.address}
                  </div>
                  {(project.submission_type || (project.services && project.services.length > 0)) && (
                     <div className="flex items-center gap-3 mt-1">
                        {project.submission_type && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-100">
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
              {/* Desktop Chat Toggle */}
              <Button 
                variant="outline" 
                size="icon"
                className="hidden xl:flex bg-white hover:bg-white/50 border-orange-200 text-orange-600 hover:text-orange-700 h-10 w-10 rounded-xl shadow-sm"
                onClick={() => setChatCollapsed(prev => !prev)}
                title="Toggle Project Chat"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              {/* Mobile Chat Toggle */}
              <Button 
                variant="outline" 
                size="icon"
                className="flex xl:hidden bg-white hover:bg-white/50 border-orange-200 text-orange-600 hover:text-orange-700 h-10 w-10 rounded-xl shadow-sm"
                onClick={() => setMobileChatOpen(true)}
                title="Open Project Chat"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-primary hover:bg-primary/95 text-white font-black h-10 md:h-12 px-4 md:px-8 rounded-xl md:rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-2 md:gap-3 text-xs md:text-sm uppercase tracking-widest"
                style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
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


        <div className="p-4 md:p-8 max-w-6xl mx-auto pb-28 md:pb-24">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
            <div className="hidden md:block">
              <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 hide-scrollbar">
                <TabsList className="bg-zinc-200/30 backdrop-blur-md border border-[#E8E0D5] rounded-3xl p-1.5 md:p-2 h-auto justify-start gap-1 md:gap-2 w-full md:w-fit mb-4 md:mb-8 shadow-inner overflow-x-auto">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-2xl px-3 md:px-10 py-2.5 md:py-3.5 text-[9px] md:text-xs font-black uppercase tracking-widest !text-zinc-700 data-[state=active]:!bg-primary data-[state=active]:!text-white data-[state=active]:!shadow-2xl transition-all duration-500 shadow-none hover:text-zinc-900 hover:bg-white/50 flex-1 md:flex-none"
                  style={{ "--primary-active": "oklch(68.351% 0.19585 34.956)" } as any}
                >
                  System Summary
                </TabsTrigger>
                <TabsTrigger 
                  value="site" 
                  className="rounded-2xl px-3 md:px-10 py-2.5 md:py-3.5 text-[9px] md:text-xs font-black uppercase tracking-widest !text-zinc-700 data-[state=active]:!bg-primary data-[state=active]:!text-white data-[state=active]:!shadow-2xl transition-all duration-500 shadow-none hover:text-zinc-900 hover:bg-white/50 flex-1 md:flex-none"
                >
                  Site & Electrical
                </TabsTrigger>
                <TabsTrigger 
                  value="components" 
                  className="rounded-2xl px-3 md:px-10 py-2.5 md:py-3.5 text-[9px] md:text-xs font-black uppercase tracking-widest !text-zinc-700 data-[state=active]:!bg-primary data-[state=active]:!text-white data-[state=active]:!shadow-2xl transition-all duration-500 shadow-none hover:text-zinc-900 hover:bg-white/50 flex-1 md:flex-none"
                >
                  Equipment
                </TabsTrigger>
                <TabsTrigger 
                  value="uploads" 
                  className="rounded-2xl px-3 md:px-10 py-2.5 md:py-3.5 text-[9px] md:text-xs font-black uppercase tracking-widest !text-zinc-700 data-[state=active]:!bg-primary data-[state=active]:!text-white data-[state=active]:!shadow-2xl transition-all duration-500 shadow-none hover:text-zinc-900 hover:bg-white/50 flex-1 md:flex-none"
                >
                  Uploads
                </TabsTrigger>
              </TabsList>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-[#E8E0D5] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Zap className="h-5 w-5" />
                       </div>
                       <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">System Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="systemSize" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                           System Size (kW DC)
                        </Label>
                        <Input 
                          id="systemSize" 
                          type="number"
                          step="0.01"
                          className="h-12 rounded-xl border-zinc-200 focus:ring-primary/20 font-bold"
                          value={project.system_summary?.system_size || ""} 
                          onChange={(e) => handleUpdateField('system_summary.system_size', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="systemType" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                           System Type
                        </Label>
                        <Select 
                          value={project.system_summary?.system_type || project.systemType || ""} 
                          onValueChange={(v) => {
                            handleUpdateField('system_summary.system_type', v);
                            handleUpdateField('systemType', v);
                          }}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                            <SelectValue placeholder="System Type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#E8E0D5]">
                            <SelectItem value="roofmount">Roof Mount</SelectItem>
                            <SelectItem value="groundmount">Ground Mount</SelectItem>
                            <SelectItem value="other">Special Utility</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="pvModules" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Number of PV Modules</Label>
                        <Input 
                          id="pvModules" 
                          type="number"
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          value={project.system_summary?.pv_modules || ""} 
                          onChange={(e) => handleUpdateField('system_summary.pv_modules', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="inverters" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Number of Inverters</Label>
                        <Input 
                          id="inverters" 
                          type="number"
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          value={project.system_summary?.inverters || ""} 
                          onChange={(e) => handleUpdateField('system_summary.inverters', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Separator className="bg-zinc-100" />
                    
                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Battery Storage
                       </h3>
                       <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2.5">
                           <Label htmlFor="batteryQty" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Quantity</Label>
                           <Input 
                             id="batteryQty" 
                             type="number"
                             className="h-12 rounded-xl border-zinc-200 font-bold"
                             value={project.system_summary?.battery_info?.qty || ""} 
                             onChange={(e) => handleUpdateField('system_summary.battery_info.qty', e.target.value)}
                           />
                         </div>
                         <div className="space-y-2.5">
                           <Label htmlFor="batteryModel" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Model</Label>
                           <Input 
                             id="batteryModel" 
                             className="h-12 rounded-xl border-zinc-200 font-bold"
                             value={project.system_summary?.battery_info?.model || ""} 
                             onChange={(e) => handleUpdateField('system_summary.battery_info.model', e.target.value)}
                           />
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E8E0D5] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                       </div>
                       <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Customer Profile</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-8 space-y-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="contactName" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3" /> Contact Principal
                      </Label>
                      <Input 
                        id="contactName" 
                        className="h-12 rounded-xl border-zinc-200 font-bold"
                        value={project.user_profile?.contact_name || ""} 
                        onChange={(e) => handleUpdateField('user_profile.contact_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="companyName" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> Entity Name
                      </Label>
                      <Input 
                        id="companyName" 
                        className="h-12 rounded-xl border-zinc-200 font-bold"
                        value={project.user_profile?.company_name || ""} 
                        onChange={(e) => handleUpdateField('user_profile.company_name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" /> Digital Axis
                        </Label>
                        <Input 
                          id="email" 
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          value={project.user_profile?.email || ""} 
                          onChange={(e) => handleUpdateField('user_profile.email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" /> Comms Link
                        </Label>
                        <Input 
                          id="phone" 
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          value={project.user_profile?.phone || ""} 
                          onChange={(e) => handleUpdateField('user_profile.phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#E8E0D5] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden hover:border-primary/20">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-zinc-900/5 text-zinc-900">
                        <FileText className="h-5 w-5" />
                     </div>
                     <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">General Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <textarea
                    className="w-full min-h-[160px] p-4 rounded-2xl border border-zinc-200 bg-[#F5F0E8]/30 text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all font-bold resize-none leading-relaxed"
                    placeholder="Document structural considerations, AHJ requirements, or field observations..."
                    value={project.general_notes || ""}
                    onChange={(e) => handleUpdateField('general_notes', e.target.value)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="site" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-[#E8E0D5] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Home className="h-5 w-5" />
                       </div>
                       <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Site Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2.5 col-span-2 md:col-span-1">
                        <Label htmlFor="roofMaterial" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Roof Material</Label>
                        <Select value={project.site_details?.roof_material || ""} onValueChange={(v) => handleUpdateField('site_details.roof_material', v)}>
                          <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                            <SelectValue placeholder="Material" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#E8E0D5]">
                            <SelectItem value="asphalt">Asphalt Shingle</SelectItem>
                            <SelectItem value="tile">Tile</SelectItem>
                            <SelectItem value="metal">Metal</SelectItem>
                            <SelectItem value="tpo">TPO</SelectItem>
                            <SelectItem value="other">Other Substrate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2.5 col-span-2 md:col-span-1">
                        <Label htmlFor="roofPitch" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Roof Pitch</Label>
                        <Select value={project.site_details?.roof_pitch || ""} onValueChange={(v) => handleUpdateField('site_details.roof_pitch', v)}>
                          <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                            <SelectValue placeholder="Pitch" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#E8E0D5]">
                            <SelectItem value="15">15° Gradient</SelectItem>
                            <SelectItem value="20">20° Gradient</SelectItem>
                            <SelectItem value="25">25° Gradient</SelectItem>
                            <SelectItem value="30">30° Gradient</SelectItem>
                            <SelectItem value="other">Custom Gradient</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="numberOfArrays" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Number of Arrays</Label>
                        <Input 
                          id="numberOfArrays" 
                          type="number"
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          value={project.site_details?.number_of_arrays || ""} 
                          onChange={(e) => handleUpdateField('site_details.number_of_arrays', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="utilityProvider" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Utility Provider</Label>
                        <Input 
                          id="utilityProvider" 
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          placeholder="e.g., PG&E"
                          value={project.site_details?.utility_provider || ""} 
                          onChange={(e) => handleUpdateField('site_details.utility_provider', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5 col-span-2 md:col-span-1">
                         <Label htmlFor="jurisdiction" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Jurisdiction</Label>
                         <Input 
                          id="jurisdiction" 
                          className="h-12 rounded-xl border-zinc-200 font-bold text-sm"
                          placeholder="City/County Building Department"
                          value={project.site_details?.jurisdiction || ""} 
                          onChange={(e) => handleUpdateField('site_details.jurisdiction', e.target.value)}
                        />
                      </div>
                      
                      {/* New Site Fields */}
                      <div className="space-y-2.5 col-span-2 md:col-span-1">
                         <Label htmlFor="groundMountType" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Ground Mount Type</Label>
                         <Input 
                          id="groundMountType" 
                          className="h-12 rounded-xl border-zinc-200 font-bold text-sm"
                          value={project.site_details?.ground_mount_type?.toString() || ""} 
                          onChange={(e) => handleUpdateField('site_details.ground_mount_type', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5 col-span-2 md:col-span-1">
                         <Label htmlFor="foundationType" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Foundation Type</Label>
                         <Input 
                          id="foundationType" 
                          className="h-12 rounded-xl border-zinc-200 font-bold text-sm"
                          value={project.site_details?.foundation_type?.toString() || ""} 
                          onChange={(e) => handleUpdateField('site_details.foundation_type', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5 col-span-2 md:col-span-1">
                         <Label htmlFor="mainPanelSize" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Main Panel Size</Label>
                         <Input 
                          id="mainPanelSize" 
                          className="h-12 rounded-xl border-zinc-200 font-bold text-sm"
                          value={project.site_details?.main_panel_size?.toString() || ""} 
                          onChange={(e) => handleUpdateField('site_details.main_panel_size', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E8E0D5] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-zinc-900 text-white">
                          <Zap className="h-5 w-5" />
                       </div>
                       <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Electrical Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="mainPanel" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Main Panel Size (A)</Label>
                        <Input 
                          id="mainPanel" 
                          type="number"
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          value={project.electrical_details?.main_panel_size || ""} 
                          onChange={(e) => handleUpdateField('electrical_details.main_panel_size', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="busRating" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Bus Rating (A)</Label>
                        <Input 
                          id="busRating" 
                          type="number"
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          value={project.electrical_details?.bus_rating || ""} 
                          onChange={(e) => handleUpdateField('electrical_details.bus_rating', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="mainBreaker" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Main Breaker (A)</Label>
                        <Input 
                          id="mainBreaker" 
                          type="number"
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          value={project.electrical_details?.main_breaker || ""} 
                          onChange={(e) => handleUpdateField('electrical_details.main_breaker', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="pvBreaker" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">PV Breaker Location</Label>
                        <Input 
                          id="pvBreaker" 
                          className="h-12 rounded-xl border-zinc-200 font-bold"
                          placeholder="e.g., Opposite End / Center"
                          value={project.electrical_details?.pv_breaker_location ? project.electrical_details.pv_breaker_location.toString() : ""} 
                          onChange={(e) => handleUpdateField('electrical_details.pv_breaker_location', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2.5 col-span-2">
                        <Label htmlFor="oneLineDiagram" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">One Line Diagram</Label>
                        {project.electrical_details?.one_line_diagram && project.electrical_details.one_line_diagram.length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                             {project.electrical_details.one_line_diagram.map((file, i) => (
                               <div key={i} className="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-700 flex items-center gap-2">
                                 <FileText className="w-3 h-3" />
                                 File {i+1}
                               </div>
                             ))}
                           </div>
                        ) : (
                          <div className="text-sm text-zinc-400 italic">No diagrams attached</div>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="bg-zinc-100" />
                    
                    <div className="space-y-4">
                       <div className="space-y-2.5">
                          <Label htmlFor="meterLocation" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Meter Location</Label>
                          <Input 
                            id="meterLocation" 
                            className="h-12 rounded-xl border-zinc-200 font-bold"
                            placeholder="e.g., SE exterior wall"
                            value={project.advanced_electrical_details?.meter_location || ""} 
                            onChange={(e) => handleUpdateField('advanced_electrical_details.meter_location', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="serviceType" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Service Entrance Type</Label>
                          <Input 
                            id="serviceType" 
                            className="h-12 rounded-xl border-zinc-200 font-bold"
                            placeholder="e.g., Underground 3-wire"
                            value={project.advanced_electrical_details?.service_entrance_type || ""} 
                            onChange={(e) => handleUpdateField('advanced_electrical_details.service_entrance_type', e.target.value)}
                          />
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
                {/* Optional Extras Card */}
                <Card className="border-[#E8E0D5] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden col-span-1 lg:col-span-2">
                   <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                          <AlertCircle className="h-5 w-5" />
                       </div>
                       <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Optional Extras & Constraints</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {/* Miracle Watt */}
                       <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-3">
                          <div className="flex items-center justify-between">
                             <Label className="font-bold text-zinc-700">Miracle Watt</Label>
                             <div className={`px-2 py-0.5 rounded text-xs font-black uppercase ${project.optional_extra_details?.miracle_watt_required ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                {project.optional_extra_details?.miracle_watt_required ? 'Required' : 'Not Required'}
                             </div>
                          </div>
                          <Input 
                             placeholder="Notes..."
                             className="bg-white"
                             value={project.optional_extra_details?.miracle_watt_notes?.toString() || ""}
                             onChange={(e) => handleUpdateField('optional_extra_details.miracle_watt_notes', e.target.value)}
                          />
                       </div>

                       {/* DER/RLC */}
                       <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-3">
                          <div className="flex items-center justify-between">
                             <Label className="font-bold text-zinc-700">DER / RLC</Label>
                             <div className={`px-2 py-0.5 rounded text-xs font-black uppercase ${project.optional_extra_details?.der_rlc_required ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                {project.optional_extra_details?.der_rlc_required ? 'Required' : 'Not Required'}
                             </div>
                          </div>
                          <Input 
                             placeholder="Notes..."
                             className="bg-white"
                             value={project.optional_extra_details?.der_rlc_notes || ""}
                             onChange={(e) => handleUpdateField('optional_extra_details.der_rlc_notes', e.target.value)}
                          />
                       </div>

                       {/* Setbacks */}
                       <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-3">
                          <div className="flex items-center justify-between">
                             <Label className="font-bold text-zinc-700">Setback Constraints</Label>
                             <div className={`px-2 py-0.5 rounded text-xs font-black uppercase ${project.optional_extra_details?.setback_constraints ? 'bg-red-100 text-red-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                {project.optional_extra_details?.setback_constraints ? 'Active' : 'None'}
                             </div>
                          </div>
                          <Input 
                             placeholder="Notes..."
                             className="bg-white"
                             value={project.optional_extra_details?.setback_notes?.toString() || ""}
                             onChange={(e) => handleUpdateField('optional_extra_details.setback_notes', e.target.value)}
                          />
                       </div>

                        {/* Site Access */}
                       <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-3">
                          <div className="flex items-center justify-between">
                             <Label className="font-bold text-zinc-700">Site Access</Label>
                             <div className={`px-2 py-0.5 rounded text-xs font-black uppercase ${project.optional_extra_details?.site_access_restrictions ? 'bg-red-100 text-red-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                {project.optional_extra_details?.site_access_restrictions ? 'Restricted' : 'Open'}
                             </div>
                          </div>
                          <Input 
                             placeholder="Notes..."
                             className="bg-white"
                             value={project.optional_extra_details?.site_access_notes?.toString() || ""}
                             onChange={(e) => handleUpdateField('optional_extra_details.site_access_notes', e.target.value)}
                          />
                       </div>
                       
                       {/* Battery SLD */}
                       <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-3">
                          <div className="flex items-center justify-between">
                             <Label className="font-bold text-zinc-700">Battery SLD</Label>
                             <div className={`px-2 py-0.5 rounded text-xs font-black uppercase ${project.optional_extra_details?.battery_sld_requested ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                {project.optional_extra_details?.battery_sld_requested ? 'Requested' : 'Standard'}
                             </div>
                          </div>
                          <Input 
                             placeholder="Notes..."
                             className="bg-white"
                             value={project.optional_extra_details?.battery_sld_notes?.toString() || ""}
                             onChange={(e) => handleUpdateField('optional_extra_details.battery_sld_notes', e.target.value)}
                          />
                       </div>

                        {/* Inspection Notes */}
                       <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-3">
                          <div className="flex items-center justify-between">
                             <Label className="font-bold text-zinc-700">Inspection Notes</Label>
                             <div className={`px-2 py-0.5 rounded text-xs font-black uppercase ${project.optional_extra_details?.inspection_notes ? 'bg-blue-100 text-blue-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                {project.optional_extra_details?.inspection_notes ? 'Present' : 'None'}
                             </div>
                          </div>
                          <Input 
                             placeholder="Notes..."
                             className="bg-white"
                             value={project.optional_extra_details?.inspection_notes_text || ""}
                             onChange={(e) => handleUpdateField('optional_extra_details.inspection_notes_text', e.target.value)}
                          />
                       </div>
                     </div>
                  </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="components" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-[#E8E0D5] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Box className="h-5 w-5" />
                     </div>
                     <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">System Components</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {project.system_components && project.system_components.length > 0 ? (
                    <div className="space-y-4">
                      {project.system_components.map((component, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-3xl bg-white border border-[#E8E0D5] hover:border-primary/30 transition-all group shadow-sm hover:shadow-lg gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-zinc-100 text-zinc-600 group-hover:bg-primary group-hover:text-white transition-colors mt-1">
                              <Box className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-black text-zinc-900 text-sm tracking-tight">{component.make_model || "Unknown Component"}</div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
                                  {component.type || "Component"}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
                                  Qty: {component.qty || 1}
                                </span>
                              </div>
                              {component.notes && (
                                <div className="text-xs text-muted-foreground mt-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100 italic">
                                  {component.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-3 border-dashed border-[#E8E0D5] bg-[#F5F0E8]/20 rounded-4xl text-center group transition-colors hover:border-primary/20">
                      <div className="p-6 rounded-3xl bg-white shadow-xl mb-6 group-hover:scale-110 transition-transform">
                         <Box className="h-10 w-10 text-zinc-300" />
                      </div>
                      <div className="max-w-md space-y-2">
                        <h4 className="text-xl font-black text-zinc-900 leading-tight">No Components Listed</h4>
                        <p className="text-zinc-500 font-bold text-sm leading-relaxed px-4 italic">
                          This project does not yet list specific system components.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="uploads" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <Card className="border-[#E8E0D5] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                     </div>
                     <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Uploads</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {project.uploads && project.uploads.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.uploads.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 rounded-3xl bg-white border border-[#E8E0D5] hover:border-primary/30 transition-all group shadow-sm hover:shadow-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-black text-zinc-900 text-sm tracking-tight">{file.name}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">{file.category || 'File'}</div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-zinc-200 text-zinc-900 hover:bg-zinc-900 hover:text-white font-black h-10 px-6 group/btn transition-all" 
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            Open
                            <ExternalLink className="w-3.5 h-3.5 ml-2" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-3 border-dashed border-[#E8E0D5] bg-[#F5F0E8]/20 rounded-4xl text-center group transition-colors hover:border-primary/20">
                      <div className="p-6 rounded-3xl bg-white shadow-xl mb-6 group-hover:scale-110 transition-transform">
                         <FileText className="h-10 w-10 text-zinc-300" />
                      </div>
                      <div className="max-w-md space-y-2">
                        <h4 className="text-xl font-black text-zinc-900 leading-tight">No Uploads</h4>
                        <p className="text-zinc-500 font-bold text-sm leading-relaxed px-4 italic">
                          This project does not yet contain any uploaded files.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {/* Mobile Bottom Tabs */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F5F0E8] border-t border-[#E8E0D5] md:hidden shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
              <TabsList className="grid grid-cols-4 h-22 pb-safe rounded-none bg-transparent border-0 p-0">
                <TabsTrigger
                  value="overview"
                  className="flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500! data-[state=active]:text-[oklch(68.351%_0.19585_34.956)]! bg-transparent! shadow-none! rounded-none h-full border-b-0! border-t-4 border-transparent data-[state=active]:border-[oklch(68.351%_0.19585_34.956)] transition-all"
                >
                  <Zap className="h-5 w-5" />
                  Summary
                </TabsTrigger>

                <TabsTrigger
                  value="site"
                  className="flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500! data-[state=active]:text-[oklch(68.351%_0.19585_34.956)]! bg-transparent! shadow-none! rounded-none h-full border-b-0! border-t-4 border-transparent data-[state=active]:border-[oklch(68.351%_0.19585_34.956)] transition-all"
                >
                  <Home className="h-5 w-5" />
                  Site
                </TabsTrigger>

                <TabsTrigger
                  value="components"
                  className="flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500! data-[state=active]:text-[oklch(68.351%_0.19585_34.956)]! bg-transparent! shadow-none! rounded-none h-full border-b-0! border-t-4 border-transparent data-[state=active]:border-[oklch(68.351%_0.19585_34.956)] transition-all"
                >
                  <Box className="h-5 w-5" />
                  Equipment
                </TabsTrigger>

                <TabsTrigger
                  value="uploads"
                  className="flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500! data-[state=active]:text-[oklch(68.351%_0.19585_34.956)]! bg-transparent! shadow-none! rounded-none h-full border-b-0! border-t-4 border-transparent data-[state=active]:border-[oklch(68.351%_0.19585_34.956)] transition-all"
                >
                  <FileText className="h-5 w-5" />
                  Uploads
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </main>
      <ProjectChat 
        projectId={id} 
        projectName={project?.name || "Project"} 
        className={cn(
          "shrink-0 z-40 shadow-[-5px_0_30px_-5px_rgba(0,0,0,0.05)]",
          // Desktop styles
          "hidden xl:flex",
          // Mobile styles (if we were using className only, but we'll use a separate instance or condition for mobile)
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
              projectName={project?.name || "Project"} 
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
  )
}
