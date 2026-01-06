"use client"

import * as React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "./status-badge"
import { Project, ProjectStatus } from "@/types/project"
import { 
  User, 
  Home, 
  Zap, 
  Box, 
  FileText, 
  Download, 
  Edit,
  MapPin,
  Calendar,
  Building2,
  Mail,
  Phone
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateProjectPDF } from "@/lib/pdf-service"
import {
    SiteTab,
    OverviewTab,
    EquipmentTab,
    FilesTab
}
from "./project-details-tabs"

interface ProjectDetailsModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  if (!project) return null

  const handleDownloadPDF = () => {
    generateProjectPDF(project)
  }

  const getStatusBadgeConfig = (status: ProjectStatus): { status: "done" | "in-process" | "rejected" | "draft"; label: string } => {
    switch (status) {
      case "approved":
        return { status: "done", label: "Approved" }
      case "rejected":
        return { status: "rejected", label: "Rejected" }
      case "draft":
        return { status: "draft", label: "Draft" }
      case "pending":
        return { status: "in-process", label: "Pending" }
      case "in_review":
        return { status: "in-process", label: "In Review" }
      default:
        return { status: "draft", label: status }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background border-border rounded-4xl shadow-2xl">
        <DialogHeader className="p-8 pb-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
               <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900">
                {project.name}
              </DialogTitle>
              <StatusBadge {...getStatusBadgeConfig(project.status)} />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
              <MapPin className="w-4 h-4" />
              {project.address}
            </div>
          </div>
          <div className="flex gap-2 mr-4">
            <Button variant="outline" size="sm" className="rounded-xl border-border bg-card font-bold h-10 px-4 group shadow-sm hover:bg-muted transition-all text-zinc-900 hover:text-primary">
              <Edit className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
              Edit
            </Button>
            <Button 
              size="sm" 
              className="rounded-xl font-bold h-10 px-4 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 bg-primary hover:bg-primary/90" 
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF Download
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="px-8 bg-transparent border-b border-border h-14 w-full justify-start gap-8 rounded-none mt-4">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 h-14 text-sm font-bold tracking-tight text-zinc-500 data-[state=active]:text-zinc-900 transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="site" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 h-14 text-sm font-bold tracking-tight text-zinc-500 data-[state=active]:text-zinc-900 transition-colors"
            >
              Site & Electrical
            </TabsTrigger>
            <TabsTrigger 
              value="components" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 h-14 text-sm font-bold tracking-tight text-zinc-500 data-[state=active]:text-zinc-900 transition-colors"
            >
              Equipment
            </TabsTrigger>
            <TabsTrigger 
              value="uploads" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 h-14 text-sm font-bold tracking-tight text-zinc-500 data-[state=active]:text-zinc-900 transition-colors"
            >
              Files
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] p-8">
            <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
              <OverviewTab project={project} />
            </TabsContent>

            <TabsContent value="site" className="mt-0 focus-visible:outline-none">
              <SiteTab project={project} />
            </TabsContent>

            <TabsContent value="components" className="mt-0 focus-visible:outline-none">
              <EquipmentTab project={project} />
            </TabsContent>

            <TabsContent value="uploads" className="mt-0 focus-visible:outline-none">
              <FilesTab project={project} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
