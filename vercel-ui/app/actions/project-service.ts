"use server"

import { Project, ProjectStatus } from "@/types/project"

export interface ProjectsResponse {
  status: string
  data: Project[]
}

export async function fetchProjectsAction(): Promise<ProjectsResponse | { error: string }> {
  try {
    const response = await fetch("http://localhost:8069/api/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure fresh data
    })

    const data: ProjectsResponse = await response.json()
    
    const statuses: ProjectStatus[] = ["approved", "pending", "in_review", "rejected", "draft"]
    
    // Map the new API structure to our frontend Project type
    const mappedProjects: Project[] = data.data.map((item: any) => {
      // Randomly assign a status for demonstration if needed, 
      // but ideally we take it from the item if it exists.
      const status = item.status || statuses[Math.floor(Math.random() * statuses.length)]
      
      return {
        id: item.id,
        name: item.name || "Untitled Project",
        address: item.address || "No Address Provided",
        status: status,
        systemSize: item.system_summary?.system_size ? `${item.system_summary.system_size} kW` : "N/A",
        systemType: item.system_summary?.system_type || "N/A",
        pvModules: item.system_summary?.pv_modules || 0,
        inverters: item.system_summary?.inverters || 0,
        batteryBackup: !!item.system_summary?.battery_info,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
        
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
    const response = await fetch(`http://localhost:8069/api/projects/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`)
    }

    const result = await response.json()
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
    const response = await fetch(`http://localhost:8069/api/projects/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: id,
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
