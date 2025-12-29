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
      // Randomly assign a status for demonstration
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      return {
        id: item.id,
        name: item.name || "Untitled Project",
        address: item.address || "No Address Provided",
        status: randomStatus,
        systemSize: item.system_summary?.system_size ? `${item.system_summary.system_size} kW` : "N/A",
        systemType: item.system_summary?.system_type || "N/A",
        pvModules: item.system_summary?.pv_modules || 0,
        inverters: item.system_summary?.inverters || 0,
        batteryBackup: !!item.system_summary?.battery_info,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
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
