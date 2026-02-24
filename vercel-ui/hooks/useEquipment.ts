import { useQuery, keepPreviousData } from "@tanstack/react-query"

type EquipmentType = "solar" | "inverter" | "battery" | "racking-system" | "racking-roof" | "racking-ground" | "racking-subcomponent" | string

interface UseEquipmentOptions {
  type: EquipmentType
  page: number
  limit?: number
  search?: string
  systemId?: string 
  enabled?: boolean
  refreshKey?: number
}

export function useEquipment({ 
  type, 
  page, 
  limit = 20, 
  search = "", 
  systemId = "all",
  enabled = true,
  refreshKey = 0
}: UseEquipmentOptions) {
  return useQuery({
    queryKey: ['equipment', type, page, limit, search, systemId, refreshKey],
    queryFn: async () => {
      // Determine API path
      let apiPath = type
      if (type === "racking-subcomponent") apiPath = "subcomponent"
      
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        q: search
      })

      // Add system ID filter if applicable
      if (systemId !== "all" && type !== "racking-system") {
        params.append("search", systemId)
      }

      const res = await fetch(`/api/equipment/${apiPath}?${params.toString()}`)
      
      if (!res.ok) {
         throw new Error("Network response was not ok")
      }

      const json = await res.json()
      
      // Normalize response structure
      let data = []
      let total = 0
      let pages = 1

      if (json.data && Array.isArray(json.data)) {
        data = json.data
        if (json.pagination) {
          total = json.pagination.total
          pages = json.pagination.pages
        }
      } else if (Array.isArray(json)) {
        data = json
        total = json.length
        pages = Math.ceil(total / limit)
      }

      return { data, total, pages }
    },
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    staleTime: 60 * 1000, // Data matches fresh for 1 minute
    enabled: enabled // Allow disabling the query
  })
}
