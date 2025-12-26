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
  ResponsiveContainer 
} from "recharts"
import { 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Users,
  DollarSign,
  Activity
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
import { Navbar } from "@/components/layout/navbar"
import { StatusBadge } from "@/components/projects/status-badge"
import { 
  mockProjects, 
  getProjectStats, 
  getSubmissionChartData 
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
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen relative selection:bg-primary/20">
      <Navbar 
        title="My Projects" 
        backLink={{ label: "Dashboard", href: "/dashboard" }}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12 relative">
        {/* Background Decorative Element */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
                Project Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Manage and track all your solar permit submissions
              </p>
            </div>
            <Link href="/forms">
              <Button 
                size="lg"
                className="font-bold shadow-lg hover:shadow-xl transition-all text-white"
                style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
              >
                ⚡ Quick Create
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Revenue */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-[#F5F0E8] border-[#E8E0D5] shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-10 transition-all duration-500 group-hover:scale-125 group-hover:opacity-15"
                style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
              />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between uppercase tracking-wider">
                  Total Revenue
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900">$12,450.00</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +12.5%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Trending up this month</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Reviews */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-[#F5F0E8] border-[#E8E0D5] shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-10 transition-all duration-500 group-hover:scale-125 group-hover:opacity-15"
                style={{ backgroundColor: "oklch(0.65 0.15 65)" }}
              />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between uppercase tracking-wider">
                  Pending Reviews
                  <Clock className="w-4 h-4" style={{ color: "oklch(0.65 0.15 65)" }} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900">{stats.pending + stats.inReview}</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-amber-600 font-semibold text-sm flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    {stats.inReview} in review
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting approval</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Approved Projects */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-[#F5F0E8] border-[#E8E0D5] shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-10 transition-all duration-500 group-hover:scale-125 group-hover:opacity-15"
                style={{ backgroundColor: "oklch(0.65 0.15 145)" }}
              />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between uppercase tracking-wider">
                  Approved Projects
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900">{stats.approved}</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +{stats.approvedTrend}%
                  </span>
                  <span className="text-xs text-muted-foreground">this month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Strong approval rate</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Capacity */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-[#F5F0E8] border-[#E8E0D5] shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-10 transition-all duration-500 group-hover:scale-125 group-hover:opacity-15"
                style={{ backgroundColor: "oklch(0.55 0.15 260)" }}
              />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between uppercase tracking-wider">
                  Total Capacity
                  <Zap className="w-4 h-4" style={{ color: "oklch(0.55 0.15 260)" }} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900">{stats.totalCapacityKW} kW</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +{stats.capacityTrend}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Meets growth projections</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-[#F5F0E8] border-[#E8E0D5] shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-zinc-900">Project Submissions</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Total for the last {timePeriod === "3months" ? "3 months" : timePeriod === "30days" ? "30 days" : "7 days"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-[#EDE8E0] rounded-lg p-1">
                  <Button
                    variant={timePeriod === "3months" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimePeriod("3months")}
                    className={`h-8 px-3 text-xs font-medium ${
                      timePeriod === "3months" 
                        ? "bg-white shadow-sm text-zinc-900" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-white/50"
                    }`}
                  >
                    Last 3 months
                  </Button>
                  <Button
                    variant={timePeriod === "30days" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimePeriod("30days")}
                    className={`h-8 px-3 text-xs font-medium ${
                      timePeriod === "30days" 
                        ? "bg-white shadow-sm text-zinc-900" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-white/50"
                    }`}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant={timePeriod === "7days" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimePeriod("7days")}
                    className={`h-8 px-3 text-xs font-medium ${
                      timePeriod === "7days" 
                        ? "bg-white shadow-sm text-zinc-900" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-white/50"
                    }`}
                  >
                    Last 7 days
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={visitorChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(68.351% 0.19585 34.956)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(68.351% 0.19585 34.956)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" vertical={false} />
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
                        className="bg-[#F5F0E8] border-[#E8E0D5]"
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-[#F5F0E8] border-[#E8E0D5] shadow-lg">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-zinc-900">
                    Projects
                  </CardTitle>
                  <Link href="/forms">
                    <Button 
                      size="sm" 
                      className="font-semibold text-white"
                      style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
                    >
                      + Add Project
                    </Button>
                  </Link>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)} className="w-full">
                  <TabsList className="bg-transparent border-b border-[#E8E0D5] rounded-none p-0 h-auto justify-start gap-6 w-full">
                    <TabsTrigger
                      value="all"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2 text-sm font-medium"
                    >
                      All Projects
                    </TabsTrigger>
                    <TabsTrigger
                      value="pending"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2 text-sm font-medium"
                    >
                      Pending{" "}
                      <Badge variant="secondary" className="ml-2 bg-[#EDE8E0] text-xs">
                        {stats.pending}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="in_review"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2 text-sm font-medium"
                    >
                      In Review{" "}
                      <Badge variant="secondary" className="ml-2 bg-[#EDE8E0] text-xs">
                        {stats.inReview}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="approved"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2 text-sm font-medium"
                    >
                      Approved
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-0 py-2 text-sm font-medium"
                    >
                      Rejected
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" className="text-xs bg-white/50 hover:bg-white">
                      ⚙️ Customize Columns
                    </Button>
                  </div>

                  <TabsContent value={activeTab} className="mt-4">
                    <div className="rounded-xl border border-[#E0D9CF] overflow-hidden bg-white/50">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#EDE8E0]/50 hover:bg-[#EDE8E0]/50">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                                onCheckedChange={toggleAll}
                              />
                            </TableHead>
                            <TableHead className="font-semibold text-zinc-700">Project Name</TableHead>
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
                              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                No projects found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredProjects.map((project) => (
                              <TableRow 
                                key={project.id} 
                                className="hover:bg-[#F5F0E8]/50 transition-colors"
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
                                  <StatusBadge status={project.status} />
                                </TableCell>
                                <TableCell className="font-medium text-zinc-900">
                                  {project.systemSize}
                                </TableCell>
                                <TableCell className="text-zinc-600">
                                  {formatDate(project.createdAt)}
                                </TableCell>
                                <TableCell className="text-sm" style={{ color: "oklch(68.351% 0.19585 34.956)" }}>
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
                    <div className="flex items-center justify-between mt-4 px-2">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredProjects.length} of {mockProjects.length} projects
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled className="h-8 bg-white/50">
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 bg-white font-semibold">
                          1
                        </Button>
                        <Button variant="outline" size="sm" disabled className="h-8 bg-white/50">
                          Next
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
