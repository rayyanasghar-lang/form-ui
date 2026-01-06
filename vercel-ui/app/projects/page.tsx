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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import Sidebar from "@/components/layout/sidebar"
import { 
  mockProjects, 
  getProjectStats, 
} from "@/lib/mock-projects"
import { ProjectStatus, Project } from "@/types/project"
import { fetchProjectsAction } from "@/app/actions/project-service"
import { Loader2 } from "lucide-react"
import { ProjectsTable } from "@/components/projects/projects-table"
import { useRouter }
 from "next/navigation"



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
    color: "var(--primary)",
  },
  approvals: {
    label: "Approvals", 
    color: "var(--success)",
  },
} satisfies ChartConfig

type TabFilter = "all" | ProjectStatus
type TimeRange = "3months" | "30days" | "7days"

export default function ProjectsPage() {
  /* State */
  const [timePeriod, setTimePeriod] = useState<TimeRange>("3months")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
                   <X className="h-5 w-5 text-sidebar-foreground/50 hover:text-sidebar-foreground" />
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
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 supports-backdrop-filter:bg-background/60 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Mobile Menu Trigger */}
              <button
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
              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">Total Revenue</span>
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{ 
                        backgroundColor: "oklch(from var(--primary) l c h / 0.1)", 
                        color: "var(--primary)",
                        borderColor: "oklch(from var(--primary) l c h / 0.2)"
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
                      className="flex items-center gap-1.5 text-[13px] font-bold text-primary"
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
              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">In Process</span>
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{ 
                        backgroundColor: "oklch(from var(--primary) l c h / 0.1)", 
                        color: "var(--primary)",
                        borderColor: "oklch(from var(--primary) l c h / 0.2)"
                      }}
                    >
                      <ArrowDownRight className="h-3 w-3" />
                      -8.3%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.inProcess}</div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-primary whitespace-nowrap">
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
              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">Done Projects</span>
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{ 
                        backgroundColor: "oklch(from var(--primary) l c h / 0.1)", 
                        color: "var(--primary)",
                        borderColor: "oklch(from var(--primary) l c h / 0.2)"
                      }}
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      +12.5%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.done}</div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-primary">
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
              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">Total Capacity</span>
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{ 
                        backgroundColor: "oklch(from var(--primary) l c h / 0.1)", 
                        color: "var(--primary)",
                        borderColor: "oklch(from var(--primary) l c h / 0.2)"
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
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-primary">
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
            <Card className="bg-card border-border shadow-sm">
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
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
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
                      stroke="var(--primary)" 
                      strokeWidth={2}
                      fill="url(#submissionsGradient)" 
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects Table */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="pb-20"
          >
            <ProjectsTable 
              projects={projects} 
              isLoading={isLoading} 
              error={error} 
            />
          </motion.div>
        </div>
      </main>

     
    </div>
  )
}
