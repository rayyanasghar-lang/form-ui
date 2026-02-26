"use client"

import { useState, useEffect } from "react"
import { Search, Database, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useEquipment } from "@/hooks/useEquipment"
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
import type { SolarRecord } from "../types/records"

import { Skeleton } from "@/components/ui/skeleton"

function EquipmentSkeleton() {
  return (
    <Table>
      <TableHeader className="bg-zinc-50">
        <TableRow>
          <TableHead className="w-12 pl-4"><Checkbox /></TableHead>
          <TableHead>Manufacturer</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Power (W)</TableHead>
          <TableHead>Efficiency (%)</TableHead>
          <TableHead>Voc (V)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(8)].map((_, i) => (
          <TableRow key={i}>
            <TableCell className="pl-4"><Skeleton className="h-4 w-4 rounded" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface SolarViewProps {
  onEdit: (item: SolarRecord) => void
  onView: (item: SolarRecord) => void
  refreshKey: number
}

export default function SolarView({ onEdit, onView, refreshKey }: SolarViewProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filterEnabled, setFilterEnabled] = useState<"all" | "enabled">("all")
  const [enableAll, setEnableAll] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 20

  // Sync search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data: queryData, isLoading: loading } = useEquipment({
    type: "solar",
    page,
    limit,
    search: debouncedSearch,
    refreshKey, // Pass refreshKey to the hook
  })

  // Derive data from query result
  const data = queryData?.data || []
  const total = queryData?.total || 0
  const pages = queryData?.pages || 1

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-zinc-600">
          Use the toggles below to enable the solar panels you want available in designs.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600">Enable all</span>
          <Checkbox 
            checked={enableAll}
            onCheckedChange={(checked) => setEnableAll(!!checked)}
          />
        </div>
      </div>

      <Card className="border-border/50 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 lg:p-5 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search Solar Panels"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filterEnabled === "all" ? "default" : "secondary"}
                onClick={() => setFilterEnabled("all")}
                size="sm"
              >
                All Solar
              </Button>
              <Button
                variant={filterEnabled === "enabled" ? "default" : "secondary"}
                onClick={() => setFilterEnabled("enabled")}
                size="sm"
              >
                Enabled
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex-1 min-h-[400px]">
          {loading ? (
            <EquipmentSkeleton />
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-2 opacity-20">
              <Database className="h-12 w-12" />
              <p>No solar panels found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-zinc-50">
                  <TableRow>
                    <TableHead className="w-12 pl-4"><Checkbox /></TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Power (W)</TableHead>
                    <TableHead>Efficiency (%)</TableHead>
                    <TableHead>Voc (V)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: SolarRecord) => (
                    <TableRow 
                      key={item.uuid} 
                      className="cursor-pointer hover:bg-zinc-50"
                      onClick={() => onView(item)}
                    >
                      <TableCell className="pl-4" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={item.enabled || enableAll} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {item.manufacturer || item.brandName || item.brand_name || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.model || "-"}</TableCell>
                      <TableCell>{item.power || "-"}</TableCell>
                      <TableCell>{item.efficiency ? `${item.efficiency}%` : "-"}</TableCell>
                      <TableCell>{item.openCircuitVoltage || "-"}</TableCell>
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
