import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  fetchAvailableServices, 
  fetchServiceQuestions,
  fetchServiceQuestionsUnion
} from "@/app/actions/service-api"
import { 
  createSite, 
  fetchSiteData, 
  saveSiteAnswers, 
  fetchRoofData, 
  fetchElectricalData 
} from "@/app/actions/site-api"
import { fetchProjectByIdAction } from "@/app/actions/project-service"

export function useProject(id: string | null) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) return null
      const res = await fetchProjectByIdAction(id)
      if (res.error) throw new Error(res.error)
      return res.data || null
    },
    enabled: !!id,
  })
}
import { Site } from "@/types/site-centric"

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await fetchAvailableServices()
      if (res.status === "error") throw new Error(res.message)
      return res.data || []
    },
  })
}

export function useServiceQuestions(serviceId: string | number | null) {
  return useQuery({
    queryKey: ["questions", serviceId],
    queryFn: async () => {
      if (!serviceId) return []
      const res = await fetchServiceQuestions(serviceId)
      if (res.status === "error") throw new Error(res.message)
      return res.data || []
    },
    enabled: !!serviceId,
  })
}

export function useServiceQuestionsUnion(serviceIds: (string | number)[]) {
  return useQuery({
    queryKey: ["questions", "union", serviceIds.join(",")],
    queryFn: async () => {
      if (!serviceIds || serviceIds.length === 0) return []
      const res = await fetchServiceQuestionsUnion(serviceIds)
      if (res.status === "error") throw new Error(res.message)
      return res.data || []
    },
    enabled: serviceIds.length > 0,
  })
}

export function useSite(uuid: string | null) {
  return useQuery({
    queryKey: ["site", uuid],
    queryFn: async () => {
      if (!uuid) return null
      const res = await fetchSiteData(uuid)
      if (res.status === "error") throw new Error(res.message)
      return res.data || null
    },
    enabled: !!uuid,
  })
}

export function useRoofData(siteUuid: string | null) {
  return useQuery({
    queryKey: ["site", siteUuid, "roof"],
    queryFn: async () => {
      if (!siteUuid) return null
      const res = await fetchRoofData(siteUuid)
      if (res.status === "error") throw new Error(res.message)
      return res.data || null
    },
    enabled: !!siteUuid,
  })
}

export function useElectricalData(siteUuid: string | null) {
  return useQuery({
    queryKey: ["site", siteUuid, "electrical"],
    queryFn: async () => {
      if (!siteUuid) return null
      const res = await fetchElectricalData(siteUuid)
      if (res.status === "error") throw new Error(res.message)
      return res.data || null
    },
    enabled: !!siteUuid,
  })
}

// --- Mutations ---

export function useCreateSite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (site: Partial<Site>) => createSite(site),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] })
    },
  })
}

export function useSaveAnswers(siteUuid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (answers: Record<string, any>) => saveSiteAnswers(siteUuid, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site", siteUuid] })
      queryClient.invalidateQueries({ queryKey: ["site", siteUuid, "roof"] })
      queryClient.invalidateQueries({ queryKey: ["site", siteUuid, "electrical"] })
    },
  })
}
