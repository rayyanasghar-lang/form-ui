"use server"

import { cookies } from "next/headers"
import { ApiResponse, Service, Question } from "@/types/site-centric"

const API_BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:8069"
const ODOO_DB = process.env.ODOO_DB 

const getHeaders = async () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (ODOO_DB) {
    headers["X-Odoo-Database"] = ODOO_DB
  }
  
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  
  return headers
}

// --- Helpers ---

const normalizeOdooString = (val: any): string => {
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  if (typeof val === 'object' && val !== null) {
    if (val.en_US) return val.en_US
    const values = Object.values(val)
    if (values.length > 0 && typeof values[0] === 'string') return values[0] as string
  }
  return ""
}

// --- Actions ---

export async function fetchAvailableServices(): Promise<ApiResponse<Service[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(`Failed to fetch services: ${response.status}`)
    const json = await response.json()
    
    if (json.status === "success" && Array.isArray(json.data)) {
      const normalizedData = json.data.map((s: any) => ({
        ...s,
        name: normalizeOdooString(s.name),
        description: normalizeOdooString(s.description || "")
      }))
      return { ...json, data: normalizedData }
    }
    
    return json
  } catch (error: any) {
    console.error("fetchAvailableServices error:", error)
    return { status: "error", message: error.message }
  }
}

export async function fetchServiceQuestions(serviceId: string | number): Promise<ApiResponse<Question[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}/questions`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(`Failed to fetch questions: ${response.status}`)
    const json = await response.json()
    let rawQuestions = []
    
    if (json.status === "success") {
      if (Array.isArray(json.data)) {
        rawQuestions = json.data
      } else if (json.data && Array.isArray(json.data.questions)) {
        rawQuestions = json.data.questions
      }
      
      const normalizedData = rawQuestions.map((q: any) => ({
        ...q,
        label: normalizeOdooString(q.label),
        description: normalizeOdooString(q.description || ""),
        placeholder: normalizeOdooString(q.placeholder || ""),
        options: Array.isArray(q.options) ? q.options.map((opt: any) => ({
          ...opt,
          label: normalizeOdooString(opt.label)
        })) : []
      }))
      return { ...json, data: normalizedData }
    }
    
    return { ...json, data: [] }
  } catch (error: any) {
    console.error("fetchServiceQuestions error:", error)
    return { status: "error", message: error.message }
  }
}

export async function addServicesToProject(projectId: string, serviceIds: (string | number)[]): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/services`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify({ service_ids: serviceIds }),
    })

    if (!response.ok) throw new Error(`Failed to add services: ${response.status}`)
    const json = await response.json()
    return json
  } catch (error: any) {
    console.error("addServicesToProject error:", error)
    return { status: "error", message: error.message }
  }
}

// Legacy support if needed, but steering towards site-centric
export async function fetchProjectCompletion(projectId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/completion`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(`Failed to fetch completion: ${response.status}`)
    const json = await response.json()
    return json
  } catch (error: any) {
    console.error("fetchProjectCompletion error:", error)
    return { status: "error", message: error.message }
  }
}
export async function fetchServiceQuestionsUnion(serviceIds: (string | number)[]): Promise<ApiResponse<Question[]>> {
  try {
    const idsParam = serviceIds.join(",")
    const response = await fetch(`${API_BASE_URL}/api/services/questions/union?service_ids=${idsParam}`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(`Failed to fetch union questions: ${response.status}`)
    const json = await response.json()
    
    if (json.status === "success" && Array.isArray(json.data)) {
      const normalizedData = json.data.map((q: any) => ({
        ...q,
        label: normalizeOdooString(q.label),
        description: normalizeOdooString(q.description || ""),
        placeholder: normalizeOdooString(q.placeholder || ""),
        options: Array.isArray(q.options) ? q.options.map((opt: any) => ({
          ...opt,
          label: normalizeOdooString(opt.label)
        })) : []
      }))
      return { ...json, data: normalizedData }
    }
    
    return { ...json, data: [] }
  } catch (error: any) {
    console.error("fetchServiceQuestionsUnion error:", error)
    return { status: "error", message: error.message }
  }
}
