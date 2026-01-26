"use server"

const API_BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:8069"

export interface AshraeRecord {
  uuid?: string
  state: string
  station: string
  high_temp_2_avg: string
  extreme_temp_min: string
}

export async function fetchAshraeData(params: { state?: string; station?: string; high_temp_2_avg?: string; extreme_temp_min?: string; page?: number; limit?: number } = {}) {
  try {
    const query = new URLSearchParams()
    if (params.state) query.append("state", params.state)
    if (params.station) query.append("station", params.station)
    if (params.high_temp_2_avg) query.append("high_temp_2_avg", params.high_temp_2_avg)
    if (params.extreme_temp_min) query.append("extreme_temp_min", params.extreme_temp_min)
    if (params.page) query.append("page", params.page.toString())
    if (params.limit) query.append("limit", params.limit.toString())

    const response = await fetch(`${API_BASE_URL}/api/ashrae?${query.toString()}`, {
        cache: 'no-store'
    })
    return await response.json()
  } catch (error) {
    console.error("fetchAshraeData error:", error)
    return { status: "error", message: "Failed to fetch ASHRAE data" }
  }
}

export async function getAshraeDetail(uuid: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ashrae/${uuid}`, {
        cache: 'no-store'
    })
    return await response.json()
  } catch (error) {
    console.error("getAshraeDetail error:", error)
    return { status: "error", message: "Failed to fetch record detail" }
  }
}

export async function createAshraeRecord(data: AshraeRecord) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ashrae`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error("createAshraeRecord error:", error)
    return { status: "error", message: "Failed to create record" }
  }
}

export async function updateAshraeRecord(uuid: string, data: Partial<AshraeRecord>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ashrae/${uuid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error("updateAshraeRecord error:", error)
    return { status: "error", message: "Failed to update record" }
  }
}

export async function deleteAshraeRecord(uuid: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ashrae/${uuid}`, {
      method: "DELETE",
    })
    return await response.json()
  } catch (error) {
    console.error("deleteAshraeRecord error:", error)
    return { status: "error", message: "Failed to delete record" }
  }
}

export async function bulkCreateAshrae(data: AshraeRecord[]) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ashrae/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error("bulkCreateAshrae error:", error)
    return { status: "error", message: "Failed to bulk create records" }
  }
}
