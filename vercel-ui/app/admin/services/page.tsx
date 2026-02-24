"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Search, 
  Briefcase, 
  Edit2, 
  Trash2, 
  GitBranch, 
  ArrowRight,
  ShieldCheck,
  Package,
  Clock,
  Settings2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchAdminServices } from "@/app/actions/admin-api"
import { AdminService } from "@/types/admin"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ServiceManagerPage() {
  const [services, setServices] = useState<AdminService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const res = await fetchAdminServices()
      if (res.status === "success" && res.data) {
        setServices(res.data)
      } else {
        toast.error("Failed to load services")
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-12 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-2">Service <span className="text-primary italic">Portfolio</span></h1>
          <p className="text-zinc-500 font-medium text-lg">Define workflows and map technical rule sets to business services.</p>
        </div>
        <Button className="h-16 px-10 rounded-full font-black shadow-2xl shadow-primary/20 gap-3 group bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform text-white" />
          Create Service
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <Input 
            placeholder="Search services by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-16 pl-14 pr-6 rounded-3xl border-zinc-100 bg-white/50 backdrop-blur-md focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg font-bold"
          />
        </div>
        <div className="flex gap-4">
             <Button variant="outline" className="h-16 rounded-3xl border-2 font-black px-8">Active Only</Button>
             <Button variant="outline" className="h-16 rounded-3xl border-2 font-black px-8">Pricing Matrix</Button>
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full py-32 text-center">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Cataloging Services...</span>
               </div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full py-32 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-emerald-300" />
              </div>
              <h4 className="text-xl font-black text-zinc-900 mb-2">No services found</h4>
              <p className="text-zinc-500 font-medium max-w-sm mx-auto">Create your first service to start building engineering workflows.</p>
            </div>
          ) : (
            filteredServices.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white rounded-[48px] border border-zinc-100 shadow-2xl shadow-zinc-100/30 hover:shadow-emerald-500/10 hover:border-emerald-500/20 transition-all duration-500 overflow-hidden flex flex-col"
              >
                <div className="p-10 flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110 duration-500">
                      <Package className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-2">
                       <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-zinc-100">
                          <Settings2 className="w-4 h-4 text-zinc-400" />
                       </Button>
                       <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 shadow-emerald-200">
                          <Edit2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-zinc-900 mb-2 group-hover:text-emerald-600 transition-colors uppercase tracking-tighter tracking-tight">{service.name}</h3>
                  <p className="text-zinc-400 font-bold mb-8 line-clamp-2 text-sm leading-relaxed">
                    {service.description || "No description provided for this engineering service workflow."}
                  </p>

                  <div className="flex items-baseline gap-2 mb-8">
                     <span className="text-4xl font-black text-emerald-600 tracking-tighter">${service.price}</span>
                     <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Base Payout</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 group-hover:bg-white transition-colors">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Questions</p>
                        <p className="text-lg font-black text-zinc-900">{service.questionIds?.length || 0}</p>
                     </div>
                     <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 group-hover:bg-white transition-colors">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-black italic">
                           <ShieldCheck className="w-4 h-4" />
                           Live
                        </div>
                     </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 mt-auto group-hover:bg-emerald-50/50 transition-colors duration-500">
                    <Link href={`/admin/services/${service.id}`}>
                        <Button className="w-full h-14 rounded-3xl font-black gap-3 bg-zinc-900 hover:bg-emerald-600 transition-all duration-300 shadow-xl shadow-zinc-200 group-hover:shadow-emerald-200">
                            Configure Rule Engine
                            <GitBranch className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </Link>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
