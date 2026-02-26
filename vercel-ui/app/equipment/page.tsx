"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, X,LogOut, Plus, Database, Pencil, Trash2, Loader2,ChevronRight, ChevronDown, 
  Sun, Zap, Settings2, Power, Battery, Layers, Package, 
} from "lucide-react"
import { useRouter } from "next/navigation"
import { signoutAction } from "@/app/actions/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar, { SidebarToggle } from "@/components/layout/sidebar"
import AuthGuard from "@/components/auth/auth-guard"
import {
  Card,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { EquipmentCategory, EquipmentType, EquipmentRecord, EquipmentTypeConfig } from "./types"
import { EQUIPMENT_CATEGORIES, EQUIPMENT_TYPES, SUBCOMPONENT_TYPES, RACKING_MANUFACTURERS } from "./constants"
import { EQUIPMENT_FIELD_CONFIG } from "./constants/fields"

import SolarView from "./components/SolarView"
import InverterView from "./components/InverterView"
import BatteryView from "./components/BatteryView"
import GeneralView from "./components/GeneralView"
import RackingViews from "./components/RackingViews"

function DatabaseSidebar({ 
  activeType, 
  onTypeChange,
  collapsed = false
}: { 
  activeType: EquipmentType
  onTypeChange: (type: EquipmentType) => void
  collapsed?: boolean
}) {
  const [expandedCategories, setExpandedCategories] = useState<Record<EquipmentCategory, boolean>>({
    electrical: true,
    structural: true,
    other: true
  })

  const toggleCategory = (category: EquipmentCategory) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  if (collapsed) return null

  return (
    <aside className="w-56 border-r border-border bg-white flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-zinc-900">Database</h2>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto py-2">
        {EQUIPMENT_CATEGORIES.map(category => {
          const categoryItems = EQUIPMENT_TYPES.filter(t => t.category === category.id)
          // Filter for top-level items in this category
          const topLevelItems = categoryItems.filter(t => !t.parentId)
          const isExpanded = expandedCategories[category.id]
          
          return (
            <div key={category.id} className="mb-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                <span>{category.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>

              {/* Category Items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {topLevelItems.map(item => {
                      const Icon = item.icon
                      const isActive = activeType === item.id
                      const children = categoryItems.filter(child => child.parentId === item.id)
                      
                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => onTypeChange(item.id)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                              isActive 
                                ? "text-primary bg-primary/5 font-medium border-l-2 border-primary" 
                                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border-l-2 border-transparent"
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-zinc-400"}`} />
                            <span className="truncate">{item.label}</span>
                          </button>
                          
                          {/* Nested Items */}
                          {children.length > 0 && (
                            <div className="ml-4 border-l border-zinc-100">
                              {children.map(child => {
                                const ChildIcon = child.icon
                                const isChildActive = activeType === child.id
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => onTypeChange(child.id)}
                                    className={`w-full flex items-center gap-2 px-4 py-1.5 text-xs transition-colors ${
                                      isChildActive 
                                        ? "text-primary font-medium" 
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                    }`}
                                  >
                                    <ChildIcon className={`h-3 w-3 ${isChildActive ? "text-primary" : "text-zinc-400"}`} />
                                    <span className="truncate">{child.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

// --- Main Equipment Page ---
export default function EquipmentPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeType, setActiveType] = useState<EquipmentType>("solar")
  const [refreshKey, setRefreshKey] = useState(0)
  const [rackingSystems, setRackingSystems] = useState<any[]>([])

  // Fetch Hub systems for the shared form dialog
  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const res = await fetch('/api/equipment/racking-system?limit=100')
        if (res.ok) {
          const json = await res.json()
          setRackingSystems(json.data || [])
        }
      } catch (e) {
        console.error("Hub fetch error:", e)
      }
    }
    fetchHubs()
  }, [])

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EquipmentRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<EquipmentRecord | null>(null)

  const activeConfig = EQUIPMENT_TYPES.find(t => t.id === activeType)

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleView = (item: any) => {
    setViewingItem(item)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (item: EquipmentRecord) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeConfig?.label || 'equipment'}?`)) return
    
    try {
      let apiType = activeType as string
      // Mapping type to API path if needed
      const config = EQUIPMENT_TYPES.find(t => t.id === activeType)
      if (config?.apiPath) apiType = config.apiPath
      if (apiType === "racking-subcomponent") apiType = "subcomponent"
      
      const res = await fetch(`/api/equipment/${apiType}/${item.uuid || item.id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        toast.success("Record deleted successfully")
        setIsDetailsOpen(false)
        setRefreshKey(prev => prev + 1)
      } else {
        toast.error("Failed to delete record")
      }
    } catch (e) {
      console.error("Delete error:", e)
      toast.error("An error occurred")
    }
  }

  const renderActiveView = () => {
    if (!activeConfig) return <PlaceholderView label="Unknown" />

    switch (activeType) {
      case "solar":
        return <SolarView onEdit={handleEdit} onView={handleView} refreshKey={refreshKey} />
      case "inverter":
        return <InverterView onEdit={handleEdit} onView={handleView} refreshKey={refreshKey} />
      case "battery":
        return <BatteryView onEdit={handleEdit} onView={handleView} refreshKey={refreshKey} />
      case "racking-system":
      case "racking-roof":
      case "racking-ground":
      case "racking-subcomponent":
        return <RackingViews type={activeType} onEdit={handleEdit} onView={handleView} refreshKey={refreshKey} />
      default:
        if (activeConfig.apiPath) {
          return (
            <GeneralView 
              type={activeType} 
              label={activeConfig.label} 
              apiPath={activeConfig.apiPath} 
              onEdit={handleEdit} 
              onView={handleView} 
              refreshKey={refreshKey} 
            />
          )
        }
        return <PlaceholderView label={activeConfig.label} />
    }
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background relative overflow-hidden">
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

        {/* Database Sidebar */}
        <div className="hidden lg:flex h-screen sticky top-0 z-30">
          <DatabaseSidebar 
            activeType={activeType}
            onTypeChange={setActiveType}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-zinc-50/50">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 text-zinc-600"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {sidebarCollapsed && (
                  <SidebarToggle onClick={() => setSidebarCollapsed(false)} />
                )}
                
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-zinc-900">Database</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-full text-zinc-500 hover:text-destructive transition-colors"
                  onClick={async () => {
                    await signoutAction()
                    localStorage.removeItem("contractor")
                    window.location.href = "/"
                  }}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 lg:p-6">
            {renderActiveView()}
          </div>
        </main>

        <EquipmentFormDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          type={activeType}
          initialData={editingItem}
          rackingSystems={rackingSystems}
          onSuccess={() => {
              setIsDialogOpen(false)
              setRefreshKey(prev => prev + 1)
          }}
        />
        <EquipmentDetailsDialog 
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          data={viewingItem}
          type={activeType}
          onEdit={(item) => {
            setIsDetailsOpen(false)
            handleEdit(item)
          }}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}

  // Placeholder for items without API
function PlaceholderView({ label }: { label: string }) {
  return (
    <Card className="border-border/50 bg-white/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Database className="h-12 w-12 opacity-20" />
        <h3 className="text-lg font-medium text-zinc-700">{label}</h3>
        <p className="text-sm">This feature is coming soon.</p>
      </div>
    </Card>
  )
}


function EquipmentFormDialog({ 
    open, 
    onOpenChange, 
    type,
    initialData,
    rackingSystems = [],
    onSuccess 
}: { 
    open: boolean
    onOpenChange: (open: boolean) => void
    type: EquipmentType
    initialData: EquipmentRecord | null
    rackingSystems?: any[]
    onSuccess: () => void
}) {
    const isEditing = !!initialData
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<Record<string, string>>({})

    const config = EQUIPMENT_FIELD_CONFIG[type] || []

    useEffect(() => {
        if (open) {
            if (initialData) {
                const formatted: Record<string, string> = {}
                Object.entries(initialData).forEach(([k, v]) => {
                    formatted[k] = v === null || v === undefined ? "" : String(v)
                })
                setFormData(formatted)
            } else {
                setFormData({})
            }
        }
    }, [open, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let apiType = type as string
            const typeConfig = EQUIPMENT_TYPES.find(t => t.id === type)
            if (typeConfig?.apiPath) apiType = typeConfig.apiPath
            
            const url = isEditing 
                ? `/api/equipment/${apiType}/${initialData?.uuid || initialData?.id}`
                : `/api/equipment/${apiType}`
            
            const method = isEditing ? "PUT" : "POST"

            // Data Preservation logic: Start with initial data to avoid nulling fields
            let payload: any = isEditing ? { ...initialData } : {}
            
            // System keys to skip
            const systemKeys = [
                "id", "uuid", "categorizedSpecs", "categorized_specs", 
                "refresh_key", "is_verified", "display_name", "display_label",
                "rackingSystemId", "rackingSystemUuid" // We handle these separately if needed
            ]

            // Overlay with form data
            Object.keys(formData).forEach(key => {
                if (!systemKeys.includes(key)) {
                    payload[key] = formData[key]
                }
            })

            // Filter out system keys from final payload to be safe
            const cleanPayload: any = {}
            Object.keys(payload).forEach(key => {
                if (!systemKeys.includes(key)) {
                    cleanPayload[key] = payload[key]
                }
            })

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanPayload)
            })

            if (res.ok) {
                toast.success(`Equipment ${isEditing ? "updated" : "created"} successfully`)
                onSuccess()
            } else {
                let errorMsg = "Operation failed"
                try {
                    const err = await res.json()
                    errorMsg = err.error || err.message || JSON.stringify(err)
                } catch (e) {
                    errorMsg = `Status ${res.status}: ${res.statusText}`
                }
                console.error("Form submission error:", errorMsg)
                toast.error(errorMsg)
            }
        } catch (e: any) {
            console.error("Network or logic error:", e)
            toast.error(e.message || "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit" : "Add"} {type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Make changes to the equipment record below." : "Add a new verified equipment record to the database."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {config.map((field) => (
                            <div key={field.key} className={field.key === 'brandName' || field.key === 'model' || field.key === 'modelName' || field.key === 'name' || field.key === 'rackingSystemName' ? 'col-span-1 sm:col-span-2' : 'col-span-1'}>
                                <Label htmlFor={field.key} className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </Label>
                                {field.key === "rackingSystemId" ? (
                                    <select
                                        id={field.key}
                                        value={formData[field.key] || ""}
                                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        required={field.required}
                                        className="w-full h-11 px-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">Select Racking System</option>
                                        {rackingSystems.map(system => (
                                            <option key={system.id} value={system.id}>{system.name}</option>
                                        ))}
                                    </select>
                                ) : field.options ? (
                                    <select
                                        id={field.key}
                                        value={formData[field.key] || ""}
                                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        required={field.required}
                                        className="w-full h-11 px-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options.map(opt => (
                                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <Input 
                                        id={field.key}
                                        placeholder={field.placeholder}
                                        value={formData[field.key] || ""}
                                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        required={field.required}
                                        className="h-11 rounded-xl border-zinc-200"
                                    />
                                )}
                            </div>
                        ))}
                        
                        {config.length === 0 && (
                            <div className="col-span-2 text-center py-8 text-zinc-500">
                                No specific fields configured for this equipment type.
                            </div>
                        )}
                    </div>

                    {/* Additional Fields Section */}
                    {isEditing && (
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                Additional Technical Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.keys(formData).filter(key => {
                                    const inConfig = config.some(f => f.key === key)
                                    const hasDropdownInConfig = config.some(f => f.key === key && f.options)
                                    const isSystem = ["id", "uuid", "categorizedSpecs", "categorized_specs", "refresh_key", "is_verified", "display_name", "display_label", "rackingSystemId", "rackingSystemUuid"].includes(key)
                                    // Only show fields that are NOT in config AND NOT system fields
                                    return !inConfig && !isSystem
                                }).map(key => (
                                    <div key={key} className="col-span-1">
                                        <Label htmlFor={key} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ')}
                                        </Label>
                                        <Input 
                                            id={key}
                                            value={formData[key] || ""}
                                            onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="rounded-xl h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Save Changes" : "Create Record"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EquipmentDetailsDialog({
    open,
    onOpenChange,
    data,
    type,
    onEdit,
    onDelete
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: EquipmentRecord | null
    type: EquipmentType
    onEdit?: (item: EquipmentRecord) => void
    onDelete?: (item: EquipmentRecord) => void
}) {
    if (!data) return null

    const formatKey = (key: string) => {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ')
            .trim()
    }

    const formatValue = (key: string, value: any) => {
        if (value === null || value === undefined) return <span className="text-zinc-300 italic">null</span>
        if (value === "") return <span className="text-zinc-300 italic">empty</span>
        
        if (key === "componentType" || key === "component_type") {
            const type = SUBCOMPONENT_TYPES.find(t => t.key === value)
            if (type) return type.label
        }
        
        return String(value)
    }

    const specs = data.categorizedSpecs || data.categorized_specs

    const details = Object.entries(data).filter(([key]) => {
        const skipKeys = [
            "uuid", "id", "display_name", "display_label", 
            "categorizedSpecs", "categorized_specs", 
            "enabled", "is_verified", "refresh_key",
            "rackingSystemId", "racking_system_id",
            "rackingSystemUuid", "racking_system_uuid"
        ]
        return !skipKeys.includes(key)
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            {type === 'solar' && <Sun className="h-6 w-6" />}
                            {type === 'inverter' && <Zap className="h-6 w-6" />}
                            {type === 'battery' && <Battery className="h-6 w-6" />}
                            {type.startsWith('racking') && <Layers className="h-6 w-6" />}
                            {!['solar', 'inverter', 'battery'].includes(type) && !type.startsWith('racking') && <Database className="h-6 w-6" />}
                         </div>
                         <div>
                             <DialogTitle className="text-xl font-bold">Equipment Details</DialogTitle>
                             <DialogDescription>
                                {data.racking_system_name || data.rackingSystemName || ""} {data.brandName || data.brand_name || data.racking_manufacturer || data.rackingManufacturer || ""} {data.model || data.modelName || data.name || data.racking_model || data.rackingModel || ""}
                             </DialogDescription>
                         </div>
                    </div>
                </DialogHeader>

                {specs && specs.length > 0 ? (
                    <div className="py-6 space-y-8">
                        {specs.map((cat: any, idx: number) => (
                            <div key={idx} className="space-y-4">
                                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    {cat.category}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                                    {(cat.specs || []).map((spec: any, sidx: number) => (
                                        <div key={sidx} className="space-y-1">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{spec.name}</h4>
                                            <p className="font-medium text-sm text-zinc-900 wrap-break-word">
                                                {formatValue(spec.key, spec.value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                        {details.map(([key, value], idx) => (
                            <div key={idx} className="space-y-1">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{formatKey(key)}</h4>
                                <p className="font-medium text-sm text-zinc-900">
                                    {formatValue(key, value)}
                                </p>
                            </div>
                        ))}
                        
                        {details.length === 0 && (
                            <p className="col-span-3 text-center text-zinc-500 py-10">No detailed data found for this record.</p>
                        )}
                    </div>
                )}


                <DialogFooter className="pt-4 border-t border-border/50 gap-2 sm:gap-0">
                    <div className="flex w-full sm:w-auto gap-2 mr-auto">
                        <Button 
                            variant="destructive" 
                            className="rounded-xl h-11 px-6 bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700" 
                            onClick={() => onDelete?.(data)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Button 
                            variant="outline" 
                            className="rounded-xl h-11 px-6 border-zinc-200" 
                            onClick={() => onEdit?.(data)}
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                    <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl h-11 px-8">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
