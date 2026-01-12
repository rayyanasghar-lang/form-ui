"use server"

import { Project, ProjectStatus } from "@/types/project"

export interface ProjectsResponse {
  status: string
  data: Project[]
}

const API_BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:8069"
const ODOO_DB = process.env.ODOO_DB 

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (ODOO_DB) {
    headers["X-Odoo-Database"] = ODOO_DB
  }
  return headers
}

export async function fetchProjectsAction(): Promise<ProjectsResponse | { error: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store", // Ensure fresh data
    })

    const text = await response.text()
    
    if (!response.ok) {
        return { error: `Server error (${response.status}): ${text.slice(0, 100)}` }
    }

    let data: ProjectsResponse
    try {
        data = JSON.parse(text)
    } catch (e) {
        console.error("Failed to parse JSON:", text.slice(0, 500))
        return { error: "Backend returned invalid JSON. Check Odoo logs or database selection." }
    }
    
    const statuses: ProjectStatus[] = ["New Job Creation", "New Design", "Design internal review", "Design revision", "Awaiting Engineering", "Print and Ship", "On hold/challenge"]
    
    // Map the new API structure to our frontend Project type
    const mappedProjects: Project[] = data.data.map((item: any) => {
      // Helper to extract string from Odoo selection/M2O ([id, "Label"] or "Label")
      const getStatusLabel = (val: any) => {
        let label = val
        if (Array.isArray(val) && val.length > 1) {
             label = val[1]
        }
        
        if (!label) return "New Job Creation"

        // Normalize specific DB variations to our strict Frontend Enum
        const normalized = String(label).trim()
        
        if (normalized === "Print & Ship") return "Print and Ship"
        if (normalized === "Design-Internal Review") return "Design internal review"
        if (normalized === "Design Revision") return "Design revision"
        if (normalized === "Design Submitted") return "Design submitted"
        if (normalized === "draft") return "New Job Creation" // Map legacy draft to New Job Creation
        
        return normalized
      }

      const rawStatus = item.stage || item.status
      const statusLabel = getStatusLabel(rawStatus)

      return {
        id: item.id,
        name: item.name || "Untitled Project",
        address: item.address || "No Address Provided",
        status: statusLabel as ProjectStatus,
        systemSize: item.system_summary?.system_size ? `${item.system_summary.system_size} kW` : "N/A",
        systemType: item.system_summary?.system_type || "N/A",
        pvModules: item.system_summary?.pv_modules || 0,
        inverters: item.system_summary?.inverters || 0,
        batteryBackup: !!item.system_summary?.battery_info,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
        type: item.type || item.system_summary?.system_type || "residential", // Fallback for type
        
        // Detailed Nested Fields
        user_profile: item.user_profile,
        system_summary: item.system_summary,
        site_details: item.site_details,
        electrical_details: item.electrical_details,
        advanced_electrical_details: item.advanced_electrical_details,
        optional_extra_details: item.optional_extra_details,
        system_components: item.system_components,
        uploads: item.uploads,
        general_notes: item.general_notes,

        // Legacy matching
        ownerName: item.user_profile?.contact_name,
        ownerEmail: item.user_profile?.email,
        ownerPhone: item.user_profile?.phone,
      }
    })

    return {
      ...data,
      data: mappedProjects
    }
  } catch (error) {
    console.error("Error fetching projects:", error)
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function fetchProjectByIdAction(id: string): Promise<{ data?: Project; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    })

    const text = await response.text()
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status} ${text.slice(0, 100)}`)
    }

    let result
    try {
        result = JSON.parse(text)
    } catch (e) {
        throw new Error("Backend returned invalid JSON.")
    }
    const item = result.data

    if (!item) {
      throw new Error("Project not found")
    }

    // Map to frontend Project type
    const project: Project = {
      id: item.id,
      name: item.name || "Untitled Project",
      address: item.address || "No Address Provided",
      status: item.status || "draft",
      systemSize: item.system_summary?.system_size ? `${item.system_summary.system_size} kW` : "N/A",
      systemType: item.system_summary?.system_type || "N/A",
      pvModules: item.system_summary?.pv_modules || 0,
      inverters: item.system_summary?.inverters || 0,
      batteryBackup: !!item.system_summary?.battery_info,
      createdAt: item.created_at ? new Date(item.created_at) : new Date(),
      updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
      type: item.type || item.system_summary?.system_type || "residential",
      
      // Detailed Nested Fields
      user_profile: item.user_profile,
      system_summary: item.system_summary,
      site_details: item.site_details,
      electrical_details: item.electrical_details,
      advanced_electrical_details: item.advanced_electrical_details,
      optional_extra_details: item.optional_extra_details,
      system_components: item.system_components,
      uploads: item.uploads,
      general_notes: item.general_notes,

      // Legacy matching
      ownerName: item.user_profile?.contact_name,
      ownerEmail: item.user_profile?.email,
      ownerPhone: item.user_profile?.phone,
    }

    return { data: project }
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error)
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function updateProjectAction(id: string, payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/update`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        id: id,
        ...payload
      }),
    })

    const text = await response.text()
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      data = null
    }

    if (!response.ok) {
      return { success: false, error: data?.error || text || "Unknown error" }
    }

    if (data && data.error) {
      return { success: false, error: data.error }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Update Action Error:", error)
    return { success: false, error: error.message || "Failed to connect to backend" }
  }
}

export async function fetchProjectUpdatesAction(id: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project-updates/${id}`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch updates: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching project updates ${id}:`, error)
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
