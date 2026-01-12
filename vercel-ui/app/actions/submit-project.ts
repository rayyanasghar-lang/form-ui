"use server"

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

export async function submitProjectAction(payload: any): Promise<{ success: boolean; data?: any; error?: any; status?: number }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/create-project`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        })

        const text = await response.text()

        let data
        try {
            data = JSON.parse(text)
        } catch (e) {
            data = null
        }

        if (!response.ok) {
            return { success: false, error: data || text || "Unknown error", status: response.status }
        }

        // Check for Odoo-style error in 200 OK response
        if (data && data.error) {
            return { success: false, error: data.error, status: response.status }
        }

        return { success: true, data, status: response.status }
    } catch (error: any) {
        console.error("Server Action Error:", error)
        return { success: false, error: error.message || "Failed to connect to backend" }
    }
}
