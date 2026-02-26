"use server"

import { Project, ProjectStatus } from "@/types/project"

export interface ProjectsResponse {
  status: string
  data: Project[]
}

import { cookies } from "next/headers"

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

export async function fetchProjectsAction(): Promise<ProjectsResponse | { error: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: "GET",
      headers: await getHeaders(),
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
    
    const statuses: ProjectStatus[] = ["New Job Creation", "New Design", "Design-Internal Review", "Design Revision", "Awaiting Engineering", "Print & Ship", "Design Submitted", "On Hold / Challenged"]
    
    // Map the new API structure to our frontend Project type
    const mappedProjects: Project[] = data.data.map((item: any) => {
      // Helper to extract string from Odoo selection/M2O ([id, "Label"] or "Label")
      const getStatusLabel = (val: any) => {
        let label = val
        if (Array.isArray(val) && val.length > 1) {
             label = val[1]
        }
        
        if (!label) return "New Job Creation"

        const normalized = String(label).trim()
        
        // Match specific mappings if needed, otherwise return normalized
        if (normalized === "Print and Ship") return "Print & Ship"
        if (normalized === "Design internal review") return "Design-Internal Review"
        if (normalized === "Design revision") return "Design Revision"
        if (normalized === "Design submitted") return "Design Submitted"
        if (normalized === "On hold/challenge") return "On Hold / Challenged"
        if (normalized === "draft" || normalized === "New") return "New Job Creation" 
        
        return normalized as ProjectStatus
      }

      // Helper to extract One2many/Many2one data
      const extractRelation = (val: any) => {
          if (!val) return undefined;
          if (Array.isArray(val)) {
              return val.length > 0 ? val[0] : undefined;
          }
          return val; // It's already an object
      }

      const rawStatus = item.stage || item.status
      const statusLabel = getStatusLabel(rawStatus)

      const systemSummary = extractRelation(item.system_summary_id || item.system_summary);
      const siteDetails = extractRelation(item.site_detail_id || item.site_details);
      const electricalDetails = extractRelation(item.electrical_detail_id || item.electrical_details);
      const advElectricalDetails = extractRelation(item.advanced_electrical_detail_id || item.advanced_electrical_details);
      const optionalExtras = extractRelation(item.optional_extra_detail_id || item.optional_extra_details);
      
      const systemComponents = item.system_component_ids || item.system_components || [];
      const uploads = item.upload_ids || item.uploads || [];

      return {
        id: item.uuid || item.id, // Prefer UUID
        name: item.name || "Untitled Project",
        address: item.address || "No Address Provided",
        status: statusLabel as ProjectStatus,
        systemSize: systemSummary?.system_size ? `${systemSummary.system_size} kW` : "N/A",
        systemType: systemSummary?.system_type || "N/A",
        pvModules: systemSummary?.pv_modules || 0,
        inverters: systemSummary?.inverters || 0,
        batteryBackup: !!systemSummary?.battery_info,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
        type: item.type || systemSummary?.system_type || "residential", // Fallback for type
        
        // Detailed Nested Fields
        user_profile: item.user_profile,
        system_summary: systemSummary,
        site_details: siteDetails,
        electrical_details: electricalDetails,
        advanced_electrical_details: advElectricalDetails,
        optional_extra_details: optionalExtras,
        system_components: systemComponents,
        uploads: uploads,
        general_notes: item.general_notes,
        
        // Site-Centric Root
        site: item.site ? {
            uuid: item.site.uuid || item.site_id,
           address: item.site.address || item.address,
           roof: item.site.roof || siteDetails,
           electrical: item.site.electrical || electricalDetails,
        } : undefined,

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
      headers: await getHeaders(),
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

    // Helper to safely extract One2many/Many2one data
    const extractRelation = (val: any) => {
        if (!val) return undefined;
        if (Array.isArray(val)) {
            return val.length > 0 ? val[0] : undefined;
        }
        return val; // It's already an object
    }

    // Map to frontend Project type
    const systemSummary = extractRelation(item.system_summary_id || item.system_summary);
    const siteDetails = extractRelation(item.site_detail_id || item.site_details);
    const electricalDetails = extractRelation(item.electrical_detail_id || item.electrical_details);
    const advElectricalDetails = extractRelation(item.advanced_electrical_detail_id || item.advanced_electrical_details);
    const optionalExtras = extractRelation(item.optional_extra_detail_id || item.optional_extra_details);
    
    // Components and Uploads are true Lists
    const systemComponents = item.system_component_ids || item.system_components || [];
    const uploads = item.upload_ids || item.uploads || [];

    const project: Project = {
      id: item.uuid || item.id, // Prefer UUID if avail
      name: item.name || "Untitled Project",
      address: item.address || "No Address Provided",
      status: item.status || "draft",
      systemSize: systemSummary?.system_size ? `${systemSummary.system_size} kW` : "N/A",
      systemType: systemSummary?.system_type || "N/A",
      pvModules: systemSummary?.pv_modules || 0,
      inverters: systemSummary?.inverters || 0,
      batteryBackup: !!systemSummary?.battery_info,
      createdAt: item.created_at ? new Date(item.created_at) : new Date(),
      updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
      type: item.type || systemSummary?.system_type || "residential",
      
      // Detailed Nested Fields
      user_profile: item.user_profile || { // Fallback if user_profile is flattened or different
        contact_name: item.user_profile_id, // If simplistic
        // ...
      },
      // Better to check if item.user_profile is object
      ...((item.user_profile && typeof item.user_profile === 'object') ? { user_profile: item.user_profile } : {}),

      system_summary: systemSummary,
      site_details: siteDetails,
      electrical_details: electricalDetails,
      advanced_electrical_details: advElectricalDetails,
      optional_extra_details: optionalExtras,
      system_components: systemComponents,
      uploads: uploads,
      general_notes: item.general_notes,
      
      // Services and Submission Type
      services: item.services || item.service_ids || [],
      submission_type: item.submission_type || item.submission_type_id,
      service_answers: item.service_answers || item.answers || {},

      // Site-Centric Root
      site: item.site ? {
        uuid: item.site.uuid || item.site_id,
        address: item.site.address || item.address,
        roof: item.site.roof || siteDetails,
        electrical: item.site.electrical || electricalDetails,
      } : undefined,

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
      headers: await getHeaders(),
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
      headers: await getHeaders(),
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
export async function sendProjectMessageAction(projectId: string, message: string, authorName: string = "Frontend User"): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project/${projectId}/message`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify({
        body: message,
        author_name: authorName
      }),
    })

    const text = await response.text()
    if (!response.ok) {
      return { success: false, error: `Failed to send message: ${response.status} ${text.slice(0, 100)}` }
    }

    try {
      const data = JSON.parse(text)
      if (data.status === "success") {
        return { success: true }
      }
      return { success: false, error: data.message || "Unknown error from backend" }
    } catch (e) {
      return { success: true } // Some APIs return 200 with non-JSON success
    }
  } catch (error: any) {
    console.error("Send Message Action Error:", error)
    return { success: false, error: error.message || "Failed to connect to backend" }
  }
}
