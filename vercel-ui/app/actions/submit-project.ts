"use server"

export async function submitProjectAction(payload: any): Promise<{ success: boolean; data?: any; error?: any; status?: number }> {
    try {
        const response = await fetch("http://localhost:8069/api/create-project", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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
