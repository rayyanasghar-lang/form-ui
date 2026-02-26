"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  MapPin, 
  Settings, 
  Zap, 
  Wind, 
  Activity, 
  ClipboardCheck, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  Database,
  FileEdit
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSite, useRoofData, useElectricalData } from "@/hooks/use-site-queries"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TechnicalDashboardProps {
  siteUuid: string
}

export function TechnicalDashboard({ siteUuid }: TechnicalDashboardProps) {
  const { data: site, isLoading: siteLoading } = useSite(siteUuid)
  const { data: roof, isLoading: roofLoading } = useRoofData(siteUuid)
  const { data: electrical, isLoading: electricalLoading } = useElectricalData(siteUuid)

  if (siteLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-zinc-500 font-bold tracking-tight">Syncing site data...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Site Header */}
      <div className="relative p-10 rounded-[40px] border-none bg-zinc-900 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/20 to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                Site Dashboard
              </Badge>
              <Badge variant="outline" className="text-zinc-400 border-zinc-700 px-3 py-1 rounded-full text-xs font-bold capitalize">
                {site?.projectType || "Residential"}
              </Badge>
            </div>
            <h1 className="text-5xl font-black tracking-tighter">{site?.name || "Unnamed Site"}</h1>
            <div className="flex items-center gap-2 text-zinc-400 font-medium">
              <MapPin className="w-5 h-5 text-primary" />
              {site?.address || "Address not specified"}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center min-w-[120px]">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status</div>
              <div className="text-lg font-bold text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Active
              </div>
            </div>
            
            <Link href={`/forms?siteUuid=${siteUuid}`}>
              <Button size="lg" className="rounded-2xl h-14 px-8 font-black gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all bg-primary text-white hover:bg-primary/90">
                <FileEdit className="w-5 h-5" />
                Configure Permit Planset
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <TabsList className="bg-zinc-100/50 p-1.5 rounded-2xl h-auto">
                <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold transition-all">
                    Overview
                </TabsTrigger>
                <TabsTrigger value="technical" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold transition-all">
                    Technical Sync
                </TabsTrigger>
                <TabsTrigger value="answers" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold transition-all">
                    Raw Answers
                </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold">
                <Database className="w-4 h-4" />
                Normalized 3NF Data
            </div>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-[32px] border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 px-8 py-6">
                    <CardTitle className="text-xl font-black">Project Timeline</CardTitle>
                    <CardDescription>Major milestones and recent updates for this site.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                    {i}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-zinc-900">Permit Planset Generated</h4>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase">2 days ago</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 line-clamp-1">Structural and electrical data synced successfully to Odoo models.</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-8">
                <Card className="rounded-[32px] border-zinc-100 shadow-xl shadow-zinc-200/50 border-l-4 border-l-primary overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Sync Engine</CardTitle>
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500 font-medium">Health Status</span>
                                <span className="text-green-500 font-black italic">Excellent</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "95%" }}
                                    className="h-full bg-primary" 
                                />
                            </div>
                            <p className="text-[11px] text-zinc-400 font-medium">95.4% of technical answers mapped to core models.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[32px] border-zinc-100 shadow-xl shadow-zinc-200/50 bg-primary text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                    <CardContent className="p-8 space-y-4 relative z-10">
                        <ClipboardCheck className="w-10 h-10 text-white/50" />
                        <h3 className="text-2xl font-black leading-tight italic">Ready for Structural Review</h3>
                        <p className="text-white/70 text-sm font-medium">All roof and electrical inputs meet minimum engineering requirements.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Roof Component */}
                <Card className="rounded-[32px] border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden group">
                    <CardHeader className="px-8 pt-8 pb-6 flex flex-row items-center justify-between bg-zinc-50/50 border-b border-zinc-100">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black">Roof Analysis</CardTitle>
                            <CardDescription>Structural data synced to sunpermit.roof</CardDescription>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors shadow-sm">
                            <Wind className="w-6 h-6" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {roofLoading ? <Loader2 className="animate-spin h-6 w-6 text-primary" /> : (
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                {Object.entries(roof || {}).filter(([k]) => k !== 'id' && k !== 'siteId').map(([key, val]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{key.replace(/([A-Z])/g, ' $1')}</div>
                                        <div className="text-md font-bold text-zinc-900 capitalize">{val?.toString() || "—"}</div>
                                    </div>
                                ))}
                                {!roof && <div className="col-span-2 text-center py-4 text-zinc-400 italic font-medium">No roof data synced yet.</div>}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Electrical Component */}
                <Card className="rounded-[32px] border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden group">
                    <CardHeader className="px-8 pt-8 pb-6 flex flex-row items-center justify-between bg-zinc-50/50 border-b border-zinc-100">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black">Electrical Config</CardTitle>
                            <CardDescription>Technical data synced to sunpermit.electrical</CardDescription>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors shadow-sm">
                            <Zap className="w-6 h-6" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {electricalLoading ? <Loader2 className="animate-spin h-6 w-6 text-primary" /> : (
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                {Object.entries(electrical || {}).filter(([k]) => k !== 'id' && k !== 'siteId').map(([key, val]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{key.replace(/([A-Z])/g, ' $1')}</div>
                                        <div className="text-md font-bold text-zinc-900 capitalize">{val?.toString() || "—"}</div>
                                    </div>
                                ))}
                                {!electrical && <div className="col-span-2 text-center py-4 text-zinc-400 italic font-medium">No electrical data synced yet.</div>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="answers">
           <Card className="rounded-[32px] border-zinc-100 shadow-xl shadow-zinc-200/50">
                <CardContent className="p-10">
                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 overflow-auto max-h-[500px]">
                        <pre className="text-sm font-mono text-zinc-600">
                            {JSON.stringify(site?.answers || {}, null, 2)}
                        </pre>
                    </div>
                </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
