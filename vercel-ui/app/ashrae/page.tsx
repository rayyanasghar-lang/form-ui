"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, X, Search, LogOut, Plus, Database, Pencil, Trash2, 
  CloudSun, Loader2, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar, { SidebarToggle } from "@/components/layout/sidebar"
import AuthGuard from "@/components/auth/auth-guard"
import {
  Card,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { signoutAction } from "@/app/actions/auth-service"
import { fetchAshraeData, createAshraeRecord, updateAshraeRecord, deleteAshraeRecord, AshraeRecord } from "@/app/actions/ashrae-service"

export default function AshraePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [data, setData] = useState<AshraeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1
  })
  const [refreshKey, setRefreshKey] = useState(0)

  // Filters
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState("")
  const [highTempFilter, setHighTempFilter] = useState("")
  const [minTempFilter, setMinTempFilter] = useState("")
  
  const [debouncedFilters, setDebouncedFilters] = useState({
    station: "",
    state: "",
    high_temp_2_avg: "",
    extreme_temp_min: ""
  })

  // Edit/Create State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AshraeRecord | null>(null)

  // Debounce all filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        station: search,
        state: stateFilter,
        high_temp_2_avg: highTempFilter,
        extreme_temp_min: minTempFilter
      })
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [search, stateFilter, highTempFilter, minTempFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchAshraeData({
        page: pagination.page,
        limit: pagination.limit,
        ...debouncedFilters
      })
      
      if (res.status === "success") {
        setData(res.data)
        if (res.pagination) {
          setPagination(prev => ({
            ...prev,
            total: res.pagination.total,
            pages: res.pagination.pages
          }))
        }
      } else {
        toast.error(res.message || "Failed to load ASHRAE data")
      }
    } catch (e) {
      console.error(e)
      toast.error("Error loading ASHRAE data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [refreshKey, pagination.page, debouncedFilters])

  const handleDelete = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    
    try {
        const res = await deleteAshraeRecord(uuid)
        if (res.status === "success") {
            toast.success("Record deleted")
            setRefreshKey(prev => prev + 1)
        } else {
            toast.error(res.message || "Failed to delete")
        }
    } catch (e) {
        toast.error("Error deleting record")
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
                  <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <CloudSun className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-zinc-900">ASHRAE Database</h1>
                    <p className="text-xs text-muted-foreground font-medium">Weather Data Management</p>
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
            <Card className="border-border/50 bg-white/50 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden flex flex-col min-h-[600px]">
              <div className="p-4 lg:p-6 border-b border-border/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      placeholder="Search weather station..."
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
                    Add New Record
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="state-filter" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">State</Label>
                    <Input 
                      id="state-filter"
                      placeholder="Filter by state (e.g. CO)"
                      value={stateFilter}
                      onChange={e => {
                        setStateFilter(e.target.value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                      className="h-9 rounded-lg bg-zinc-50/50 border-zinc-200 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="high-temp-filter" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">High Temp Avg</Label>
                    <Input 
                      id="high-temp-filter"
                      placeholder="e.g. 81.5"
                      value={highTempFilter}
                      onChange={e => {
                        setHighTempFilter(e.target.value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                      className="h-9 rounded-lg bg-zinc-50/50 border-zinc-200 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="min-temp-filter" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Extreme Min Temp</Label>
                    <Input 
                      id="min-temp-filter"
                      placeholder="e.g. -15.0"
                      value={minTempFilter}
                      onChange={e => {
                        setMinTempFilter(e.target.value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                      className="h-9 rounded-lg bg-zinc-50/50 border-zinc-200 text-sm"
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setStateFilter("")
                        setHighTempFilter("")
                        setMinTempFilter("")
                        setSearch("")
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                      className="text-xs h-9 text-zinc-500 hover:text-zinc-900"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
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
                                    <TableHead className="w-[300px] pl-6 rounded-tl-2xl">Station</TableHead>
                                    <TableHead>State</TableHead>
                                    <TableHead>High Temp 2% Avg (°C)</TableHead>
                                    <TableHead>Extreme Min Temp (°C)</TableHead>
                                    <TableHead className="text-right pr-6 rounded-tr-2xl">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item) => (
                                    <TableRow 
                                        key={item.uuid} 
                                        className="hover:bg-zinc-50/50 border-zinc-50 transition-colors"
                                    >
                                        <TableCell className="font-medium text-zinc-900 pl-6">
                                            {item.station}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-zinc-200 font-medium">
                                                {item.state}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-600 text-sm">{item.high_temp_2_avg}</TableCell>
                                        <TableCell className="text-zinc-600 text-sm">{item.extreme_temp_min}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                                    onClick={() => {
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
                                                    onClick={() => handleDelete(item.uuid!)}
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
            </Card>
          </div>
        </main>
      </div>

      <AshraeFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        initialData={editingItem}
        onSuccess={() => {
            setIsDialogOpen(false)
            setRefreshKey(prev => prev + 1)
        }}
      />
    </AuthGuard>
  )
}

function AshraeFormDialog({ 
    open, 
    onOpenChange, 
    initialData,
    onSuccess 
}: { 
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData: AshraeRecord | null
    onSuccess: () => void
}) {
    const isEditing = !!initialData
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<AshraeRecord>({
        state: "",
        station: "",
        high_temp_2_avg: "",
        extreme_temp_min: ""
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData(initialData)
            } else {
                setFormData({
                    state: "",
                    station: "",
                    high_temp_2_avg: "",
                    extreme_temp_min: ""
                })
            }
        }
    }, [open, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = isEditing 
                ? await updateAshraeRecord(initialData.uuid!, formData)
                : await createAshraeRecord(formData)

            if (res.status === "success") {
                toast.success(`Record ${isEditing ? "updated" : "created"} successfully`)
                onSuccess()
            } else {
                toast.error(res.message || "Operation failed")
            }
        } catch (e: any) {
            toast.error(e.message || "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit" : "Add"} ASHRAE Record</DialogTitle>
                    <DialogDescription>
                        Enter weather station data for the selected location.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="station" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Station Name <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    id="station"
                                    placeholder="e.g. ASPEN PITKIN"
                                    value={formData.station}
                                    onChange={e => setFormData(prev => ({ ...prev, station: e.target.value }))}
                                    required
                                    className="h-11 rounded-xl border-zinc-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="state" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    State <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    id="state"
                                    placeholder="e.g. CO"
                                    value={formData.state}
                                    onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                    required
                                    className="h-11 rounded-xl border-zinc-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="high_temp" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    High Temp 2% Avg (°C)
                                </Label>
                                <Input 
                                    id="high_temp"
                                    placeholder="e.g. 35.0"
                                    value={formData.high_temp_2_avg}
                                    onChange={e => setFormData(prev => ({ ...prev, high_temp_2_avg: e.target.value }))}
                                    className="h-11 rounded-xl border-zinc-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="min_temp" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Extreme Min Temp (°C)
                                </Label>
                                <Input 
                                    id="min_temp"
                                    placeholder="e.g. -11.0"
                                    value={formData.extreme_temp_min}
                                    onChange={e => setFormData(prev => ({ ...prev, extreme_temp_min: e.target.value }))}
                                    className="h-11 rounded-xl border-zinc-200"
                                />
                            </div>
                        </div>
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
