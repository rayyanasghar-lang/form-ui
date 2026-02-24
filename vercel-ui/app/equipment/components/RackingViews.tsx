"use client"

import { useState, useEffect } from "react"
import { Search, Database, Loader2, ChevronLeft, ChevronRight, Layers, Package, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { useEquipment } from "@/hooks/useEquipment"
import type { RackingRecord } from "../types/records"
import { Skeleton } from "@/components/ui/skeleton"

function EquipmentSkeleton({ type }: { type: string }) {
  const isSystem = type === "racking-system"
  return (
    <Table>
      <TableHeader className="bg-zinc-50">
        <TableRow>
          <TableHead className="w-12 pl-4"><Checkbox /></TableHead>
          <TableHead>Manufacturer</TableHead>
          {isSystem ? (
            <>
              <TableHead>System Name</TableHead>
              <TableHead>Type</TableHead>
            </>
          ) : (
            <>
              <TableHead>Model / Part #</TableHead>
              <TableHead>System Hub</TableHead>
            </>
          )}
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(8)].map((_, i) => (
          <TableRow key={i}>
            <TableCell className="pl-4"><Skeleton className="h-4 w-4 rounded" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface RackingViewProps {
  type: "racking-system" | "racking-roof" | "racking-ground" | "racking-subcomponent"
  onEdit: (item: RackingRecord) => void
  onView: (item: RackingRecord) => void
  refreshKey: number
}

export default function RackingViews({ type, onEdit, onView, refreshKey }: RackingViewProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedSystemId, setSelectedSystemId] = useState<string>("all")
  const [rackingSystems, setRackingSystems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data: queryData, isLoading: loading } = useEquipment({
    type: type,
    page,
    limit,
    search: debouncedSearch,
    systemId: selectedSystemId,
    refreshKey,
  })

  // Fetch Hub systems for filtering
  useEffect(() => {
    if (type !== "racking-system") {
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
    }
  }, [type])

  const data = queryData?.data || []
  const total = queryData?.total || 0
  const pages = queryData?.pages || 1

  const getTitle = () => {
    switch(type) {
      case "racking-system": return "Racking Systems (Hub)"
      case "racking-roof": return "Roof Mount Products"
      case "racking-ground": return "Ground Mount Products"
      case "racking-subcomponent": return "Sub-Components"
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 lg:p-5 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
               <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder={`Search ${getTitle()}`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {type !== "racking-system" && (
                <select 
                  value={selectedSystemId}
                  onChange={(e) => setSelectedSystemId(e.target.value)}
                  className="h-9 px-3 text-sm rounded-lg border border-zinc-200 bg-white"
                >
                  <option value="all">All Systems</option>
                  {rackingSystems.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex-1 min-h-[400px]">
          {loading ? (
            <EquipmentSkeleton type={type} />
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-2 opacity-20">
              <Database className="h-12 w-12" />
              <p>No records found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-zinc-50">
                  <TableRow>
                    <TableHead className="w-12 pl-4"><Checkbox /></TableHead>
                    <TableHead>Manufacturer</TableHead>
                    {type === "racking-system" ? (
                      <>
                        <TableHead>System Name</TableHead>
                        <TableHead>Type</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Model / Part #</TableHead>
                        <TableHead>System Hub</TableHead>
                      </>
                    )}
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: RackingRecord) => (
                    <TableRow 
                      key={item.uuid} 
                      className="cursor-pointer hover:bg-zinc-50"
                      onClick={() => onView(item)}
                    >
                      <TableCell className="pl-4" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={item.enabled} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {item.manufacturer || item.brandName || item.brand_name || item.rackingManufacturer || item.racking_manufacturer || "-"}
                        </Badge>
                      </TableCell>
                      
                      {type === "racking-system" ? (
                        <>
                          <TableCell className="font-medium">{item.name || "-"}</TableCell>
                          <TableCell>
                             <Badge variant="outline" className="capitalize">
                                {item.rackingType || item.racking_type || "-"}
                              </Badge>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{item.rackingModel || item.model || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                              {item.racking_system_name || item.rackingSystemName || item['Racking System Name'] || "Linked Hub"}
                            </Badge>
                          </TableCell>
                        </>
                      )}
                      
                      <TableCell className="max-w-[300px] truncate">{item.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="p-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {pages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page >= pages}
                    onClick={() => setPage(p => p + 1)}
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
  )
}
