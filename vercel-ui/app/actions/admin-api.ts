"use server"

import { cookies } from "next/headers"
import { ApiResponse } from "@/types/site-centric"
import { AdminQuestion, AdminService, MappingRule, Category } from "@/types/admin"

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

// --- Questions ---

export async function fetchAdminQuestions(category?: string): Promise<ApiResponse<AdminQuestion[]>> {
  try {
    const url = category ? `${API_BASE_URL}/api/questions?category=${category}` : `${API_BASE_URL}/api/questions`
    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })
    if (!response.ok) throw new Error(`Failed to fetch questions: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    console.error("fetchAdminQuestions error:", error)
    return { status: "error", message: error.message }
  }
}

export async function createQuestion(data: Partial<AdminQuestion>): Promise<ApiResponse<AdminQuestion>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`Failed to create question: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}

export async function updateQuestion(id: string | number, data: Partial<AdminQuestion>): Promise<ApiResponse<AdminQuestion>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
      method: "PUT",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`Failed to update question: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}

export async function deleteQuestion(id: string | number): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
      method: "DELETE",
      headers: await getHeaders(),
    })
    if (!response.ok) throw new Error(`Failed to delete question: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}

// --- Services ---

export async function fetchAdminServices(): Promise<ApiResponse<AdminService[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })
    if (!response.ok) throw new Error(`Failed to fetch services: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}

export async function createService(data: Partial<AdminService>): Promise<ApiResponse<AdminService>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}

// --- Rules / Mapping ---

export async function fetchServiceRules(serviceId: string | number): Promise<ApiResponse<MappingRule[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}/questions`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}

export async function linkQuestionToService(serviceId: string | number, data: { questionId: number | string, orderIndex: number, isRequired: boolean, condition?: any }): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}/questions`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}

export async function updateMappingRule(serviceId: string | number, ruleId: string | number, data: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}/questions/${ruleId}`, {
      method: "PUT",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}

// --- Categories ---

export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })
    return await response.json()
  } catch (error: any) {
    return { status: "error", message: error.message }
  }
}
