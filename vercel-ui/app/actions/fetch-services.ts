"use server"

export interface Service {
  id: string
  name: string
}

export interface ServicesResponse {
  status: string
  data: Service[]
}

const API_BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:8069"
const ODOO_DB = process.env.ODOO_DB || "sunpermit"

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (ODOO_DB) {
    headers["X-Odoo-Database"] = ODOO_DB
  }
  return headers
}

export async function fetchServicesAction(): Promise<ServicesResponse | { error: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store", // Ensure fresh data
    })

    if (!response.ok) {
      return {
        error: `Failed to fetch services: ${response.status} ${response.statusText}`,
      }
    }

    const data: ServicesResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching services:", error)
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
