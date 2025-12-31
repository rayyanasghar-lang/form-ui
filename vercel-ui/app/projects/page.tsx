"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
} from "recharts"
import { 
  Clock, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Activity,
  DollarSign,
  FolderOpen,
  PanelLeft,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { 
  TabsWithBadge as Tabs, 
  TabsWithBadgeList as TabsList, 
  TabsWithBadgeTrigger as TabsTrigger 
} from "@/components/ui/tabs-with-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Sidebar from "@/components/layout/sidebar"
import { StatusBadge } from "@/components/projects/status-badge"
import { 
  mockProjects, 
  getProjectStats, 
} from "@/lib/mock-projects"
import { ProjectStatus, Project } from "@/types/project"
import { fetchProjectsAction } from "@/app/actions/project-service"
import { Loader2 } from "lucide-react"
import { ProjectDetailsModal } from "@/components/projects/project-details-modal"

import { useRouter } from "next/navigation"

// Extended chart data for the visitors-style chart
const visitorChartData = [
  { date: "Apr 5", submissions: 4, approvals: 3 },
  { date: "Apr 11", submissions: 5, approvals: 4 },
  { date: "Apr 17", submissions: 4, approvals: 3 },
  { date: "Apr 23", submissions: 6, approvals: 5 },
  { date: "Apr 29", submissions: 5, approvals: 4 },
  { date: "May 5", submissions: 7, approvals: 6 },
  { date: "May 11", submissions: 6, approvals: 5 },
  { date: "May 17", submissions: 5, approvals: 4 },
  { date: "May 23", submissions: 6, approvals: 5 },
  { date: "May 29", submissions: 5, approvals: 4 },
  { date: "Jun 4", submissions: 7, approvals: 6 },
  { date: "Jun 10", submissions: 6, approvals: 5 },
  { date: "Jun 16", submissions: 8, approvals: 7 },
  { date: "Jun 22", submissions: 7, approvals: 6 },
  { date: "Jun 29", submissions: 6, approvals: 5 },
]

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "oklch(68.351% 0.19585 34.956)",
  },
  approvals: {
    label: "Approvals", 
    color: "oklch(0.65 0.15 145)",
  },
} satisfies ChartConfig

type TabFilter = "all" | ProjectStatus
type TimeRange = "3months" | "30days" | "7days"

