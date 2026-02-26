"use server"

import { cookies } from "next/headers"
import { ApiResponse, Site, SiteFullData, RoofComponent, ElectricalComponent } from "@/types/site-centric"

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

export async function createSite(site: Partial<Site>): Promise<ApiResponse<Site>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sites`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(site),
    })

    if (!response.ok) throw new Error(`Failed to create site: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    console.error("createSite error:", error)
    return { status: "error", message: error.message }
  }
}

export async function fetchSiteData(uuid: string): Promise<ApiResponse<SiteFullData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sites/${uuid}`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(`Failed to fetch site: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    console.error("fetchSiteData error:", error)
    return { status: "error", message: error.message }
  }
}

export async function saveSiteAnswers(uuid: string, answers: Record<string, any>): Promise<ApiResponse<any>> {
  try {
    const formattedAnswers = Object.entries(answers).map(([key, value]) => ({
      question_key: key,
      value: value
    }))

    const response = await fetch(`${API_BASE_URL}/api/sites/${uuid}/answers`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify({ answers: formattedAnswers }),
    })

    if (!response.ok) throw new Error(`Failed to save answers: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    console.error("saveSiteAnswers error:", error)
    return { status: "error", message: error.message }
  }
}

export async function fetchRoofData(uuid: string): Promise<ApiResponse<RoofComponent>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sites/${uuid}/roof`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(`Failed to fetch roof data: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    console.error("fetchRoofData error:", error)
    return { status: "error", message: error.message }
  }
}

export async function fetchElectricalData(uuid: string): Promise<ApiResponse<ElectricalComponent>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sites/${uuid}/electrical`, {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(`Failed to fetch electrical data: ${response.status}`)
    return await response.json()
  } catch (error: any) {
    console.error("fetchElectricalData error:", error)
    return { status: "error", message: error.message }
  }
}
