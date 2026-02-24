"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ArrowRight, Zap, Battery, Briefcase, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useServices } from "@/hooks/use-site-queries"
import { toast } from "sonner"

interface ServiceSelectionViewProps {
  projectId: string
  existingServiceIds?: string[]
  onServicesSelected: (serviceIds: string[]) => void
}

const getServiceIcon = (name: any) => {
  const nameStr = typeof name === 'string' ? name : String(name || "")
  const lower = nameStr.toLowerCase()
  if (lower.includes('solar')) return Zap
  if (lower.includes('battery')) return Battery
  return Briefcase
}

export function ServiceSelectionView({ existingServiceIds = [], onServicesSelected }: ServiceSelectionViewProps) {
  const { data: availableServices, isLoading, error } = useServices()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleService = (id: string | number) => {
    const idStr = String(id)
    if (existingServiceIds.includes(idStr)) return 

    setSelectedIds(prev => 
      prev.includes(idStr) 
        ? prev.filter(s => s !== idStr) 
        : [...prev, idStr]
    )
  }

  const handleContinue = () => {
    const newSelectedIds = selectedIds.filter(id => !existingServiceIds.includes(id))
    
    if (newSelectedIds.length === 0) {
      toast.error("Please select at least one new service to continue")
      return
    }
    
    onServicesSelected(newSelectedIds)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-zinc-500 font-medium">Loading available services...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 rotate-180" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Failed to load services</h3>
        <p className="text-zinc-500 max-w-xs">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        <Button variant="outline" className="mt-6 rounded-full" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight">
            Choose Your <span className="text-primary italic">Services</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Select the engineering services required for your site. Each service will generate a tailored data collection form.
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {availableServices?.map((service) => {
          const serviceIdStr = String(service.id)
          const isExisting = existingServiceIds.includes(serviceIdStr)
          const isSelected = selectedIds.includes(serviceIdStr) || isExisting
          const Icon = getServiceIcon(service.name)
          
          return (
            <motion.div
              key={serviceIdStr}
              whileHover={!isExisting ? { scale: 1.02, y: -4 } : {}}
              whileTap={!isExisting ? { scale: 0.98 } : {}}
              className={cn("h-full", isExisting && "opacity-60 grayscale-[0.5]")}
            >
              <div
                onClick={() => toggleService(service.id)}
                className={cn(
                  "relative h-full flex flex-col p-6 rounded-3xl border-2 transition-all duration-300",
                  "backdrop-blur-xl",
                  !isExisting && "cursor-pointer",
                  isExisting ? "border-zinc-200 bg-zinc-50 cursor-not-allowed" :
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 ring-4 ring-primary/5" 
                    : "border-zinc-200 bg-white/80 hover:border-primary/50 hover:shadow-xl"
                )}
              >
                <div className="absolute top-6 right-6">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    isSelected 
                      ? "bg-primary border-primary scale-110" 
                      : "border-zinc-300"
                  )}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>

                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                  isSelected ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-zinc-100 text-zinc-500"
                )}>
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className={cn(
                  "text-xl font-bold mb-2 transition-colors duration-300",
                  isSelected ? "text-primary" : "text-zinc-900"
                )}>
                  {service.name}
                </h3>
                
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {service.description || "Custom engineering service tailored to your project requirements."}
                </p>
                
                {service.questionCount && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Inputs Required</span>
                    <div className="h-px flex-1 bg-zinc-100" />
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{service.questionCount}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          onClick={handleContinue}
          disabled={selectedIds.length === 0}
          className="h-16 px-12 rounded-full text-lg font-black shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Begin Configuration
          <ArrowRight className="ml-3 w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