export default function ProjectsPage() {
  const [timePeriod, setTimePeriod] = useState<TimeRange>("3months")
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const itemsPerPage = 10
  
  const stats = getProjectStats(projects)

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true)
      const result = await fetchProjectsAction()
      if ("error" in result) {
        setError(result.error)
      } else {
        setProjects(result.data)
      }
      setIsLoading(false)
    }
    loadProjects()
  }, [])

  const filteredProjects = activeTab === "all" 
    ? projects 
    : projects.filter(p => p.status === activeTab)

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

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

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
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

  const handleViewDetails = (project: Project) => {
    router.push(`/projects/${project.id}`)
  }

  return (
    <div className="flex h-screen bg-background">
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

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 z-40">
        <Sidebar 
          variant="dashboard"
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header Bar */}
        <div className="border-b border-[#E8E0D5] bg-[#F5F0E8] sticky top-0 z-30">
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
                  className="p-2 rounded-lg hover:bg-black/5 transition-colors text-zinc-500 hover:text-zinc-900 -ml-2"
                  title="Show sidebar"
                >
                  <PanelLeft className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-xl lg:text-2xl font-bold text-zinc-900">Project Dashboard</h1>
            </div>
            
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-5 lg:space-y-6">
          {/* Metric Cards - Corporate Style */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {/* Total Revenue */}
            <motion.div variants={item}>
              <Card className="bg-white border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">Total Revenue</span>
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{ 
                        backgroundColor: "oklch(68.351% 0.19585 34.956 / 0.1)", 
                        color: "oklch(68.351% 0.19585 34.956)",
                        borderColor: "oklch(68.351% 0.19585 34.956 / 0.2)"
                      }}
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      +12.5%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">$12,450.00</div>
                  <div className="mt-4 space-y-1">
                    <div 
                      className="flex items-center gap-1.5 text-[13px] font-bold"
                      style={{ color: "oklch(68.351% 0.19585 34.956)" }}
                    >
                      Trending up this month
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[12px] text-zinc-500 font-medium">
                      Visitors for the last 6 months
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Reviews */}
            <motion.div variants={item}>
              <Card className="bg-white border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">Pending Reviews</span>
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border border-zinc-200"
                      style={{ 
                        backgroundColor: "oklch(0.55 0.12 75 / 0.1)", 
                        color: "oklch(0.55 0.12 75)"
                      }}
                    >
                      <ArrowDownRight className="h-3 w-3" />
                      -8.3%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.pending + stats.inReview}</div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-amber-600 whitespace-nowrap">
                      Down {stats.inReview} this period
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[12px] text-zinc-500 font-medium">
                      Acquisition needs attention
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Approved Projects */}
            <motion.div variants={item}>
              <Card className="bg-white border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">Approved Projects</span>
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border border-zinc-200"
                      style={{ 
                        backgroundColor: "oklch(0.65 0.15 145 / 0.1)", 
                        color: "oklch(0.55 0.15 145)"
                      }}
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      +12.5%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.approved}</div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-green-600">
                      Strong user retention
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[12px] text-zinc-500 font-medium">
                      Engagement exceed targets
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Capacity */}
            <motion.div variants={item}>
              <Card className="bg-white border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">Total Capacity</span>
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{ 
                        backgroundColor: "oklch(68.351% 0.19585 34.956 / 0.1)", 
                        color: "oklch(68.351% 0.19585 34.956)",
                        borderColor: "oklch(68.351% 0.19585 34.956 / 0.2)"
                      }}
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      +4.5%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.totalCapacityKW} kW</div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-900">
                      Steady performance increase
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[12px] text-zinc-500 font-medium whitespace-nowrap">
                      Meets growth projections
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <Card className="bg-white border-[#E8E0D5] shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-zinc-900">Project Submissions</CardTitle>
                    <CardDescription className="text-zinc-500">
                      Overview for the last {timePeriod === "3months" ? "3 months" : timePeriod === "30days" ? "30 days" : "7 days"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
                    {(["3months", "30days", "7days"] as const).map((range) => (
                      <Button
                        key={range}
                        variant="ghost"
                        size="sm"
                        onClick={() => setTimePeriod(range)}
                        className={`h-8 px-3 text-xs font-medium rounded-md ${
                          timePeriod === range 
                            ? "bg-white shadow-sm text-zinc-900" 
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-white/50"
                        }`}
                      >
                        {range === "3months" ? "3 months" : range === "30days" ? "30 days" : "7 days"}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <AreaChart data={visitorChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(68.351% 0.19585 34.956)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="oklch(68.351% 0.19585 34.956)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={10}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={10}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="bg-white border-zinc-200"
                          indicator="dot"
                        />
                      }
                    />
                    <Area 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="oklch(68.351% 0.19585 34.956)" 
                      strokeWidth={2}
                      fill="url(#submissionsGradient)" 
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects Table with Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <Card className="bg-white border-[#E8E0D5] shadow-sm">
              <CardHeader className="pb-0">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)} className="w-full">
                  <div className="flex flex-col items-start justify-between mb-4 gap-4 sm:flex-row sm:items-center">
                    <div className="w-full overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 hide-scrollbar">
                      <TabsList className="bg-transparent border-b border-zinc-200 rounded-none p-0 h-auto justify-start gap-6 w-max sm:w-auto">
                        <TabsTrigger
                          value="all"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                        >
                          All Projects
                        </TabsTrigger>
                        <TabsTrigger
                          value="draft"
                          badge={stats.draft}
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                        >
                          Drafts
                        </TabsTrigger>
                        <TabsTrigger
                          value="pending"
                          badge={stats.pending}
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                        >
                          Pending
                        </TabsTrigger>
                        <TabsTrigger
                          value="in_review"
                          badge={stats.inReview}
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                        >
                          In Review
                        </TabsTrigger>
                        <TabsTrigger
                          value="approved"
                          badge={stats.approved}
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                        >
                          Approved
                        </TabsTrigger>
                        <TabsTrigger
                          value="rejected"
                          badge={stats.rejected}
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                        >
                          Rejected
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      
                      <Link href="/forms" className="w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          className="text-xs h-8 font-semibold text-white w-full sm:w-auto"
                          style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
                        >
                          + Add Project
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <TabsContent value={activeTab} className="mt-0">
                  <div className="rounded-xl border border-zinc-200 overflow-hidden hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={paginatedProjects.length > 0 && paginatedProjects.every(p => selectedIds.has(p.id))}
                                onCheckedChange={(checked) => {
                                  const newSet = new Set(selectedIds)
                                  if (checked) {
                                    paginatedProjects.forEach(p => newSet.add(p.id))
                                  } else {
                                    paginatedProjects.forEach(p => newSet.delete(p.id))
                                  }
                                  setSelectedIds(newSet)
                                }}
                              />
                            </TableHead>
                            <TableHead className="font-semibold text-zinc-700">Project</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Address</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Status</TableHead>
                            <TableHead className="font-semibold text-zinc-700">System Size</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Created</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Reviewer</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-24">
                                <div className="flex flex-col items-center justify-center gap-3">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  <p className="text-sm font-medium text-zinc-500">Loading projects...</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : error ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-12 text-red-500 font-medium">
                                {error}
                              </TableCell>
                            </TableRow>
                          ) : filteredProjects.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                                No projects found
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedProjects.map((project) => (
                              <TableRow 
                                key={project.id} 
                                className="hover:bg-zinc-100 transition-colors"
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
                                <TableCell className="text-zinc-600 max-w-[200px] truncate text-sm">
                                  {project.address}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge {...getStatusBadgeConfig(project.status)} />
                                </TableCell>
                                <TableCell className="font-medium text-zinc-900">
                                  {project.systemSize}
                                </TableCell>
                                <TableCell className="text-zinc-600 text-sm">
                                  {formatDate(project.createdAt)}
                                </TableCell>
                                <TableCell 
                                  className="text-sm font-medium"
                                  style={{ color: "oklch(68.351% 0.19585 34.956)" }}
                                >
                                  {project.ownerName || "Assign reviewer"}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-white border-[#E8E0D5] rounded-xl shadow-xl">
                                      <DropdownMenuItem 
                                        className="cursor-pointer font-bold py-3 px-4 hover:bg-primary/5 text-zinc-900 group"
                                        onClick={() => handleViewDetails(project)}
                                      >
                                        <Eye className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
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

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden max-w-[92%] mx-auto w-full pb-20">
                      {isLoading ? (
                        <div className="text-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-sm font-medium text-zinc-500">Loading projects...</p>
                        </div>
                      ) : error ? (
                         <div className="text-center py-12 text-red-500 font-medium">
                           {error}
                         </div>
                      ) : paginatedProjects.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 bg-white rounded-xl border border-zinc-200">
                          No projects found
                        </div>
                      ) : (
                        paginatedProjects.map((project) => (
                          <div key={project.id} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm space-y-3">
                            {/* Project Name Row */}
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-1">Project</span>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-900 text-right">{project.name}</span>
                                  <StatusBadge {...getStatusBadgeConfig(project.status)} />
                                </div>
                              </div>
                            </div>

                            {/* Address Row */}
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Address</span>
                              <span className="text-sm text-zinc-900 text-right max-w-[60%] font-medium">{project.address}</span>
                            </div>

                            {/* System Size Row */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">System Size</span>
                              <span className="text-sm font-medium text-zinc-900">{project.systemSize}</span>
                            </div>

                            {/* Created Date Row */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Created</span>
                              <span className="text-sm font-medium text-zinc-900">{formatDate(project.createdAt)}</span>
                            </div>

                            {/* Reviewer Row */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Reviewer</span>
                              <span 
                                className="text-sm font-bold"
                                style={{ color: "oklch(68.351% 0.19585 34.956)" }}
                              >
                                {project.ownerName || "Unassigned"}
                              </span>
                            </div>

                            {/* Action Button */}
                            <div className="pt-2 mt-2">
                              <Button 
                                onClick={() => handleViewDetails(project)}
                                className="w-full font-bold shadow-md shadow-primary/10 h-10 tracking-wide uppercase text-xs"
                                style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 px-1">
                      <p className="text-sm text-zinc-500">
                        Showing {Math.min(filteredProjects.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredProjects.length, currentPage * itemsPerPage)} of {filteredProjects.length} projects
                      </p>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={currentPage === 1} 
                          className="h-8 text-xs"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button 
                            key={page}
                            variant="outline" 
                            size="sm" 
                            className={`h-8 w-8 text-xs ${
                              currentPage === page 
                                ? "bg-zinc-900 text-white hover:bg-zinc-800" 
                                : "bg-white text-zinc-600 hover:bg-zinc-50"
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
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Project Details Modal */}
      <ProjectDetailsModal 
        project={selectedProject}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  )
}
