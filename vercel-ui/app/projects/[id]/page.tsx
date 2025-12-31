"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
  Phone,
  ExternalLink
} from "lucide-react"
import Sidebar from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/projects/status-badge"
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
    <div className="flex h-screen bg-[#F5F0E8]">
      <Sidebar 
        variant="dashboard"
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 border-b border-[#E8E0D5] bg-[#F5F0E8]/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push("/projects")}
                className="hover:bg-black/5 rounded-xl h-10 w-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black tracking-tight text-zinc-900 leading-none">{project.name}</h1>
                  <StatusBadge {...getStatusBadgeConfig(project.status)} />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wider mt-1.5 leading-none">
                  <MapPin className="h-3 w-3" />
                  {project.address}
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/95 text-white font-black h-12 px-8 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-3 text-sm uppercase tracking-widest"
              style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Save Configuration
            </Button>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto pb-24">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-zinc-200/30 backdrop-blur-md border border-[#E8E0D5] rounded-3xl p-2 h-auto justify-start gap-2 w-fit mb-8 shadow-inner">
              <TabsTrigger 
                value="overview" 
                className="rounded-2xl px-10 py-3.5 text-xs font-black uppercase tracking-widest !text-zinc-700 data-[state=active]:!bg-primary data-[state=active]:!text-white data-[state=active]:!shadow-2xl transition-all duration-500 shadow-none hover:text-zinc-900 hover:bg-white/50"
                style={{ "--primary-active": "oklch(68.351% 0.19585 34.956)" } as any}
              >
                System Summary
              </TabsTrigger>
              <TabsTrigger 
                value="site" 
                className="rounded-2xl px-10 py-3.5 text-xs font-black uppercase tracking-widest !text-zinc-700 data-[state=active]:!bg-primary data-[state=active]:!text-white data-[state=active]:!shadow-2xl transition-all duration-500 shadow-none hover:text-zinc-900 hover:bg-white/50"
              >
                Site & Electrical
              </TabsTrigger>
              <TabsTrigger 
                value="components" 
                className="rounded-2xl px-10 py-3.5 text-xs font-black uppercase tracking-widest !text-zinc-700 data-[state=active]:!bg-primary data-[state=active]:!text-white data-[state=active]:!shadow-2xl transition-all duration-500 shadow-none hover:text-zinc-900 hover:bg-white/50"
              >
                Equipment
              </TabsTrigger>
              <TabsTrigger 
                value="uploads" 
                className="rounded-2xl px-10 py-3.5 text-xs font-black uppercase tracking-widest !text-zinc-700 data-[state=active]:!bg-primary data-[state=active]:!text-white data-[state=active]:!shadow-2xl transition-all duration-500 shadow-none hover:text-zinc-900 hover:bg-white/50"
              >
                Uploads
              </TabsTrigger>
            </TabsList>

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
                      <div className="space-y-2.5 col-span-2">
                         <Label htmlFor="jurisdiction" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Jurisdiction</Label>
                         <Input 
                          id="jurisdiction" 
                          className="h-12 rounded-xl border-zinc-200 font-bold text-sm"
                          placeholder="City/County Building Department"
                          value={project.site_details?.jurisdiction || ""} 
                          onChange={(e) => handleUpdateField('site_details.jurisdiction', e.target.value)}
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
                        <Select value={project.electrical_details?.pv_breaker_location || ""} onValueChange={(v) => handleUpdateField('electrical_details.pv_breaker_location', v)}>
                          <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                            <SelectValue placeholder="Position" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#E8E0D5]">
                            <SelectItem value="top">Upper (Top) Bus</SelectItem>
                            <SelectItem value="bottom">Lower (Bottom) Bus</SelectItem>
                            <SelectItem value="opposite">Opposite End</SelectItem>
                            <SelectItem value="center">Center / Sub</SelectItem>
                            <SelectItem value="unknown">Undetermined</SelectItem>
                          </SelectContent>
                        </Select>
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
          </Tabs>
        </div>
      </main>
    </div>
  )
}
