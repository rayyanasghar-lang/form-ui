"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, X, Search, Bell, LogOut, Plus, Database, Pencil, Trash2, 
  Sun, Zap, Power, Battery, FileCode, Paperclip, Settings2, Loader2,
  MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { signoutAction } from "@/app/actions/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar, { SidebarToggle } from "@/components/layout/sidebar"
import AuthGuard from "@/components/auth/auth-guard"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

// --- Types ---
type EquipmentType = 
  | "solar" 
  | "inverter" 
  | "optimizer" 
  | "disconnect" 
  | "battery" 
  | "attachment" 
  | "reference-code"

interface EquipmentRecord {
  id: string
  uuid: string
  make_model?: string
  model?: string
  brand_name?: string
  brandName?: string
  [key: string]: any
}

// --- Configuration ---
const EQUIPMENT_TYPES: { id: EquipmentType; label: string; icon: any }[] = [
  { id: "solar", label: "Solar Modules", icon: Sun },
  { id: "inverter", label: "Inverters", icon: Zap },
  { id: "battery", label: "Batteries", icon: Battery },
  { id: "optimizer", label: "Optimizers", icon: Settings2 },
  { id: "disconnect", label: "Disconnects", icon: Power },
  { id: "attachment", label: "Attachments", icon: Paperclip },
  { id: "reference-code", label: "Reference Codes", icon: FileCode },
]

// --- Components ---

