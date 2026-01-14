"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Loader2,
  LayoutGrid,
  Clock,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  TabsWithBadge as Tabs,
  TabsWithBadgeList as TabsList,
  TabsWithBadgeTrigger as TabsTrigger,
} from "@/components/ui/tabs-with-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { StatusBadge } from "./status-badge"
import { Project, ProjectStatus, ProjectTableProps, PROJECT_STATUSES } from "@/types/project"
import { CalculateProjectProgress } from "@/lib/calculate-progress"


type TabFilter = "all" | ProjectStatus

export function ProjectsTable({ projects, isLoading = false, error = null, className }: ProjectTableProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const normalizeStatus = (status: string) => (status || "").toLowerCase().trim()

  const filteredProjects =
    activeTab === "all"
      ? projects
      : projects.filter((p) => {
          const status = normalizeStatus(p.status)
          const filter = normalizeStatus(activeTab)
          
          return status === filter
        })

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to first page when tab changes
  if (currentPage > 1 && currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1)
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)))
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d)
  }

  const handleViewDetails = (project: Project) => {
    router.push(`/projects/${project.id}`)
  }

  const getStatusBadgeConfig = (
    status: ProjectStatus | string,
  ): {
    status: "done" | "in-process" | "rejected" | "draft"
    label: string
  } => {
    const normalized = normalizeStatus(status as string)
    
    let variant: "done" | "in-process" | "rejected" | "draft" = "in-process"
    
    // Strict mapping based on requested Enum
    if (normalized === "print & ship") {
      variant = "done" 
    } else if (normalized === "on hold / challenged") {
      variant = "rejected"
    } else if (normalized === "new job creation") {
        variant = "draft"
    }
    
    // Default others to in-process (New Design, Design Review, etc.)

    return { status: variant, label: status as string }
  }

  return (
    <div className={` ${className}`}>
      <div className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-zinc-900 tracking-tight">Projects</CardTitle>

        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)} className="mt-4">
          <div className="w-full overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex w-auto min-w-full md:w-full md:flex-wrap gap-2 md:gap-2.5 border-b-0 bg-transparent h-auto p-1">
              <TabsTrigger 
                value="all" 
                className="shrink-0 text-xs px-4 py-2 md:text-xs md:px-6 md:py-2.5 rounded-full bg-zinc-100 text-zinc-600 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 font-bold uppercase tracking-wider shadow-sm hover:bg-zinc-200 data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 border-0 flex items-center justify-center"
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                All
              </TabsTrigger>

              {PROJECT_STATUSES.map((status) => (
                <TabsTrigger
                    key={status}
                    value={status}
                    badge={projects.filter((p) => normalizeStatus(p.status) === normalizeStatus(status)).length}
                    className="shrink-0 text-xs px-4 py-2 md:text-xs md:px-6 md:py-2.5 rounded-full bg-zinc-100 text-zinc-600 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 font-bold uppercase tracking-wider shadow-sm hover:bg-zinc-200 data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 border-0 flex items-center justify-center"
                >
                    {status === "On Hold / Challenged" ? <XCircle className="h-3.5 w-3.5 mr-2" /> :
                     status === "Print & Ship" ? <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> :
                     <Clock className="h-3.5 w-3.5 mr-2" />
                    }
                    {status}
                </TabsTrigger>
              ))}

            </TabsList>
          </div>
        </Tabs>


      </div>
      <div className="px-0">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={paginatedProjects.length > 0 && paginatedProjects.every((p) => selectedIds.has(p.id))}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-zinc-700">Project</TableHead>
                <TableHead className="font-semibold text-zinc-700">Address</TableHead>
                <TableHead className="font-semibold text-zinc-700">Status</TableHead>
                <TableHead className="font-semibold text-zinc-700">Completion %</TableHead>
                <TableHead className="font-semibold text-zinc-700">Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-24">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-zinc-500">Loading projects...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-red-500 font-medium">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(project.id)}
                        onCheckedChange={() => toggleSelect(project.id)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-zinc-900">{project.name}</TableCell>
                    <TableCell className="text-zinc-600 max-w-[200px] truncate font-medium">{project.address}</TableCell>

                    <TableCell>
                      <StatusBadge {...getStatusBadgeConfig(project.status)} />
                    </TableCell>
                    <TableCell className="font-semibold">{CalculateProjectProgress(project)}%</TableCell>
                    <TableCell className="text-zinc-600 font-medium">{formatDate(project.createdAt)}</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewDetails(project)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Mobile Table */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-500">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-medium">{error}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border border-[#E0D9CF]">
              No projects found
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full border-none">
              {paginatedProjects.map((project) => {
                const statusConfig = getStatusBadgeConfig(project.status)
                return (
                  <AccordionItem
                    key={project.id}
                    value={project.id}
                    className="border-b border-zinc-100 last:border-b-0 rounded-none mb-0 overflow-hidden w-full"
                  >
                    <AccordionTrigger className="px-3 py-3 hover:bg-zinc-50/50 transition-colors hover:no-underline">
                      <div className="flex flex-col items-start gap-1 text-left w-full pr-2 overflow-hidden">
                        <div className="flex items-center justify-between w-full gap-2">
                          <p className="font-bold text-zinc-900 text-sm truncate leading-tight flex-1">{project.name}</p>
                          <StatusBadge {...statusConfig} />
                        </div>
                        <p className="text-xs text-zinc-500 font-medium truncate w-full leading-tight">{formatDate(project.createdAt)}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-1">
                      <div className="space-y-3">     
                        {/* Project Details */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 leading-none">Project Progress</p>
                            <p className="text-sm font-bold text-zinc-900 leading-tight">{CalculateProjectProgress(project)}%</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 leading-none">Address</p>
                          <div className="mt-1">
                            <p className="text-sm font-medium text-zinc-900 leading-snug break-words">{project.address}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-zinc-100">
                          <Link href={`/projects/${project.id}`} className="block w-full">
                            <Button
                              className="w-full font-medium shadow-sm h-10 tracking-wide uppercase text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </div>
      </div>
      {/* Pagination */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-zinc-200 gap-4 md:gap-0">
          <p className="text-sm text-zinc-500 text-center md:text-left">
            Showing {Math.min(filteredProjects.length, (currentPage - 1) * itemsPerPage + 1)}-
            {Math.min(filteredProjects.length, currentPage * itemsPerPage)} of {filteredProjects.length} projects
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              className="h-8 text-xs"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant="outline"
                size="sm"
                className={`h-8 w-8 text-xs ${
                  currentPage === page ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 text-xs"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
