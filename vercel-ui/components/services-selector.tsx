"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle2, Circle, Briefcase } from "lucide-react"
import { fetchServicesAction, Service } from "@/app/actions/fetch-services"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ServicesSelectorProps {
  selectedServices: Array<{ id: string; name: string }>
  onServicesChange: (services: Array<{ id: string; name: string }>) => void
  className?: string
}

export function ServicesSelector({ 
  selectedServices, 
  onServicesChange,
  className 
}: ServicesSelectorProps) {
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available services on mount
  useEffect(() => {
    async function loadServices() {
      setIsLoading(true)
      setError(null)
      
      const result = await fetchServicesAction()
      
      if ("error" in result) {
        setError(result.error)
      } else {
        setAvailableServices(result.data || [])
      }
      
      setIsLoading(false)
    }
    
    loadServices()
  }, [])

  const isSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId)
  }

  const toggleService = (service: Service) => {
    if (isSelected(service.id)) {
      // Remove service
      onServicesChange(selectedServices.filter(s => s.id !== service.id))
    } else {
      // Add service (append)
      onServicesChange([...selectedServices, { id: service.id, name: service.name }])
    }
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm font-medium text-zinc-500">Loading services...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-sm text-destructive font-medium">{error}</p>
        <p className="text-xs text-muted-foreground mt-1">Failed to load available services</p>
      </div>
    )
  }

  if (availableServices.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Briefcase className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
        <p className="text-sm text-muted-foreground font-medium">No services available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-sm text-muted-foreground font-medium">
        Select the services required for this project. Changes will be saved when you click Save Configuration.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableServices.map((service) => {
          const selected = isSelected(service.id)
          
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service)}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group",
                selected 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-border bg-card hover:border-primary/30 hover:bg-zinc-50"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors shrink-0",
                selected 
                  ? "bg-primary border-primary text-white" 
                  : "border-zinc-200 text-zinc-300 group-hover:border-primary/50"
              )}>
                {selected ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold text-base",
                  selected ? "text-primary" : "text-zinc-900"
                )}>
                  {service.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  ID: {service.id.slice(0, 8)}...
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedServices.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
            Selected Services ({selectedServices.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map((service) => (
              <span 
                key={service.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-full"
              >
                <Briefcase className="h-3 w-3" />
                {service.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