export default function EquipmentPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<EquipmentType>("solar")

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
                  <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-zinc-900">Equipment DB</h1>
                    <p className="text-xs text-muted-foreground font-medium">Master Record Management</p>
                  </div>
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

          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EquipmentType)} className="space-y-6">
              <div className="overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
                <TabsList className="h-12 p-1 bg-white/50 border border-zinc-200 rounded-2xl w-full lg:w-auto inline-flex justify-start">
                  {EQUIPMENT_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <TabsTrigger 
                        key={type.id} 
                        value={type.id}
                        className="h-10 px-4 rounded-xl gap-2 text-zinc-500! hover:text-zinc-900 hover:bg-white/60 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                      >
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>

              {EQUIPMENT_TYPES.map((type) => (
                <TabsContent key={type.id} value={type.id} className="outline-none min-h-[500px]">
                  <EquipmentTypeView type={type.id} label={type.label} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

function EquipmentTypeView({ type, label }: { type: EquipmentType; label: string }) {
  const [data, setData] = useState<EquipmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })
  const [refreshKey, setRefreshKey] = useState(0)

  // Edit/Create State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EquipmentRecord | null>(null)

  // Details View State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<EquipmentRecord | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchEquipment = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        q: debouncedSearch
      })

      const res = await fetch(`/api/equipment/${type}?${queryParams}`)
      if (res.ok) {
        const json = await res.json()
        
        // Handle new pagination structure
        if (json.data && Array.isArray(json.data)) {
            setData(json.data)
            if (json.pagination) {
                setPagination(prev => ({
                    ...prev,
                    total: json.pagination.total,
                    pages: json.pagination.pages
                }))
            }
        } else if (Array.isArray(json)) {
            // Fallback for old array response
            setData(json)
            setPagination(prev => ({ ...prev, total: json.length, pages: 1 }))
        } else {
            setData([])
        }
      } else {
        toast.error("Failed to load equipment")
      }
    } catch (e) {
      console.error(e)
      toast.error("Error loading equipment")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [type, refreshKey, pagination.page, debouncedSearch])

  // Reset pagination when type changes
  useEffect(() => {
      setPagination(prev => ({ ...prev, page: 1, search: "" }))
      setSearch("")
      setDebouncedSearch("")
  }, [type])


  const handleDelete = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    
    try {
        const res = await fetch(`/api/equipment/${type}/${uuid}`, {
            method: "DELETE"
        })
        if (res.ok) {
            toast.success("Record deleted")
            setRefreshKey(prev => prev + 1)
        } else {
            toast.error("Failed to delete")
        }
    } catch (e) {
        toast.error("Error deleting record")
    }
  }

  return (
    <Card className="border-border/50 bg-white/50 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden flex flex-col h-full min-h-[600px]">
      <div className="p-4 lg:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder={`Search ${label}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white border-zinc-200"
          />
        </div>
        
        <Button 
            onClick={() => {
                setEditingItem(null)
                setIsDialogOpen(true)
            }} 
            className="rounded-xl h-10 px-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New {label.split(' ')[0]}
        </Button>
      </div>

      <div className="relative flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 min-h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading records...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 min-h-[300px]">
            <Database className="h-8 w-8 opacity-20" />
            <p className="text-sm">No records found</p>
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1">
                <Table>
                    <TableHeader className="bg-zinc-50/50 sticky top-0 z-10 backdrop-blur-md">
                        <TableRow className="hover:bg-transparent border-zinc-100">
                            {type === 'reference-code' ? (
                                <>
                                    <TableHead className="w-[200px] pl-6 rounded-tl-2xl">Code</TableHead>
                                    <TableHead>Display Name</TableHead>
                                </>
                            ) : type === 'solar' ? (
                                <>
                                    <TableHead className="w-[200px] pl-6 rounded-tl-2xl">Model</TableHead>
                                    <TableHead>Manufacturer</TableHead>
                                    <TableHead>Power (W)</TableHead>
                                    <TableHead>Efficiency (%)</TableHead>
                                    <TableHead>Voc (V)</TableHead>
                                </>
                            ) : type === 'inverter' ? (
                                <>
                                    <TableHead className="w-[200px] pl-6 rounded-tl-2xl">Model</TableHead>
                                    <TableHead>Manufacturer</TableHead>
                                    <TableHead>Max DC (W)</TableHead>
                                    <TableHead>AC Power (W)</TableHead>
                                    <TableHead>Efficiency (%)</TableHead>
                                </>
                            ) : type === 'battery' ? (
                                <>
                                    <TableHead className="w-[200px] pl-6 rounded-tl-2xl">Model</TableHead>
                                    <TableHead>Manufacturer</TableHead>
                                    <TableHead>Rated Power (W)</TableHead>
                                    <TableHead>Energy (Wh)</TableHead>
                                </>
                            ) : (
                                <>
                                    <TableHead className="w-[250px] pl-6 rounded-tl-2xl">Name/Model</TableHead>
                                    <TableHead>Manufacturer</TableHead>
                                </>
                            )}
                            <TableHead className="text-right pr-6 rounded-tr-2xl">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow 
                                key={item.uuid || item.id} 
                                className="hover:bg-zinc-50/50 border-zinc-50 transition-colors cursor-pointer"
                                onClick={() => {
                                    setViewingItem(item)
                                    setIsDetailsOpen(true)
                                }}
                            >
                                {type === 'reference-code' ? (
                                    <>
                                        <TableCell className="font-medium text-zinc-900 pl-6">
                                            {item.code || "No Code"}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-zinc-600">
                                                {item.display_label || item.display_name || "No Display Name"}
                                            </span>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell className="font-medium text-zinc-900 pl-6">
                                            {item.model || item.modelName || item.code || item.make_model || item.name || "Unknown Model"}
                                            {item.part_number && <div className="text-xs text-muted-foreground mt-0.5">{item.part_number}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-zinc-200 font-medium">
                                                {item.brandName || item.brand_name || "Unknown Brand"}
                                            </Badge>
                                        </TableCell>
                                        {/* Dynamic Columns based on type */}
                                        {type === 'solar' && (
                                            <>
                                                <TableCell className="text-zinc-600 text-sm">{item.power || '-'}</TableCell>
                                                <TableCell className="text-zinc-600 text-sm">{item.efficiency || '-'}</TableCell>
                                                <TableCell className="text-zinc-600 text-sm">{item.openCircuitVoltage || '-'}</TableCell>
                                            </>
                                        )}
                                        {type === 'inverter' && (
                                            <>
                                                <TableCell className="text-zinc-600 text-sm">{item.maxDCPower || '-'}</TableCell>
                                                <TableCell className="text-zinc-600 text-sm">{item.ACOutputPower || '-'}</TableCell>
                                                <TableCell className="text-zinc-600 text-sm">{item.efficiency || '-'}</TableCell>
                                            </>
                                        )}
                                        {type === 'battery' && (
                                            <>
                                                <TableCell className="text-zinc-600 text-sm">{item.ratedOutputPower || '-'}</TableCell>
                                                <TableCell className="text-zinc-600 text-sm">{item.usableEnergy || '-'}</TableCell>
                                            </>
                                        )}
                                    </>
                                )}
                                <TableCell className="text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setEditingItem(item)
                                                setIsDialogOpen(true)
                                            }}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-zinc-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(item.uuid || item.id)
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination Controls */}
            <div className="p-4 border-t border-border/50 flex items-center justify-between bg-white/30 backdrop-blur-sm">
                <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-zinc-900">{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}</span> to <span className="font-medium text-zinc-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-zinc-900">{pagination.total}</span> results
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg"
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium px-2">
                        Page {pagination.page} of {pagination.pages || 1}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg"
                        disabled={pagination.page >= (pagination.pages || 1)}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </>
        )}
      </div>

      <EquipmentFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        type={type}
        initialData={editingItem}
        onSuccess={() => {
            setIsDialogOpen(false)
            setRefreshKey(prev => prev + 1)
        }}
      />
      <EquipmentDetailsDialog 
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        data={viewingItem}
        type={type}
      />
    </Card>
  )
}

