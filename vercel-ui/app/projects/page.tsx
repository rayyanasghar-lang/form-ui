"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
  FolderOpen
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import Sidebar from "@/components/projects/sidebar"
import { StatusBadge } from "@/components/projects/status-badge"
import { 
  mockProjects, 
  getProjectStats, 
} from "@/lib/mock-projects"
import type { ProjectStatus } from "@/types/project"

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
  
  const stats = getProjectStats()

  const filteredProjects = activeTab === "all" 
    ? mockProjects 
    : mockProjects.filter(p => p.status === activeTab)

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header Bar */}
        <div className="border-b border-[#E8E0D5] bg-[#F5F0E8] sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-zinc-900">Project Dashboard</h1>
            <Link href="/forms">
              <Button 
                className="font-bold shadow-md hover:shadow-lg transition-all text-white"
                style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
              >
                ⚡ Quick Create
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-6">
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
                  <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                    Total Revenue
                    <div 
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "oklch(68.351% 0.19585 34.956 / 0.1)" }}
                    >
                      <DollarSign className="w-4 h-4" style={{ color: "oklch(68.351% 0.19585 34.956)" }} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">$12,450</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +12.5%
                    </span>
                    <span className="text-xs text-zinc-500">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Reviews */}
            <motion.div variants={item}>
              <Card className="bg-white border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                    Pending Reviews
                    <div 
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "oklch(0.75 0.12 75 / 0.15)" }}
                    >
                      <Clock className="w-4 h-4" style={{ color: "oklch(0.55 0.12 75)" }} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.pending + stats.inReview}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-amber-600 font-semibold text-sm flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" />
                      {stats.inReview} in review
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Approved Projects */}
            <motion.div variants={item}>
              <Card className="bg-white border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                    Approved
                    <div 
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "oklch(0.65 0.15 145 / 0.15)" }}
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.55 0.15 145)" }} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.approved}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{stats.approvedTrend}%
                    </span>
                    <span className="text-xs text-zinc-500">this month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Capacity */}
            <motion.div variants={item}>
              <Card className="bg-white border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                    Total Capacity
                    <div 
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "oklch(0.55 0.15 260 / 0.15)" }}
                    >
                      <Zap className="w-4 h-4" style={{ color: "oklch(0.45 0.15 260)" }} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.totalCapacityKW} kW</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{stats.capacityTrend}%
                    </span>
                    <span className="text-xs text-zinc-500">vs last month</span>
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
                  <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-transparent border-b border-zinc-200 rounded-none p-0 h-auto justify-start gap-6">
                      <TabsTrigger
                        value="all"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2.5 text-sm font-medium data-[state=active]:shadow-none"
                      >
                        All Projects
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2.5 text-sm font-medium data-[state=active]:shadow-none"
                      >
                        Pending
                        <Badge variant="secondary" className="ml-2 bg-zinc-100 text-zinc-600 text-xs font-medium">
                          {stats.pending}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="in_review"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2.5 text-sm font-medium data-[state=active]:shadow-none"
                      >
                        In Review
                        <Badge variant="secondary" className="ml-2 bg-zinc-100 text-zinc-600 text-xs font-medium">
                          {stats.inReview}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="approved"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2.5 text-sm font-medium data-[state=active]:shadow-none"
                      >
                        Approved
                      </TabsTrigger>
                      <TabsTrigger
                        value="rejected"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2.5 text-sm font-medium data-[state=active]:shadow-none"
                      >
                        Rejected
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8 bg-white border-zinc-200">
                        ⚙️ Columns
                      </Button>
                      <Link href="/forms">
                        <Button 
                          size="sm" 
                          className="text-xs h-8 font-semibold text-white"
                          style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
                        >
                          + Add Project
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <TabsContent value={activeTab} className="mt-0">
                    <div className="rounded-lg border border-zinc-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
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
                            <TableHead className="font-semibold text-zinc-700">Reviewer</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProjects.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                                No projects found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredProjects.map((project) => (
                              <TableRow 
                                key={project.id} 
                                className="hover:bg-zinc-50/50 transition-colors"
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
                                  <StatusBadge status={project.status} />
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
                    
                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 px-1">
                      <p className="text-sm text-zinc-500">
                        Showing {filteredProjects.length} of {mockProjects.length} projects
                      </p>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs bg-zinc-900 text-white hover:bg-zinc-800">
                          1
                        </Button>
                        <Button variant="outline" size="sm" disabled className="h-8 text-xs">
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
    </div>
  )
}
