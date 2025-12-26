"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  Zap,
  Settings,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { StatCard } from "@/components/projects/stat-card"
import { SubmissionsChart } from "@/components/projects/submissions-chart"
import { ProjectsTable } from "@/components/projects/projects-table"
import { 
  mockProjects, 
  getProjectStats, 
  getSubmissionChartData 
} from "@/lib/mock-projects"

export default function ProjectsPage() {
  const stats = getProjectStats()
  const chartData = getSubmissionChartData()

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
                Your Projects
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Manage and track all your solar permit submissions
              </p>
            </div>
            <Link href="/forms">
              <Button 
                size="lg"
                className="font-bold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "oklch(68.351% 0.19585 34.956)" }}
              >
                + New Project
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <StatCard
              title="Total Projects"
              value={stats.total}
              trend={stats.totalTrend}
              trendLabel="vs last month"
              icon={FolderOpen}
              accentColor="oklch(68.351% 0.19585 34.956)"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              title="Pending Review"
              value={stats.pending + stats.inReview}
              trend={stats.pendingTrend}
              trendLabel="vs last month"
              icon={Clock}
              accentColor="oklch(0.65 0.15 65)"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              title="Approved"
              value={stats.approved}
              trend={stats.approvedTrend}
              trendLabel="this month"
              icon={CheckCircle2}
              accentColor="oklch(0.65 0.15 145)"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              title="Total Capacity"
              value={`${stats.totalCapacityKW} kW`}
              trend={stats.capacityTrend}
              trendLabel="vs last month"
              icon={Zap}
              accentColor="oklch(0.55 0.15 260)"
            />
          </motion.div>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <SubmissionsChart data={chartData} />
        </motion.div>

        {/* Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ProjectsTable projects={mockProjects} />
        </motion.div>
      </main>
    </div>
  )
}