// Field configuration for each equipment type
const EQUIPMENT_FIELD_CONFIG: Record<string, { key: string; label: string; placeholder?: string; type?: string; required?: boolean }[]> = {
  solar: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. Hyundai", required: true },
    { key: "model", label: "Model", placeholder: "e.g. HiN-S380XG(BK)", required: true },
    { key: "power", label: "Power (W)", placeholder: "e.g. 380" },
    { key: "efficiency", label: "Efficiency (%)", placeholder: "e.g. 20.86" },
    { key: "openCircuitVoltage", label: "Open Circuit Voltage (Voc)", placeholder: "e.g. 41.4" },
    { key: "shortCircuitCurrent", label: "Short Circuit Current (Isc)", placeholder: "e.g. 11.6" },
    { key: "maximumPowerVoltage", label: "Max Power Voltage (Vmp)", placeholder: "e.g. 34.6" },
    { key: "maximumPowerCurrent", label: "Max Power Current (Imp)", placeholder: "e.g. 10.99" },
    { key: "temperatureCoefficient", label: "Temp Coefficient", placeholder: "e.g. -0.28" },
    { key: "width", label: "Width", placeholder: "e.g. 40.86" },
    { key: "length", label: "Length", placeholder: "e.g. 69.09" },
  ],
  inverter: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. SolarEdge", required: true },
    { key: "model", label: "Model", placeholder: "e.g. SE7600H-US", required: true },
    { key: "maxDCPower", label: "Max DC Power (W)", placeholder: "e.g. 11800" },
    { key: "ACOutputPower", label: "AC Output Power (W)", placeholder: "e.g. 7600" },
    { key: "efficiency", label: "Efficiency (%)", placeholder: "e.g. 99" },
    { key: "maxInputCurrent", label: "Max Input Current (A)", placeholder: "e.g. 20.5" },
    { key: "maxOutputCurrent", label: "Max Output Current (A)", placeholder: "e.g. 32" },
    { key: "maxInputVoltage", label: "Max Input Voltage (V)", placeholder: "e.g. 480" },
  ],
  battery: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. Tesla", required: true },
    { key: "modelName", label: "Model Name", placeholder: "e.g. Powerwall 2", required: true },
    { key: "ratedOutputPower", label: "Rated Output Power (W)", placeholder: "e.g. 5000" },
    { key: "peakPower", label: "Peak Power (W)", placeholder: "e.g. 7000" },
    { key: "usableEnergy", label: "Usable Energy (Wh)", placeholder: "e.g. 13500" },
    { key: "voltageRange", label: "Voltage Range (V)", placeholder: "e.g. 350-450" },
    { key: "outputCurrent", label: "Output Current (A)", placeholder: "e.g. 30" },
    { key: "scalibility", label: "Scalability", placeholder: "e.g. Yes (up to 10)" },
    { key: "insulationType", label: "Insulation Type", placeholder: "e.g. Class I" },
    { key: "rating", label: "Rating", placeholder: "e.g. IP65" },
    { key: "operatingTemprature", label: "Operating Temperature", placeholder: "e.g. -20 to 50" },
    { key: "warranty", label: "Warranty", placeholder: "e.g. 10 Years" },
  ],
  optimizer: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. SolarEdge", required: true },
    { key: "model", label: "Model", placeholder: "e.g. P400", required: true },
    { key: "inputDCPower", label: "Input DC Power (W)", placeholder: "e.g. 400" },
    { key: "maxInputCurrent", label: "Max Input Current (A)", placeholder: "e.g. 10" },
    { key: "voltageRange", label: "Voltage Range (V)", placeholder: "e.g. 8-60" },
    { key: "maxOutputCurrent", label: "Max Output Current (A)", placeholder: "e.g. 15" },
    { key: "maxOutputVoltage", label: "Max Output Voltage (V)", placeholder: "e.g. 80" },
    { key: "efficiency", label: "Efficiency (%)", placeholder: "e.g. 99.5" },
  ],
  disconnect: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. Schneider", required: true },
    { key: "model", label: "Model", placeholder: "e.g. DU321", required: true },
    { key: "ratedCurrent", label: "Rated Current (A)", placeholder: "e.g. 30" },
    { key: "maxRatedVoltage", label: "Max Rated Voltage (V)", placeholder: "e.g. 240" },
  ],
  attachment: [
    { key: "model", label: "Model", placeholder: "e.g. QuickMount XV", required: true },
  ],
  "reference-code": [
    { key: "code", label: "Code", placeholder: "e.g. REF-2024-001", required: true },
  ]
}

