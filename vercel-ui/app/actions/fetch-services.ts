"use server"

export interface Service {
  id: string
  name: string
}

export interface ServicesResponse {
  status: string
  data: Service[]
}

export async function fetchServicesAction(): Promise<ServicesResponse | { error: string }> {
  try {
    const response = await fetch("http://localhost:8069/api/services", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
