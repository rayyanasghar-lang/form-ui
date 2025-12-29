"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Eye, Edit, Trash2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  TabsWithBadge as Tabs, 
  TabsWithBadgeList as TabsList, 
  TabsWithBadgeTrigger as TabsTrigger 
} from "@/components/ui/tabs-with-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "./status-badge"
import type { Project, ProjectStatus } from "@/types/project"

interface ProjectsTableProps {
  projects: Project[]
  className?: string
}

type TabFilter = "all" | ProjectStatus

export function ProjectsTable({ projects, className }: ProjectsTableProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredProjects = activeTab === "all" 
    ? projects 
    : projects.filter(p => p.status === activeTab)

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
      setSelectedIds(new Set(filteredProjects.map(p => p.id)))
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
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
    <Card className={`bg-[#F5F0E8] border-[#E8E0D5] shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-zinc-900">
            Projects
          </CardTitle>
          <Link href="/forms">
            <Button 
              size="sm" 
              className="font-semibold"
              style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
            >
              + New Project
            </Button>
          </Link>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)} className="mt-4">
          <TabsList>
            <TabsTrigger value="all">
              All
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              badge={projects.filter(p => p.status === 'pending').length}
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="in_review" 
              badge={projects.filter(p => p.status === 'in_review').length}
            >
              In Review
            </TabsTrigger>
            <TabsTrigger 
              value="approved" 
              badge={projects.filter(p => p.status === 'approved').length}
            >
              Approved
            </TabsTrigger>
            <TabsTrigger 
              value="rejected" 
              badge={projects.filter(p => p.status === 'rejected').length}
            >
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-[#E0D9CF] overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#EDE8E0] hover:bg-[#EDE8E0]">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-zinc-700">Project</TableHead>
                <TableHead className="font-semibold text-zinc-700">Address</TableHead>
                <TableHead className="font-semibold text-zinc-700">Status</TableHead>
                <TableHead className="font-semibold text-zinc-700">System Size</TableHead>
                <TableHead className="font-semibold text-zinc-700">Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow 
                    key={project.id} 
                    className="hover:bg-[#F5F0E8] transition-colors"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(project.id)}
                        onCheckedChange={() => toggleSelect(project.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-zinc-900">
                      {project.name}
                    </TableCell>
                    <TableCell className="text-zinc-600 max-w-[200px] truncate">
                      {project.address}
                    </TableCell>
                    <TableCell>
                      <StatusBadge {...getStatusBadgeConfig(project.status)} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {project.systemSize}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {formatDate(project.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Download Plans
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
        
        {/* Pagination placeholder */}
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="h-8">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="h-8 bg-white">
              1
            </Button>
            <Button variant="outline" size="sm" disabled className="h-8">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