function EquipmentFormDialog({ 
    open, 
    onOpenChange, 
    type,
    initialData,
    onSuccess 
}: { 
    open: boolean
    onOpenChange: (open: boolean) => void
    type: EquipmentType
    initialData: EquipmentRecord | null
    onSuccess: () => void
}) {
    const isEditing = !!initialData
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<Record<string, string>>({})

    const config = EQUIPMENT_FIELD_CONFIG[type] || []

    useEffect(() => {
        if (open) {
            if (initialData) {
                // Determine fields to populate based on config
                // We shouldn't just dump all initialData because it might contain extra fields
                // but for simplicity and robustness we can start with initialData
                // and just ensure we are editing the right keys in the UI.
                
                // Converting numbers to strings for inputs
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
            const url = isEditing 
                ? `/api/equipment/${type}/${initialData?.uuid || initialData?.id}`
                : `/api/equipment/${type}`
            
            const method = isEditing ? "PUT" : "POST"

            // Filter formData to only include relevant fields for this type
            // This prevents sending readonly or non-existent fields (like display_name) that cause 500 errors
            const cleanPayload: Record<string, string> = {}
            const allowedKeys = config.map(c => c.key)
            
            // Should usually include simple identification fields if they aren't in config for some reason, 
            // but our config is comprehensive.
            
            Object.keys(formData).forEach(key => {
                if (allowedKeys.includes(key)) {
                    cleanPayload[key] = formData[key]
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
            <DialogContent className="sm:max-w-[600px] rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit" : "Add"} {type === 'reference-code' ? 'Reference Code' : type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Make changes to the equipment record below." : "Add a new verified equipment record to the database."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {config.map((field) => (
                            <div key={field.key} className={field.key === 'brandName' || field.key === 'model' || field.key === 'modelName' || field.key === 'code' ? 'col-span-1 sm:col-span-2' : 'col-span-1'}>
                                <Label htmlFor={field.key} className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </Label>
                                <Input 
                                    id={field.key}
                                    placeholder={field.placeholder}
                                    value={formData[field.key] || ""}
                                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                    required={field.required}
                                    className="h-11 rounded-xl border-zinc-200"
                                />
                            </div>
                        ))}
                        
                        {config.length === 0 && (
                            <div className="col-span-2 text-center py-8 text-zinc-500">
                                No specific fields configured for this equipment type.
                            </div>
                        )}
                    </div>

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
    type
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: EquipmentRecord | null
    type: EquipmentType
}) {
    if (!data) return null

    // Helper to format keys like "brandName" -> "Brand Name"
    const formatKey = (key: string) => {
        return key
            .replace(/([A-Z])/g, ' $1') // Add space before capitals
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .replace(/_/g, ' ') // Replace underscores
            .trim()
    }

    // Filter out internal keys like uuid, id, and display_name. 
    // Show ALL other fields even if empty/null as per user request for "all data".
    const details = Object.entries(data).filter(([key]) => {
        return key !== "uuid" && key !== "id" && key !== "display_name"
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            {type === 'solar' && <Sun className="h-6 w-6" />}
                            {type === 'inverter' && <Zap className="h-6 w-6" />}
                            {type === 'battery' && <Battery className="h-6 w-6" />}
                            {(type !== 'solar' && type !== 'inverter' && type !== 'battery') && <Database className="h-6 w-6" />}
                         </div>
                         <div>
                             <DialogTitle className="text-xl font-bold">Equipment Details</DialogTitle>
                             <DialogDescription>{data.brandName || data.brand_name} {data.model || data.modelName || data.code}</DialogDescription>
                         </div>
                    </div>
                </DialogHeader>

                <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                    {details.map(([key, value]) => (
                        <div key={key} className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{formatKey(key)}</h4>
                            <p className="font-medium text-sm text-zinc-900 wrap-break-word">
                                {value === null || value === undefined ? <span className="text-zinc-300 italic">null</span> : 
                                 typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                                 value === "" ? <span className="text-zinc-300 italic">empty</span> : 
                                 String(value)}
                            </p>
                        </div>
                    ))}
                    
                    {details.length === 0 && (
                        <p className="col-span-3 text-center text-zinc-500 py-10">No detailed data found for this record.</p>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t border-border/50">
                    <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl h-11">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
