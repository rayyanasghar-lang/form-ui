"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Eye, Edit, Trash2, ExternalLink, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import type { Project, ProjectStatus,ProjectTableProps } from "@/types/project"
import { CalculateProjectProgress } from "@/lib/calculate-progress"


type TabFilter = "all" | "in_process" | "done" | "rejected" | "draft"



export function ProjectsTable({ projects, isLoading = false, error = null, className }: ProjectTableProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  // Filter by search query first
  const searchFilteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.status.toLowerCase().includes(query)
    )
  })

  const filteredProjects =
    activeTab === "all"
      ? searchFilteredProjects
      : searchFilteredProjects.filter((p) => {
          if (activeTab === "in_process") {
            return p.status === "pending" || p.status === "in_review" || p.status === "in_process"
          }
          if (activeTab === "done") {
            return p.status === "approved" || p.status === "done"
          }
          return p.status === activeTab
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
    status: ProjectStatus,
  ): {
    status: "done" | "in-process" | "rejected" | "draft"
    label: string
  } => {
    switch (status) {
      case "approved":
      case "done":
        return { status: "done", label: "Done" }
      case "rejected":
        return { status: "rejected", label: "Rejected" }
      case "draft":
        return { status: "draft", label: "Draft" }
      case "pending":
      case "in_review":
      case "in_process":
        return { status: "in-process", label: "In Process" }
      default:
        return { status: "draft", label: status }
    }
  }

  return (
    <div className={` ${className}`}>
      <div className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-xl font-bold text-zinc-900">Projects</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
              className="pl-9 h-9 bg-white border-[#E8E0D5] focus:border-primary/30 focus:ring-primary/10"
            />
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)} className="mt-4">
          <TabsList className="overflow-x-auto md:overflow-x-visible w-full flex flex-nowrap md:flex-wrap gap-1 scrollbar-none ">
            <TabsTrigger value="all" className="shrink-0 text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5">
              All
            </TabsTrigger>
            <TabsTrigger
              value="in_process"
              badge={
                projects.filter(
                  (p) => p.status === "pending" || p.status === "in_review" || p.status === "in_process",
                ).length
              }
              className="shrink-0 text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5"
            >
              In Process
            </TabsTrigger>
            <TabsTrigger
              value="done"
              badge={projects.filter((p) => p.status === "approved" || p.status === "done").length}
              className="shrink-0 text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5"
            >
              Done
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              badge={projects.filter((p) => p.status === "rejected").length}
              className="shrink-0 text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5"
            >
              Rejected
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              badge={projects.filter((p) => p.status === "draft").length}
              className="shrink-0 text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5"
            >
              Draft
            </TabsTrigger>
          </TabsList>
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
                    <TableCell className="font-medium text-zinc-900">{project.name}</TableCell>
                    <TableCell className="text-zinc-600 max-w-[200px] truncate">{project.address}</TableCell>
                    <TableCell>
                      <StatusBadge {...getStatusBadgeConfig(project.status)} />
                    </TableCell>
                    <TableCell className="font-normal">{CalculateProjectProgress(project)}%</TableCell>
                    <TableCell className="text-zinc-600">{formatDate(project.createdAt)}</TableCell>
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
                    <AccordionTrigger className="px-3 py-1.5 hover:bg-zinc-50/50 transition-colors hover:no-underline">
                      <div className="flex flex-col items-start gap-0 text-left w-full pr-1">
                        <div className="flex items-center justify-between w-full">
                          <p className="font-bold text-zinc-900 text-sm truncate max-w-[180px] leading-tight">{project.name}</p>
                          
                        </div>
                        <p className = "text-[10px] text-zinc-500 font-medium truncate w-full leading-tight">{formatDate(project.createdAt)}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-1.5">
                      <div className="space-y-1.5 pt-0.5">
                        {/* Project Details */}
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5 leading-none">Project Progress</p>
                            <p className="text-[11px] font-normal text-zinc-500 leading-tight">{CalculateProjectProgress(project)}%</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5 leading-none">Status</p>
                            <StatusBadge {...statusConfig} />
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5 leading-none">Address</p>
                          <div className="mt-0.5">
                            <p className="font-normal text-zinc-500 text-[12px] leading-tight">{project.address}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 space-y-2 border-t border-[#E0D9CF]">
                        
                        <Link href={`/projects/${project.id}`}>

                              <Button
                                className="w-full font-bold shadow-sm h-9 tracking-wide uppercase text-[10px]"
                                style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
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
        <div className="flex items-center justify-between p-4 border-t border-zinc-200">
          <p className="text-sm text-zinc-500">
            Showing {Math.min(filteredProjects.length, (currentPage - 1) * itemsPerPage + 1)}-
            {Math.min(filteredProjects.length, currentPage * itemsPerPage)} of {filteredProjects.length} projects
          </p>
          <div className="flex items-center gap-1 ml-2">
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
